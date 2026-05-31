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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordExportController = void 0;
const words_service_1 = require("../services/words.service");
const form_service_1 = require("../services/form.service");
const formService = new form_service_1.FormService();
class WordExportController {
    /**
     * Extrait l'ID des paramètres de requête
     */
    getParamId(req) {
        const { id } = req.params;
        // Si c'est un tableau, prendre le premier élément, sinon utiliser la chaîne
        return Array.isArray(id) ? id[0] : id;
    }
    /**
     * Exporter un formulaire APES en Word
     * GET /words/form/:id/export
     */
    exportFormToWord(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = this.getParamId(req); // ← Correction ici
                const formData = yield formService.getFormById(id);
                if (!formData) {
                    res.status(404).json({ message: 'Formulaire APES non trouvé' });
                    return;
                }
                const buffer = yield (0, words_service_1.generateFormDataWordDocument)(formData);
                const projectName = formData.project_name || 'projet';
                const filename = `apes-${String(projectName).replace(/\s+/g, '_')}.docx`;
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.send(buffer);
            }
            catch (error) {
                console.error('[WordExport] Erreur export APES:', error);
                res.status(500).json({ message: 'Erreur lors de la génération du document Word APES' });
            }
        });
    }
    /**
     * Exporter une checklist d'audit en Word
     * GET /words/checklist-audit/:id/export
     */
    exportChecklistAuditToWord(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = this.getParamId(req); // ← Correction ici
                const checklist = yield formService.getChecklistAuditById(id);
                if (!checklist) {
                    res.status(404).json({ message: "Checklist d'audit non trouvée" });
                    return;
                }
                const buffer = yield (0, words_service_1.exportChecklistAuditWord)(checklist);
                const subprojet = checklist.subprojet || 'checklist';
                const filename = `checklist-audit-${String(subprojet).replace(/\s+/g, '_')}.docx`;
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.send(buffer);
            }
            catch (error) {
                console.error('[WordExport] Erreur export Checklist Audit:', error);
                res.status(500).json({ message: 'Erreur lors de la génération du document Word Checklist Audit' });
            }
        });
    }
    /**
     * Exporter une checklist conducteur de travaux en Word
     * GET /words/checklist-conducteur/:id/export
     */
    exportChecklistConducteurToWord(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = this.getParamId(req); // ← Correction ici
                const checklist = yield formService.getChecklistConducteurById(id);
                if (!checklist) {
                    res.status(404).json({ message: 'Checklist conducteur non trouvée' });
                    return;
                }
                const buffer = yield (0, words_service_1.exportChecklistConducteurWord)(checklist);
                const subprojet = checklist.subprojet || 'conducteur';
                const filename = `checklist-conducteur-${String(subprojet).replace(/\s+/g, '_')}.docx`;
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.send(buffer);
            }
            catch (error) {
                console.error('[WordExport] Erreur export Checklist Conducteur:', error);
                res.status(500).json({ message: 'Erreur lors de la génération du document Word Checklist Conducteur' });
            }
        });
    }
    /**
     * Exporter un guide d'entretien en Word
     * GET /words/guide-entretien/:id/export
     */
    exportGuideEntretienToWord(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = this.getParamId(req); // ← Correction ici
                const guide = yield formService.getGuideEntretienById(id);
                if (!guide) {
                    res.status(404).json({ message: "Guide d'entretien non trouvé" });
                    return;
                }
                const buffer = yield (0, words_service_1.exportGuideEntretienWord)(guide);
                const subprojet = guide.subprojet || 'guide';
                const guideType = guide.guide_type || 'entretien';
                const filename = `guide-${guideType}-${String(subprojet).replace(/\s+/g, '_')}.docx`;
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.send(buffer);
            }
            catch (error) {
                console.error('[WordExport] Erreur export Guide Entretien:', error);
                res.status(500).json({ message: "Erreur lors de la génération du document Word Guide d'entretien" });
            }
        });
    }
}
exports.WordExportController = WordExportController;
exports.default = new WordExportController();
//# sourceMappingURL=words.controller.js.map