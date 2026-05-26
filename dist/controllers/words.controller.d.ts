import { Request, Response } from 'express';
export declare class WordExportController {
    /**
     * Exporter un formulaire APES en Word
     * GET /words/form/:id/export
     */
    exportFormToWord(req: Request, res: Response): Promise<void>;
    /**
     * Exporter une checklist d'audit en Word
     * GET /words/checklist-audit/:id/export
     */
    exportChecklistAuditToWord(req: Request, res: Response): Promise<void>;
    /**
     * Exporter une checklist conducteur de travaux en Word
     * GET /words/checklist-conducteur/:id/export
     */
    exportChecklistConducteurToWord(req: Request, res: Response): Promise<void>;
    /**
     * Exporter un guide d'entretien en Word
     * GET /words/guide-entretien/:id/export
     */
    exportGuideEntretienToWord(req: Request, res: Response): Promise<void>;
}
declare const _default: WordExportController;
export default _default;
//# sourceMappingURL=words.controller.d.ts.map