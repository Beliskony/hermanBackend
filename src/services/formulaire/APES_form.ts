// apes-form.service.ts - Version avec procédures stockées et interfaces correctes

import { pool } from '../../config/databaseConnect';
import { newId } from '../../utils/id';
import { BaseRepository, Paginated } from './Base_form';
import type { IAPESForm, IAPESFormWithDetails, ICreateAPESForm } from '../../interfaces/IAPES';
import type { IDocumentReview, ICreateDocumentReview } from '../../interfaces/IDocumentReview';
import type { IFieldInspection, ICreateFieldInspection } from '../../interfaces/IFieldInspection';
import type { IStakeholderInterview, ICreateStakeholderInterview } from '../../interfaces/IStakeholderInterview';
import type {
  IGenderAssessment,
  ICreateGenderAssessment,
} from '../../interfaces/IGenderAssessment';
import type {
  IComplaintMechanism,
  ICreateComplaintMechanism,
} from '../../interfaces/IComplaintMechanism';

export class APESFormService extends BaseRepository {
  
  // =========================================================================
  //  CRUD PRINCIPAL AVEC PROCÉDURES
  // =========================================================================

  async create(data: ICreateAPESForm): Promise<IAPESFormWithDetails> {
    const formId = newId();
    
    const documentReviewJson = data.document_review ? JSON.stringify({
      documents_presents: data.document_review.documents_presents,
      documents_analysis: data.document_review.documents_analysis,
      documents_manquants: data.document_review.documents_manquants,
      autres_documents: data.document_review.autres_documents
    }) : null;
    
    const fieldInspectionJson = data.field_inspection ? JSON.stringify({
      project_name: data.field_inspection.project_name,
      date: data.field_inspection.date,
      auditors: data.field_inspection.auditors,
      accompaniers: data.field_inspection.accompaniers,
      zones: data.field_inspection.zones,
      water_management: data.field_inspection.water_management,
      waste_management: data.field_inspection.waste_management,
      emissions: data.field_inspection.emissions,
      health_safety: data.field_inspection.health_safety,
      community: data.field_inspection.community
    }) : null;
    
    const stakeholderJson = data.stakeholder_interview ? JSON.stringify({
      date: data.stakeholder_interview.date,
      location: data.stakeholder_interview.location,
      duration: data.stakeholder_interview.duration,
      stakeholder_type: data.stakeholder_interview.stakeholder_type,
      profile_name: data.stakeholder_interview.profile_name,
      profile_function: data.stakeholder_interview.profile_function,
      profile_gender: data.stakeholder_interview.profile_gender,
      profile_age_range: data.stakeholder_interview.profile_age_range,
      consent_confidentiality: data.stakeholder_interview.consent_confidentiality,
      consent_notes: data.stakeholder_interview.consent_notes,
      consent_recording: data.stakeholder_interview.consent_recording,
      responses: data.stakeholder_interview.responses,
      eval_quality: data.stakeholder_interview.eval_quality,
      eval_frankness: data.stakeholder_interview.eval_frankness,
      eval_relevance: data.stakeholder_interview.eval_relevance,
      eval_climate: data.stakeholder_interview.eval_climate
    }) : null;
    
    const genderJson = data.gender_assessment ? JSON.stringify({
      quantitative_data: data.gender_assessment.quantitative_data
    }) : null;
    
    const complaintJson = data.complaint_mechanism ? JSON.stringify({
      documentary_basis: data.complaint_mechanism.documentary_basis,
      key_criteria: data.complaint_mechanism.key_criteria,
      global_conclusion: data.complaint_mechanism.global_conclusion
    }) : null;
    
    const [results] = await pool.query<any[]>(
      'CALL sp_create_apes(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        formId,
        data.project_id,
        data.project_info?.project_name,
        data.project_info?.date,
        data.project_info?.auditors,
        data.project_info?.location,
        data.project_info?.period,
        documentReviewJson,
        fieldInspectionJson,
        stakeholderJson,
        genderJson,
        complaintJson
      ]
    );
    
