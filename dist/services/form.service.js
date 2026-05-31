"use strict";
// ─────────────────────────────────────────────────────────────────────────────
//  form.service.ts  —  MySQL version
//
//  Stratégie :
//  • FormData (APES)          → tables form_data + sections filles
//  • GuideEntretien           → guide_entretien + guide_entretien_questions
//  • ChecklistAudit           → checklist_audit + criteres + documents
//  • ChecklistConducteur      → checklist_conducteur + questions
//
//  Les champs JSON MySQL (waterManagement, responses, etc.) sont
//  sérialisés/désérialisés avec JSON.stringify / JSON.parse.
//
//  Pagination : LIMIT / OFFSET (remplace .skip().limit())
// ─────────────────────────────────────────────────────────────────────────────
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
const databaseConnect_1 = require("../config/databaseConnect");
const id_1 = require("../utils/id");
// ─── Helpers ─────────────────────────────────────────────────────────────────
/** mysql2 retourne les résultats des CALL dans rows[0] */
function firstResultSet(rows) {
    return Array.isArray(rows[0]) ? rows[0] : rows;
}
/** Compte les lignes d'une table avec un filtre optionnel WHERE */
function countRows(table_1) {
    return __awaiter(this, arguments, void 0, function* (table, where = '1=1', params = []) {
        const [rows] = yield databaseConnect_1.pool.query(`SELECT COUNT(*) AS total FROM ${table} WHERE ${where}`, params);
        return rows[0].total;
    });
}
// =============================================================================
//  FORM DATA — APES
// =============================================================================
class FormService {
    constructor() {
        // Section → section_key mapping (ChecklistAudit)
        this.SECTION_MAP = {
            section1_cadreJuridique: 's1',
            'section2_infraSecurite.stabiliteStructure': 's2_stabilite',
            'section2_infraSecurite.securiteIncendie': 's2_incendie',
            'section2_infraSecurite.accessibilitePMR': 's2_pmr',
            'section3_gestionEnvSociale.gestionDechets': 's3_dechets',
            'section3_gestionEnvSociale.nuisancesPollution': 's3_nuisances',
            'section3_gestionEnvSociale.santeSecuteTravailleurs': 's3_sante',
            'section4_gestionSociale.relationsCommunautes': 's4_communautes',
            'section4_gestionSociale.mgp': 's4_mgp',
            'section5_risquesERP.securiteSurete': 's5_securite',
            'section5_risquesERP.hygieneEnvironnement': 's5_hygiene',
        };
        this.CONDUCTEUR_SECTIONS = [
            'section1_infoGenerales', 'section2_processusInitialT1', 'section3_installationT2',
            'section4_recrutementT2', 'section5_hseT2', 'section6_gestionEnvT2',
            'section7_sensibilisationT2', 'section8_mgpT2', 'section9_fermetureT2',
            'section10_exploitationT3', 'section11_synthese',
        ];
        this.CONDUCTEUR_KEY_MAP = {
            section1_infoGenerales: 's1', section2_processusInitialT1: 's2',
            section3_installationT2: 's3', section4_recrutementT2: 's4',
            section5_hseT2: 's5', section6_gestionEnvT2: 's6',
            section7_sensibilisationT2: 's7', section8_mgpT2: 's8',
            section9_fermetureT2: 's9', section10_exploitationT3: 's10',
            section11_synthese: 's11',
        };
    }
    // ── CREATE FORM ────────────────────────────────────────────────────────────
    createForm(formData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const formId = (0, id_1.newId)();
            const projectId = (0, id_1.newId)();
            // 1 — Créer project_info + form_data (transaction dans la proc)
            yield databaseConnect_1.pool.query('CALL sp_create_form(?,?,?,?,?,?,?,?)', [
                formId,
                projectId,
                formData.projectInfo.projectName,
                formData.projectInfo.date,
                formData.projectInfo.auditors,
                formData.projectInfo.location,
                formData.projectInfo.period,
                (_a = formData.status) !== null && _a !== void 0 ? _a : 'draft',
            ]);
            // 2 — Sections filles (si fournies à la création)
            yield this._saveSections(formId, formData);
            return { id: formId, projectId, status: (_b = formData.status) !== null && _b !== void 0 ? _b : 'draft' };
        });
    }
    // ── GET BY ID ──────────────────────────────────────────────────────────────
    getFormById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Infos de base via la vue
            const [base] = yield databaseConnect_1.pool.query('SELECT * FROM v_form_summary WHERE form_id = ?', [id]);
            if (base.length === 0)
                return null;
            // Sections filles
            const [docReview] = yield databaseConnect_1.pool.query('SELECT * FROM document_review      WHERE form_id = ?', [id]);
            const [fieldInsp] = yield databaseConnect_1.pool.query('SELECT * FROM field_inspection     WHERE form_id = ?', [id]);
            const [stakeholder] = yield databaseConnect_1.pool.query('SELECT * FROM stakeholder_interview WHERE form_id = ?', [id]);
            const [genderBase] = yield databaseConnect_1.pool.query('SELECT * FROM gender_assessment    WHERE form_id = ?', [id]);
            const [complaint] = yield databaseConnect_1.pool.query('SELECT * FROM complaint_mechanism  WHERE form_id = ?', [id]);
            // Sous-tables gender
            let genderFull = null;
            if (genderBase.length > 0) {
                const gId = genderBase[0].id;
                const [objectives] = yield databaseConnect_1.pool.query('SELECT * FROM gender_objectives      WHERE gender_assessment_id = ? ORDER BY sort_order', [gId]);
                const [consultations] = yield databaseConnect_1.pool.query('SELECT * FROM gender_consultations   WHERE gender_assessment_id = ? ORDER BY sort_order', [gId]);
                const [impacts] = yield databaseConnect_1.pool.query('SELECT * FROM gender_impacts         WHERE gender_assessment_id = ? ORDER BY sort_order', [gId]);
                const [recommendations] = yield databaseConnect_1.pool.query('SELECT * FROM gender_recommendations WHERE gender_assessment_id = ? ORDER BY sort_order', [gId]);
                genderFull = Object.assign(Object.assign({}, genderBase[0]), { quantitative_data: this._parseJson(genderBase[0].quantitative_data), objectives,
                    consultations,
                    impacts,
                    recommendations });
            }
            // Sous-tables complaint
            let complaintFull = null;
            if (complaint.length > 0) {
                const cId = complaint[0].id;
                const [strengths] = yield databaseConnect_1.pool.query('SELECT * FROM complaint_strengths      WHERE complaint_mechanism_id = ? ORDER BY sort_order', [cId]);
                const [weaknesses] = yield databaseConnect_1.pool.query('SELECT * FROM complaint_weaknesses     WHERE complaint_mechanism_id = ? ORDER BY sort_order', [cId]);
                const [recommendations] = yield databaseConnect_1.pool.query('SELECT * FROM complaint_recommendations WHERE complaint_mechanism_id = ? ORDER BY sort_order', [cId]);
                complaintFull = Object.assign(Object.assign({}, complaint[0]), { documentary_basis: this._parseJson(complaint[0].documentary_basis), key_criteria: this._parseJson(complaint[0].key_criteria), strengths: strengths.map((s) => s.strength), weaknesses,
                    recommendations });
            }
            return Object.assign(Object.assign({}, base[0]), { documentReview: docReview[0] ? Object.assign(Object.assign({}, docReview[0]), { documents_presents: this._parseJson(docReview[0].documents_presents), documents_analysis: this._parseJson(docReview[0].documents_analysis) }) : null, fieldInspection: fieldInsp[0] ? Object.assign(Object.assign({}, fieldInsp[0]), { zones: this._parseJson(fieldInsp[0].zones), water_management: this._parseJson(fieldInsp[0].water_management), waste_management: this._parseJson(fieldInsp[0].waste_management), emissions: this._parseJson(fieldInsp[0].emissions), health_safety: this._parseJson(fieldInsp[0].health_safety), community: this._parseJson(fieldInsp[0].community) }) : null, stakeholderInterview: stakeholder[0] ? Object.assign(Object.assign({}, stakeholder[0]), { responses: this._parseJson(stakeholder[0].responses) }) : null, genderAssessment: genderFull, complaintMechanism: complaintFull });
        });
    }
    // ── GET ALL (paginated + filters) ─────────────────────────────────────────
    getAllForms() {
        return __awaiter(this, arguments, void 0, function* (filters = {}, page = 1, limit = 10) {
            const conditions = [];
            const params = [];
            if (filters.status) {
                conditions.push('status = ?');
                params.push(filters.status);
            }
            if (filters.projectName) {
                conditions.push('project_name LIKE ?');
                params.push(`%${filters.projectName}%`);
            }
            if (filters.dateFrom) {
                conditions.push('created_at >= ?');
                params.push(filters.dateFrom);
            }
            if (filters.dateTo) {
                conditions.push('created_at <= ?');
                params.push(filters.dateTo);
            }
            const where = conditions.length > 0 ? conditions.join(' AND ') : '1=1';
            const offset = (page - 1) * limit;
            const [forms] = yield databaseConnect_1.pool.query(`SELECT * FROM v_form_summary WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
            const total = yield countRows('v_form_summary', where, params);
            return { forms, total, page, totalPages: Math.ceil(total / limit) };
        });
    }
    // ── UPDATE FORM ────────────────────────────────────────────────────────────
    updateForm(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            // Bloquer la re-soumission d'un formulaire déjà soumis
            if (updateData.status === 'submitted') {
                const [rows] = yield databaseConnect_1.pool.query('SELECT status FROM form_data WHERE id = ?', [id]);
                if (((_a = rows[0]) === null || _a === void 0 ? void 0 : _a.status) === 'submitted') {
                    throw new Error('Le formulaire a déjà été soumis et ne peut plus être modifié');
                }
            }
            if (updateData.projectInfo) {
                yield databaseConnect_1.pool.query('CALL sp_update_form(?,?,?,?,?,?,?)', [
                    id,
                    updateData.projectInfo.projectName,
                    updateData.projectInfo.date,
                    updateData.projectInfo.auditors,
                    updateData.projectInfo.location,
                    updateData.projectInfo.period,
                    (_b = updateData.status) !== null && _b !== void 0 ? _b : 'draft',
                ]);
            }
            else if (updateData.status) {
                yield databaseConnect_1.pool.query('UPDATE form_data SET status = ?, updated_at = NOW() WHERE id = ?', [updateData.status, id]);
            }
            // Mettre à jour les sections si fournies
            yield this._saveSections(id, updateData);
            return this.getFormById(id);
        });
    }
    // ── DELETE FORM ────────────────────────────────────────────────────────────
    deleteForm(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield databaseConnect_1.pool.query('CALL sp_delete_form(?,?)', [id, 1]); // 1 = hard delete
            return true;
        });
    }
    // ── SUBMIT FORM ────────────────────────────────────────────────────────────
    submitForm(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield databaseConnect_1.pool.query('CALL sp_submit_form(?)', [id]);
            return this.getFormById(id);
        });
    }
    // ── STATS ──────────────────────────────────────────────────────────────────
    getFormStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const [apesStats] = yield databaseConnect_1.pool.query(`
      SELECT status, COUNT(*) AS count, MAX(created_at) AS latest
      FROM form_data
      GROUP BY status
    `);
            const [auditStats] = yield databaseConnect_1.pool.query(`
      SELECT 'N/A' AS status, COUNT(*) AS count, MAX(created_at) AS latest
      FROM checklist_audit
    `);
            const [conducteurStats] = yield databaseConnect_1.pool.query(`
      SELECT 'N/A' AS status, COUNT(*) AS count, MAX(created_at) AS latest
      FROM checklist_conducteur
    `);
            const [guideStats] = yield databaseConnect_1.pool.query(`
      SELECT guide_type AS status, COUNT(*) AS count, MAX(created_at) AS latest
      FROM guide_entretien
      GROUP BY guide_type
    `);
            const totalApes = apesStats.reduce((s, r) => s + Number(r.count), 0);
            const totalAudit = auditStats.reduce((s, r) => s + Number(r.count), 0);
            const totalConducteur = conducteurStats.reduce((s, r) => s + Number(r.count), 0);
            const totalGuide = guideStats.reduce((s, r) => s + Number(r.count), 0);
            const statusLabels = {
                draft: 'Brouillon',
                submitted: 'Soumis',
                archived: 'Archivé',
            };
            return {
                total: totalApes + totalAudit + totalConducteur + totalGuide,
                byFormType: {
                    apes: apesStats.map(this._formatStat(statusLabels)),
                    checklistAudit: auditStats.map(this._formatStat(statusLabels)),
                    checklistConducteur: conducteurStats.map(this._formatStat(statusLabels)),
                    guideEntretien: guideStats.map(this._formatStat(statusLabels)),
                },
                details: {
                    apes: { total: totalApes, stats: apesStats },
                    checklistAudit: { total: totalAudit, stats: auditStats },
                    checklistConducteur: { total: totalConducteur, stats: conducteurStats },
                    guideEntretien: { total: totalGuide, stats: guideStats },
                },
            };
        });
    }
    // =============================================================================
    //  GUIDE D'ENTRETIEN
    // =============================================================================
    createGuideEntretien(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
            const id = (0, id_1.newId)();
            yield databaseConnect_1.pool.query('CALL sp_save_guide_entretien(?,?,?,?,?,?,?,?,?,?,?,?)', [
                id,
                (_a = data.guide_type) !== null && _a !== void 0 ? _a : data.guideType,
                data.subprojet,
                (_b = data.gi_nom) !== null && _b !== void 0 ? _b : (_c = data.generalInfo) === null || _c === void 0 ? void 0 : _c.nom,
                (_d = data.gi_fonction) !== null && _d !== void 0 ? _d : (_e = data.generalInfo) === null || _e === void 0 ? void 0 : _e.fonction,
                (_h = (_f = data.gi_contact) !== null && _f !== void 0 ? _f : (_g = data.generalInfo) === null || _g === void 0 ? void 0 : _g.contact) !== null && _h !== void 0 ? _h : '',
                (_j = data.gi_date) !== null && _j !== void 0 ? _j : (_k = data.generalInfo) === null || _k === void 0 ? void 0 : _k.date,
                (_l = data.gi_lieu) !== null && _l !== void 0 ? _l : (_m = data.generalInfo) === null || _m === void 0 ? void 0 : _m.lieu,
                (_q = (_o = data.gi_type_entretien) !== null && _o !== void 0 ? _o : (_p = data.generalInfo) === null || _p === void 0 ? void 0 : _p.typeEntretien) !== null && _q !== void 0 ? _q : '',
                (_t = (_r = data.gi_employeur) !== null && _r !== void 0 ? _r : (_s = data.generalInfo) === null || _s === void 0 ? void 0 : _s.employeur) !== null && _t !== void 0 ? _t : '',
                (_w = (_u = data.gi_type_contrat) !== null && _u !== void 0 ? _u : (_v = data.generalInfo) === null || _v === void 0 ? void 0 : _v.typeContrat) !== null && _w !== void 0 ? _w : '',
                (_y = (_x = data.notes_auditeur) !== null && _x !== void 0 ? _x : data.notesAuditeur) !== null && _y !== void 0 ? _y : '',
            ]);
            // Insérer les questions de chaque thème
            yield this._insertGuideQuestions(id, data);
            return this.getGuideEntretienById(id);
        });
    }
    getGuideEntretienById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield databaseConnect_1.pool.query('SELECT * FROM guide_entretien WHERE id = ?', [id]);
            if (rows.length === 0)
                return null;
            const [questions] = yield databaseConnect_1.pool.query('SELECT * FROM guide_entretien_questions WHERE guide_entretien_id = ? ORDER BY theme_key, sort_order', [id]);
            return this._buildGuideResponse(rows[0], questions);
        });
    }
    getAllGuideEntretiens() {
        return __awaiter(this, arguments, void 0, function* (filters = {}, page = 1, limit = 10) {
            const conditions = [];
            const params = [];
            if (filters.guideType) {
                conditions.push('guide_type = ?');
                params.push(filters.guideType);
            }
            if (filters.subprojet) {
                conditions.push('subprojet LIKE ?');
                params.push(`%${filters.subprojet}%`);
            }
            const where = conditions.length > 0 ? conditions.join(' AND ') : '1=1';
            const offset = (page - 1) * limit;
            const [items] = yield databaseConnect_1.pool.query(`SELECT * FROM v_guide_entretiens WHERE ${where} ORDER BY date_entretien DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
            const total = yield countRows('guide_entretien', where, params);
            return { items, total, page, totalPages: Math.ceil(total / limit) };
        });
    }
    updateGuideEntretien(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
            yield databaseConnect_1.pool.query('CALL sp_save_guide_entretien(?,?,?,?,?,?,?,?,?,?,?,?)', [
                id,
                (_a = data.guide_type) !== null && _a !== void 0 ? _a : data.guideType,
                data.subprojet,
                (_b = data.gi_nom) !== null && _b !== void 0 ? _b : (_c = data.generalInfo) === null || _c === void 0 ? void 0 : _c.nom,
                (_d = data.gi_fonction) !== null && _d !== void 0 ? _d : (_e = data.generalInfo) === null || _e === void 0 ? void 0 : _e.fonction,
                (_h = (_f = data.gi_contact) !== null && _f !== void 0 ? _f : (_g = data.generalInfo) === null || _g === void 0 ? void 0 : _g.contact) !== null && _h !== void 0 ? _h : '',
                (_j = data.gi_date) !== null && _j !== void 0 ? _j : (_k = data.generalInfo) === null || _k === void 0 ? void 0 : _k.date,
                (_l = data.gi_lieu) !== null && _l !== void 0 ? _l : (_m = data.generalInfo) === null || _m === void 0 ? void 0 : _m.lieu,
                (_q = (_o = data.gi_type_entretien) !== null && _o !== void 0 ? _o : (_p = data.generalInfo) === null || _p === void 0 ? void 0 : _p.typeEntretien) !== null && _q !== void 0 ? _q : '',
                (_t = (_r = data.gi_employeur) !== null && _r !== void 0 ? _r : (_s = data.generalInfo) === null || _s === void 0 ? void 0 : _s.employeur) !== null && _t !== void 0 ? _t : '',
                (_w = (_u = data.gi_type_contrat) !== null && _u !== void 0 ? _u : (_v = data.generalInfo) === null || _v === void 0 ? void 0 : _v.typeContrat) !== null && _w !== void 0 ? _w : '',
                (_y = (_x = data.notes_auditeur) !== null && _x !== void 0 ? _x : data.notesAuditeur) !== null && _y !== void 0 ? _y : '',
            ]);
            // Re-synchroniser les questions : supprimer + réinsérer
            yield databaseConnect_1.pool.query('DELETE FROM guide_entretien_questions WHERE guide_entretien_id = ?', [id]);
            yield this._insertGuideQuestions(id, data);
            return this.getGuideEntretienById(id);
        });
    }
    deleteGuideEntretien(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield databaseConnect_1.pool.query('DELETE FROM guide_entretien WHERE id = ?', [id]);
            return result.affectedRows > 0;
        });
    }
    // =============================================================================
    //  CHECKLIST AUDIT
    // =============================================================================
    createChecklistAudit(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            const id = (0, id_1.newId)();
            yield databaseConnect_1.pool.query('CALL sp_save_checklist_audit(?,?,?,?,?,?,?)', [
                id,
                data.subprojet,
                data.auditeurs,
                data.date,
                (_b = (_a = data.synthese) === null || _a === void 0 ? void 0 : _a.nombreNonConformitesMajeures) !== null && _b !== void 0 ? _b : 0,
                (_d = (_c = data.synthese) === null || _c === void 0 ? void 0 : _c.domainesCritiques) !== null && _d !== void 0 ? _d : '',
                (_f = (_e = data.synthese) === null || _e === void 0 ? void 0 : _e.signatureAuditeur) !== null && _f !== void 0 ? _f : '',
            ]);
            yield this._insertChecklistCriteres(id, data);
            yield this._insertChecklistDocuments(id, (_g = data.section6_bilanDocumentaire) !== null && _g !== void 0 ? _g : []);
            return this.getChecklistAuditById(id);
        });
    }
    getChecklistAuditById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield databaseConnect_1.pool.query('SELECT * FROM checklist_audit WHERE id = ?', [id]);
            if (rows.length === 0)
                return null;
            const [criteres] = yield databaseConnect_1.pool.query('SELECT * FROM checklist_audit_criteres  WHERE checklist_audit_id = ? ORDER BY section_key, sort_order', [id]);
            const [documents] = yield databaseConnect_1.pool.query('SELECT * FROM checklist_audit_documents WHERE checklist_audit_id = ? ORDER BY sort_order', [id]);
            return this._buildAuditResponse(rows[0], criteres, documents);
        });
    }
    getAllChecklistAudits() {
        return __awaiter(this, arguments, void 0, function* (filters = {}, page = 1, limit = 10) {
            const conditions = [];
            const params = [];
            if (filters.subprojet) {
                conditions.push('subprojet LIKE ?');
                params.push(`%${filters.subprojet}%`);
            }
            if (filters.auditeurs) {
                conditions.push('auditeurs LIKE ?');
                params.push(`%${filters.auditeurs}%`);
            }
            const where = conditions.length > 0 ? conditions.join(' AND ') : '1=1';
            const offset = (page - 1) * limit;
            const [items] = yield databaseConnect_1.pool.query(`SELECT * FROM checklist_audit WHERE ${where} ORDER BY date DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
            const total = yield countRows('checklist_audit', where, params);
            return { items, total, page, totalPages: Math.ceil(total / limit) };
        });
    }
    updateChecklistAudit(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            yield databaseConnect_1.pool.query('CALL sp_save_checklist_audit(?,?,?,?,?,?,?)', [
                id,
                data.subprojet,
                data.auditeurs,
                data.date,
                (_b = (_a = data.synthese) === null || _a === void 0 ? void 0 : _a.nombreNonConformitesMajeures) !== null && _b !== void 0 ? _b : 0,
                (_d = (_c = data.synthese) === null || _c === void 0 ? void 0 : _c.domainesCritiques) !== null && _d !== void 0 ? _d : '',
                (_f = (_e = data.synthese) === null || _e === void 0 ? void 0 : _e.signatureAuditeur) !== null && _f !== void 0 ? _f : '',
            ]);
            // Re-sync critères et documents
            yield databaseConnect_1.pool.query('DELETE FROM checklist_audit_criteres  WHERE checklist_audit_id = ?', [id]);
            yield databaseConnect_1.pool.query('DELETE FROM checklist_audit_documents WHERE checklist_audit_id = ?', [id]);
            yield this._insertChecklistCriteres(id, data);
            yield this._insertChecklistDocuments(id, (_g = data.section6_bilanDocumentaire) !== null && _g !== void 0 ? _g : []);
            return this.getChecklistAuditById(id);
        });
    }
    deleteChecklistAudit(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield databaseConnect_1.pool.query('DELETE FROM checklist_audit WHERE id = ?', [id]);
            return result.affectedRows > 0;
        });
    }
    // =============================================================================
    //  CHECKLIST CONDUCTEUR TRAVAUX
    // =============================================================================
    createChecklistConducteur(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const id = (0, id_1.newId)();
            yield databaseConnect_1.pool.query(`INSERT INTO checklist_conducteur
       (id, subprojet, auditeur, date, personne_rencontree, fonction, entreprise,
        contact, duree_entretien, lieu, commentaires_libres, signature_auditeur)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, [
                id, data.subprojet, data.auditeur, data.date,
                data.personneRencontree, data.fonction, data.entreprise,
                (_a = data.contact) !== null && _a !== void 0 ? _a : '',
                (_b = data.dureeEntretien) !== null && _b !== void 0 ? _b : '',
                data.lieu,
                (_c = data.commentairesLibres) !== null && _c !== void 0 ? _c : '',
                (_d = data.signatureAuditeur) !== null && _d !== void 0 ? _d : '',
            ]);
            yield this._insertConducteurQuestions(id, data);
            return this.getChecklistConducteurById(id);
        });
    }
    getChecklistConducteurById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield databaseConnect_1.pool.query('SELECT * FROM checklist_conducteur WHERE id = ?', [id]);
            if (rows.length === 0)
                return null;
            const [questions] = yield databaseConnect_1.pool.query('SELECT * FROM checklist_conducteur_questions WHERE checklist_conducteur_id = ? ORDER BY section_key, sort_order', [id]);
            return this._buildConducteurResponse(rows[0], questions);
        });
    }
    getAllChecklistConducteurs() {
        return __awaiter(this, arguments, void 0, function* (filters = {}, page = 1, limit = 10) {
            const conditions = [];
            const params = [];
            if (filters.subprojet) {
                conditions.push('subprojet  LIKE ?');
                params.push(`%${filters.subprojet}%`);
            }
            if (filters.entreprise) {
                conditions.push('entreprise LIKE ?');
                params.push(`%${filters.entreprise}%`);
            }
            const where = conditions.length > 0 ? conditions.join(' AND ') : '1=1';
            const offset = (page - 1) * limit;
            const [items] = yield databaseConnect_1.pool.query(`SELECT * FROM checklist_conducteur WHERE ${where} ORDER BY date DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
            const total = yield countRows('checklist_conducteur', where, params);
            return { items, total, page, totalPages: Math.ceil(total / limit) };
        });
    }
    updateChecklistConducteur(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            yield databaseConnect_1.pool.query(`UPDATE checklist_conducteur
       SET subprojet = ?, auditeur = ?, date = ?, personne_rencontree = ?,
           fonction = ?, entreprise = ?, contact = ?, duree_entretien = ?,
           lieu = ?, commentaires_libres = ?, signature_auditeur = ?, updated_at = NOW()
       WHERE id = ?`, [
                data.subprojet, data.auditeur, data.date, data.personneRencontree,
                data.fonction, data.entreprise,
                (_a = data.contact) !== null && _a !== void 0 ? _a : '',
                (_b = data.dureeEntretien) !== null && _b !== void 0 ? _b : '',
                data.lieu,
                (_c = data.commentairesLibres) !== null && _c !== void 0 ? _c : '',
                (_d = data.signatureAuditeur) !== null && _d !== void 0 ? _d : '',
                id,
            ]);
            yield databaseConnect_1.pool.query('DELETE FROM checklist_conducteur_questions WHERE checklist_conducteur_id = ?', [id]);
            yield this._insertConducteurQuestions(id, data);
            return this.getChecklistConducteurById(id);
        });
    }
    deleteChecklistConducteur(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield databaseConnect_1.pool.query('DELETE FROM checklist_conducteur WHERE id = ?', [id]);
            return result.affectedRows > 0;
        });
    }
    // =============================================================================
    //  HELPERS PRIVÉS
    // =============================================================================
    /** Upsert toutes les sections d'un FormData */
    _saveSections(formId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            if (data.documentReview) {
                const dr = data.documentReview;
                yield databaseConnect_1.pool.query('CALL sp_save_document_review(?,?,?,?,?,?)', [
                    (0, id_1.newId)(), formId,
                    JSON.stringify((_a = dr.documentsPresents) !== null && _a !== void 0 ? _a : {}),
                    JSON.stringify((_b = dr.documentsAnalysis) !== null && _b !== void 0 ? _b : {}),
                    (_c = dr.documentsManquants) !== null && _c !== void 0 ? _c : '',
                    (_d = dr.autresDocuments) !== null && _d !== void 0 ? _d : '',
                ]);
            }
            if (data.fieldInspection) {
                const fi = data.fieldInspection;
                const fiId = (0, id_1.newId)();
                yield databaseConnect_1.pool.query(`INSERT INTO field_inspection
         (id, form_id, project_name, date, auditors, accompaniers, zones,
          water_management, waste_management, emissions, health_safety, community)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
           project_name = VALUES(project_name), date = VALUES(date),
           auditors = VALUES(auditors), accompaniers = VALUES(accompaniers),
           zones = VALUES(zones), water_management = VALUES(water_management),
           waste_management = VALUES(waste_management), emissions = VALUES(emissions),
           health_safety = VALUES(health_safety), community = VALUES(community)`, [
                    fiId, formId, fi.projectName, fi.date, fi.auditors,
                    (_e = fi.accompaniers) !== null && _e !== void 0 ? _e : '',
                    JSON.stringify((_f = fi.zones) !== null && _f !== void 0 ? _f : []),
                    JSON.stringify((_g = fi.waterManagement) !== null && _g !== void 0 ? _g : {}),
                    JSON.stringify((_h = fi.wasteManagement) !== null && _h !== void 0 ? _h : {}),
                    JSON.stringify((_j = fi.emissions) !== null && _j !== void 0 ? _j : {}),
                    JSON.stringify((_k = fi.healthSafety) !== null && _k !== void 0 ? _k : {}),
                    JSON.stringify((_l = fi.community) !== null && _l !== void 0 ? _l : {}),
                ]);
            }
            if (data.stakeholderInterview) {
                const si = data.stakeholderInterview;
                yield databaseConnect_1.pool.query('CALL sp_save_stakeholder_interview(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
                    (0, id_1.newId)(), formId,
                    si.date, si.location, si.duration, si.stakeholderType,
                    si.profile.name, si.profile.function, si.profile.gender, si.profile.ageRange,
                    si.consent.confidentiality ? 1 : 0,
                    si.consent.notes ? 1 : 0,
                    si.consent.recording ? 1 : 0,
                    JSON.stringify((_m = si.responses) !== null && _m !== void 0 ? _m : {}),
                    si.evaluation.quality, si.evaluation.frankness,
                    si.evaluation.relevance, si.evaluation.climate,
                ]);
            }
            if (data.genderAssessment) {
                yield this._saveGenderAssessment(formId, data.genderAssessment);
            }
            if (data.complaintMechanism) {
                yield this._saveComplaintMechanism(formId, data.complaintMechanism);
            }
        });
    }
    _saveGenderAssessment(formId, ga) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            // Upsert gender_assessment
            const gaId = (0, id_1.newId)();
            yield databaseConnect_1.pool.query(`INSERT INTO gender_assessment (id, form_id, quantitative_data)
       VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE quantitative_data = VALUES(quantitative_data)`, [gaId, formId, JSON.stringify((_a = ga.quantitativeData) !== null && _a !== void 0 ? _a : {})]);
            // Récupérer l'id réel (en cas de ON DUPLICATE KEY)
            const [gaRows] = yield databaseConnect_1.pool.query('SELECT id FROM gender_assessment WHERE form_id = ?', [formId]);
            const realGaId = gaRows[0].id;
            // Vider et réinsérer les sous-tables
            yield databaseConnect_1.pool.query('DELETE FROM gender_objectives      WHERE gender_assessment_id = ?', [realGaId]);
            yield databaseConnect_1.pool.query('DELETE FROM gender_consultations   WHERE gender_assessment_id = ?', [realGaId]);
            yield databaseConnect_1.pool.query('DELETE FROM gender_impacts         WHERE gender_assessment_id = ?', [realGaId]);
            yield databaseConnect_1.pool.query('DELETE FROM gender_recommendations WHERE gender_assessment_id = ?', [realGaId]);
            for (const [i, obj] of ((_b = ga.objectives) !== null && _b !== void 0 ? _b : []).entries()) {
                yield databaseConnect_1.pool.query('INSERT INTO gender_objectives (id, gender_assessment_id, objective, indicator, status, sort_order) VALUES (?,?,?,?,?,?)', [(0, id_1.newId)(), realGaId, obj.objective, obj.indicator, obj.status, i]);
            }
            for (const [i, c] of ((_c = ga.consultations) !== null && _c !== void 0 ? _c : []).entries()) {
                yield databaseConnect_1.pool.query('INSERT INTO gender_consultations (id, gender_assessment_id, `group`, sessions, participants, method, sort_order) VALUES (?,?,?,?,?,?,?)', [(0, id_1.newId)(), realGaId, c.group, c.sessions, c.participants, c.method, i]);
            }
            for (const [i, imp] of [...((_e = (_d = ga.impacts) === null || _d === void 0 ? void 0 : _d.environmental) !== null && _e !== void 0 ? _e : []).map((x) => (Object.assign(Object.assign({}, x), { impact_type: 'environmental' }))), ...((_g = (_f = ga.impacts) === null || _f === void 0 ? void 0 : _f.socioeconomic) !== null && _g !== void 0 ? _g : []).map((x) => (Object.assign(Object.assign({}, x), { impact_type: 'socioeconomic' })))].entries()) {
                yield databaseConnect_1.pool.query('INSERT INTO gender_impacts (id, gender_assessment_id, impact_type, impact, women, men, vulnerable, severity, opportunity, sort_order) VALUES (?,?,?,?,?,?,?,?,?,?)', [(0, id_1.newId)(), realGaId, imp.impact_type, imp.impact, imp.women, imp.men, imp.vulnerable, (_h = imp.severity) !== null && _h !== void 0 ? _h : null, (_j = imp.opportunity) !== null && _j !== void 0 ? _j : null, i]);
            }
            for (const [i, r] of ((_k = ga.recommendations) !== null && _k !== void 0 ? _k : []).entries()) {
                yield databaseConnect_1.pool.query('INSERT INTO gender_recommendations (id, gender_assessment_id, recommendation, priority, scope, responsible, deadline, sort_order) VALUES (?,?,?,?,?,?,?,?)', [(0, id_1.newId)(), realGaId, r.recommendation, r.priority, r.scope, r.responsible, r.deadline, i]);
            }
        });
    }
    _saveComplaintMechanism(formId, cm) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const cmId = (0, id_1.newId)();
            yield databaseConnect_1.pool.query(`INSERT INTO complaint_mechanism (id, form_id, documentary_basis, key_criteria, global_conclusion)
       VALUES (?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         documentary_basis = VALUES(documentary_basis),
         key_criteria      = VALUES(key_criteria),
         global_conclusion = VALUES(global_conclusion)`, [cmId, formId, JSON.stringify((_a = cm.documentaryBasis) !== null && _a !== void 0 ? _a : {}), JSON.stringify((_b = cm.keyCriteria) !== null && _b !== void 0 ? _b : {}), (_c = cm.globalConclusion) !== null && _c !== void 0 ? _c : '']);
            const [cmRows] = yield databaseConnect_1.pool.query('SELECT id FROM complaint_mechanism WHERE form_id = ?', [formId]);
            const realCmId = cmRows[0].id;
            yield databaseConnect_1.pool.query('DELETE FROM complaint_strengths      WHERE complaint_mechanism_id = ?', [realCmId]);
            yield databaseConnect_1.pool.query('DELETE FROM complaint_weaknesses     WHERE complaint_mechanism_id = ?', [realCmId]);
            yield databaseConnect_1.pool.query('DELETE FROM complaint_recommendations WHERE complaint_mechanism_id = ?', [realCmId]);
            for (const [i, s] of ((_d = cm.strengths) !== null && _d !== void 0 ? _d : []).entries()) {
                yield databaseConnect_1.pool.query('INSERT INTO complaint_strengths (id, complaint_mechanism_id, strength, sort_order) VALUES (?,?,?,?)', [(0, id_1.newId)(), realCmId, s, i]);
            }
            for (const [i, w] of ((_e = cm.weaknesses) !== null && _e !== void 0 ? _e : []).entries()) {
                yield databaseConnect_1.pool.query('INSERT INTO complaint_weaknesses (id, complaint_mechanism_id, deficiency, consequence, severity, sort_order) VALUES (?,?,?,?,?,?)', [(0, id_1.newId)(), realCmId, w.deficiency, w.consequence, w.severity, i]);
            }
            for (const [i, r] of ((_f = cm.recommendations) !== null && _f !== void 0 ? _f : []).entries()) {
                yield databaseConnect_1.pool.query('INSERT INTO complaint_recommendations (id, complaint_mechanism_id, recommendation, priority, responsible, deadline, sort_order) VALUES (?,?,?,?,?,?,?)', [(0, id_1.newId)(), realCmId, r.recommendation, r.priority, r.responsible, r.deadline, i]);
            }
        });
    }
    _insertChecklistCriteres(auditId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
            const sections = [
                { key: 's1', items: (_a = data.section1_cadreJuridique) !== null && _a !== void 0 ? _a : [] },
                { key: 's2_stabilite', items: (_c = (_b = data.section2_infraSecurite) === null || _b === void 0 ? void 0 : _b.stabiliteStructure) !== null && _c !== void 0 ? _c : [] },
                { key: 's2_incendie', items: (_e = (_d = data.section2_infraSecurite) === null || _d === void 0 ? void 0 : _d.securiteIncendie) !== null && _e !== void 0 ? _e : [] },
                { key: 's2_pmr', items: (_g = (_f = data.section2_infraSecurite) === null || _f === void 0 ? void 0 : _f.accessibilitePMR) !== null && _g !== void 0 ? _g : [] },
                { key: 's3_dechets', items: (_j = (_h = data.section3_gestionEnvSociale) === null || _h === void 0 ? void 0 : _h.gestionDechets) !== null && _j !== void 0 ? _j : [] },
                { key: 's3_nuisances', items: (_l = (_k = data.section3_gestionEnvSociale) === null || _k === void 0 ? void 0 : _k.nuisancesPollution) !== null && _l !== void 0 ? _l : [] },
                { key: 's3_sante', items: (_o = (_m = data.section3_gestionEnvSociale) === null || _m === void 0 ? void 0 : _m.santeSecuteTravailleurs) !== null && _o !== void 0 ? _o : [] },
                { key: 's4_communautes', items: (_q = (_p = data.section4_gestionSociale) === null || _p === void 0 ? void 0 : _p.relationsCommunautes) !== null && _q !== void 0 ? _q : [] },
                { key: 's4_mgp', items: (_s = (_r = data.section4_gestionSociale) === null || _r === void 0 ? void 0 : _r.mgp) !== null && _s !== void 0 ? _s : [] },
                { key: 's5_securite', items: (_u = (_t = data.section5_risquesERP) === null || _t === void 0 ? void 0 : _t.securiteSurete) !== null && _u !== void 0 ? _u : [] },
                { key: 's5_hygiene', items: (_w = (_v = data.section5_risquesERP) === null || _v === void 0 ? void 0 : _v.hygieneEnvironnement) !== null && _w !== void 0 ? _w : [] },
            ];
            for (const section of sections) {
                for (const [i, item] of section.items.entries()) {
                    yield databaseConnect_1.pool.query('CALL sp_add_critere(?,?,?,?,?,?,?,?,?,?)', [
                        (0, id_1.newId)(), auditId, section.key,
                        item.numero, item.critere,
                        (_x = item.sourcesMethode) !== null && _x !== void 0 ? _x : '',
                        (_y = item.conformite) !== null && _y !== void 0 ? _y : 'S.O.',
                        (_z = item.observations) !== null && _z !== void 0 ? _z : '',
                        (_0 = item.risqueNonConformite) !== null && _0 !== void 0 ? _0 : '',
                        i,
                    ]);
                }
            }
        });
    }
    _insertChecklistDocuments(auditId, items) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            for (const [i, doc] of items.entries()) {
                yield databaseConnect_1.pool.query(`INSERT INTO checklist_audit_documents
         (id, checklist_audit_id, numero, document, disponible, commentaires, sort_order)
         VALUES (?,?,?,?,?,?,?)`, [(0, id_1.newId)(), auditId, doc.numero, doc.document, (_a = doc.disponible) !== null && _a !== void 0 ? _a : 'S.O.', (_b = doc.commentaires) !== null && _b !== void 0 ? _b : '', i]);
            }
        });
    }
    _insertConducteurQuestions(conducteurId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            for (const section of this.CONDUCTEUR_SECTIONS) {
                const items = (_a = data[section]) !== null && _a !== void 0 ? _a : [];
                const key = this.CONDUCTEUR_KEY_MAP[section];
                for (const [i, q] of items.entries()) {
                    yield databaseConnect_1.pool.query(`INSERT INTO checklist_conducteur_questions
           (id, checklist_conducteur_id, section_key, numero, question,
            reponse, reponse_booleenne, observations, sort_order)
           VALUES (?,?,?,?,?,?,?,?,?)`, [
                        (0, id_1.newId)(), conducteurId, key,
                        q.numero, q.question,
                        (_b = q.reponse) !== null && _b !== void 0 ? _b : '',
                        (_c = q.reponseBooleenne) !== null && _c !== void 0 ? _c : null,
                        (_d = q.observations) !== null && _d !== void 0 ? _d : '',
                        i,
                    ]);
                }
            }
        });
    }
    _insertGuideQuestions(guideId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const themes = ['theme1', 'theme2', 'theme3', 'theme4'];
            const themeKeys = {
                theme1: 't1', theme2: 't2', theme3: 't3', theme4: 't4',
            };
            for (const theme of themes) {
                const questions = (_b = (_a = data[theme]) === null || _a === void 0 ? void 0 : _a.questions) !== null && _b !== void 0 ? _b : [];
                for (const [i, q] of questions.entries()) {
                    const nuisances = q.nuisancesObservees
                        ? JSON.stringify(q.nuisancesObservees)
                        : null;
                    yield databaseConnect_1.pool.query('CALL sp_add_guide_question(?,?,?,?,?,?,?,?)', [
                        (0, id_1.newId)(), guideId, themeKeys[theme],
                        q.questionId, q.question,
                        (_c = q.reponse) !== null && _c !== void 0 ? _c : '',
                        nuisances, i,
                    ]);
                }
            }
        });
    }
    // ── Reconstructeurs (DB rows → shape Mongoose) ────────────────────────────
    _buildGuideResponse(row, questions) {
        const byTheme = (key) => questions.filter(q => q.theme_key === key);
        // Retourne les champs directement (sans generalInfo) pour que words.service.ts les trouve
        return {
            id: row.id,
            guide_type: row.guide_type,
            subprojet: row.subprojet,
            // Champs directs
            gi_nom: row.gi_nom,
            gi_fonction: row.gi_fonction,
            gi_contact: row.gi_contact,
            gi_date: row.gi_date,
            gi_lieu: row.gi_lieu,
            gi_type_entretien: row.gi_type_entretien,
            gi_employeur: row.gi_employeur,
            gi_type_contrat: row.gi_type_contrat,
            notes_auditeur: row.notes_auditeur,
            created_at: row.created_at,
            updated_at: row.updated_at,
            // Thème 1
            theme1: {
                questions: byTheme('t1').map((q) => ({
                    question_id: q.question_id,
                    question: q.question,
                    reponse: q.reponse,
                    sort_order: q.sort_order,
                }))
            },
            // Thème 2 (avec nuisances pour riverains)
            theme2: {
                questions: byTheme('t2').map((q) => ({
                    question_id: q.question_id,
                    question: q.question,
                    reponse: q.reponse,
                    nuisance_poussiere: q.nuisance_poussiere === 1,
                    nuisance_bruit: q.nuisance_bruit === 1,
                    nuisance_circulation: q.nuisance_circulation === 1,
                    nuisance_odeurs: q.nuisance_odeurs === 1,
                    nuisance_dechets: q.nuisance_dechets === 1,
                    nuisancesObservees: {
                        poussiere: q.nuisance_poussiere === 1,
                        bruit: q.nuisance_bruit === 1,
                        circulation: q.nuisance_circulation === 1,
                        odeurs: q.nuisance_odeurs === 1,
                        dechets: q.nuisance_dechets === 1,
                    },
                    sort_order: q.sort_order,
                }))
            },
            // Thème 3
            theme3: {
                questions: byTheme('t3').map((q) => ({
                    question_id: q.question_id,
                    question: q.question,
                    reponse: q.reponse,
                    sort_order: q.sort_order,
                }))
            },
            // Thème 4 (optionnel)
            theme4: byTheme('t4').length > 0 ? {
                questions: byTheme('t4').map((q) => ({
                    question_id: q.question_id,
                    question: q.question,
                    reponse: q.reponse,
                    sort_order: q.sort_order,
                }))
            } : undefined,
        };
    }
    // ── GLOBAL STATS UNIFIED ─────────────────────────────────────────────────────
    getGlobalStats() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            // Récupérer les totaux par table
            const [apesCount] = yield databaseConnect_1.pool.query(`SELECT COUNT(*) as total FROM form_data`);
            const [guideCount] = yield databaseConnect_1.pool.query(`SELECT COUNT(*) as total FROM guide_entretien`);
            const [auditCount] = yield databaseConnect_1.pool.query(`SELECT COUNT(*) as total FROM checklist_audit`);
            const [conducteurCount] = yield databaseConnect_1.pool.query(`SELECT COUNT(*) as total FROM checklist_conducteur`);
            // Récupérer les stats par statut pour APES
            const [apesStatus] = yield databaseConnect_1.pool.query(`
    SELECT status, COUNT(*) as count 
    FROM form_data 
    GROUP BY status
  `);
            // Récupérer les stats par type pour guides
            const [guideType] = yield databaseConnect_1.pool.query(`
    SELECT guide_type as type, COUNT(*) as count 
    FROM guide_entretien 
    GROUP BY guide_type
  `);
            // Récupérer les 10 derniers formulaires créés (tous types)
            const [recentForms] = yield databaseConnect_1.pool.query(`
    SELECT 
      id, 
      'apes' as type, 
      status, 
      created_at,
      (SELECT project_name FROM project_info WHERE project_info.id = form_data.project_info_id) as name
    FROM form_data
    UNION ALL
    SELECT id, 'guide-entretien' as type, 'draft' as status, created_at, subprojet as name
    FROM guide_entretien
    UNION ALL
    SELECT id, 'checklist-audit' as type, 'draft' as status, created_at, subprojet as name
    FROM checklist_audit
    UNION ALL
    SELECT id, 'checklist-conducteur' as type, 'draft' as status, created_at, subprojet as name
    FROM checklist_conducteur
    ORDER BY created_at DESC
    LIMIT 10
  `);
            const totalGeneral = (((_a = apesCount[0]) === null || _a === void 0 ? void 0 : _a.total) || 0) +
                (((_b = guideCount[0]) === null || _b === void 0 ? void 0 : _b.total) || 0) +
                (((_c = auditCount[0]) === null || _c === void 0 ? void 0 : _c.total) || 0) +
                (((_d = conducteurCount[0]) === null || _d === void 0 ? void 0 : _d.total) || 0);
            return {
                total: totalGeneral,
                byType: {
                    apes: { total: ((_e = apesCount[0]) === null || _e === void 0 ? void 0 : _e.total) || 0, stats: apesStatus[0] || [] },
                    guide: { total: ((_f = guideCount[0]) === null || _f === void 0 ? void 0 : _f.total) || 0, stats: guideType[0] || [] },
                    checklistAudit: { total: ((_g = auditCount[0]) === null || _g === void 0 ? void 0 : _g.total) || 0 },
                    checklistConducteur: { total: ((_h = conducteurCount[0]) === null || _h === void 0 ? void 0 : _h.total) || 0 }
                },
                recent: recentForms[0] || [],
                timestamp: new Date().toISOString()
            };
        });
    }
    _buildAuditResponse(row, criteres, documents) {
        const bySectionKey = (key) => criteres.filter(c => c.section_key === key);
        return Object.assign(Object.assign({}, row), { synthese: {
                nombreNonConformitesMajeures: row.synth_nb_nc_majeures,
                domainesCritiques: row.synth_domaines_critiques,
                signatureAuditeur: row.synth_signature_auditeur,
            }, section1_cadreJuridique: bySectionKey('s1'), section2_infraSecurite: {
                stabiliteStructure: bySectionKey('s2_stabilite'),
                securiteIncendie: bySectionKey('s2_incendie'),
                accessibilitePMR: bySectionKey('s2_pmr'),
            }, section3_gestionEnvSociale: {
                gestionDechets: bySectionKey('s3_dechets'),
                nuisancesPollution: bySectionKey('s3_nuisances'),
                santeSecuteTravailleurs: bySectionKey('s3_sante'),
            }, section4_gestionSociale: {
                relationsCommunautes: bySectionKey('s4_communautes'),
                mgp: bySectionKey('s4_mgp'),
            }, section5_risquesERP: {
                securiteSurete: bySectionKey('s5_securite'),
                hygieneEnvironnement: bySectionKey('s5_hygiene'),
            }, section6_bilanDocumentaire: documents });
    }
    _buildConducteurResponse(row, questions) {
        const byKey = (k) => questions.filter(q => q.section_key === k);
        return Object.assign(Object.assign({}, row), { section1_infoGenerales: byKey('s1'), section2_processusInitialT1: byKey('s2'), section3_installationT2: byKey('s3'), section4_recrutementT2: byKey('s4'), section5_hseT2: byKey('s5'), section6_gestionEnvT2: byKey('s6'), section7_sensibilisationT2: byKey('s7'), section8_mgpT2: byKey('s8'), section9_fermetureT2: byKey('s9'), section10_exploitationT3: byKey('s10'), section11_synthese: byKey('s11') });
    }
    _parseJson(val) {
        if (typeof val === 'string') {
            try {
                return JSON.parse(val);
            }
            catch (_a) {
                return val;
            }
        }
        return val;
    }
    _formatStat(labels) {
        return (s) => {
            var _a;
            return ({
                status: s.status,
                label: (_a = labels[s.status]) !== null && _a !== void 0 ? _a : s.status,
                count: Number(s.count),
                latest: s.latest,
            });
        };
    }
}
exports.FormService = FormService;
//# sourceMappingURL=form.service.js.map