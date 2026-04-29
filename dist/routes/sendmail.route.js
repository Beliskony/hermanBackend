"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sendmail_service_1 = __importDefault(require("../services/sendmail.service"));
const SendContactMailrouter = (0, express_1.Router)();
SendContactMailrouter.post('/contactMail', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const form = req.body;
    // Validation basique
    if (!form.name || !form.email || !form.message) {
        return res.status(400).json({
            success: false,
            message: 'Champs requis manquants : name, email, message',
        });
    }
    try {
        yield Promise.all([
            sendmail_service_1.default.sendContactConfirmation(form),
            sendmail_service_1.default.sendContactNotificationToAdmin(form),
        ]);
        return res.status(200).json({
            success: true,
            message: 'Email envoyé avec succès',
        });
    }
    catch (error) {
        console.error('[POST /api/contact]', error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur lors de l'envoi de l'email",
        });
    }
}));
exports.default = SendContactMailrouter;
//# sourceMappingURL=sendmail.route.js.map