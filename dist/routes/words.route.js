"use strict";
// routes/words.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const words_controller_1 = require("../controllers/words.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const wordsRouter = (0, express_1.Router)();
const controller = new words_controller_1.WordExportController();
/**
 * Routes d'export Word pour tous les types de formulaires
 * GET /api/words/:type/:id/export
 */
// APES Form
wordsRouter.get("/form/:id/export", auth_middleware_1.authMiddleware, controller.exportFormToWord);
// Checklist Audit
wordsRouter.get("/checklist-audit/:id/export", auth_middleware_1.authMiddleware, controller.exportChecklistAuditToWord);
// Checklist Conducteur
wordsRouter.get("/checklist-conducteur/:id/export", auth_middleware_1.authMiddleware, controller.exportChecklistConducteurToWord);
// Guide Entretien
wordsRouter.get("/guide-entretien/:id/export", auth_middleware_1.authMiddleware, controller.exportGuideEntretienToWord);
exports.default = wordsRouter;
//# sourceMappingURL=words.route.js.map