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
exports.formController = exports.FormController = void 0;
const form_service_1 = require("../services/form.service");
const form_service_2 = require("../services/form.service");
const databaseConnect_1 = require("../config/databaseConnect");
const formService = new form_service_1.FormService();
const questionService = new form_service_2.QuestionService();
// =============================================================================
// HELPERS
// =============================================================================
const isValidId = (id) => {
    return typeof id === 'string' && id.length === 16 && /^[a-f0-9]{16}$/i.test(id);
};
const paginate = (req) => {
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    return {
        page: isNaN(page) || page < 1 ? 1 : page,
        limit: isNaN(limit) || limit < 1 ? 10 : Math.min(limit, 100)
    };
};
// =============================================================================
// FORM CONTROLLER
// =============================================================================
class FormController {
    // ===========================================================================
    // PROJETS
    // ===========================================================================
    getAllProjects(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page, limit } = paginate(req);
                const result = yield formService.projects.getAll(page, limit);
                res.json({ success: true, data: result.items, pagination: { page: result.page, limit, total: result.total, totalPages: result.totalPages } });
            }
            catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
    }
    getProjectById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!isValidId(id))
                    return res.status(400).json({ success: false, message: 'ID invalide' });
                const project = yield formService.projects.getById(id);
                if (!project)
                    return res.status(404).json({ success: false, message: 'Projet non trouvé' });
                res.json({ success: true, data: project });
            }
            catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
    }
    // ===========================================================================
    // QUESTIONS (charge les questions selon le type de formulaire)
    // ===========================================================================
    getFormQuestions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { projectId, formType } = req.params;
                const { sectionKey } = req.query;
                const data = yield questionService.getFormQuestions(projectId, formType, sectionKey);
                res.json({ data });
            }
            catch (e) {
                res.status(500).json({ message: e.message });
            }
        });
    }
    getFormQuestionsBySection(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { projectId, formType, sectionKey } = req.params;
                const data = yield questionService.getProjectQuestionsBySection(projectId, formType, sectionKey);
                res.json({ data });
            }
            catch (e) {
                res.status(500).json({ message: e.message });
            }
        });
    }
    getQuestionById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield questionService.getProjectQuestionById(req.params.id);
                if (!data)
                    return res.status(404).json({ message: 'Question introuvable' });
                res.json({ data });
            }
            catch (e) {
                res.status(500).json({ message: e.message });
            }
        });
    }
    // ===========================================================================
    // APES FORM
    // ===========================================================================
    createAPES(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield formService.apes.create(req.body);
                res.status(201).json({ success: true, type: 'apes', data: result });
            }
            catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
        });
    }
    getAPES(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!isValidId(id))
                    return res.status(400).json({ success: false, message: 'ID invalide' });
                const apes = yield formService.apes.getById(id);
                if (!apes)
                    return res.status(404).json({ success: false, message: 'Formulaire APES non trouvé' });
                res.json({ success: true, type: 'apes', data: apes });
            }
            catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
    }
    updateAPES(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!isValidId(id))
                    return res.status(400).json({ success: false, message: 'ID invalide' });
                // Pour la mise à jour, on utilise saveDocumentReview, saveFieldInspection, etc.
                // ou on implémente une méthode update dans le service
                res.json({ success: true, message: 'Mise à jour APES à implémenter' });
            }
            catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
        });
    }
    submitAPES(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!isValidId(id))
                    return res.status(400).json({ success: false, message: 'ID invalide' });
                const result = yield formService.apes.submit(id);
                res.json({ success: true, type: 'apes', message: 'Formulaire APES soumis avec succès', data: result });
            }
            catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
        });
    }
    // ===========================================================================
    // GUIDE ENTRETIEN
    // ===========================================================================
    createGuideEntretien(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield formService.guideEntretien.create(req.body);
                res.status(201).json({ success: true, type: 'guide_entretien', data: result });
            }
            catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
        });
    }
    getGuideEntretien(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!isValidId(id))
                    return res.status(400).json({ success: false, message: 'ID invalide' });
                const guide = yield formService.guideEntretien.getById(id);
                if (!guide)
                    return res.status(404).json({ success: false, message: 'Guide non trouvé' });
                res.json({ success: true, type: 'guide_entretien', data: guide });
            }
            catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
    }
    submitGuideEntretien(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!isValidId(id))
                    return res.status(400).json({ success: false, message: 'ID invalide' });
                // Implémenter la soumission si nécessaire
                res.json({ success: true, type: 'guide_entretien', message: 'Guide soumis avec succès' });
            }
            catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
        });
    }
    // ===========================================================================
    // DATA COLLECTION
    // ===========================================================================
    createDataCollection(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield formService.dataCollection.create(req.body);
                res.status(201).json({ success: true, type: 'data_collection', data: result });
            }
            catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
        });
    }
    getDataCollection(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!isValidId(id))
                    return res.status(400).json({ success: false, message: 'ID invalide' });
                const data = yield formService.dataCollection.getById(id);
                if (!data)
                    return res.status(404).json({ success: false, message: 'Formulaire Data Collection non trouvé' });
                res.json({ success: true, type: 'data_collection', data });
            }
            catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
    }
    updateDataCollection(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!isValidId(id))
                    return res.status(400).json({ success: false, message: 'ID invalide' });
                const result = yield formService.dataCollection.update(id, req.body);
                res.json({ success: true, type: 'data_collection', data: result });
            }
            catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
        });
    }
    // ===========================================================================
    // CHECKLIST AUDIT
    // ===========================================================================
    createChecklistAudit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield formService.checklistAudit.create(req.body);
                res.status(201).json({ success: true, type: 'checklist_audit', data: result });
            }
            catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
        });
    }
    getChecklistAudit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!isValidId(id))
                    return res.status(400).json({ success: false, message: 'ID invalide' });
                const audit = yield formService.checklistAudit.getById(id);
                if (!audit)
                    return res.status(404).json({ success: false, message: 'Audit non trouvé' });
                res.json({ success: true, type: 'checklist_audit', data: audit });
            }
            catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
    }
    submitChecklistAudit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!isValidId(id))
                    return res.status(400).json({ success: false, message: 'ID invalide' });
                res.json({ success: true, type: 'checklist_audit', message: 'Audit soumis avec succès' });
            }
            catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
        });
    }
    // ===========================================================================
    // CHECKLIST CONDUCTEUR
    // ===========================================================================
    createChecklistConducteur(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield formService.checklistConducteur.create(req.body);
                res.status(201).json({ success: true, type: 'checklist_conducteur', data: result });
            }
            catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
        });
    }
    getChecklistConducteur(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!isValidId(id))
                    return res.status(400).json({ success: false, message: 'ID invalide' });
                const conducteur = yield formService.checklistConducteur.getById(id);
                if (!conducteur)
                    return res.status(404).json({ success: false, message: 'Checklist non trouvée' });
                res.json({ success: true, type: 'checklist_conducteur', data: conducteur });
            }
            catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
    }
    submitChecklistConducteur(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!isValidId(id))
                    return res.status(400).json({ success: false, message: 'ID invalide' });
                res.json({ success: true, type: 'checklist_conducteur', message: 'Checklist soumise avec succès' });
            }
            catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
        });
    }
    // ===========================================================================
    // FORMULAIRE UNIQUE (GET)
    // ===========================================================================
    getForm(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const type = req.query.type;
                if (!isValidId(id))
                    return res.status(400).json({ success: false, message: 'ID invalide' });
                const resolvers = {
                    guide_entretien: () => formService.guideEntretien.getById(id),
                    checklist_audit: () => formService.checklistAudit.getById(id),
                    checklist_conducteur: () => formService.checklistConducteur.getById(id),
                    apes: () => formService.apes.getById(id),
                    data_collection: () => formService.dataCollection.getById(id),
                };
                // Si le type est fourni, requête directe
                if (type && resolvers[type]) {
                    const data = yield resolvers[type]();
                    if (!data)
                        return res.status(404).json({ success: false, message: 'Formulaire non trouvé' });
                    return res.json({ success: true, type, data });
                }
                // Fallback : essai séquentiel
                for (const [formType, resolve] of Object.entries(resolvers)) {
                    const data = yield resolve();
                    if (data)
                        return res.json({ success: true, type: formType, data });
                }
                res.status(404).json({ success: false, message: 'Formulaire non trouvé' });
            }
            catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
    }
    submitForm(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!isValidId(id))
                    return res.status(400).json({ success: false, message: 'ID invalide' });
                const apesResult = yield formService.apes.submit(id);
                if (apesResult) {
                    return res.json({ success: true, type: 'apes', message: 'Formulaire soumis avec succès', data: apesResult });
                }
                res.status(404).json({ success: false, message: 'Formulaire non trouvé' });
            }
            catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
        });
    }
    getAllForms(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page, limit } = paginate(req);
                const projectId = req.query.projectId;
                if (!projectId) {
                    return res.status(400).json({ success: false, message: 'projectId requis' });
                }
                // Utiliser les procédures existantes
                const [apesRows] = yield databaseConnect_1.pool.query('CALL sp_list_apes(?, ?, ?, ?)', [projectId, null, limit, (page - 1) * limit]);
                const [guideRows] = yield databaseConnect_1.pool.query(`SELECT id, status, created_at, submitted_at, subprojet, 'guide_entretien' AS formType 
       FROM guide_entretien WHERE project_id = ?`, [projectId]);
                const [auditRows] = yield databaseConnect_1.pool.query(`SELECT id, status, created_at, submitted_at, subprojet, 'checklist_audit' AS formType 
       FROM checklist_audit WHERE project_id = ?`, [projectId]);
                const [conducteurRows] = yield databaseConnect_1.pool.query(`SELECT id, status, created_at, submitted_at, subprojet, 'checklist_conducteur' AS formType 
       FROM checklist_conducteur WHERE project_id = ?`, [projectId]);
                const [dataCollectionRows] = yield databaseConnect_1.pool.query(`SELECT dc.id, dc.status, dc.created_at, dc.submitted_at, drd.subprojet, 'data_collection' AS formType
       FROM data_collection dc
       LEFT JOIN data_collection_revue_doc drd ON drd.data_collection_id = dc.id
       WHERE dc.project_id = ?`, [projectId]);
                // apesRows[0] contient les résultats, apesRows[1] contient le total
                const apesItems = apesRows[0] || [];
                const allForms = [
                    ...apesItems.map((r) => ({
                        id: r.form_id,
                        name: r.project_name || 'Formulaire APES',
                        type: 'apes',
                        status: r.status,
                        created_at: r.created_at,
                        submitted_at: r.submitted_at
                    })),
                    ...guideRows.map((r) => ({
                        id: r.id,
                        name: r.subprojet || 'Guide entretien',
                        type: 'guide_entretien',
                        status: r.status,
                        created_at: r.created_at,
                        submitted_at: r.submitted_at
                    })),
                    ...auditRows.map((r) => ({
                        id: r.id,
                        name: r.subprojet || 'Checklist audit',
                        type: 'checklist_audit',
                        status: r.status,
                        created_at: r.created_at,
                        submitted_at: r.submitted_at
                    })),
                    ...conducteurRows.map((r) => ({
                        id: r.id,
                        name: r.subprojet || 'Checklist conducteur',
                        type: 'checklist_conducteur',
                        status: r.status,
                        created_at: r.created_at,
                        submitted_at: r.submitted_at
                    })),
                    ...dataCollectionRows.map((r) => ({
                        id: r.id,
                        name: r.subprojet || 'Data collection',
                        type: 'data_collection',
                        status: r.status,
                        created_at: r.created_at,
                        submitted_at: r.submitted_at
                    }))
                ];
                allForms.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                const total = allForms.length;
                const start = (page - 1) * limit;
                const paginated = allForms.slice(start, start + limit);
                res.json({
                    success: true,
                    data: paginated,
                    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
                });
            }
            catch (error) {
                console.error('Erreur getAllForms:', error);
                res.status(500).json({ success: false, message: error.message });
            }
        });
    }
}
exports.FormController = FormController;
exports.formController = new FormController();
//# sourceMappingURL=form.controller.js.map