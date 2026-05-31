import { Router } from 'express';
import { WordExportController } from '../controllers/words.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const wordsRouter = Router();
const controller = new WordExportController();

/**
 * Route UNIQUE d'export Word
 * GET /words/export/:id
 * 
 * Supporte tous les types de formulaires :
 * - APES
 * - Checklist Audit
 * - Checklist Conducteur
 * - Guide Entretien
 */
wordsRouter.get("/word/export/:id", authMiddleware, controller.exportAnyFormToWord);

export default wordsRouter;