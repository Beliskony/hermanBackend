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
                    case 'apes': {
                        // Pour APES, il faut extraire les questions du formulaire
                        const questions = extractQuestionsFromAPESData(data);
                        buffer = yield (0, words_service_1.exportAPESWord)({
                            project_name: data.project_name || projectName,
                            date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString(),
                            auditors: data.auditors || auditors,
                            location: data.location || projectLocation,
                            period: data.period || '',
                            document_review: data.document_review ? {
                                documents_presents: data.document_review.documents_presents,
                            } : undefined,
                            field_inspection: data.field_inspection ? {
                                water_management: data.field_inspection.water_management,
                                waste_management: data.field_inspection.waste_management,
                                emissions: data.field_inspection.emissions,
                                health_safety: data.field_inspection.health_safety,
                                community: data.field_inspection.community,
                            } : undefined,
                            stakeholder_interview: data.stakeholder_interview ? {
                                responses: data.stakeholder_interview.responses,
                            } : undefined,
                            gender_assessment: data.gender_assessment ? {
                                quantitative_data: data.gender_assessment.quantitative_data,
                            } : undefined,
                            complaint_mechanism: data.complaint_mechanism ? {
                                documentary_basis: data.complaint_mechanism.documentary_basis,
                            } : undefined,
                        }, projectName, projectLocation, auditors, questions);
                        filename = generateFilename('apes', projectName);
                        break;
                    }
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
// =============================================================================
//  FONCTION D'EXTRACTION DES QUESTIONS POUR APES
// =============================================================================
function extractQuestionsFromAPESData(data) {
    const questions = [];
    // Si les questions sont déjà dans data.questions
    if (data.questions && Array.isArray(data.questions)) {
        return data.questions.map((q) => ({
            section_key: q.section_key,
            question_id: q.question_id,
            question_text: q.question_text,
            sort_order: q.sort_order,
        }));
    }
    // Si les questions sont dans data.questions_by_section
    if (data.questions_by_section) {
        for (const section of Object.values(data.questions_by_section)) {
            if (Array.isArray(section)) {
                for (const q of section) {
                    questions.push({
                        section_key: q.section_key,
                        question_id: q.question_id,
                        question_text: q.question_text,
                        sort_order: q.sort_order,
                    });
                }
            }
        }
        return questions;
    }
    // Si aucune question n'est trouvée, retourner un tableau vide
    console.warn('[APES Export] Aucune question trouvée dans les données');
    return [];
}
exports.default = WordExportController;
//# sourceMappingURL=words.controller.js.map