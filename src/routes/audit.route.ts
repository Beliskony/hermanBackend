// src/routes/auditRoutes.ts
import express from 'express';
import { AuditController } from '../controllers/audit.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const auditRouter = express.Router();

// CRUD avec support multi-ID
auditRouter.post('/audits', authMiddleware, AuditController.create); // POST /api/audits
auditRouter.get('/audits', authMiddleware, AuditController.getAll); // GET /api/audits (tous OU avec ?ids=...)
auditRouter.get('/audits/:id', authMiddleware, AuditController.getById); // GET /api/audits/:id OU /api/audits?id=...
auditRouter.put('/audits/:id', authMiddleware, AuditController.update); // PUT /api/audits/:id OU /api/audits avec body.ids
auditRouter.delete('/audits/:id', authMiddleware, AuditController.delete); // DELETE /api/audits/:id OU /api/audits?ids=...

// Recherche
auditRouter.get('/audits/search/all', authMiddleware, AuditController.search);

// Synchronisation multi-ID
auditRouter.post('/audits/sync', authMiddleware, AuditController.syncMetadata); // POST /api/audits/sync?ids=...
auditRouter.post('/audits/:id/sync', authMiddleware, AuditController.syncMetadata); // POST /api/audits/:id/sync

// Récupération par type
auditRouter.get('/audits/type/:type', authMiddleware, AuditController.getByType);

// Vérification existence multi-ID
auditRouter.get('/audits/check', authMiddleware, AuditController.checkExists); // GET /api/audits/check?ids=...
auditRouter.get('/audits/:id/check', authMiddleware, AuditController.checkExists); // GET /api/audits/:id/check

export default auditRouter;