    const result = this._formatProcedureResult(results);
    if (!result) {
      throw new Error(`Erreur lors de la création du formulaire APES ${formId}`);
    }
    return result;
  }

  async getById(id: string): Promise<IAPESFormWithDetails | null> {
    const [results] = await pool.query<any[]>(
      'CALL sp_get_apes_complet(?)',
      [id]
    );
    
    if (!results || !results[0] || results[0].length === 0) {
      return null;
    }
    
    return this._formatProcedureResult(results);
  }

  async submit(id: string): Promise<IAPESFormWithDetails> {
    const [results] = await pool.query<any[]>(
      'CALL sp_submit_apes(?)',
      [id]
    );
    
    const result = this._formatProcedureResult(results);
    if (!result) {
      throw new Error(`Erreur lors de la soumission du formulaire ${id}`);
    }
    return result;
  }

  async getAll(
    projectId?: string,
    status?: string,
    page = 1,
    limit = 10
  ): Promise<Paginated<IAPESForm>> {
    const offset = (page - 1) * limit;
    
    const [results] = await pool.query<any[]>(
      'CALL sp_list_apes(?, ?, ?, ?)',
      [projectId ?? null, status ?? null, limit, offset]
    );
    
    const items = results[0] || [];
    const total = results[1]?.[0]?.total || 0;
    
    return {
      items: items.map((r: any) => this._mapForm(r)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.getById(id);
    if (!existing) return false;
    if (existing.status === 'submitted') throw new Error('Impossible de supprimer un formulaire soumis');
    
    await this._deleteCompleteForm(id);
    return true;
  }

  // =========================================================================
  //  MÉTHODES SPÉCIFIQUES POUR CHAQUE SECTION (lecture seule)
  // =========================================================================

  async getDocumentReview(formId: string): Promise<IDocumentReview | null> {
    const form = await this.getById(formId);
    return form?.document_review ?? null;
  }

  async getFieldInspection(formId: string): Promise<IFieldInspection | null> {
    const form = await this.getById(formId);
    return form?.field_inspection ?? null;
  }

  async getStakeholderInterview(formId: string): Promise<IStakeholderInterview | null> {
    const form = await this.getById(formId);
    return form?.stakeholder_interview ?? null;
  }

  async getGenderAssessment(formId: string): Promise<IGenderAssessment | null> {
    const form = await this.getById(formId);
    return form?.gender_assessment ?? null;
  }

  async getComplaintMechanism(formId: string): Promise<IComplaintMechanism | null> {
    const form = await this.getById(formId);
    return form?.complaint_mechanism ?? null;
  }

  // =========================================================================
  //  MÉTHODES PRIVÉES
  // =========================================================================

  private _formatProcedureResult(results: any[]): IAPESFormWithDetails | null {
    if (!results || !results[0] || results[0].length === 0) {
      return null;
    }
    
    const header = results[0][0];
    const questions = results[1] || [];
    
    // Extraire les réponses par section
    const documentReviewAnswers = this._extractAnswersBySection(questions, [
      'CR1', 'CR2', 'CR3', 'CR4', 'CR5',
      'PL1', 'PL2', 'PL3', 'PL4', 'PL5'
    ]);
    
    const fieldInspectionAnswers = this._extractAnswersBySection(questions, [
      'ET1', 'ET2', 'ET3', 'ET4', 'ET5', 'ET6', 'ET7', 'ET8',
      'IE1', 'IE2', 'IE3', 'IE4', 'IE5', 'IE6',
      'GR1', 'GR2', 'GR3'
    ]);
    
    const stakeholderAnswers = this._extractAnswersBySection(questions, [
      'EX1', 'EX2', 'EX3', 'EX4',
      'IS1', 'IS2', 'IS3', 'IS4', 'IS5', 'IS6',
      'PP1', 'PP2', 'PP3', 'PP4'
    ]);
    
    const genderAnswers = this._extractAnswersBySection(questions, ['FO1', 'FO2', 'FO3']);
    
    const complaintAnswers = this._extractAnswersBySection(questions, ['AC1', 'AC2', 'AC3', 'TR1', 'TR2', 'TR3']);
    
    const project = {
      id: header.project_id,
      name: header.project_name ?? '',
      location: header.location ?? null,
    };
    
    // Construire l'objet questions pour l'export Word
    const formattedQuestions = questions.map((q: any) => ({
      section_key: q.section_key,
      question_id: q.question_id,
      question_text: q.question_text,
      question_type: q.question_type,
      sort_order: q.sort_order,
      answer: q.answer,
      observations: q.observations,
    }));
    
    return {
      id: header.form_id,
      project_id: header.project_id,
      project_name: header.project_name ?? null,
      date: header.project_date ? new Date(header.project_date) : null,
      auditors: header.auditors ?? null,
      location: header.location ?? null,
      period: header.period ?? null,
      document_review_id: null,
      field_inspection_id: null,
      stakeholder_interview_id: null,
      gender_assessment_id: null,
      complaint_mechanism_id: null,
      status: header.status,
      created_at: new Date(header.created_at),
      updated_at: new Date(header.updated_at),
      submitted_at: header.submitted_at ? new Date(header.submitted_at) : undefined,
      document_review: {
        id: '',
        project_id: header.project_id,
        documents_presents: documentReviewAnswers,
        documents_analysis: {},
        documents_manquants: null,
        autres_documents: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      field_inspection: {
        id: '',
        project_id: header.project_id,
        project_name: header.project_name ?? '',
        date: header.project_date ? new Date(header.project_date) : new Date(),
        auditors: header.auditors ?? '',
        accompaniers: null,
        zones: [],
        water_management: fieldInspectionAnswers,
        waste_management: {},
        emissions: {},
        health_safety: {},
        community: {},
        created_at: new Date(),
        updated_at: new Date(),
      },
      stakeholder_interview: {
        id: '',
        project_id: header.project_id,
        date: header.project_date ? new Date(header.project_date) : new Date(),
        location: header.location ?? '',
        duration: '',
        stakeholder_type: '',
        profile_name: '',
        profile_function: '',
        profile_gender: '',
        profile_age_range: '',
        consent_confidentiality: false,
        consent_notes: false,
        consent_recording: false,
        responses: stakeholderAnswers,
        eval_quality: 3,
        eval_frankness: 3,
        eval_relevance: 3,
        eval_climate: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      gender_assessment: {
        id: '',
        project_id: header.project_id,
        quantitative_data: genderAnswers,
        created_at: new Date(),
        updated_at: new Date(),
      },
      complaint_mechanism: {
        id: '',
        project_id: header.project_id,
        documentary_basis: complaintAnswers,
        key_criteria: {},
        global_conclusion: 'non_evalue',
        created_at: new Date(),
        updated_at: new Date(),
      },
      project: project,
      // 🔑 AJOUT IMPORTANT: propriété questions pour l'export Word
      questions: formattedQuestions,
    };
  }

  private _extractAnswersBySection(questions: any[], questionIds: string[]): Record<string, any> {
    const result: Record<string, any> = {};
    for (const q of questions) {
      if (questionIds.includes(q.question_id)) {
        let answer = q.answer;
        if (typeof answer === 'string' && answer.startsWith('"') && answer.endsWith('"')) {
          answer = answer.slice(1, -1);
        }
        result[q.question_id] = answer;
      }
    }
    return result;
  }

  private async _deleteCompleteForm(formId: string): Promise<void> {
    const [docReviewRows] = await pool.query<any[]>(
      'SELECT document_review_id, field_inspection_id, stakeholder_interview_id, gender_assessment_id, complaint_mechanism_id, project_info_id FROM form_data WHERE id = ?',
      [formId]
    );
    
    if (docReviewRows[0]) {
      const ids = docReviewRows[0];
      
      if (ids.document_review_id) {
        await pool.query('DELETE FROM document_review WHERE id = ?', [ids.document_review_id]);
      }
      if (ids.field_inspection_id) {
        await pool.query('DELETE FROM field_inspection WHERE id = ?', [ids.field_inspection_id]);
      }
      if (ids.stakeholder_interview_id) {
        await pool.query('DELETE FROM stakeholder_interview WHERE id = ?', [ids.stakeholder_interview_id]);
      }
      if (ids.gender_assessment_id) {
        await pool.query('DELETE FROM gender_objectives WHERE gender_assessment_id = ?', [ids.gender_assessment_id]);
        await pool.query('DELETE FROM gender_consultations WHERE gender_assessment_id = ?', [ids.gender_assessment_id]);
        await pool.query('DELETE FROM gender_impacts WHERE gender_assessment_id = ?', [ids.gender_assessment_id]);
        await pool.query('DELETE FROM gender_recommendations WHERE gender_assessment_id = ?', [ids.gender_assessment_id]);
        await pool.query('DELETE FROM gender_assessment WHERE id = ?', [ids.gender_assessment_id]);
      }
      if (ids.complaint_mechanism_id) {
        await pool.query('DELETE FROM complaint_strengths WHERE complaint_mechanism_id = ?', [ids.complaint_mechanism_id]);
        await pool.query('DELETE FROM complaint_weaknesses WHERE complaint_mechanism_id = ?', [ids.complaint_mechanism_id]);
        await pool.query('DELETE FROM complaint_recommendations WHERE complaint_mechanism_id = ?', [ids.complaint_mechanism_id]);
        await pool.query('DELETE FROM complaint_mechanism WHERE id = ?', [ids.complaint_mechanism_id]);
      }
      if (ids.project_info_id) {
        await pool.query('DELETE FROM project_info WHERE id = ?', [ids.project_info_id]);
      }
      await pool.query('DELETE FROM form_data WHERE id = ?', [formId]);
    }
  }

  private _mapForm(r: any): IAPESForm {
    return {
      id: r.form_id,
      project_id: r.project_id,
      project_name: r.project_name ?? null,
      date: r.project_date ? new Date(r.project_date) : null,
      auditors: r.auditors ?? null,
      location: r.location ?? null,
      period: r.period ?? null,
      document_review_id: null,
      field_inspection_id: null,
      stakeholder_interview_id: null,
      gender_assessment_id: null,
      complaint_mechanism_id: null,
      status: r.status,
      created_at: new Date(r.created_at),
      updated_at: new Date(r.updated_at),
      submitted_at: r.submitted_at ? new Date(r.submitted_at) : undefined,
    };
  }
}