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
exports.deleteChecklistConducteur = exports.updateChecklistConducteur = exports.getAllChecklistConducteurs = exports.getChecklistConducteur = exports.createChecklistConducteur = exports.deleteChecklistAudit = exports.updateChecklistAudit = exports.getAllChecklistAudits = exports.getChecklistAudit = exports.createChecklistAudit = exports.deleteGuideEntretien = exports.updateGuideEntretien = exports.getAllGuideEntretiens = exports.getGuideEntretien = exports.createGuideEntretien = exports.getStats = exports.submitForm = exports.deleteForm = exports.updateForm = exports.getAllForms = exports.getForm = exports.createForm = void 0;
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
// ─── FORM (ancien FormData) ───────────────────────────────────
const createForm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const form = yield formService.createForm(req.body);
        res.status(201).json({ success: true, message: 'Formulaire créé avec succès', data: form });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Erreur lors de la création du formulaire' });
    }
});
exports.createForm = createForm;
const getForm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!isValidId(id))
            return void res.status(400).json({ success: false, message: 'ID invalide' });
        const form = yield formService.getFormById(id);
        if (!form)
            return void res.status(404).json({ success: false, message: 'Formulaire non trouvé' });
        res.status(200).json({ success: true, data: form });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Erreur lors de la récupération du formulaire' });
    }
});
exports.getForm = getForm;
const getAllForms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const status = typeof req.query.status === 'string' ? req.query.status : undefined;
        const projectName = typeof req.query.projectName === 'string' ? req.query.projectName : undefined;
        const dateFrom = typeof req.query.dateFrom === 'string' ? req.query.dateFrom : undefined;
        const dateTo = typeof req.query.dateTo === 'string' ? req.query.dateTo : undefined;
        const pageParam = req.query.page;
        const limitParam = req.query.limit;
        const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) : Array.isArray(pageParam) ? parseInt(pageParam[0], 10) : 1;
        const limit = typeof limitParam === 'string' ? parseInt(limitParam, 10) : Array.isArray(limitParam) ? parseInt(limitParam[0], 10) : 10;
        const filters = {};
        if (status)
            filters.status = status;
        if (projectName)
            filters.projectName = projectName;
        if (dateFrom) {
            const d = new Date(dateFrom);
            if (!isNaN(d.getTime()))
                filters.dateFrom = d;
        }
        if (dateTo) {
            const d = new Date(dateTo);
            if (!isNaN(d.getTime()))
                filters.dateTo = d;
        }
        const validatedPage = isNaN(page) || page < 1 ? 1 : page;
        const validatedLimit = isNaN(limit) || limit < 1 ? 10 : limit;
        const result = yield formService.getAllForms(filters, validatedPage, validatedLimit);
        res.status(200).json({
            success: true,
            data: result.forms,
            pagination: { page: result.page, limit: validatedLimit, total: result.total, totalPages: result.totalPages }
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Erreur lors de la récupération des formulaires' });
    }
});
exports.getAllForms = getAllForms;
const updateForm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!isValidId(id))
            return void res.status(400).json({ success: false, message: 'ID invalide' });
        const updatedForm = yield formService.updateForm(id, req.body);
        if (!updatedForm)
            return void res.status(404).json({ success: false, message: 'Formulaire non trouvé' });
        res.status(200).json({ success: true, message: 'Formulaire mis à jour avec succès', data: updatedForm });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Erreur lors de la mise à jour du formulaire' });
    }
});
exports.updateForm = updateForm;
const deleteForm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!isValidId(id))
            return void res.status(400).json({ success: false, message: 'ID invalide' });
        const deleted = yield formService.deleteForm(id);
        if (!deleted)
            return void res.status(404).json({ success: false, message: 'Formulaire non trouvé' });
        res.status(200).json({ success: true, message: 'Formulaire supprimé avec succès' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Erreur lors de la suppression du formulaire' });
    }
});
exports.deleteForm = deleteForm;
const submitForm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!isValidId(id))
            return void res.status(400).json({ success: false, message: 'ID invalide' });
        const submittedForm = yield formService.submitForm(id);
        if (!submittedForm)
            return void res.status(404).json({ success: false, message: 'Formulaire non trouvé' });
        res.status(200).json({ success: true, message: 'Formulaire soumis avec succès', data: submittedForm });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Erreur lors de la soumission du formulaire' });
    }
});
exports.submitForm = submitForm;
const getStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield formService.getFormStats();
        res.status(200).json({ success: true, data: stats });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Erreur lors de la récupération des statistiques' });
    }
});
exports.getStats = getStats;
// ─── GUIDE D'ENTRETIEN ───────────────────────────────────────
const createGuideEntretien = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield formService.createGuideEntretien(req.body);
        res.status(201).json({ success: true, message: 'GuideEntretien créé avec succès', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.createGuideEntretien = createGuideEntretien;
const getGuideEntretien = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!isValidId(req.params.id))
            return void res.status(400).json({ success: false, message: 'ID invalide' });
        const data = yield formService.getGuideEntretienById(req.params.id);
        if (!data)
            return void res.status(404).json({ success: false, message: 'GuideEntretien non trouvé' });
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.getGuideEntretien = getGuideEntretien;
const getAllGuideEntretiens = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit } = paginate(req);
        const guideType = typeof req.query.guideType === 'string' ? req.query.guideType : undefined;
        const subprojet = typeof req.query.subprojet === 'string' ? req.query.subprojet : undefined;
        const result = yield formService.getAllGuideEntretiens({ guideType, subprojet }, page, limit);
        res.status(200).json({ success: true, data: result.items, pagination: { page: result.page, limit, total: result.total, totalPages: result.totalPages } });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.getAllGuideEntretiens = getAllGuideEntretiens;
