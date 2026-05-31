import { Request, Response } from 'express';
import { 
  generateFormDataWordDocument,
  exportChecklistAuditWord,
  exportChecklistConducteurWord,
  exportGuideEntretienWord
} from '../services/words.service';
import { FormService } from '../services/form.service';

const formService = new FormService();

// Helper pour extraire un ID valide
const getValidId = (param: string | string[] | undefined): string | null => {
  if (!param) return null;
  const id = Array.isArray(param) ? param[0] : param;
  return id && /^[a-zA-Z0-9_-]{16}$/.test(id) ? id : null;
};

// Helper pour générer le nom du fichier
const generateFilename = (type: string, name: string): string => {
  const safeName = String(name).replace(/\s+/g, '_').substring(0, 50);
  return `${type}-${safeName}.docx`;
};

export class WordExportController {

  /**
   * Route UNIQUE pour exporter n'importe quel formulaire
   * GET /words/export/:id
   * 
   * Détecte automatiquement le type de formulaire et génère le Word correspondant
   */
  async exportAnyFormToWord(req: Request, res: Response): Promise<void> {
    try {
      const id = getValidId(req.params.id);
      if (!id) {
        res.status(400).json({ message: 'ID invalide (doit être 16 caractères alphanumériques)' });
        return;
      }

      // Détection du type de formulaire
      let type: 'apes' | 'checklist-audit' | 'checklist-conducteur' | 'guide-entretien' | null = null;
      let data: any = null;

      // 1. Essayer Guide Entretien
      data = await formService.getGuideEntretienById(id);
      if (data) type = 'guide-entretien';

      // 2. Essayer Checklist Audit
      if (!data) {
        data = await formService.getChecklistAuditById(id);
        if (data) type = 'checklist-audit';
      }

      // 3. Essayer Checklist Conducteur
      if (!data) {
        data = await formService.getChecklistConducteurById(id);
        if (data) type = 'checklist-conducteur';
      }

      // 4. Essayer APES Form
      if (!data) {
        data = await formService.getFormById(id);
        if (data) type = 'apes';
      }

      if (!data || !type) {
        res.status(404).json({ message: 'Formulaire non trouvé' });
        return;
      }

      // Génération du document Word selon le type
      let buffer: Buffer;
      let filename: string;

      switch (type) {
        case 'guide-entretien':
          buffer = await exportGuideEntretienWord(data);
          filename = generateFilename(`guide-${data.guide_type || 'entretien'}`, data.subprojet || data.gi_nom || 'guide');
          break;

        case 'checklist-audit':
          buffer = await exportChecklistAuditWord(data);
          filename = generateFilename('checklist-audit', data.subprojet || 'audit');
          break;

        case 'checklist-conducteur':
          buffer = await exportChecklistConducteurWord(data);
          filename = generateFilename('checklist-conducteur', data.subprojet || 'conducteur');
          break;

        case 'apes':
          buffer = await generateFormDataWordDocument(data);
          filename = generateFilename('apes', data.project_name || 'projet');
          break;

        default:
          res.status(400).json({ message: 'Type de formulaire non supporté' });
          return;
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);

    } catch (error) {
      console.error('[WordExport] Erreur:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la génération du document Word',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }
}

export default WordExportController;