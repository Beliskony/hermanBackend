"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const form_controller_1 = require("../controllers/form.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const formRouter = (0, express_1.Router)();
// ============================================
// ROUTES FORM (ancien FormData)
// ============================================
/**
 * @route   POST /form
 * @desc    Créer un nouveau formulaire APES
 * @access  Private
 * @body    {object} formData - Les données complètes du formulaire
 */
formRouter.post('/form', auth_middleware_1.authMiddleware, form_controller_1.createForm);
/**
 * @route   GET /form
 * @desc    Récupérer tous les formulaires (avec pagination et filtres)
 * @access  Private
 * @query   {string} [status] - Statut (draft, submitted, archived)
 * @query   {string} [projectName] - Nom du projet (recherche partielle)
 * @query   {string} [dateFrom] - Date de début (format ISO)
 * @query   {string} [dateTo] - Date de fin (format ISO)
 * @query   {number} [page=1] - Numéro de page
 * @query   {number} [limit=10] - Nombre d'éléments par page
 */
formRouter.get('/form', auth_middleware_1.authMiddleware, form_controller_1.getAllForms);
/**
 * @route   GET /form/stats
 * @desc    Obtenir les statistiques des formulaires
 * @access  Private
 */
formRouter.get('/form/stats', auth_middleware_1.authMiddleware, form_controller_1.getStats);
/**
 * @route   GET /form/:id
 * @desc    Récupérer un formulaire par son ID
 * @access  Private
 * @param   {string} id - ID du formulaire
 */
formRouter.get('/form/:id', auth_middleware_1.authMiddleware, form_controller_1.getForm);
/**
 * @route   PUT /form/:id
 * @desc    Mettre à jour complètement un formulaire
 * @access  Private
 * @param   {string} id - ID du formulaire
 * @body    {object} updateData - Nouvelles données complètes
 */
formRouter.put('/form/:id', auth_middleware_1.authMiddleware, form_controller_1.updateForm);
/**
 * @route   DELETE /form/:id
 * @desc    Supprimer un formulaire
 * @access  Private
 * @param   {string} id - ID du formulaire
 */
formRouter.delete('/form/:id', auth_middleware_1.authMiddleware, form_controller_1.deleteForm);
/**
 * @route   POST /form/:id/submit
 * @desc    Soumettre un formulaire (changer le statut à "submitted")
 * @access  Private
 * @param   {string} id - ID du formulaire
 */
formRouter.post('/form/:id/submit', auth_middleware_1.authMiddleware, form_controller_1.submitForm);
// ============================================
// ROUTES GUIDE D'ENTRETIEN
// ============================================
/**
 * @route   POST /guide-entretien
 * @desc    Créer un nouveau guide d'entretien
 * @access  Private
 * @body    {object} guideData - Les données du guide
 */
formRouter.post('/guide-entretien', auth_middleware_1.authMiddleware, form_controller_1.createGuideEntretien);
/**
 * @route   GET /guide-entretien
 * @desc    Récupérer tous les guides d'entretien (avec pagination et filtres)
 * @access  Private
 * @query   {string} [guideType] - Type de guide
 * @query   {string} [subprojet] - Nom du sous-projet
 * @query   {number} [page=1] - Numéro de page
 * @query   {number} [limit=10] - Nombre d'éléments par page
 */
formRouter.get('/guide-entretien', auth_middleware_1.authMiddleware, form_controller_1.getAllGuideEntretiens);
/**
 * @route   GET /guide-entretien/:id
 * @desc    Récupérer un guide d'entretien par son ID
 * @access  Private
 * @param   {string} id - ID du guide
 */
formRouter.get('/guide-entretien/:id', auth_middleware_1.authMiddleware, form_controller_1.getGuideEntretien);
/**
 * @route   PUT /guide-entretien/:id
 * @desc    Mettre à jour un guide d'entretien
 * @access  Private
 * @param   {string} id - ID du guide
 * @body    {object} updateData - Nouvelles données
 */
formRouter.put('/guide-entretien/:id', auth_middleware_1.authMiddleware, form_controller_1.updateGuideEntretien);
/**
 * @route   DELETE /guide-entretien/:id
 * @desc    Supprimer un guide d'entretien
 * @access  Private
 * @param   {string} id - ID du guide
 */
