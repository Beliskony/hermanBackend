import { Request, Response } from 'express';
import { FormData } from '../interfaces/FormData.model';
import { ChecklistAudit, ChecklistConducteurTravaux } from '../interfaces/ChecklistAudit.model';
import { GuideEntretien } from '../interfaces/GuideEntretien.model';
import { 
  generateFormDataWordDocument,
  exportChecklistAuditWord,
  exportChecklistConducteurWord,
  exportGuideEntretienWord
} from '../services/words.service';

export class WordExportController {
  
  /**
   * Exporter un formulaire APES en Word
   * GET /words/form/:id/export
   */
  async exportFormToWord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const formData = await FormData.findById(id);
      if (!formData) {
        res.status(404).json({ message: 'Formulaire APES non trouvé' });
        return;
      }

      const buffer = await generateFormDataWordDocument(formData);

      const projectName = formData.projectInfo?.projectName || 'projet';
      const filename = `apes-${projectName.replace(/\s+/g, '_')}.docx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error('[WordExport] Erreur export APES:', error);
      res.status(500).json({ message: 'Erreur lors de la génération du document Word APES' });
    }
  }

  /**
   * Exporter une checklist d'audit en Word
   * GET /words/checklist-audit/:id/export
   */
  async exportChecklistAuditToWord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const checklist = await ChecklistAudit.findById(id);
      if (!checklist) {
        res.status(404).json({ message: 'Checklist d\'audit non trouvée' });
        return;
      }

      const buffer = await exportChecklistAuditWord(checklist);

      const subprojet = checklist.subprojet || 'checklist';
      const filename = `checklist-audit-${subprojet.replace(/\s+/g, '_')}.docx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error('[WordExport] Erreur export Checklist Audit:', error);
      res.status(500).json({ message: 'Erreur lors de la génération du document Word Checklist Audit' });
    }
  }

  /**
   * Exporter une checklist conducteur de travaux en Word
   * GET /words/checklist-conducteur/:id/export
   */
  async exportChecklistConducteurToWord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const checklist = await ChecklistConducteurTravaux.findById(id);
      if (!checklist) {
        res.status(404).json({ message: 'Checklist conducteur non trouvée' });
        return;
      }

      const buffer = await exportChecklistConducteurWord(checklist);

      const subprojet = checklist.subprojet || 'conducteur';
      const filename = `checklist-conducteur-${subprojet.replace(/\s+/g, '_')}.docx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error('[WordExport] Erreur export Checklist Conducteur:', error);
      res.status(500).json({ message: 'Erreur lors de la génération du document Word Checklist Conducteur' });
    }
  }

  /**
   * Exporter un guide d'entretien en Word
   * GET /words/guide-entretien/:id/export
   */
  async exportGuideEntretienToWord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const guide = await GuideEntretien.findById(id);
      if (!guide) {
        res.status(404).json({ message: 'Guide d\'entretien non trouvé' });
        return;
      }

      const buffer = await exportGuideEntretienWord(guide);

      const subprojet = guide.subprojet || 'guide';
      const guideType = guide.guideType || 'entretien';
      const filename = `guide-${guideType}-${subprojet.replace(/\s+/g, '_')}.docx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error('[WordExport] Erreur export Guide Entretien:', error);
      res.status(500).json({ message: 'Erreur lors de la génération du document Word Guide d\'entretien' });
    }
  }
}

export default new WordExportController();