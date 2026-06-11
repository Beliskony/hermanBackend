// routes/ShareLink.route.ts

import { Router, Request, Response } from 'express';
import { formTokenService } from '../services/ShareLink.service';
import { authMiddleware } from '../middlewares/auth.middleware';
import { formController } from '../controllers/form.controller'; // ton controller existant

const router = Router();

// ── Admin : générer le lien ──────────────────────────────────────────────────
// POST /admin/projects/:projectId/share-link
router.post('/admin/projects/:projectId/share-link', authMiddleware, (req: Request, res: Response) => {
  try {
    const link = formTokenService.generateLink(req.params.projectId as string);
    res.json({ link });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Public : valider le token + retourner le projet ──────────────────────────
// GET /projets/:projectId/token/:token
router.get('/projets/:projectId/token/:token', (req: Request, res: Response, next) => {
  const { projectId, token } = req.params;

  // 1. Vérifier le JWT
  let payload: { projectId: string };
  try {
    payload = formTokenService.verify(token as string);
  } catch (e: any) {
    const expired = e.name === 'TokenExpiredError';
    return res.status(401).json({
      message: expired ? 'Lien expiré' : 'Lien invalide',
      reason:  expired ? 'expired'     : 'invalid',
    });
  }

  // 2. Vérifier que le projectId du JWT correspond à celui de l'URL
  if (payload.projectId !== projectId) {
    return res.status(403).json({ message: 'Token invalide pour ce projet', reason: 'invalid' });
  }

  // 3. Déléguer à ton controller existant GET /projects/:id
  req.params.id = projectId;
  formController.getProjectById(req, res);
});

export default router;