"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const words_controller_1 = require("../controllers/words.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const wordsRouter = (0, express_1.Router)();
const controller = new words_controller_1.WordExportController();
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
wordsRouter.get("/word/export/:id", auth_middleware_1.authMiddleware, controller.exportAnyFormToWord);
exports.default = wordsRouter;
//# sourceMappingURL=words.route.js.map