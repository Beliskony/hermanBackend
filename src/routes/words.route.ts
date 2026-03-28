import { Router } from 'express';
import { WordExportController } from '../controllers/words.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const wordsRouter = Router();
const controller = new WordExportController();

/**
 * GET /api/form-data/:id/export/word
 * Génère et télécharge le formulaire en document Word
 */
wordsRouter.get("/:id/export/words", authMiddleware, controller.exportToWord);

export default wordsRouter;