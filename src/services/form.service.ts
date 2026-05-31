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

import { pool }  from '../config/databaseConnect';
import { newId } from '../utils/id';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** mysql2 retourne les résultats des CALL dans rows[0] */
function firstResultSet(rows: any): any[] {
  return Array.isArray(rows[0]) ? rows[0] : rows;
}

/** Compte les lignes d'une table avec un filtre optionnel WHERE */
async function countRows(table: string, where = '1=1', params: any[] = []): Promise<number> {
  const [rows] = await pool.query<any[]>(
    `SELECT COUNT(*) AS total FROM ${table} WHERE ${where}`,
    params
  );
  return rows[0].total as number;
}

// =============================================================================
//  FORM DATA — APES
// =============================================================================

export class FormService {

  // ── CREATE FORM ────────────────────────────────────────────────────────────
  async createForm(formData: {
    projectInfo: {
      projectName: string;
      date: Date | string;
      auditors: string;
      location: string;
      period: string;
    };
    documentReview?: any;
    fieldInspection?: any;
    stakeholderInterview?: any;
    genderAssessment?: any;
    complaintMechanism?: any;
    status?: 'draft' | 'submitted' | 'archived';
  }) {
    const formId    = newId();
    const projectId = newId();

    // 1 — Créer project_info + form_data (transaction dans la proc)
    await pool.query('CALL sp_create_form(?,?,?,?,?,?,?,?)', [
      formId,
      projectId,
      formData.projectInfo.projectName,
      formData.projectInfo.date,
      formData.projectInfo.auditors,
      formData.projectInfo.location,
      formData.projectInfo.period,
      formData.status ?? 'draft',
    ]);

    // 2 — Sections filles (si fournies à la création)
    await this._saveSections(formId, formData);

    return { id: formId, projectId, status: formData.status ?? 'draft' };
  }

  // ── GET BY ID ──────────────────────────────────────────────────────────────
  async getFormById(id: string) {
    // Infos de base via la vue
    const [base] = await pool.query<any[]>(
      'SELECT * FROM v_form_summary WHERE form_id = ?',
      [id]
    );
    if (base.length === 0) return null;

    // Sections filles
    const [docReview]      = await pool.query<any[]>('SELECT * FROM document_review      WHERE form_id = ?', [id]);
    const [fieldInsp]      = await pool.query<any[]>('SELECT * FROM field_inspection     WHERE form_id = ?', [id]);
    const [stakeholder]    = await pool.query<any[]>('SELECT * FROM stakeholder_interview WHERE form_id = ?', [id]);
    const [genderBase]     = await pool.query<any[]>('SELECT * FROM gender_assessment    WHERE form_id = ?', [id]);
    const [complaint]      = await pool.query<any[]>('SELECT * FROM complaint_mechanism  WHERE form_id = ?', [id]);

    // Sous-tables gender
    let genderFull: any = null;
    if (genderBase.length > 0) {
      const gId = genderBase[0].id;
      const [objectives]     = await pool.query<any[]>('SELECT * FROM gender_objectives      WHERE gender_assessment_id = ? ORDER BY sort_order', [gId]);
      const [consultations]  = await pool.query<any[]>('SELECT * FROM gender_consultations   WHERE gender_assessment_id = ? ORDER BY sort_order', [gId]);
      const [impacts]        = await pool.query<any[]>('SELECT * FROM gender_impacts         WHERE gender_assessment_id = ? ORDER BY sort_order', [gId]);
      const [recommendations]= await pool.query<any[]>('SELECT * FROM gender_recommendations WHERE gender_assessment_id = ? ORDER BY sort_order', [gId]);

      genderFull = {
        ...genderBase[0],
        quantitative_data: this._parseJson(genderBase[0].quantitative_data),
        objectives,
        consultations,
        impacts,
        recommendations,
      };
    }

    // Sous-tables complaint
    let complaintFull: any = null;
    if (complaint.length > 0) {
      const cId = complaint[0].id;
      const [strengths]       = await pool.query<any[]>('SELECT * FROM complaint_strengths      WHERE complaint_mechanism_id = ? ORDER BY sort_order', [cId]);
      const [weaknesses]      = await pool.query<any[]>('SELECT * FROM complaint_weaknesses     WHERE complaint_mechanism_id = ? ORDER BY sort_order', [cId]);
      const [recommendations] = await pool.query<any[]>('SELECT * FROM complaint_recommendations WHERE complaint_mechanism_id = ? ORDER BY sort_order', [cId]);

      complaintFull = {
        ...complaint[0],
        documentary_basis: this._parseJson(complaint[0].documentary_basis),
        key_criteria:      this._parseJson(complaint[0].key_criteria),
        strengths:         strengths.map((s: any) => s.strength),
        weaknesses,
        recommendations,
      };
    }

    return {
      ...base[0],
      documentReview:      docReview[0]   ? { ...docReview[0], documents_presents: this._parseJson(docReview[0].documents_presents), documents_analysis: this._parseJson(docReview[0].documents_analysis) } : null,
      fieldInspection:     fieldInsp[0]   ? { ...fieldInsp[0], zones: this._parseJson(fieldInsp[0].zones), water_management: this._parseJson(fieldInsp[0].water_management), waste_management: this._parseJson(fieldInsp[0].waste_management), emissions: this._parseJson(fieldInsp[0].emissions), health_safety: this._parseJson(fieldInsp[0].health_safety), community: this._parseJson(fieldInsp[0].community) } : null,
      stakeholderInterview:stakeholder[0] ? { ...stakeholder[0], responses: this._parseJson(stakeholder[0].responses) } : null,
      genderAssessment:    genderFull,
      complaintMechanism:  complaintFull,
    };
  }

