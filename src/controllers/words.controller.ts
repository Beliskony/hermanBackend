import { Request, Response } from 'express';
import {
  exportAPESWord,
  exportGuideWord,
  exportAuditWord,
  exportConducteurWord,
  exportDataCollectionWord
} from '../services/word/words.service';
import { FormService } from '../services/form.service';

const formService = new FormService();

const getValidId = (param: string | string[] | undefined): string | null => {
  if (!param) return null;
  const id = Array.isArray(param) ? param[0] : param;
  return id && /^[a-zA-Z0-9_-]{16}$/.test(id) ? id : null;
};

const generateFilename = (type: string, name: string): string => {
  const safeName = String(name).replace(/\s+/g, '_').substring(0, 50);
  return `${type}-${safeName}.docx`;
};

const extractMeta = (data: any): { projectName: string; projectLocation: string; auditors: string } => ({
  projectName:     data.project_name     || data.subprojet  || data.gi_nom   || 'Projet',
  projectLocation: data.project_location || data.lieu       || '—',
  auditors:        data.auditors         || data.auditeurs  || data.auditeur || data.gi_nom || '—',
});

export class WordExportController {


  /**
   * GET /words/export/:id
   * Détecte le type de formulaire et génère le Word correspondant
   */
  async exportAnyFormToWord(req: Request, res: Response): Promise<void> {
    try {
      const id = getValidId(req.params.id);
      if (!id) {
        res.status(400).json({ message: 'ID invalide (doit être 16 caractères alphanumériques)' });
        return;
      }

      type FormType = 'apes' | 'checklist-audit' | 'checklist-conducteur' | 'guide-entretien' | 'data-collection';
      let formType: FormType | null = null;
      let data: any = null;

      // 1. Guide entretien
      data = await formService.guideEntretien.getById(id);
      if (data) formType = 'guide-entretien';

      // 2. Checklist audit
      if (!data) {
        data = await formService.checklistAudit.getById(id);
        if (data) formType = 'checklist-audit';
      }

      // 3. Checklist conducteur
      if (!data) {
        data = await formService.checklistConducteur.getById(id);
        if (data) formType = 'checklist-conducteur';
      }

      // 4. APES
      if (!data) {
        data = await formService.apes.getById(id);
        if (data) formType = 'apes';
      }

      // 5. Data Collection
      if (!data) {
        data = await formService.dataCollection.getById(id);
        if (data) formType = 'data-collection';
      }

      if (!data || !formType) {
        res.status(404).json({ message: 'Formulaire non trouvé' });
        return;
      }

      const { projectName, projectLocation, auditors } = extractMeta(data);
      let buffer: Buffer;
      let filename: string;

      switch (formType) {
        case 'guide-entretien':
          buffer = await exportGuideWord(data, projectName, projectLocation, auditors);
          filename = generateFilename(`guide-${data.guide_type || 'entretien'}`, data.subprojet || data.gi_nom || 'guide');
          break;

        case 'checklist-audit':
          buffer = await exportAuditWord(data, projectName, projectLocation, auditors);
          filename = generateFilename('checklist-audit', data.subprojet || 'audit');
          break;

        case 'checklist-conducteur':
          buffer = await exportConducteurWord(data, projectName, projectLocation, auditors);
          filename = generateFilename('checklist-conducteur', data.subprojet || 'conducteur');
          break;

        case 'apes':
          buffer = await exportAPESWord(data, projectName, projectLocation, auditors);
          filename = generateFilename('apes', projectName);
          break;

        case 'data-collection':
          buffer = await exportDataCollectionWord(data, projectName, projectLocation, auditors);
          filename = generateFilename('data-collection', data.subprojet || 'data-collection');
          break;
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);

    } catch (error) {
      console.error('[WordExport] Erreur:', error);
      res.status(500).json({
        message: 'Erreur lors de la génération du document Word',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }
}

export default WordExportController;