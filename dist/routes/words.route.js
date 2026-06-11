"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/word.routes.ts
const express_1 = require("express");
const words_controller_1 = __importDefault(require("../controllers/words.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const wordsRouter = (0, express_1.Router)();
const controller = new words_controller_1.default();
wordsRouter.use(auth_middleware_1.authMiddleware);
// Route générique (détection auto)
wordsRouter.get('/export/:id', controller.exportAnyFormToWord.bind(controller));
exports.default = wordsRouter;
//# sourceMappingURL=words.route.js.map