formRouter.delete('/guide-entretien/:id', auth_middleware_1.authMiddleware, form_controller_1.deleteGuideEntretien);
// ============================================
// ROUTES CHECKLIST AUDIT
// ============================================
/**
 * @route   POST /checklist-audit
 * @desc    Créer une nouvelle checklist d'audit
 * @access  Private
 * @body    {object} checklistData - Les données de la checklist
 */
formRouter.post('/checklist-audit', auth_middleware_1.authMiddleware, form_controller_1.createChecklistAudit);
/**
 * @route   GET /checklist-audit
 * @desc    Récupérer toutes les checklists d'audit (avec pagination et filtres)
 * @access  Private
 * @query   {string} [subprojet] - Nom du sous-projet
 * @query   {string} [auditeurs] - Auditeurs
 * @query   {number} [page=1] - Numéro de page
 * @query   {number} [limit=10] - Nombre d'éléments par page
 */
formRouter.get('/checklist-audit', auth_middleware_1.authMiddleware, form_controller_1.getAllChecklistAudits);
/**
 * @route   GET /checklist-audit/:id
 * @desc    Récupérer une checklist d'audit par son ID
 * @access  Private
 * @param   {string} id - ID de la checklist
 */
formRouter.get('/checklist-audit/:id', auth_middleware_1.authMiddleware, form_controller_1.getChecklistAudit);
/**
 * @route   PUT /checklist-audit/:id
 * @desc    Mettre à jour une checklist d'audit
 * @access  Private
 * @param   {string} id - ID de la checklist
 * @body    {object} updateData - Nouvelles données
 */
formRouter.put('/checklist-audit/:id', auth_middleware_1.authMiddleware, form_controller_1.updateChecklistAudit);
/**
 * @route   DELETE /checklist-audit/:id
 * @desc    Supprimer une checklist d'audit
 * @access  Private
 * @param   {string} id - ID de la checklist
 */
formRouter.delete('/checklist-audit/:id', auth_middleware_1.authMiddleware, form_controller_1.deleteChecklistAudit);
// ============================================
// ROUTES CHECKLIST CONDUCTEUR TRAVAUX
// ============================================
/**
 * @route   POST /checklist-conducteur
 * @desc    Créer une nouvelle checklist conducteur de travaux
 * @access  Private
 * @body    {object} checklistData - Les données de la checklist
 */
formRouter.post('/checklist-conducteur', auth_middleware_1.authMiddleware, form_controller_1.createChecklistConducteur);
/**
 * @route   GET /checklist-conducteur
 * @desc    Récupérer toutes les checklists conducteur (avec pagination et filtres)
 * @access  Private
 * @query   {string} [subprojet] - Nom du sous-projet
 * @query   {string} [entreprise] - Nom de l'entreprise
 * @query   {number} [page=1] - Numéro de page
 * @query   {number} [limit=10] - Nombre d'éléments par page
 */
formRouter.get('/checklist-conducteur', auth_middleware_1.authMiddleware, form_controller_1.getAllChecklistConducteurs);
/**
 * @route   GET /checklist-conducteur/:id
 * @desc    Récupérer une checklist conducteur par son ID
 * @access  Private
 * @param   {string} id - ID de la checklist
 */
formRouter.get('/checklist-conducteur/:id', auth_middleware_1.authMiddleware, form_controller_1.getChecklistConducteur);
/**
 * @route   PUT /checklist-conducteur/:id
 * @desc    Mettre à jour une checklist conducteur
 * @access  Private
 * @param   {string} id - ID de la checklist
 * @body    {object} updateData - Nouvelles données
 */
formRouter.put('/checklist-conducteur/:id', auth_middleware_1.authMiddleware, form_controller_1.updateChecklistConducteur);
/**
 * @route   DELETE /checklist-conducteur/:id
 * @desc    Supprimer une checklist conducteur
 * @access  Private
 * @param   {string} id - ID de la checklist
 */
formRouter.delete('/checklist-conducteur/:id', auth_middleware_1.authMiddleware, form_controller_1.deleteChecklistConducteur);
exports.default = formRouter;
//# sourceMappingURL=form.route.js.map