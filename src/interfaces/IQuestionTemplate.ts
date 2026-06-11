// src/interfaces/IQuestionTemplate.ts

export type FormType = 
  | 'apes'
  | 'guide_entretien'
  | 'checklist_audit'
  | 'checklist_conducteur'
  | 'document_review'
  | 'field_inspection'
  | 'stakeholder_interview'
  | 'gender_assessment'
  | 'complaint_mechanism';

export type AnswerType = 
  | 'text'
  | 'boolean'
  | 'conformite'
  | 'reponse_booleenne'
  | 'rating_5'
  | 'score'
  | 'select'
  | 'nuisances';

// Pour compatibilité avec l'ancien code, garder QuestionType comme alias
export type QuestionType = AnswerType;

// =============================================================================
// NOUVEAU : Question templates (catalogue global)
// Anciennement IDefaultFormQuestion
// =============================================================================
export interface IQuestionTemplate {
  id: string;
  form_type: FormType;
  section_key: string;
  question_id: string;
  question: string;                    // Renommé : 'question' au lieu de 'question_text'
  hint: string | null;
  answer_type: AnswerType;             // Renommé : 'answer_type' au lieu de 'question_type'
  options_json: any | null;
  scoring_weight: number;
  is_required: boolean;
  sort_order: number;
  active: boolean;
  created_at: Date;
}

// =============================================================================
// NOUVEAU : Project questions (questions personnalisées par projet)
// Anciennement IProjectFormTemplate
// =============================================================================
export interface IProjectQuestion {
  id: string;
  project_id: string;
  template_id: string | null;          // NULL si question personnalisée
  form_type: FormType;
  section_key: string;
  question_id: string;
  question: string;                    // Renommé : 'question' au lieu de 'question_text'
  hint: string | null;
  answer_type: AnswerType;             // Renommé : 'answer_type' au lieu de 'question_type'
  options_json: any | null;
  scoring_weight: number;
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
  modified_by_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

// =============================================================================
// Interface pour les scores (inchangée car form_scores a les generated columns)
// =============================================================================
export interface IFormScore {
  id: string;
  project_id: string;
  form_type: FormType;
  form_instance_id: string;
  raw_score: number;
  max_score: number;
  note_sur_20: number;                 // V2 : generated column
  appreciation: string;                // V2 : generated column
  computed_at: Date;
}

// =============================================================================
// ALIAS pour compatibilité ascendante (si nécessaire)
// =============================================================================
/** @deprecated Utiliser IQuestionTemplate à la place */
export interface IDefaultFormQuestion extends IQuestionTemplate {
  question_text: string;
  question_type: QuestionType;
}
/** @deprecated Utiliser IProjectQuestion à la place */
export interface IProjectFormTemplate extends IProjectQuestion {
  question_text: string;
  question_type: QuestionType;
}

// =============================================================================
// HELPERS pour la migration des données (à supprimer plus tard)
// =============================================================================
/**
 * Convertit un ancien IDefaultFormQuestion en IQuestionTemplate
 */
export function toQuestionTemplate(old: IDefaultFormQuestion): IQuestionTemplate {
  return {
    id: old.id,
    form_type: old.form_type,
    section_key: old.section_key,
    question_id: old.question_id,
    question: old.question_text,
    hint: old.hint,
    answer_type: old.question_type as AnswerType,
    options_json: old.options_json,
    scoring_weight: old.scoring_weight,
    is_required: old.is_required,
    sort_order: old.sort_order,
    active: old.active,
    created_at: old.created_at,
  };
}

/**
 * Convertit un ancien IProjectFormTemplate en IProjectQuestion
 */
export function toProjectQuestion(old: IProjectFormTemplate): IProjectQuestion {
  return {
    id: old.id,
    project_id: old.project_id,
    template_id: null,
    form_type: old.form_type,
    section_key: old.section_key,
    question_id: old.question_id,
    question: old.question_text,
    hint: old.hint,
    answer_type: old.question_type as AnswerType,
    options_json: old.options_json,
    scoring_weight: old.scoring_weight,
    is_required: old.is_required,
    is_active: old.is_active,
    sort_order: old.sort_order,
    modified_by_admin: old.modified_by_admin,
    created_at: old.created_at,
    updated_at: old.updated_at,
  };
}