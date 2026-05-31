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
// Helper pour extraire un ID valide
const getValidId = (param) => {
    if (!param)
        return null;
    const id = Array.isArray(param) ? param[0] : param;
    return id && /^[a-zA-Z0-9_-]{16}$/.test(id) ? id : null;
};
// Helper pour générer le nom du fichier
const generateFilename = (type, name) => {
    const safeName = String(name).replace(/\s+/g, '_').substring(0, 50);
    return `${type}-${safeName}.docx`;
};
class WordExportController {
    /**
     * Route UNIQUE pour exporter n'importe quel formulaire
     * GET /words/export/:id
     *
     * Détecte automatiquement le type de formulaire et génère le Word correspondant
     */
    exportAnyFormToWord(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = getValidId(req.params.id);
                if (!id) {
                    res.status(400).json({ message: 'ID invalide (doit être 16 caractères alphanumériques)' });
                    return;
                }
                // Détection du type de formulaire
                let type = null;
                let data = null;
                // 1. Essayer Guide Entretien
                data = yield formService.getGuideEntretienById(id);
                if (data)
                    type = 'guide-entretien';
                // 2. Essayer Checklist Audit
                if (!data) {
                    data = yield formService.getChecklistAuditById(id);
                    if (data)
                        type = 'checklist-audit';
                }
                // 3. Essayer Checklist Conducteur
                if (!data) {
                    data = yield formService.getChecklistConducteurById(id);
                    if (data)
                        type = 'checklist-conducteur';
                }
                // 4. Essayer APES Form
                if (!data) {
                    data = yield formService.getFormById(id);
                    if (data)
                        type = 'apes';
                }
                if (!data || !type) {
                    res.status(404).json({ message: 'Formulaire non trouvé' });
                    return;
                }
                // Génération du document Word selon le type
                let buffer;
                let filename;
                switch (type) {
                    case 'guide-entretien':
                        buffer = yield (0, words_service_1.exportGuideEntretienWord)(data);
                        filename = generateFilename(`guide-${data.guide_type || 'entretien'}`, data.subprojet || data.gi_nom || 'guide');
                        break;
                    case 'checklist-audit':
                        buffer = yield (0, words_service_1.exportChecklistAuditWord)(data);
                        filename = generateFilename('checklist-audit', data.subprojet || 'audit');
                        break;
                    case 'checklist-conducteur':
                        buffer = yield (0, words_service_1.exportChecklistConducteurWord)(data);
                        filename = generateFilename('checklist-conducteur', data.subprojet || 'conducteur');
                        break;
                    case 'apes':
                        buffer = yield (0, words_service_1.generateFormDataWordDocument)(data);
                        filename = generateFilename('apes', data.project_name || 'projet');
                        break;
                    default:
                        res.status(400).json({ message: 'Type de formulaire non supporté' });
                        return;
                }
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.send(buffer);
            }
            catch (error) {
                console.error('[WordExport] Erreur:', error);
                res.status(500).json({
                    message: 'Erreur lors de la génération du document Word',
                    error: error instanceof Error ? error.message : 'Erreur inconnue'
                });
            }
        });
    }
}
exports.WordExportController = WordExportController;
exports.default = WordExportController;
//# sourceMappingURL=words.controller.js.map