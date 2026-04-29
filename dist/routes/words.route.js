"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const words_controller_1 = require("../controllers/words.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const wordsRouter = (0, express_1.Router)();
const controller = new words_controller_1.WordExportController();
/**
 * GET /api/form-data/:id/export/word
 * Génère et télécharge le formulaire en document Word
 */
wordsRouter.get("/:id/export/words", auth_middleware_1.authMiddleware, controller.exportToWord);
exports.default = wordsRouter;
//# sourceMappingURL=words.route.js.map