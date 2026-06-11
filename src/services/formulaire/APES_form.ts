// ─────────────────────────────────────────────────────────────────────────────
//  apes-form.service.ts  —  Service complet des formulaires APES
// ─────────────────────────────────────────────────────────────────────────────

import { pool } from '../../config/databaseConnect';
import { newId } from '../../utils/id';
import { BaseRepository, parseJson, stringify, Paginated } from './Base_form';
import type { IAPESForm, IAPESFormWithDetails, ICreateAPESForm } from '../../interfaces/IAPES';
import type { IDocumentReview, ICreateDocumentReview } from '../../interfaces/IDocumentReview';
import type { IFieldInspection, ICreateFieldInspection } from '../../interfaces/IFieldInspection';
import type { IStakeholderInterview, ICreateStakeholderInterview } from '../../interfaces/IStakeholderInterview';
import type {
  IGenderAssessment,
  IGenderObjective,
  IGenderConsultation,
  IGenderImpact,
  IGenderRecommendation,
  ICreateGenderAssessment,
} from '../../interfaces/IGenderAssessment';
import type {
  IComplaintMechanism,
  IComplaintWeakness,
  IComplaintRecommendation,
  ICreateComplaintMechanism,
} from '../../interfaces/IComplaintMechanism';

export class APESFormService extends BaseRepository {
  async create(data: ICreateAPESForm): Promise<IAPESForm> {
    const formId = newId();
    const projectInfoId = newId();

    await pool.query('START TRANSACTION');

    try {
      if (data.project_info) {
        await pool.query(
          `INSERT INTO project_info (id, project_name, date, auditors, location, period)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            projectInfoId,
            data.project_info.project_name,
            data.project_info.date,
            data.project_info.auditors,
            data.project_info.location,
            data.project_info.period
          ]
        );
      }

      await pool.query(
        `INSERT INTO form_data (id, project_id, project_info_id, status)
         VALUES (?, ?, ?, ?)`,
        [formId, data.project_id, projectInfoId, data.status ?? 'draft']
      );

      let docReviewId = null;
      if (data.document_review) {
        docReviewId = newId();
        await pool.query(
          `INSERT INTO document_review 
           (id, form_id, documents_presents, documents_analysis, documents_manquants, autres_documents)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            docReviewId,
            formId,
            stringify(data.document_review.documents_presents || {}),
            stringify(data.document_review.documents_analysis || {}),
            data.document_review.documents_manquants || null,
            data.document_review.autres_documents || null
          ]
        );
      }

      let fieldId = null;
      if (data.field_inspection) {
        fieldId = newId();
        await pool.query(
          `INSERT INTO field_inspection 
           (id, form_id, project_name, date, auditors, accompaniers, zones,
            water_management, waste_management, emissions, health_safety, community)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            fieldId,
            formId,
            data.field_inspection.project_name,
            data.field_inspection.date,
            data.field_inspection.auditors,
            data.field_inspection.accompaniers || null,
            stringify(data.field_inspection.zones || []),
            stringify(data.field_inspection.water_management || {}),
            stringify(data.field_inspection.waste_management || {}),
            stringify(data.field_inspection.emissions || {}),
            stringify(data.field_inspection.health_safety || {}),
            stringify(data.field_inspection.community || {})
          ]
        );
      }

      let stakeholderId = null;
      if (data.stakeholder_interview) {
        stakeholderId = newId();
        await pool.query(
          `INSERT INTO stakeholder_interview 
           (id, form_id, date, location, duration, stakeholder_type,
            profile_name, profile_function, profile_gender, profile_age_range,
            consent_confidentiality, consent_notes, consent_recording,
            responses, eval_quality, eval_frankness, eval_relevance, eval_climate)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            stakeholderId,
            formId,
            data.stakeholder_interview.date,
            data.stakeholder_interview.location,
            data.stakeholder_interview.duration,
            data.stakeholder_interview.stakeholder_type,
            data.stakeholder_interview.profile_name,
            data.stakeholder_interview.profile_function,
            data.stakeholder_interview.profile_gender,
            data.stakeholder_interview.profile_age_range,
            data.stakeholder_interview.consent_confidentiality ? 1 : 0,
            data.stakeholder_interview.consent_notes ? 1 : 0,
            data.stakeholder_interview.consent_recording ? 1 : 0,
            stringify(data.stakeholder_interview.responses || {}),
            data.stakeholder_interview.eval_quality || 3,
            data.stakeholder_interview.eval_frankness || 3,
            data.stakeholder_interview.eval_relevance || 3,
            data.stakeholder_interview.eval_climate || 3
          ]
        );
      }