  // ── GET ALL (paginated + filters) ─────────────────────────────────────────
  async getAllForms(
    filters: { status?: string; projectName?: string; dateFrom?: Date; dateTo?: Date } = {},
    page  = 1,
    limit = 10
  ) {
    const conditions: string[] = [];
    const params: any[]        = [];

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

    const where  = conditions.length > 0 ? conditions.join(' AND ') : '1=1';
    const offset = (page - 1) * limit;

    const [forms] = await pool.query<any[]>(
      `SELECT * FROM v_form_summary WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const total = await countRows('v_form_summary', where, params);

    return { forms, total, page, totalPages: Math.ceil(total / limit) };
  }

  // ── UPDATE FORM ────────────────────────────────────────────────────────────
  async updateForm(id: string, updateData: any) {
    // Bloquer la re-soumission d'un formulaire déjà soumis
    if (updateData.status === 'submitted') {
      const [rows] = await pool.query<any[]>(
        'SELECT status FROM form_data WHERE id = ?',
        [id]
      );
      if (rows[0]?.status === 'submitted') {
        throw new Error('Le formulaire a déjà été soumis et ne peut plus être modifié');
      }
    }

    if (updateData.projectInfo) {
      await pool.query('CALL sp_update_form(?,?,?,?,?,?,?)', [
        id,
        updateData.projectInfo.projectName,
        updateData.projectInfo.date,
        updateData.projectInfo.auditors,
        updateData.projectInfo.location,
        updateData.projectInfo.period,
        updateData.status ?? 'draft',
      ]);
    } else if (updateData.status) {
      await pool.query(
        'UPDATE form_data SET status = ?, updated_at = NOW() WHERE id = ?',
        [updateData.status, id]
      );
    }

    // Mettre à jour les sections si fournies
    await this._saveSections(id, updateData);

    return this.getFormById(id);
  }

  // ── DELETE FORM ────────────────────────────────────────────────────────────
  async deleteForm(id: string): Promise<boolean> {
    await pool.query('CALL sp_delete_form(?,?)', [id, 1]); // 1 = hard delete
    return true;
  }

  // ── SUBMIT FORM ────────────────────────────────────────────────────────────
  async submitForm(id: string) {
    await pool.query('CALL sp_submit_form(?)', [id]);
    return this.getFormById(id);
  }

  // ── STATS ──────────────────────────────────────────────────────────────────
  async getFormStats() {
    const [apesStats] = await pool.query<any[]>(`
      SELECT status, COUNT(*) AS count, MAX(created_at) AS latest
      FROM form_data
      GROUP BY status
    `);

    const [auditStats] = await pool.query<any[]>(`
      SELECT 'N/A' AS status, COUNT(*) AS count, MAX(created_at) AS latest
      FROM checklist_audit
    `);

    const [conducteurStats] = await pool.query<any[]>(`
      SELECT 'N/A' AS status, COUNT(*) AS count, MAX(created_at) AS latest
      FROM checklist_conducteur
    `);

    const [guideStats] = await pool.query<any[]>(`
      SELECT guide_type AS status, COUNT(*) AS count, MAX(created_at) AS latest
      FROM guide_entretien
      GROUP BY guide_type
    `);

    const totalApes       = apesStats.reduce((s, r) => s + Number(r.count), 0);
    const totalAudit      = auditStats.reduce((s, r) => s + Number(r.count), 0);
    const totalConducteur = conducteurStats.reduce((s, r) => s + Number(r.count), 0);
    const totalGuide      = guideStats.reduce((s, r) => s + Number(r.count), 0);

    const statusLabels: Record<string, string> = {
      draft:     'Brouillon',
      submitted: 'Soumis',
      archived:  'Archivé',
    };

    return {
      total: totalApes + totalAudit + totalConducteur + totalGuide,
      byFormType: {
        apes:                apesStats.map(this._formatStat(statusLabels)),
        checklistAudit:      auditStats.map(this._formatStat(statusLabels)),
        checklistConducteur: conducteurStats.map(this._formatStat(statusLabels)),
        guideEntretien:      guideStats.map(this._formatStat(statusLabels)),
      },
      details: {
        apes:               { total: totalApes,       stats: apesStats },
        checklistAudit:     { total: totalAudit,      stats: auditStats },
        checklistConducteur:{ total: totalConducteur, stats: conducteurStats },
        guideEntretien:     { total: totalGuide,      stats: guideStats },
      },
    };
  }

  // =============================================================================
  //  GUIDE D'ENTRETIEN
  // =============================================================================

  async createGuideEntretien(data: any) {
    const id = newId();

    await pool.query('CALL sp_save_guide_entretien(?,?,?,?,?,?,?,?,?,?,?,?)', [
      id,
      data.guide_type     ?? data.guideType,
      data.subprojet,
      data.gi_nom         ?? data.generalInfo?.nom,
      data.gi_fonction    ?? data.generalInfo?.fonction,
      data.gi_contact     ?? data.generalInfo?.contact     ?? '',
      data.gi_date        ?? data.generalInfo?.date,
      data.gi_lieu        ?? data.generalInfo?.lieu,
      data.gi_type_entretien ?? data.generalInfo?.typeEntretien ?? '',
      data.gi_employeur   ?? data.generalInfo?.employeur   ?? '',
      data.gi_type_contrat ?? data.generalInfo?.typeContrat ?? '',
      data.notes_auditeur ?? data.notesAuditeur ?? '',
    ]);

    // Insérer les questions de chaque thème
    await this._insertGuideQuestions(id, data);

    return this.getGuideEntretienById(id);
  }

  async getGuideEntretienById(id: string) {
    const [rows] = await pool.query<any[]>(
      'SELECT * FROM guide_entretien WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return null;

    const [questions] = await pool.query<any[]>(
      'SELECT * FROM guide_entretien_questions WHERE guide_entretien_id = ? ORDER BY theme_key, sort_order',
      [id]
    );

    return this._buildGuideResponse(rows[0], questions);
  }

  async getAllGuideEntretiens(
    filters: { guideType?: string; subprojet?: string } = {},
    page  = 1,
    limit = 10
  ) {
    const conditions: string[] = [];
    const params: any[]        = [];

    if (filters.guideType) { conditions.push('guide_type = ?');        params.push(filters.guideType); }
    if (filters.subprojet) { conditions.push('subprojet LIKE ?');      params.push(`%${filters.subprojet}%`); }

    const where  = conditions.length > 0 ? conditions.join(' AND ') : '1=1';
    const offset = (page - 1) * limit;

    const [items] = await pool.query<any[]>(
      `SELECT * FROM v_guide_entretiens WHERE ${where} ORDER BY date_entretien DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const total = await countRows('guide_entretien', where, params);

    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateGuideEntretien(id: string, data: any) {
    await pool.query('CALL sp_save_guide_entretien(?,?,?,?,?,?,?,?,?,?,?,?)', [
      id,
      data.guide_type     ?? data.guideType,
      data.subprojet,
      data.gi_nom         ?? data.generalInfo?.nom,
      data.gi_fonction    ?? data.generalInfo?.fonction,
      data.gi_contact     ?? data.generalInfo?.contact     ?? '',
      data.gi_date        ?? data.generalInfo?.date,
      data.gi_lieu        ?? data.generalInfo?.lieu,
      data.gi_type_entretien ?? data.generalInfo?.typeEntretien ?? '',
      data.gi_employeur   ?? data.generalInfo?.employeur   ?? '',
      data.gi_type_contrat ?? data.generalInfo?.typeContrat ?? '',
      data.notes_auditeur ?? data.notesAuditeur ?? '',
    ]);

    // Re-synchroniser les questions : supprimer + réinsérer
    await pool.query('DELETE FROM guide_entretien_questions WHERE guide_entretien_id = ?', [id]);
    await this._insertGuideQuestions(id, data);

    return this.getGuideEntretienById(id);
  }

  async deleteGuideEntretien(id: string): Promise<boolean> {
    const [result] = await pool.query<any>(
      'DELETE FROM guide_entretien WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // =============================================================================
  //  CHECKLIST AUDIT
  // =============================================================================

  async createChecklistAudit(data: any) {
    const id = newId();

    await pool.query('CALL sp_save_checklist_audit(?,?,?,?,?,?,?)', [
      id,
      data.subprojet,
      data.auditeurs,
      data.date,
      data.synthese?.nombreNonConformitesMajeures ?? 0,
      data.synthese?.domainesCritiques            ?? '',
      data.synthese?.signatureAuditeur            ?? '',
    ]);

    await this._insertChecklistCriteres(id, data);
    await this._insertChecklistDocuments(id, data.section6_bilanDocumentaire ?? []);

    return this.getChecklistAuditById(id);
  }

  async getChecklistAuditById(id: string) {
    const [rows] = await pool.query<any[]>(
      'SELECT * FROM checklist_audit WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return null;

    const [criteres]  = await pool.query<any[]>(
      'SELECT * FROM checklist_audit_criteres  WHERE checklist_audit_id = ? ORDER BY section_key, sort_order', [id]
    );
    const [documents] = await pool.query<any[]>(
      'SELECT * FROM checklist_audit_documents WHERE checklist_audit_id = ? ORDER BY sort_order', [id]
    );

    return this._buildAuditResponse(rows[0], criteres, documents);
  }

  async getAllChecklistAudits(
    filters: { subprojet?: string; auditeurs?: string } = {},
    page  = 1,
    limit = 10
  ) {
    const conditions: string[] = [];
    const params: any[]        = [];

    if (filters.subprojet) { conditions.push('subprojet LIKE ?'); params.push(`%${filters.subprojet}%`); }
    if (filters.auditeurs) { conditions.push('auditeurs LIKE ?'); params.push(`%${filters.auditeurs}%`); }

    const where  = conditions.length > 0 ? conditions.join(' AND ') : '1=1';
    const offset = (page - 1) * limit;

    const [items] = await pool.query<any[]>(
      `SELECT * FROM checklist_audit WHERE ${where} ORDER BY date DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const total = await countRows('checklist_audit', where, params);

    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateChecklistAudit(id: string, data: any) {
    await pool.query('CALL sp_save_checklist_audit(?,?,?,?,?,?,?)', [
      id,
      data.subprojet,
      data.auditeurs,
      data.date,
      data.synthese?.nombreNonConformitesMajeures ?? 0,
      data.synthese?.domainesCritiques            ?? '',
      data.synthese?.signatureAuditeur            ?? '',
    ]);

    // Re-sync critères et documents
    await pool.query('DELETE FROM checklist_audit_criteres  WHERE checklist_audit_id = ?', [id]);
    await pool.query('DELETE FROM checklist_audit_documents WHERE checklist_audit_id = ?', [id]);
    await this._insertChecklistCriteres(id, data);
    await this._insertChecklistDocuments(id, data.section6_bilanDocumentaire ?? []);

    return this.getChecklistAuditById(id);
  }

  async deleteChecklistAudit(id: string): Promise<boolean> {
    const [result] = await pool.query<any>('DELETE FROM checklist_audit WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // =============================================================================
  //  CHECKLIST CONDUCTEUR TRAVAUX
  // =============================================================================

  async createChecklistConducteur(data: any) {
    const id = newId();

    await pool.query(
      `INSERT INTO checklist_conducteur
       (id, subprojet, auditeur, date, personne_rencontree, fonction, entreprise,
        contact, duree_entretien, lieu, commentaires_libres, signature_auditeur)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id, data.subprojet, data.auditeur, data.date,
        data.personneRencontree, data.fonction, data.entreprise,
        data.contact ?? '', data.dureeEntretien ?? '', data.lieu,
        data.commentairesLibres ?? '', data.signatureAuditeur ?? '',
      ]
    );

    await this._insertConducteurQuestions(id, data);

    return this.getChecklistConducteurById(id);
  }

  async getChecklistConducteurById(id: string) {
    const [rows] = await pool.query<any[]>(
      'SELECT * FROM checklist_conducteur WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return null;

    const [questions] = await pool.query<any[]>(
      'SELECT * FROM checklist_conducteur_questions WHERE checklist_conducteur_id = ? ORDER BY section_key, sort_order',
      [id]
    );

    return this._buildConducteurResponse(rows[0], questions);
  }

  async getAllChecklistConducteurs(
    filters: { subprojet?: string; entreprise?: string } = {},
    page  = 1,
    limit = 10
  ) {
    const conditions: string[] = [];
    const params: any[]        = [];

    if (filters.subprojet) { conditions.push('subprojet  LIKE ?'); params.push(`%${filters.subprojet}%`); }
    if (filters.entreprise){ conditions.push('entreprise LIKE ?'); params.push(`%${filters.entreprise}%`); }

    const where  = conditions.length > 0 ? conditions.join(' AND ') : '1=1';
    const offset = (page - 1) * limit;

    const [items] = await pool.query<any[]>(
      `SELECT * FROM checklist_conducteur WHERE ${where} ORDER BY date DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const total = await countRows('checklist_conducteur', where, params);

    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateChecklistConducteur(id: string, data: any) {
    await pool.query(
      `UPDATE checklist_conducteur
       SET subprojet = ?, auditeur = ?, date = ?, personne_rencontree = ?,
           fonction = ?, entreprise = ?, contact = ?, duree_entretien = ?,
           lieu = ?, commentaires_libres = ?, signature_auditeur = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        data.subprojet, data.auditeur, data.date, data.personneRencontree,
        data.fonction, data.entreprise, data.contact ?? '', data.dureeEntretien ?? '',
        data.lieu, data.commentairesLibres ?? '', data.signatureAuditeur ?? '', id,
      ]
    );

    await pool.query('DELETE FROM checklist_conducteur_questions WHERE checklist_conducteur_id = ?', [id]);
    await this._insertConducteurQuestions(id, data);

    return this.getChecklistConducteurById(id);
  }

  async deleteChecklistConducteur(id: string): Promise<boolean> {
    const [result] = await pool.query<any>(
      'DELETE FROM checklist_conducteur WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // =============================================================================
  //  HELPERS PRIVÉS
  // =============================================================================

  /** Upsert toutes les sections d'un FormData */
  private async _saveSections(formId: string, data: any) {
    if (data.documentReview) {
      const dr = data.documentReview;
      await pool.query('CALL sp_save_document_review(?,?,?,?,?,?)', [
        newId(), formId,
        JSON.stringify(dr.documentsPresents  ?? {}),
        JSON.stringify(dr.documentsAnalysis  ?? {}),
        dr.documentsManquants ?? '',
        dr.autresDocuments    ?? '',
      ]);
    }

    if (data.fieldInspection) {
      const fi = data.fieldInspection;
      const fiId = newId();
      await pool.query(
        `INSERT INTO field_inspection
         (id, form_id, project_name, date, auditors, accompaniers, zones,
          water_management, waste_management, emissions, health_safety, community)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
           project_name = VALUES(project_name), date = VALUES(date),
           auditors = VALUES(auditors), accompaniers = VALUES(accompaniers),
           zones = VALUES(zones), water_management = VALUES(water_management),
           waste_management = VALUES(waste_management), emissions = VALUES(emissions),
           health_safety = VALUES(health_safety), community = VALUES(community)`,
        [
          fiId, formId, fi.projectName, fi.date, fi.auditors, fi.accompaniers ?? '',
          JSON.stringify(fi.zones ?? []),
          JSON.stringify(fi.waterManagement ?? {}),
          JSON.stringify(fi.wasteManagement ?? {}),
          JSON.stringify(fi.emissions       ?? {}),
          JSON.stringify(fi.healthSafety    ?? {}),
          JSON.stringify(fi.community       ?? {}),
        ]
      );
    }

    if (data.stakeholderInterview) {
      const si = data.stakeholderInterview;
      await pool.query('CALL sp_save_stakeholder_interview(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
        newId(), formId,
        si.date, si.location, si.duration, si.stakeholderType,
        si.profile.name, si.profile.function, si.profile.gender, si.profile.ageRange,
        si.consent.confidentiality ? 1 : 0,
        si.consent.notes           ? 1 : 0,
        si.consent.recording       ? 1 : 0,
        JSON.stringify(si.responses ?? {}),
        si.evaluation.quality, si.evaluation.frankness,
        si.evaluation.relevance, si.evaluation.climate,
      ]);
    }

    if (data.genderAssessment) {
      await this._saveGenderAssessment(formId, data.genderAssessment);
    }

    if (data.complaintMechanism) {
      await this._saveComplaintMechanism(formId, data.complaintMechanism);
    }
  }

  private async _saveGenderAssessment(formId: string, ga: any) {
    // Upsert gender_assessment
    const gaId = newId();
    await pool.query(
      `INSERT INTO gender_assessment (id, form_id, quantitative_data)
       VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE quantitative_data = VALUES(quantitative_data)`,
      [gaId, formId, JSON.stringify(ga.quantitativeData ?? {})]
    );

    // Récupérer l'id réel (en cas de ON DUPLICATE KEY)
    const [gaRows] = await pool.query<any[]>(
      'SELECT id FROM gender_assessment WHERE form_id = ?', [formId]
    );
    const realGaId = gaRows[0].id;

    // Vider et réinsérer les sous-tables
    await pool.query('DELETE FROM gender_objectives      WHERE gender_assessment_id = ?', [realGaId]);
    await pool.query('DELETE FROM gender_consultations   WHERE gender_assessment_id = ?', [realGaId]);
    await pool.query('DELETE FROM gender_impacts         WHERE gender_assessment_id = ?', [realGaId]);
    await pool.query('DELETE FROM gender_recommendations WHERE gender_assessment_id = ?', [realGaId]);

    for (const [i, obj] of (ga.objectives ?? []).entries()) {
      await pool.query(
        'INSERT INTO gender_objectives (id, gender_assessment_id, objective, indicator, status, sort_order) VALUES (?,?,?,?,?,?)',
        [newId(), realGaId, obj.objective, obj.indicator, obj.status, i]
      );
    }

    for (const [i, c] of (ga.consultations ?? []).entries()) {
      await pool.query(
        'INSERT INTO gender_consultations (id, gender_assessment_id, `group`, sessions, participants, method, sort_order) VALUES (?,?,?,?,?,?,?)',
        [newId(), realGaId, c.group, c.sessions, c.participants, c.method, i]
      );
    }

    for (const [i, imp] of [...(ga.impacts?.environmental ?? []).map((x: any) => ({ ...x, impact_type: 'environmental' })), ...(ga.impacts?.socioeconomic ?? []).map((x: any) => ({ ...x, impact_type: 'socioeconomic' }))].entries()) {
      await pool.query(
        'INSERT INTO gender_impacts (id, gender_assessment_id, impact_type, impact, women, men, vulnerable, severity, opportunity, sort_order) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [newId(), realGaId, imp.impact_type, imp.impact, imp.women, imp.men, imp.vulnerable, imp.severity ?? null, imp.opportunity ?? null, i]
      );
    }

    for (const [i, r] of (ga.recommendations ?? []).entries()) {
      await pool.query(
        'INSERT INTO gender_recommendations (id, gender_assessment_id, recommendation, priority, scope, responsible, deadline, sort_order) VALUES (?,?,?,?,?,?,?,?)',
        [newId(), realGaId, r.recommendation, r.priority, r.scope, r.responsible, r.deadline, i]
      );
    }
  }

  private async _saveComplaintMechanism(formId: string, cm: any) {
    const cmId = newId();
    await pool.query(
      `INSERT INTO complaint_mechanism (id, form_id, documentary_basis, key_criteria, global_conclusion)
       VALUES (?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         documentary_basis = VALUES(documentary_basis),
         key_criteria      = VALUES(key_criteria),
         global_conclusion = VALUES(global_conclusion)`,
      [cmId, formId, JSON.stringify(cm.documentaryBasis ?? {}), JSON.stringify(cm.keyCriteria ?? {}), cm.globalConclusion ?? '']
    );

    const [cmRows] = await pool.query<any[]>('SELECT id FROM complaint_mechanism WHERE form_id = ?', [formId]);
    const realCmId = cmRows[0].id;

    await pool.query('DELETE FROM complaint_strengths      WHERE complaint_mechanism_id = ?', [realCmId]);
    await pool.query('DELETE FROM complaint_weaknesses     WHERE complaint_mechanism_id = ?', [realCmId]);
    await pool.query('DELETE FROM complaint_recommendations WHERE complaint_mechanism_id = ?', [realCmId]);

    for (const [i, s] of (cm.strengths ?? []).entries()) {
      await pool.query('INSERT INTO complaint_strengths (id, complaint_mechanism_id, strength, sort_order) VALUES (?,?,?,?)', [newId(), realCmId, s, i]);
    }
    for (const [i, w] of (cm.weaknesses ?? []).entries()) {
      await pool.query('INSERT INTO complaint_weaknesses (id, complaint_mechanism_id, deficiency, consequence, severity, sort_order) VALUES (?,?,?,?,?,?)', [newId(), realCmId, w.deficiency, w.consequence, w.severity, i]);
    }
    for (const [i, r] of (cm.recommendations ?? []).entries()) {
      await pool.query('INSERT INTO complaint_recommendations (id, complaint_mechanism_id, recommendation, priority, responsible, deadline, sort_order) VALUES (?,?,?,?,?,?,?)', [newId(), realCmId, r.recommendation, r.priority, r.responsible, r.deadline, i]);
    }
  }

  // Section → section_key mapping (ChecklistAudit)
  private readonly SECTION_MAP: Record<string, string> = {
    section1_cadreJuridique:                          's1',
    'section2_infraSecurite.stabiliteStructure':      's2_stabilite',
    'section2_infraSecurite.securiteIncendie':        's2_incendie',
    'section2_infraSecurite.accessibilitePMR':        's2_pmr',
    'section3_gestionEnvSociale.gestionDechets':      's3_dechets',
    'section3_gestionEnvSociale.nuisancesPollution':  's3_nuisances',
    'section3_gestionEnvSociale.santeSecuteTravailleurs': 's3_sante',
    'section4_gestionSociale.relationsCommunautes':   's4_communautes',
    'section4_gestionSociale.mgp':                    's4_mgp',
    'section5_risquesERP.securiteSurete':             's5_securite',
    'section5_risquesERP.hygieneEnvironnement':       's5_hygiene',
  };

  private async _insertChecklistCriteres(auditId: string, data: any) {
    const sections: Array<{ key: string; items: any[] }> = [
      { key: 's1',             items: data.section1_cadreJuridique ?? [] },
      { key: 's2_stabilite',   items: data.section2_infraSecurite?.stabiliteStructure ?? [] },
      { key: 's2_incendie',    items: data.section2_infraSecurite?.securiteIncendie   ?? [] },
      { key: 's2_pmr',         items: data.section2_infraSecurite?.accessibilitePMR   ?? [] },
      { key: 's3_dechets',     items: data.section3_gestionEnvSociale?.gestionDechets ?? [] },
      { key: 's3_nuisances',   items: data.section3_gestionEnvSociale?.nuisancesPollution ?? [] },
      { key: 's3_sante',       items: data.section3_gestionEnvSociale?.santeSecuteTravailleurs ?? [] },
      { key: 's4_communautes', items: data.section4_gestionSociale?.relationsCommunautes ?? [] },
      { key: 's4_mgp',         items: data.section4_gestionSociale?.mgp ?? [] },
      { key: 's5_securite',    items: data.section5_risquesERP?.securiteSurete ?? [] },
      { key: 's5_hygiene',     items: data.section5_risquesERP?.hygieneEnvironnement ?? [] },
    ];

    for (const section of sections) {
      for (const [i, item] of section.items.entries()) {
        await pool.query('CALL sp_add_critere(?,?,?,?,?,?,?,?,?,?)', [
          newId(), auditId, section.key,
          item.numero, item.critere, item.sourcesMethode ?? '',
          item.conformite ?? 'S.O.',
          item.observations ?? '', item.risqueNonConformite ?? '', i,
        ]);
      }
    }
  }

  private async _insertChecklistDocuments(auditId: string, items: any[]) {
    for (const [i, doc] of items.entries()) {
      await pool.query(
        `INSERT INTO checklist_audit_documents
         (id, checklist_audit_id, numero, document, disponible, commentaires, sort_order)
         VALUES (?,?,?,?,?,?,?)`,
        [newId(), auditId, doc.numero, doc.document, doc.disponible ?? 'S.O.', doc.commentaires ?? '', i]
      );
    }
  }

  private readonly CONDUCTEUR_SECTIONS = [
    'section1_infoGenerales', 'section2_processusInitialT1', 'section3_installationT2',
    'section4_recrutementT2', 'section5_hseT2', 'section6_gestionEnvT2',
    'section7_sensibilisationT2', 'section8_mgpT2', 'section9_fermetureT2',
    'section10_exploitationT3', 'section11_synthese',
  ];

  private readonly CONDUCTEUR_KEY_MAP: Record<string, string> = {
    section1_infoGenerales: 's1', section2_processusInitialT1: 's2',
    section3_installationT2: 's3', section4_recrutementT2: 's4',
    section5_hseT2: 's5', section6_gestionEnvT2: 's6',
    section7_sensibilisationT2: 's7', section8_mgpT2: 's8',
    section9_fermetureT2: 's9', section10_exploitationT3: 's10',
    section11_synthese: 's11',
  };

  private async _insertConducteurQuestions(conducteurId: string, data: any) {
    for (const section of this.CONDUCTEUR_SECTIONS) {
      const items: any[] = data[section] ?? [];
      const key = this.CONDUCTEUR_KEY_MAP[section];
      for (const [i, q] of items.entries()) {
        await pool.query(
          `INSERT INTO checklist_conducteur_questions
           (id, checklist_conducteur_id, section_key, numero, question,
            reponse, reponse_booleenne, observations, sort_order)
           VALUES (?,?,?,?,?,?,?,?,?)`,
          [
            newId(), conducteurId, key,
            q.numero, q.question,
            q.reponse ?? '', q.reponseBooleenne ?? null,
            q.observations ?? '', i,
          ]
        );
      }
    }
  }

  private async _insertGuideQuestions(guideId: string, data: any) {
    const themes = ['theme1', 'theme2', 'theme3', 'theme4'];
    const themeKeys: Record<string, 't1' | 't2' | 't3' | 't4'> = {
      theme1: 't1', theme2: 't2', theme3: 't3', theme4: 't4',
    };

    for (const theme of themes) {
      const questions: any[] = data[theme]?.questions ?? [];
      for (const [i, q] of questions.entries()) {
        const nuisances = q.nuisancesObservees
          ? JSON.stringify(q.nuisancesObservees)
          : null;
        await pool.query('CALL sp_add_guide_question(?,?,?,?,?,?,?,?)', [
          newId(), guideId, themeKeys[theme],
          q.questionId, q.question, q.reponse ?? '',
          nuisances, i,
        ]);
      }
    }
  }

  // ── Reconstructeurs (DB rows → shape Mongoose) ────────────────────────────

  private _buildGuideResponse(row: any, questions: any[]) {
  const byTheme = (key: string) => questions.filter(q => q.theme_key === key);
  
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
      questions: byTheme('t1').map((q: any) => ({
        question_id: q.question_id,
        question: q.question,
        reponse: q.reponse,
        sort_order: q.sort_order,
      }))
    },
    // Thème 2 (avec nuisances pour riverains)
    theme2: { 
      questions: byTheme('t2').map((q: any) => ({
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
      questions: byTheme('t3').map((q: any) => ({
        question_id: q.question_id,
        question: q.question,
        reponse: q.reponse,
        sort_order: q.sort_order,
      }))
    },
    // Thème 4 (optionnel)
    theme4: byTheme('t4').length > 0 ? { 
      questions: byTheme('t4').map((q: any) => ({
        question_id: q.question_id,
        question: q.question,
        reponse: q.reponse,
        sort_order: q.sort_order,
      })) 
    } : undefined,
  };
}

// ── GLOBAL STATS UNIFIED ─────────────────────────────────────────────────────
async getGlobalStats() {
  // Récupérer les totaux par table
  const [apesCount] = await pool.query<any[]>(`SELECT COUNT(*) as total FROM form_data`);
  const [guideCount] = await pool.query<any[]>(`SELECT COUNT(*) as total FROM guide_entretien`);
  const [auditCount] = await pool.query<any[]>(`SELECT COUNT(*) as total FROM checklist_audit`);
  const [conducteurCount] = await pool.query<any[]>(`SELECT COUNT(*) as total FROM checklist_conducteur`);

  // Récupérer les stats par statut pour APES
  const [apesStatus] = await pool.query<any[]>(`
    SELECT status, COUNT(*) as count 
    FROM form_data 
    GROUP BY status
  `);

  // Récupérer les stats par type pour guides
  const [guideType] = await pool.query<any[]>(`
    SELECT guide_type as type, COUNT(*) as count 
    FROM guide_entretien 
    GROUP BY guide_type
  `);

  // Récupérer les 10 derniers formulaires créés (tous types)
  const [recentForms] = await pool.query<any[]>(`
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

  const totalGeneral = (apesCount[0]?.total || 0) + 
                       (guideCount[0]?.total || 0) + 
                       (auditCount[0]?.total || 0) + 
                       (conducteurCount[0]?.total || 0);

  return {
    total: totalGeneral,
    byType: {
      apes: { total: apesCount[0]?.total || 0, stats: apesStatus[0] || [] },
      guide: { total: guideCount[0]?.total || 0, stats: guideType[0] || [] },
      checklistAudit: { total: auditCount[0]?.total || 0 },
      checklistConducteur: { total: conducteurCount[0]?.total || 0 }
    },
    recent: recentForms[0] || [],
    timestamp: new Date().toISOString()
  };
}


  private _buildAuditResponse(row: any, criteres: any[], documents: any[]) {
    const bySectionKey = (key: string) => criteres.filter(c => c.section_key === key);
    return {
      ...row,
      synthese: {
        nombreNonConformitesMajeures: row.synth_nb_nc_majeures,
        domainesCritiques:            row.synth_domaines_critiques,
        signatureAuditeur:            row.synth_signature_auditeur,
      },
      section1_cadreJuridique:    bySectionKey('s1'),
      section2_infraSecurite: {
        stabiliteStructure: bySectionKey('s2_stabilite'),
        securiteIncendie:   bySectionKey('s2_incendie'),
        accessibilitePMR:   bySectionKey('s2_pmr'),
      },
      section3_gestionEnvSociale: {
        gestionDechets:          bySectionKey('s3_dechets'),
        nuisancesPollution:      bySectionKey('s3_nuisances'),
        santeSecuteTravailleurs: bySectionKey('s3_sante'),
      },
      section4_gestionSociale: {
        relationsCommunautes: bySectionKey('s4_communautes'),
        mgp:                  bySectionKey('s4_mgp'),
      },
      section5_risquesERP: {
        securiteSurete:       bySectionKey('s5_securite'),
        hygieneEnvironnement: bySectionKey('s5_hygiene'),
      },
      section6_bilanDocumentaire: documents,
    };
  }

  private _buildConducteurResponse(row: any, questions: any[]) {
    const byKey = (k: string) => questions.filter(q => q.section_key === k);
    return {
      ...row,
      section1_infoGenerales:      byKey('s1'),
      section2_processusInitialT1: byKey('s2'),
      section3_installationT2:     byKey('s3'),
      section4_recrutementT2:      byKey('s4'),
      section5_hseT2:              byKey('s5'),
      section6_gestionEnvT2:       byKey('s6'),
      section7_sensibilisationT2:  byKey('s7'),
      section8_mgpT2:              byKey('s8'),
      section9_fermetureT2:        byKey('s9'),
      section10_exploitationT3:    byKey('s10'),
      section11_synthese:          byKey('s11'),
    };
  }

  private _parseJson(val: any): any {
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return val; }
    }
    return val;
  }

  private _formatStat(labels: Record<string, string>) {
    return (s: any) => ({
      status: s.status,
      label:  labels[s.status] ?? s.status,
      count:  Number(s.count),
      latest: s.latest,
    });
  }
}