const updateGuideEntretien = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!isValidId(req.params.id))
            return void res.status(400).json({ success: false, message: 'ID invalide' });
        const data = yield formService.updateGuideEntretien(req.params.id, req.body);
        if (!data)
            return void res.status(404).json({ success: false, message: 'GuideEntretien non trouvé' });
        res.status(200).json({ success: true, message: 'GuideEntretien mis à jour avec succès', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.updateGuideEntretien = updateGuideEntretien;
const deleteGuideEntretien = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!isValidId(req.params.id))
            return void res.status(400).json({ success: false, message: 'ID invalide' });
        const deleted = yield formService.deleteGuideEntretien(req.params.id);
        if (!deleted)
            return void res.status(404).json({ success: false, message: 'GuideEntretien non trouvé' });
        res.status(200).json({ success: true, message: 'GuideEntretien supprimé avec succès' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.deleteGuideEntretien = deleteGuideEntretien;
// ─── CHECKLIST AUDIT ─────────────────────────────────────────
const createChecklistAudit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield formService.createChecklistAudit(req.body);
        res.status(201).json({ success: true, message: 'ChecklistAudit créée avec succès', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.createChecklistAudit = createChecklistAudit;
const getChecklistAudit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!isValidId(req.params.id))
            return void res.status(400).json({ success: false, message: 'ID invalide' });
        const data = yield formService.getChecklistAuditById(req.params.id);
        if (!data)
            return void res.status(404).json({ success: false, message: 'ChecklistAudit non trouvée' });
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.getChecklistAudit = getChecklistAudit;
const getAllChecklistAudits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit } = paginate(req);
        const subprojet = typeof req.query.subprojet === 'string' ? req.query.subprojet : undefined;
        const auditeurs = typeof req.query.auditeurs === 'string' ? req.query.auditeurs : undefined;
        const result = yield formService.getAllChecklistAudits({ subprojet, auditeurs }, page, limit);
        res.status(200).json({ success: true, data: result.items, pagination: { page: result.page, limit, total: result.total, totalPages: result.totalPages } });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.getAllChecklistAudits = getAllChecklistAudits;
const updateChecklistAudit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!isValidId(req.params.id))
            return void res.status(400).json({ success: false, message: 'ID invalide' });
        const data = yield formService.updateChecklistAudit(req.params.id, req.body);
        if (!data)
            return void res.status(404).json({ success: false, message: 'ChecklistAudit non trouvée' });
        res.status(200).json({ success: true, message: 'ChecklistAudit mise à jour avec succès', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.updateChecklistAudit = updateChecklistAudit;
const deleteChecklistAudit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!isValidId(req.params.id))
            return void res.status(400).json({ success: false, message: 'ID invalide' });
        const deleted = yield formService.deleteChecklistAudit(req.params.id);
        if (!deleted)
            return void res.status(404).json({ success: false, message: 'ChecklistAudit non trouvée' });
        res.status(200).json({ success: true, message: 'ChecklistAudit supprimée avec succès' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.deleteChecklistAudit = deleteChecklistAudit;
// ─── CHECKLIST CONDUCTEUR TRAVAUX ────────────────────────────
const createChecklistConducteur = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield formService.createChecklistConducteur(req.body);
        res.status(201).json({ success: true, message: 'ChecklistConducteur créée avec succès', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.createChecklistConducteur = createChecklistConducteur;
const getChecklistConducteur = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!isValidId(req.params.id))
            return void res.status(400).json({ success: false, message: 'ID invalide' });
        const data = yield formService.getChecklistConducteurById(req.params.id);
        if (!data)
            return void res.status(404).json({ success: false, message: 'ChecklistConducteur non trouvée' });
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.getChecklistConducteur = getChecklistConducteur;
const getAllChecklistConducteurs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit } = paginate(req);
        const subprojet = typeof req.query.subprojet === 'string' ? req.query.subprojet : undefined;
        const entreprise = typeof req.query.entreprise === 'string' ? req.query.entreprise : undefined;
        const result = yield formService.getAllChecklistConducteurs({ subprojet, entreprise }, page, limit);
        res.status(200).json({ success: true, data: result.items, pagination: { page: result.page, limit, total: result.total, totalPages: result.totalPages } });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.getAllChecklistConducteurs = getAllChecklistConducteurs;
const updateChecklistConducteur = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!isValidId(req.params.id))
            return void res.status(400).json({ success: false, message: 'ID invalide' });
        const data = yield formService.updateChecklistConducteur(req.params.id, req.body);
        if (!data)
            return void res.status(404).json({ success: false, message: 'ChecklistConducteur non trouvée' });
        res.status(200).json({ success: true, message: 'ChecklistConducteur mise à jour avec succès', data });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.updateChecklistConducteur = updateChecklistConducteur;
const deleteChecklistConducteur = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!isValidId(req.params.id))
            return void res.status(400).json({ success: false, message: 'ID invalide' });
        const deleted = yield formService.deleteChecklistConducteur(req.params.id);
        if (!deleted)
            return void res.status(404).json({ success: false, message: 'ChecklistConducteur non trouvée' });
        res.status(200).json({ success: true, message: 'ChecklistConducteur supprimée avec succès' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.deleteChecklistConducteur = deleteChecklistConducteur;
//# sourceMappingURL=form.controller.js.map