      let genderId = null;
      if (data.gender_assessment) {
        genderId = newId();
        await pool.query(
          `INSERT INTO gender_assessment (id, form_id, quantitative_data)
           VALUES (?, ?, ?)`,
          [
            genderId,
            formId,
            stringify(data.gender_assessment.quantitative_data || {})
          ]
        );
      }

      let complaintId = null;
      if (data.complaint_mechanism) {
        complaintId = newId();
        await pool.query(
          `INSERT INTO complaint_mechanism 
           (id, form_id, documentary_basis, key_criteria, global_conclusion)
           VALUES (?, ?, ?, ?, ?)`,
          [
            complaintId,
            formId,
            stringify(data.complaint_mechanism.documentary_basis || {}),
            stringify(data.complaint_mechanism.key_criteria || {}),
            data.complaint_mechanism.global_conclusion || 'non_evalue'
          ]
        );
      }

      await pool.query('COMMIT');
      return (await this._getFormRow(formId))!;
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }

  async getById(id: string): Promise<IAPESFormWithDetails | null> {
    const form = await this._getFormRow(id);
    if (!form) return null;

    const projectInfo = await pool.query<any[]>(
      'SELECT id, name, location FROM projects WHERE id = ?',
      [form.project_id]
    );
    const project = projectInfo[0][0] ?? null;

    const [documentReview, fieldInspection, stakeholderInterview, genderAssessment, complaintMechanism] =
      await Promise.all([
        form.document_review_id ? this._getDocumentReview(form.document_review_id) : null,
        form.field_inspection_id ? this._getFieldInspection(form.field_inspection_id) : null,
        form.stakeholder_interview_id ? this._getStakeholderInterview(form.stakeholder_interview_id) : null,
        form.gender_assessment_id ? this._getGenderAssessment(form.gender_assessment_id) : null,
        form.complaint_mechanism_id ? this._getComplaintMechanism(form.complaint_mechanism_id) : null,
      ]);

    return {
      ...form,
      document_review: documentReview,
      field_inspection: fieldInspection,
      stakeholder_interview: stakeholderInterview,
      gender_assessment: genderAssessment,
      complaint_mechanism: complaintMechanism,
      project: project
        ? { id: project.id, name: project.name, location: project.location ?? null }
        : { id: form.project_id, name: '', location: null },
    };
  }

  async getAll(
    projectId?: string,
    status?: string,
    page = 1,
    limit = 10
  ): Promise<Paginated<IAPESForm>> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (projectId) {
      conditions.push('project_id = ?');
      params.push(projectId);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    const where = conditions.length ? conditions.join(' AND ') : '1=1';
    const offset = (page - 1) * limit;

    const [rows] = await pool.query<any[]>(
      `SELECT * FROM form_data WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const total = await this.countRows('form_data', where, params);

    return {
      items: rows.map(r => this._mapForm(r)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async submit(id: string): Promise<IAPESForm> {
    const form = await this._getFormRow(id);
    if (!form) throw new Error('Formulaire introuvable');
    if (form.status !== 'draft') throw new Error('Formulaire déjà soumis');

    await pool.query(
      `UPDATE form_data SET status = 'submitted', submitted_at = NOW(), updated_at = NOW() WHERE id = ?`,
      [id]
    );

    return (await this._getFormRow(id))!;
  }

  async getDocumentReview(formId: string): Promise<IDocumentReview | null> {
    const form = await this._getFormRow(formId);
    if (!form || !form.document_review_id) return null;
    return this._getDocumentReview(form.document_review_id);
  }

  async saveDocumentReview(formId: string, data: ICreateDocumentReview): Promise<IDocumentReview> {
    const form = await this._getFormRow(formId);
    if (!form) throw new Error('Formulaire introuvable');
    if (form.status !== 'draft') throw new Error('Impossible de modifier un formulaire soumis');

    const reviewId = form.document_review_id || newId();
    const isNew = !form.document_review_id;

    await pool.query(
      `
      INSERT INTO document_review
        (id, form_id, documents_presents, documents_analysis, documents_manquants, autres_documents)
      VALUES (?,?,?,?,?,?)
      ON DUPLICATE KEY UPDATE
        documents_presents = VALUES(documents_presents),
        documents_analysis = VALUES(documents_analysis),
        documents_manquants = VALUES(documents_manquants),
        autres_documents = VALUES(autres_documents),
        updated_at = NOW()
      `,
      [
        reviewId,
        formId,
        stringify(data.documents_presents ?? {}),
        stringify(data.documents_analysis ?? {}),
        data.documents_manquants ?? null,
        data.autres_documents ?? null,
      ]
    );

    if (isNew) {
      await pool.query(`UPDATE form_data SET document_review_id = ? WHERE id = ?`, [reviewId, formId]);
    }

    return (await this._getDocumentReview(reviewId))!;
  }

  async getFieldInspection(formId: string): Promise<IFieldInspection | null> {
    const form = await this._getFormRow(formId);
    if (!form || !form.field_inspection_id) return null;
    return this._getFieldInspection(form.field_inspection_id);
  }

  async saveFieldInspection(formId: string, data: ICreateFieldInspection): Promise<IFieldInspection> {
    const form = await this._getFormRow(formId);
    if (!form) throw new Error('Formulaire introuvable');
    if (form.status !== 'draft') throw new Error('Impossible de modifier un formulaire soumis');

    const inspectionId = form.field_inspection_id || newId();
    const isNew = !form.field_inspection_id;

    await pool.query(
      `
      INSERT INTO field_inspection
        (id, form_id, project_name, date, auditors, accompaniers,
         zones, water_management, waste_management, emissions, health_safety, community)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
      ON DUPLICATE KEY UPDATE
        project_name = VALUES(project_name),
        date = VALUES(date),
        auditors = VALUES(auditors),
        accompaniers = VALUES(accompaniers),
        zones = VALUES(zones),
        water_management = VALUES(water_management),
        waste_management = VALUES(waste_management),
        emissions = VALUES(emissions),
        health_safety = VALUES(health_safety),
        community = VALUES(community),
        updated_at = NOW()
      `,
      [
        inspectionId,
        formId,
        data.project_name,
        data.date,
        data.auditors,
        data.accompaniers ?? null,
        stringify(data.zones ?? []),
        stringify(data.water_management ?? {}),
        stringify(data.waste_management ?? {}),
        stringify(data.emissions ?? {}),
        stringify(data.health_safety ?? {}),
        stringify(data.community ?? {}),
      ]
    );

    if (isNew) {
      await pool.query(`UPDATE form_data SET field_inspection_id = ? WHERE id = ?`, [inspectionId, formId]);
    }

    return (await this._getFieldInspection(inspectionId))!;
  }

  async getStakeholderInterview(formId: string): Promise<IStakeholderInterview | null> {
    const form = await this._getFormRow(formId);
    if (!form || !form.stakeholder_interview_id) return null;
    return this._getStakeholderInterview(form.stakeholder_interview_id);
  }

  async saveStakeholderInterview(formId: string, data: ICreateStakeholderInterview): Promise<IStakeholderInterview> {
    const form = await this._getFormRow(formId);
    if (!form) throw new Error('Formulaire introuvable');
    if (form.status !== 'draft') throw new Error('Impossible de modifier un formulaire soumis');

    const interviewId = form.stakeholder_interview_id || newId();
    const isNew = !form.stakeholder_interview_id;

    await pool.query(
      `
      INSERT INTO stakeholder_interview
        (id, form_id, date, location, duration, stakeholder_type,
         profile_name, profile_function, profile_gender, profile_age_range,
         consent_confidentiality, consent_notes, consent_recording,
         responses, eval_quality, eval_frankness, eval_relevance, eval_climate)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON DUPLICATE KEY UPDATE
        date = VALUES(date),
        location = VALUES(location),
        duration = VALUES(duration),
        stakeholder_type = VALUES(stakeholder_type),
        profile_name = VALUES(profile_name),
        profile_function = VALUES(profile_function),
        profile_gender = VALUES(profile_gender),
        profile_age_range = VALUES(profile_age_range),
        consent_confidentiality = VALUES(consent_confidentiality),
        consent_notes = VALUES(consent_notes),
        consent_recording = VALUES(consent_recording),
        responses = VALUES(responses),
        eval_quality = VALUES(eval_quality),
        eval_frankness = VALUES(eval_frankness),
        eval_relevance = VALUES(eval_relevance),
        eval_climate = VALUES(eval_climate),
        updated_at = NOW()
      `,
      [
        interviewId,
        formId,
        data.date,
        data.location,
        data.duration,
        data.stakeholder_type,
        data.profile_name,
        data.profile_function,
        data.profile_gender,
        data.profile_age_range,
        data.consent_confidentiality ? 1 : 0,
        data.consent_notes ? 1 : 0,
        data.consent_recording ? 1 : 0,
        stringify(data.responses ?? {}),
        data.eval_quality,
        data.eval_frankness,
        data.eval_relevance,
        data.eval_climate,
      ]
    );

    if (isNew) {
      await pool.query(`UPDATE form_data SET stakeholder_interview_id = ? WHERE id = ?`, [interviewId, formId]);
    }

    return (await this._getStakeholderInterview(interviewId))!;
  }

  async getGenderAssessment(formId: string): Promise<IGenderAssessment | null> {
    const form = await this._getFormRow(formId);
    if (!form || !form.gender_assessment_id) return null;
    return this._getGenderAssessment(form.gender_assessment_id);
  }

  async saveGenderAssessment(
    formId: string,
    data: ICreateGenderAssessment & {
      objectives?: Omit<IGenderObjective, 'id' | 'gender_assessment_id'>[];
      consultations?: Omit<IGenderConsultation, 'id' | 'gender_assessment_id'>[];
      impacts?: Omit<IGenderImpact, 'id' | 'gender_assessment_id'>[];
      recommendations?: Omit<IGenderRecommendation, 'id' | 'gender_assessment_id'>[];
    }
  ): Promise<IGenderAssessment> {
    const form = await this._getFormRow(formId);
    if (!form) throw new Error('Formulaire introuvable');
    if (form.status !== 'draft') throw new Error('Impossible de modifier un formulaire soumis');

    const assessmentId = form.gender_assessment_id || newId();
    const isNew = !form.gender_assessment_id;

    await pool.query(
      `
      INSERT INTO gender_assessment (id, form_id, quantitative_data)
      VALUES (?,?,?)
      ON DUPLICATE KEY UPDATE
        quantitative_data = VALUES(quantitative_data),
        updated_at = NOW()
      `,
      [assessmentId, formId, stringify(data.quantitative_data ?? {})]
    );

    if (data.objectives) {
      await pool.query('DELETE FROM gender_objectives WHERE gender_assessment_id = ?', [assessmentId]);
      for (const [i, obj] of data.objectives.entries()) {
        await pool.query(
          `INSERT INTO gender_objectives (id, gender_assessment_id, objective, indicator, status, sort_order)
           VALUES (?,?,?,?,?,?)`,
          [newId(), assessmentId, obj.objective, obj.indicator, obj.status, i]
        );
      }
    }

    if (data.consultations) {
      await pool.query('DELETE FROM gender_consultations WHERE gender_assessment_id = ?', [assessmentId]);
      for (const [i, cons] of data.consultations.entries()) {
        await pool.query(
          `INSERT INTO gender_consultations (id, gender_assessment_id, \`group\`, sessions, participants, method, sort_order)
           VALUES (?,?,?,?,?,?,?)`,
          [newId(), assessmentId, cons.group, cons.sessions, cons.participants, cons.method, i]
        );
      }
    }

    if (data.impacts) {
      await pool.query('DELETE FROM gender_impacts WHERE gender_assessment_id = ?', [assessmentId]);
      for (const [i, imp] of data.impacts.entries()) {
        await pool.query(
          `INSERT INTO gender_impacts (id, gender_assessment_id, impact_type, impact, women, men, vulnerable, severity, opportunity, sort_order)
           VALUES (?,?,?,?,?,?,?,?,?,?)`,
          [newId(), assessmentId, imp.impact_type, imp.impact, imp.women, imp.men, imp.vulnerable, imp.severity ?? null, imp.opportunity ?? null, i]
        );
      }
    }

    if (data.recommendations) {
      await pool.query('DELETE FROM gender_recommendations WHERE gender_assessment_id = ?', [assessmentId]);
      for (const [i, rec] of data.recommendations.entries()) {
        await pool.query(
          `INSERT INTO gender_recommendations (id, gender_assessment_id, recommendation, priority, scope, responsible, deadline, sort_order)
           VALUES (?,?,?,?,?,?,?,?)`,
          [newId(), assessmentId, rec.recommendation, rec.priority, rec.scope, rec.responsible, rec.deadline, i]
        );
      }
    }

    if (isNew) {
      await pool.query(`UPDATE form_data SET gender_assessment_id = ? WHERE id = ?`, [assessmentId, formId]);
    }

    return (await this._getGenderAssessment(assessmentId))!;
  }

  async getComplaintMechanism(formId: string): Promise<IComplaintMechanism | null> {
    const form = await this._getFormRow(formId);
    if (!form || !form.complaint_mechanism_id) return null;
    return this._getComplaintMechanism(form.complaint_mechanism_id);
  }

  async saveComplaintMechanism(
    formId: string,
    data: ICreateComplaintMechanism & {
      strengths?: string[];
      weaknesses?: Omit<IComplaintWeakness, 'id' | 'complaint_mechanism_id'>[];
      recommendations?: Omit<IComplaintRecommendation, 'id' | 'complaint_mechanism_id'>[];
    }
  ): Promise<IComplaintMechanism> {
    const form = await this._getFormRow(formId);
    if (!form) throw new Error('Formulaire introuvable');
    if (form.status !== 'draft') throw new Error('Impossible de modifier un formulaire soumis');

    const mechanismId = form.complaint_mechanism_id || newId();
    const isNew = !form.complaint_mechanism_id;

    await pool.query(
      `
      INSERT INTO complaint_mechanism
        (id, form_id, documentary_basis, key_criteria, global_conclusion)
      VALUES (?,?,?,?,?)
      ON DUPLICATE KEY UPDATE
        documentary_basis = VALUES(documentary_basis),
        key_criteria = VALUES(key_criteria),
        global_conclusion = VALUES(global_conclusion),
        updated_at = NOW()
      `,
      [mechanismId, formId, stringify(data.documentary_basis ?? {}), stringify(data.key_criteria ?? {}), data.global_conclusion]
    );

    if (data.strengths) {
      await pool.query('DELETE FROM complaint_strengths WHERE complaint_mechanism_id = ?', [mechanismId]);
      for (const [i, s] of data.strengths.entries()) {
        await pool.query(
          `INSERT INTO complaint_strengths (id, complaint_mechanism_id, strength, sort_order) VALUES (?,?,?,?)`,
          [newId(), mechanismId, s, i]
        );
      }
    }

    if (data.weaknesses) {
      await pool.query('DELETE FROM complaint_weaknesses WHERE complaint_mechanism_id = ?', [mechanismId]);
      for (const [i, w] of data.weaknesses.entries()) {
        await pool.query(
          `INSERT INTO complaint_weaknesses (id, complaint_mechanism_id, deficiency, consequence, severity, sort_order) VALUES (?,?,?,?,?,?)`,
          [newId(), mechanismId, w.deficiency, w.consequence, w.severity, i]
        );
      }
    }

    if (data.recommendations) {
      await pool.query('DELETE FROM complaint_recommendations WHERE complaint_mechanism_id = ?', [mechanismId]);
      for (const [i, r] of data.recommendations.entries()) {
        await pool.query(
          `INSERT INTO complaint_recommendations (id, complaint_mechanism_id, recommendation, priority, responsible, deadline, sort_order) VALUES (?,?,?,?,?,?,?)`,
          [newId(), mechanismId, r.recommendation, r.priority, r.responsible, r.deadline, i]
        );
      }
    }

    if (isNew) {
      await pool.query(`UPDATE form_data SET complaint_mechanism_id = ? WHERE id = ?`, [mechanismId, formId]);
    }

    return (await this._getComplaintMechanism(mechanismId))!;
  }

