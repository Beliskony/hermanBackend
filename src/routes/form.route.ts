import { Router } from 'express';
import * as formController from '../controllers/form.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const formRouter = Router();

// =============================================================================
// ROUTES UNIFIÉES (RECOMMANDÉES)
// =============================================================================
formRouter.get('/forms/stats', authMiddleware, formController.getStats);
formRouter.post('/forms', authMiddleware, formController.createAnyForm);
formRouter.get('/forms', authMiddleware, formController.getAllFormsUnified);
formRouter.get('/forms/:id', authMiddleware, formController.getAnyFormById);
formRouter.put('/forms/:id', authMiddleware, formController.updateAnyForm);
formRouter.delete('/forms/:id', authMiddleware, formController.deleteAnyForm);




export default formRouter;