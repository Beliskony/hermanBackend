// ─────────────────────────────────────────────────────────────────────────────
//  question.service.ts  —  Service des questions (lecture seule)
// ─────────────────────────────────────────────────────────────────────────────

import { pool } from '../config/databaseConnect';
import { BaseRepository, parseJson } from '../services/formulaire/Base_form';
import type { IProjectQuestion, FormType, AnswerType } from '../interfaces/IQuestionTemplate';

export class QuestionService extends BaseRepository {
async getFormQuestions(
  projectId: string,
  formType: FormType,
  sectionKey?: string
): Promise<Record<string, IProjectQuestion[]>> {
  const params: unknown[] = [projectId, formType];
  let where = 'project_id = ? AND form_type = ? AND is_active = 1';
  if (sectionKey) {
    where += ' AND section_key = ?';
    params.push(sectionKey);
  }
  const [rows] = await pool.query<any[]>(
    `
    SELECT
      id, project_id, template_id, form_type, section_key, question_id,
      question_text AS question, hint, question_type AS answer_type,
      options_json, scoring_weight, is_required, is_active, sort_order,
      modified_by_admin, created_at, updated_at
    FROM project_form_templates
    WHERE ${where}
    ORDER BY section_key, sort_order
    `,
    params
  );
  return rows.reduce<Record<string, IProjectQuestion[]>>((acc, r) => {
    const key = r.section_key as string;
    (acc[key] ??= []).push(this._mapProjectQuestion(r));
    return acc;
  }, {});
}

async getProjectQuestionsBySection(
  projectId: string,
  formType: FormType,
  sectionKey: string
): Promise<IProjectQuestion[]> {
  const [rows] = await pool.query<any[]>(
    `SELECT 
      id, project_id, template_id, form_type, section_key, question_id,
      question_text AS question, hint, question_type AS answer_type,
      options_json, scoring_weight, is_required, is_active, sort_order,
      modified_by_admin, created_at, updated_at
    FROM project_form_templates
    WHERE project_id = ? AND form_type = ? AND section_key = ? AND is_active = 1
    ORDER BY sort_order`,
    [projectId, formType, sectionKey]
  );
  return rows.map(r => this._mapProjectQuestion(r));
}

async getProjectQuestionById(id: string): Promise<IProjectQuestion | null> {
  const [rows] = await pool.query<any[]>(
    `SELECT 
      id, project_id, template_id, form_type, section_key, question_id,
      question_text AS question, hint, question_type AS answer_type,
      options_json, scoring_weight, is_required, is_active, sort_order,
      modified_by_admin, created_at, updated_at
    FROM project_form_templates WHERE id = ?`,
    [id]
  );
  return rows[0] ? this._mapProjectQuestion(rows[0]) : null;
}

private _mapProjectQuestion(r: any): IProjectQuestion {
  return {
    id:                r.id,
    project_id:        r.project_id,
    template_id:       r.template_id       ?? null,
    form_type:         r.form_type         as FormType,
    section_key:       r.section_key,
    question_id:       r.question_id,
    question:          r.question,
    hint:              r.hint              ?? null,
    answer_type:       r.answer_type       as AnswerType,
    options_json:      parseJson(r.options_json),
    scoring_weight:    parseFloat(r.scoring_weight),
    is_required:       r.is_required       === 1,
    is_active:         r.is_active         === 1,
    sort_order:        r.sort_order,
    modified_by_admin: r.modified_by_admin === 1,
    created_at:        new Date(r.created_at),
    updated_at:        new Date(r.updated_at),
  };
}
}