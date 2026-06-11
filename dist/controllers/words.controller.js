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
const words_service_1 = require("../services/word/words.service");
const form_service_1 = require("../services/form.service");
const formService = new form_service_1.FormService();
const getValidId = (param) => {
    if (!param)
        return null;
    const id = Array.isArray(param) ? param[0] : param;
    return id && /^[a-zA-Z0-9_-]{16}$/.test(id) ? id : null;
};
const generateFilename = (type, name) => {
    const safeName = String(name).replace(/\s+/g, '_').substring(0, 50);
    return `${type}-${safeName}.docx`;
};
const extractMeta = (data) => ({
    projectName: data.project_name || data.subprojet || data.gi_nom || 'Projet',
    projectLocation: data.project_location || data.lieu || '—',
    auditors: data.auditors || data.auditeurs || data.auditeur || data.gi_nom || '—',
});
class WordExportController {
    /**
     * GET /words/export/:id
     * Détecte le type de formulaire et génère le Word correspondant
     */
    exportAnyFormToWord(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = getValidId(req.params.id);
                if (!id) {
                    res.status(400).json({ message: 'ID invalide (doit être 16 caractères alphanumériques)' });
                    return;
                }
                let formType = null;
                let data = null;
                // 1. Guide entretien
                data = yield formService.guideEntretien.getById(id);
                if (data)
                    formType = 'guide-entretien';
                // 2. Checklist audit
                if (!data) {
                    data = yield formService.checklistAudit.getById(id);
                    if (data)
                        formType = 'checklist-audit';
                }
                // 3. Checklist conducteur
                if (!data) {
                    data = yield formService.checklistConducteur.getById(id);
                    if (data)
                        formType = 'checklist-conducteur';
                }
                // 4. APES
                if (!data) {
                    data = yield formService.apes.getById(id);
                    if (data)
                        formType = 'apes';
                }
                // 5. Data Collection
                if (!data) {
                    data = yield formService.dataCollection.getById(id);
                    if (data)
                        formType = 'data-collection';
                }
                if (!data || !formType) {
                    res.status(404).json({ message: 'Formulaire non trouvé' });
                    return;
                }
                const { projectName, projectLocation, auditors } = extractMeta(data);
                let buffer;
                let filename;
                switch (formType) {
                    case 'guide-entretien':
                        buffer = yield (0, words_service_1.exportGuideWord)(data, projectName, projectLocation, auditors);
                        filename = generateFilename(`guide-${data.guide_type || 'entretien'}`, data.subprojet || data.gi_nom || 'guide');
                        break;
                    case 'checklist-audit':
                        buffer = yield (0, words_service_1.exportAuditWord)(data, projectName, projectLocation, auditors);
                        filename = generateFilename('checklist-audit', data.subprojet || 'audit');
                        break;
                    case 'checklist-conducteur':
                        buffer = yield (0, words_service_1.exportConducteurWord)(data, projectName, projectLocation, auditors);
                        filename = generateFilename('checklist-conducteur', data.subprojet || 'conducteur');
                        break;
                    case 'apes':
                        buffer = yield (0, words_service_1.exportAPESWord)(data, projectName, projectLocation, auditors);
                        filename = generateFilename('apes', projectName);
                        break;
                    case 'data-collection':
                        buffer = yield (0, words_service_1.exportDataCollectionWord)(data, projectName, projectLocation, auditors);
                        filename = generateFilename('data-collection', data.subprojet || 'data-collection');
                        break;
                }
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.send(buffer);
            }
            catch (error) {
                console.error('[WordExport] Erreur:', error);
                res.status(500).json({
                    message: 'Erreur lors de la génération du document Word',
                    error: error instanceof Error ? error.message : 'Erreur inconnue',
                });
            }
        });
    }
}
exports.WordExportController = WordExportController;
exports.default = WordExportController;
//# sourceMappingURL=words.controller.js.map