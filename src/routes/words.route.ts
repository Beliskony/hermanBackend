// routes/word.routes.ts
import { Router } from 'express';
import WordExportController from '../controllers/words.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const wordsRouter = Router();
const controller = new WordExportController();
wordsRouter.use(authMiddleware);

// Route générique (détection auto)
wordsRouter.get('/export/:id', controller.exportAnyFormToWord.bind(controller));

export default wordsRouter;