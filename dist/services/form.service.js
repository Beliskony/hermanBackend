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
exports.FormService = void 0;
const GuideEntretien_model_1 = require("../interfaces/GuideEntretien.model");
const ChecklistAudit_model_1 = require("../interfaces/ChecklistAudit.model");
const FormData_model_1 = require("../interfaces/FormData.model");
class FormService {
    /**
      * Créer un nouveau formulaire
      */
    createForm(formData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const form = new FormData_model_1.FormData(formData);
                return yield form.save();
            }
            catch (error) {
                throw new Error(`Erreur lors de la création du formulaire: ${error}`);
            }
        });
    }
    /**
     * Récupérer un formulaire par ID
     */
    getFormById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield FormData_model_1.FormData.findById(id);
            }
            catch (error) {
                throw new Error(`Erreur lors de la récupération du formulaire: ${error}`);
            }
        });
    }
    /**
     * Récupérer tous les formulaires
     */
    getAllForms() {
        return __awaiter(this, arguments, void 0, function* (filters = {}, page = 1, limit = 10) {
            try {
                const query = {};
                if (filters.status)
                    query.status = filters.status;
                if (filters.projectName) {
                    query['projectInfo.projectName'] = { $regex: filters.projectName, $options: 'i' };
                }
                if (filters.dateFrom || filters.dateTo) {
                    query.createdAt = {};
                    if (filters.dateFrom)
                        query.createdAt.$gte = filters.dateFrom;
                    if (filters.dateTo)
                        query.createdAt.$lte = filters.dateTo;
                }
                const skip = (page - 1) * limit;
                const [forms, total] = yield Promise.all([
                    FormData_model_1.FormData.find(query)
                        .sort({ createdAt: -1 })
                        .skip(skip)
                        .limit(limit),
                    FormData_model_1.FormData.countDocuments(query)
                ]);
                return {
                    forms,
                    total,
                    page,
                    totalPages: Math.ceil(total / limit)
                };
            }
            catch (error) {
                throw new Error(`Erreur lors de la récupération des formulaires: ${error}`);
            }
        });
    }
    /**
     * Mettre à jour un formulaire
     */
    updateForm(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Ne pas permettre la mise à jour du statut à "submitted" si déjà soumis
                if (updateData.status === 'submitted') {
                    const existingForm = yield FormData_model_1.FormData.findById(id);
                    if ((existingForm === null || existingForm === void 0 ? void 0 : existingForm.status) === 'submitted') {
                        throw new Error('Le formulaire a déjà été soumis et ne peut plus être modifié');
                    }
                    updateData.submittedAt = new Date();
                }
                return yield FormData_model_1.FormData.findByIdAndUpdate(id, Object.assign(Object.assign({}, updateData), { updatedAt: new Date() }), { new: true, runValidators: true });
            }
            catch (error) {
                throw new Error(`Erreur lors de la mise à jour du formulaire: ${error}`);
            }
        });
    }
    /**
     * Supprimer un formulaire
     */
    deleteForm(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield FormData_model_1.FormData.findByIdAndDelete(id);
                return result !== null;
            }
            catch (error) {
                throw new Error(`Erreur lors de la suppression du formulaire: ${error}`);
            }
        });
    }
    /**
     * Soumettre un formulaire (changer le statut à submitted)
     */
    submitForm(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield FormData_model_1.FormData.findByIdAndUpdate(id, {
                    status: 'submitted',
                    submittedAt: new Date(),
                    updatedAt: new Date()
                }, { new: true });
            }
            catch (error) {
                throw new Error(`Erreur lors de la soumission du formulaire: ${error}`);
            }
        });
    }
    /**
     * Statistiques des formulaires
     */
    getFormStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Récupérer les comptages de chaque collection séparément
                const [apesStats, checklistAuditStats, checklistConducteurStats, guideEntretienStats] = yield Promise.all([
                    FormData_model_1.FormData.aggregate([
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1 },
                                latest: { $max: '$createdAt' }
                            }
                        }
                    ]),
                    ChecklistAudit_model_1.ChecklistAudit.aggregate([
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1 },
                                latest: { $max: '$createdAt' }
                            }
                        }
                    ]),
                    ChecklistAudit_model_1.ChecklistConducteurTravaux.aggregate([
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1 },
                                latest: { $max: '$createdAt' }
                            }
                        }
                    ]),
                    GuideEntretien_model_1.GuideEntretien.aggregate([
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1 },
                                latest: { $max: '$createdAt' }
                            }
                        }
                    ])
                ]);
                // Structure des statistiques par type
                const byFormType = {
                    apes: this.formatStats(apesStats),
                    checklistAudit: this.formatStats(checklistAuditStats),
                    checklistConducteur: this.formatStats(checklistConducteurStats),
                    guideEntretien: this.formatStats(guideEntretienStats)
                };
                // Calcul des totaux globaux
                const totalApres = apesStats.reduce((sum, s) => sum + s.count, 0);
                const totalChecklistAudit = checklistAuditStats.reduce((sum, s) => sum + s.count, 0);
                const totalChecklistConducteur = checklistConducteurStats.reduce((sum, s) => sum + s.count, 0);
                const totalGuideEntretien = guideEntretienStats.reduce((sum, s) => sum + s.count, 0);
                const totalAll = totalApres + totalChecklistAudit + totalChecklistConducteur + totalGuideEntretien;
                // Statistiques globales par statut
                const globalByStatus = this.mergeStatsByStatus([
                    apesStats,
                    checklistAuditStats,
                    checklistConducteurStats,
                    guideEntretienStats
                ]);
                return {
                    total: totalAll,
                    byFormType,
                    byStatus: globalByStatus,
                    details: {
                        apes: { total: totalApres, stats: byFormType.apes },
                        checklistAudit: { total: totalChecklistAudit, stats: byFormType.checklistAudit },
                        checklistConducteur: { total: totalChecklistConducteur, stats: byFormType.checklistConducteur },
                        guideEntretien: { total: totalGuideEntretien, stats: byFormType.guideEntretien }
                    }
                };
            }
            catch (error) {
                throw new Error(`Erreur lors du calcul des statistiques: ${error}`);
            }
        });
    }
    // Méthode utilitaire pour formater les stats d'un type
    formatStats(stats) {
        return stats.map(stat => ({
            status: stat._id,
            count: stat.count,
            latest: stat.latest
        }));
    }
    // Méthode pour fusionner les statistiques par statut
    mergeStatsByStatus(allStatsArrays) {
        const statusMap = new Map();
        const statusOrder = ['draft', 'submitted', 'reviewed', 'approved', 'archived'];
        const statusLabels = {
            draft: 'Brouillon',
            submitted: 'Soumis',
            reviewed: 'Révisé',
            approved: 'Approuvé',
            archived: 'Archivé'
        };
        allStatsArrays.forEach(statsArray => {
            statsArray.forEach(stat => {
                const status = stat._id;
                if (statusMap.has(status)) {
                    statusMap.set(status, statusMap.get(status) + stat.count);
                }
                else {
                    statusMap.set(status, stat.count);
                }
            });
        });
        // Retourner les stats triées par ordre de statut
        return statusOrder
            .filter(status => statusMap.has(status))
            .map(status => ({
            status,
            label: statusLabels[status] || status,
            count: statusMap.get(status)
        }));
    }
    // ─── GUIDE D'ENTRETIEN ───────────────────────────────────────
    createGuideEntretien(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield new GuideEntretien_model_1.GuideEntretien(data).save();
            }
            catch (error) {
                throw new Error(`Erreur création GuideEntretien: ${error}`);
            }
        });
    }
    getGuideEntretienById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield GuideEntretien_model_1.GuideEntretien.findById(id);
            }
            catch (error) {
                throw new Error(`Erreur récupération GuideEntretien: ${error}`);
            }
        });
    }
    getAllGuideEntretiens() {
        return __awaiter(this, arguments, void 0, function* (filters = {}, page = 1, limit = 10) {
            try {
                const query = {};
                if (filters.guideType)
                    query.guideType = filters.guideType;
                if (filters.subprojet)
                    query.subprojet = { $regex: filters.subprojet, $options: 'i' };
                const skip = (page - 1) * limit;
                const [items, total] = yield Promise.all([
                    GuideEntretien_model_1.GuideEntretien.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
                    GuideEntretien_model_1.GuideEntretien.countDocuments(query)
                ]);
                return { items, total, page, totalPages: Math.ceil(total / limit) };
            }
            catch (error) {
                throw new Error(`Erreur récupération GuideEntretiens: ${error}`);
            }
        });
    }
    updateGuideEntretien(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield GuideEntretien_model_1.GuideEntretien.findByIdAndUpdate(id, data, { new: true, runValidators: true });
            }
            catch (error) {
                throw new Error(`Erreur mise à jour GuideEntretien: ${error}`);
            }
        });
    }
    deleteGuideEntretien(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return (yield GuideEntretien_model_1.GuideEntretien.findByIdAndDelete(id)) !== null;
            }
            catch (error) {
                throw new Error(`Erreur suppression GuideEntretien: ${error}`);
            }
        });
    }
    // ─── CHECKLIST AUDIT ─────────────────────────────────────────
    createChecklistAudit(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield new ChecklistAudit_model_1.ChecklistAudit(data).save();
            }
            catch (error) {
                throw new Error(`Erreur création ChecklistAudit: ${error}`);
            }
        });
    }
    getChecklistAuditById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield ChecklistAudit_model_1.ChecklistAudit.findById(id);
            }
            catch (error) {
                throw new Error(`Erreur récupération ChecklistAudit: ${error}`);
            }
        });
    }
    getAllChecklistAudits() {
        return __awaiter(this, arguments, void 0, function* (filters = {}, page = 1, limit = 10) {
            try {
                const query = {};
                if (filters.subprojet)
                    query.subprojet = { $regex: filters.subprojet, $options: 'i' };
                if (filters.auditeurs)
                    query.auditeurs = { $regex: filters.auditeurs, $options: 'i' };
                const skip = (page - 1) * limit;
                const [items, total] = yield Promise.all([
                    ChecklistAudit_model_1.ChecklistAudit.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
                    ChecklistAudit_model_1.ChecklistAudit.countDocuments(query)
                ]);
                return { items, total, page, totalPages: Math.ceil(total / limit) };
            }
            catch (error) {
                throw new Error(`Erreur récupération ChecklistAudits: ${error}`);
            }
        });
    }
    updateChecklistAudit(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield ChecklistAudit_model_1.ChecklistAudit.findByIdAndUpdate(id, data, { new: true, runValidators: true });
            }
            catch (error) {
                throw new Error(`Erreur mise à jour ChecklistAudit: ${error}`);
            }
        });
    }
    deleteChecklistAudit(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return (yield ChecklistAudit_model_1.ChecklistAudit.findByIdAndDelete(id)) !== null;
            }
            catch (error) {
                throw new Error(`Erreur suppression ChecklistAudit: ${error}`);
            }
        });
    }
    // ─── CHECKLIST CONDUCTEUR TRAVAUX ────────────────────────────
    createChecklistConducteur(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield new ChecklistAudit_model_1.ChecklistConducteurTravaux(data).save();
            }
            catch (error) {
                throw new Error(`Erreur création ChecklistConducteurTravaux: ${error}`);
            }
        });
    }
    getChecklistConducteurById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield ChecklistAudit_model_1.ChecklistConducteurTravaux.findById(id);
            }
            catch (error) {
                throw new Error(`Erreur récupération ChecklistConducteurTravaux: ${error}`);
            }
        });
    }
    getAllChecklistConducteurs() {
        return __awaiter(this, arguments, void 0, function* (filters = {}, page = 1, limit = 10) {
            try {
                const query = {};
                if (filters.subprojet)
                    query.subprojet = { $regex: filters.subprojet, $options: 'i' };
                if (filters.entreprise)
                    query.entreprise = { $regex: filters.entreprise, $options: 'i' };
                const skip = (page - 1) * limit;
                const [items, total] = yield Promise.all([
                    ChecklistAudit_model_1.ChecklistConducteurTravaux.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
                    ChecklistAudit_model_1.ChecklistConducteurTravaux.countDocuments(query)
                ]);
                return { items, total, page, totalPages: Math.ceil(total / limit) };
            }
            catch (error) {
                throw new Error(`Erreur récupération ChecklistConducteurTravaux: ${error}`);
            }
        });
    }
    updateChecklistConducteur(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield ChecklistAudit_model_1.ChecklistConducteurTravaux.findByIdAndUpdate(id, data, { new: true, runValidators: true });
            }
            catch (error) {
                throw new Error(`Erreur mise à jour ChecklistConducteurTravaux: ${error}`);
            }
        });
    }
    deleteChecklistConducteur(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return (yield ChecklistAudit_model_1.ChecklistConducteurTravaux.findByIdAndDelete(id)) !== null;
            }
            catch (error) {
                throw new Error(`Erreur suppression ChecklistConducteurTravaux: ${error}`);
            }
        });
    }
}
exports.FormService = FormService;
//# sourceMappingURL=form.service.js.map