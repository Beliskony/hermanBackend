import { Request, Response } from 'express';
export declare class WordExportController {
    /**
     * Route UNIQUE pour exporter n'importe quel formulaire
     * GET /words/export/:id
     *
     * Détecte automatiquement le type de formulaire et génère le Word correspondant
     */
    exportAnyFormToWord(req: Request, res: Response): Promise<void>;
}
export default WordExportController;
//# sourceMappingURL=words.controller.d.ts.map