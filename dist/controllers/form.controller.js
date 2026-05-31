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
exports.getStats = exports.getAllFormsUnified = exports.deleteAnyForm = exports.updateAnyForm = exports.getAnyFormById = exports.createAnyForm = void 0;
const form_service_1 = require("../services/form.service");
const formService = new form_service_1.FormService();
// ─── HELPERS ─────────────────────────────────────────────────
const isValidId = (id) => !Array.isArray(id);
const paginate = (req) => {
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    return {
        page: isNaN(page) || page < 1 ? 1 : page,
        limit: isNaN(limit) || limit < 1 ? 10 : limit
    };
};
/**
 * Détection automatique du type de formulaire
 */
const detectFormType = (body) => {
    // Guide Entretien
    if (body.guide_type || body.gi_nom || body.theme1) {
        return 'guide-entretien';
    }
    // Checklist Audit
    if (body.section1_cadreJuridique !== undefined || body.section2_infraSecurite || body.section6_bilanDocumentaire) {
        return 'checklist-audit';
    }
    // Checklist Conducteur
    if (body.section1_infoGenerales || body.section2_processusInitialT1 || body.auditeur) {
        return 'checklist-conducteur';
    }
    // APES (par défaut)
    if (body.projectInfo || body.project_name) {
        return 'apes';
    }
    throw new Error('Impossible de détecter le type de formulaire. Vérifiez les champs envoyés.');
};
// ─── ROUTE UNIFIÉE ───────────────────────────────────────────
/**
 * POST /forms
 * Crée n'importe quel type de formulaire automatiquement
 */
const createAnyForm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const formType = detectFormType(req.body);
        let result;
        switch (formType) {
            case 'guide-entretien':
                result = yield formService.createGuideEntretien(req.body);
                break;
            case 'checklist-audit':
                result = yield formService.createChecklistAudit(req.body);
                break;
            case 'checklist-conducteur':
                result = yield formService.createChecklistConducteur(req.body);
                break;
            case 'apes':
                result = yield formService.createForm(req.body);
                break;
        }
        res.status(201).json({
            success: true,
            message: `${formType} créé avec succès`,
            data: result,
            type: formType
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Erreur lors de la création du formulaire'
        });
    }
});
exports.createAnyForm = createAnyForm;
/**
 * GET /forms/:id
 * Récupère n'importe quel formulaire par son ID
 */
const getAnyFormById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!isValidId(id)) {
            return res.status(400).json({ success: false, message: 'ID invalide' });
        }
        // Essayer chaque type
        let result = yield formService.getGuideEntretienById(id);
        if (result) {
            return res.json({ success: true, type: 'guide-entretien', data: result });
        }
        result = yield formService.getChecklistAuditById(id);
        if (result) {
            return res.json({ success: true, type: 'checklist-audit', data: result });
        }
        result = yield formService.getChecklistConducteurById(id);
        if (result) {
            return res.json({ success: true, type: 'checklist-conducteur', data: result });
        }
        result = yield formService.getFormById(id);
        if (result) {
            return res.json({ success: true, type: 'apes', data: result });
        }
        res.status(404).json({ success: false, message: 'Formulaire non trouvé' });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la récupération du formulaire'
        });
    }
});
exports.getAnyFormById = getAnyFormById;
/**
 * PUT /forms/:id
 * Met à jour n'importe quel formulaire
 */
const updateAnyForm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!isValidId(id)) {
            return res.status(400).json({ success: false, message: 'ID invalide' });
        }
        const formType = detectFormType(req.body);
        let result;
        switch (formType) {
            case 'guide-entretien':
                result = yield formService.updateGuideEntretien(id, req.body);
                break;
            case 'checklist-audit':
                result = yield formService.updateChecklistAudit(id, req.body);
                break;
            case 'checklist-conducteur':
                result = yield formService.updateChecklistConducteur(id, req.body);
                break;
            case 'apes':
                result = yield formService.updateForm(id, req.body);
                break;
        }
        if (!result) {
            return res.status(404).json({ success: false, message: 'Formulaire non trouvé' });
        }
        res.json({
            success: true,
            message: `${formType} mis à jour avec succès`,
            data: result,
            type: formType
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Erreur lors de la mise à jour du formulaire'
        });
    }
});
exports.updateAnyForm = updateAnyForm;
/**
 * DELETE /forms/:id
 * Supprime n'importe quel formulaire
 */
const deleteAnyForm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!isValidId(id)) {
            return res.status(400).json({ success: false, message: 'ID invalide' });
        }
        // Essayer chaque type
        let deleted = yield formService.deleteGuideEntretien(id);
        if (deleted) {
            return res.json({ success: true, message: 'Guide entretien supprimé avec succès' });
        }
        deleted = yield formService.deleteChecklistAudit(id);
        if (deleted) {
            return res.json({ success: true, message: 'Checklist audit supprimée avec succès' });
        }
        deleted = yield formService.deleteChecklistConducteur(id);
        if (deleted) {
            return res.json({ success: true, message: 'Checklist conducteur supprimée avec succès' });
        }
        deleted = yield formService.deleteForm(id);
        if (deleted) {
            return res.json({ success: true, message: 'Formulaire APES supprimé avec succès' });
        }
        res.status(404).json({ success: false, message: 'Formulaire non trouvé' });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la suppression du formulaire'
        });
    }
});
exports.deleteAnyForm = deleteAnyForm;
/**
 * GET /forms
 * Liste tous les formulaires (tous types confondus)
 */
const getAllFormsUnified = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit } = paginate(req);
        const status = typeof req.query.status === 'string' ? req.query.status : undefined;
        const search = typeof req.query.search === 'string' ? req.query.search : undefined;
        // Récupérer tous les types
        const [apesResult, auditResult, conducteurResult, guideResult] = yield Promise.all([
            formService.getAllForms({ status, projectName: search }, page, 100),
            formService.getAllChecklistAudits({ subprojet: search }, page, 100),
            formService.getAllChecklistConducteurs({ subprojet: search }, page, 100),
            formService.getAllGuideEntretiens({ subprojet: search }, page, 100)
        ]);
        // Fusionner et trier
        const allForms = [
            ...apesResult.forms.map((f) => (Object.assign(Object.assign({}, f), { formType: 'apes' }))),
            ...auditResult.items.map((f) => (Object.assign(Object.assign({}, f), { formType: 'checklist-audit' }))),
            ...conducteurResult.items.map((f) => (Object.assign(Object.assign({}, f), { formType: 'checklist-conducteur' }))),
            ...guideResult.items.map((f) => (Object.assign(Object.assign({}, f), { formType: 'guide-entretien' })))
        ];
        // Trier par date de création
        allForms.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        // Pagination manuelle
        const start = (page - 1) * limit;
        const paginated = allForms.slice(start, start + limit);
        res.json({
            success: true,
            data: paginated,
            pagination: {
                page,
                limit,
                total: allForms.length,
                totalPages: Math.ceil(allForms.length / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la récupération des formulaires'
        });
    }
});
exports.getAllFormsUnified = getAllFormsUnified;
const getStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield formService.getGlobalStats();
        res.status(200).json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Erreur getStats:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la récupération des statistiques'
        });
    }
});
exports.getStats = getStats;
//# sourceMappingURL=form.controller.js.map