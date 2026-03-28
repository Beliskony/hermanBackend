import { Request, Response } from 'express';
import { FormData } from '../interfaces/FormData.model';
import { generateFormDataWordDocument } from '../services/words.service';

export class WordExportController {
  async exportToWord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const formData = await FormData.findById(id);
      if (!formData) {
        res.status(404).json({ message: 'Formulaire non trouvé' });
        return;
      }

      const buffer = await generateFormDataWordDocument(formData);

      const filename = `audit-${formData.projectInfo.projectName.replace(/\s+/g, '_')}.docx`;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error('[WordExport] Erreur lors de la génération du document:', error);
      res.status(500).json({ message: 'Erreur lors de la génération du document Word' });
    }
  }
}

export default new WordExportController();