private async _getFormRow(id: string): Promise<any | null> {
  const [rows] = await pool.query<any[]>(
    `
    SELECT 
      fd.*,
      pi.project_name,
      pi.date,
      pi.auditors,
      pi.location,
      pi.period
    FROM form_data fd
    LEFT JOIN project_info pi ON fd.project_info_id = pi.id
    WHERE fd.id = ?
    `,
    [id]
  );
  return rows[0] || null;
}

private _mapForm(r: any): IAPESForm {
  return {
    id: r.id,
    project_id: r.project_id,
    project_name: r.project_name ?? null,     // ← Ajouté
    date: r.date ? new Date(r.date) : null,   // ← Ajouté
    auditors: r.auditors ?? null,             // ← Ajouté
    location: r.location ?? null,             // ← Ajouté
    period: r.period ?? null,                 // ← Ajouté
    document_review_id: r.document_review_id ?? null,
    field_inspection_id: r.field_inspection_id ?? null,
    stakeholder_interview_id: r.stakeholder_interview_id ?? null,
    gender_assessment_id: r.gender_assessment_id ?? null,
    complaint_mechanism_id: r.complaint_mechanism_id ?? null,
    status: r.status,
    created_at: new Date(r.created_at),
    updated_at: new Date(r.updated_at),
    submitted_at: r.submitted_at ? new Date(r.submitted_at) : undefined,
  };
}

  private async _getDocumentReview(id: string): Promise<IDocumentReview | null> {
    const [rows] = await pool.query<any[]>('SELECT * FROM document_review WHERE id = ?', [id]);
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      project_id: r.project_id,
      documents_presents: parseJson(r.documents_presents) ?? {},
      documents_analysis: parseJson(r.documents_analysis) ?? {},
      documents_manquants: r.documents_manquants ?? null,
      autres_documents: r.autres_documents ?? null,
      created_at: new Date(r.created_at),
      updated_at: new Date(r.updated_at),
    };
  }

  private async _getFieldInspection(id: string): Promise<IFieldInspection | null> {
    const [rows] = await pool.query<any[]>('SELECT * FROM field_inspection WHERE id = ?', [id]);
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      project_id: r.project_id,
      project_name: r.project_name,
      date: new Date(r.date),
      auditors: r.auditors,
      accompaniers: r.accompaniers ?? null,
      zones: parseJson(r.zones),
      water_management: parseJson(r.water_management) ?? {},
      waste_management: parseJson(r.waste_management) ?? {},
      emissions: parseJson(r.emissions) ?? {},
      health_safety: parseJson(r.health_safety) ?? {},
      community: parseJson(r.community) ?? {},
      created_at: new Date(r.created_at),
      updated_at: new Date(r.updated_at),
    };
  }

  private async _getStakeholderInterview(id: string): Promise<IStakeholderInterview | null> {
    const [rows] = await pool.query<any[]>('SELECT * FROM stakeholder_interview WHERE id = ?', [id]);
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      project_id: r.project_id,
      date: new Date(r.date),
      location: r.location,
      duration: r.duration,
      stakeholder_type: r.stakeholder_type,
      profile_name: r.profile_name,
      profile_function: r.profile_function,
      profile_gender: r.profile_gender,
      profile_age_range: r.profile_age_range,
      consent_confidentiality: r.consent_confidentiality === 1,
      consent_notes: r.consent_notes === 1,
      consent_recording: r.consent_recording === 1,
      responses: parseJson(r.responses) ?? {},
      eval_quality: r.eval_quality,
      eval_frankness: r.eval_frankness,
      eval_relevance: r.eval_relevance,
      eval_climate: r.eval_climate,
      created_at: new Date(r.created_at),
      updated_at: new Date(r.updated_at),
    };
  }

  private async _getGenderAssessment(id: string): Promise<IGenderAssessment | null> {
    const [rows] = await pool.query<any[]>('SELECT * FROM gender_assessment WHERE id = ?', [id]);
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      project_id: r.project_id,
      quantitative_data: parseJson(r.quantitative_data) ?? {},
      created_at: new Date(r.created_at),
      updated_at: new Date(r.updated_at),
    };
  }

  private async _getComplaintMechanism(id: string): Promise<IComplaintMechanism | null> {
    const [rows] = await pool.query<any[]>('SELECT * FROM complaint_mechanism WHERE id = ?', [id]);
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      project_id: r.project_id,
      documentary_basis: parseJson(r.documentary_basis) ?? {},
      key_criteria: parseJson(r.key_criteria) ?? {},
      global_conclusion: r.global_conclusion,
      created_at: new Date(r.created_at),
      updated_at: new Date(r.updated_at),
    };
  }
}