// routes/words.routes.ts

import { Router } from 'express';
import { WordExportController } from '../controllers/words.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const wordsRouter = Router();
const controller = new WordExportController();

/**
 * Routes d'export Word pour tous les types de formulaires
 * GET /api/words/:type/:id/export
 */

// APES Form
wordsRouter.get(
  "/form/:id/export", 
  authMiddleware, 
  controller.exportFormToWord
);

// Checklist Audit
wordsRouter.get(
  "/checklist-audit/:id/export", 
  authMiddleware, 
  controller.exportChecklistAuditToWord
);

// Checklist Conducteur
wordsRouter.get(
  "/checklist-conducteur/:id/export", 
  authMiddleware, 
  controller.exportChecklistConducteurToWord
);

// Guide Entretien
wordsRouter.get(
  "/guide-entretien/:id/export", 
  authMiddleware, 
  controller.exportGuideEntretienToWord
);

export default wordsRouter;