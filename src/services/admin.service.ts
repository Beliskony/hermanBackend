// ─────────────────────────────────────────────────────────────────────────────
//  admin.service.ts  —  Logiques ADMINISTRATEUR
//  Adapté à la vraie DB (dump phpMyAdmin 2026-06-02)
//
//  Modèle réel :
//  ✅ Tables  : default_form_questions, default_form_questions (noms réels en DB)
//  ✅ form_data : id, project_id, project_info_id, status, submitted_at, ...
//  ✅ Annexes APES liées via form_id (pas de FK inverse dans form_data)
//  ✅ Pas de project_id dans les annexes APES
//  ✅ note_sur_20 / appreciation : PAS de generated columns → calcul en TS
//  ✅ sp_create_project, sp_save_form_score, sp_reset_template_to_default : existent
//  ✅ sp_add_custom_project_question : NON vérifiée → SQL direct utilisé
//  ✅ sp_reset_default_form_questions : NON vérifiée → sp_reset_template_to_default utilisée
// ─────────────────────────────────────────────────────────────────────────────

import { pool } from '../config/databaseConnect';
import { newId } from '../utils/id';

import type { IProject, ProjectStatus, ICreateProject, IUpdateProject } from '../interfaces/IProject';
import type {
  IQuestionTemplate, IProjectQuestion, IFormScore,
  FormType, AnswerType,
} from '../interfaces/IQuestionTemplate';

// =============================================================================
//  HELPERS
// =============================================================================

function parseJson<T = any>(val: unknown): T | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'string') {
    try { return JSON.parse(val) as T; } catch { return null; }
  }
  return val as T;
}

function stringify(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  return typeof val === 'string' ? val : JSON.stringify(val);
}

async function countRows(table: string, where = '1=1', params: unknown[] = []): Promise<number> {
  const [rows] = await pool.query<any[]>(
    `SELECT COUNT(*) AS total FROM \`${table}\` WHERE ${where}`,
    params
  );
  return Number(rows[0].total);
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

// ─── Calcul note/20 et appréciation (pas de generated columns en DB réelle) ──
function computeNote(raw: number, max: number): number {
  if (max <= 0) return 0;
  return Math.round((raw / max) * 20 * 100) / 100;
}

function computeAppreciation(note: number): string {
  if (note < 5)  return 'Insuffisant';
  if (note < 8)  return 'Médiocre';
  if (note < 10) return 'Passable';
  if (note < 12) return 'Assez Bien';
  if (note < 14) return 'Bien';
  if (note < 17) return 'Très Bien';
  return 'Excellent';
}

// =============================================================================
//  1. ADMIN PROJECT SERVICE
// =============================================================================

export class AdminProjectService {

  async create(data: ICreateProject): Promise<IProject> {
    const id = newId();
    // sp_create_project existe en DB — clone les default_form_questions actifs
    await pool.query('CALL sp_create_project(?,?,?,?,?,?,?)', [
      id, data.name, data.description ?? null, data.location ?? null,
      data.start_date ?? null, data.end_date ?? null, data.created_by,
    ]);
    return (await this.getById(id))!;
  }

  async getById(id: string): Promise<IProject | null> {
    const [rows] = await pool.query<any[]>('SELECT * FROM projects WHERE id = ?', [id]);
    return rows[0] ? this._map(rows[0]) : null;
  }

  async getAll(page = 1, limit = 10, status?: ProjectStatus): Promise<Paginated<IProject>> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (status) { conditions.push('status = ?'); params.push(status); }

    const where  = conditions.length ? conditions.join(' AND ') : '1=1';
    const offset = (page - 1) * limit;

    const [rows] = await pool.query<any[]>(
      `SELECT * FROM projects WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const total = await countRows('projects', where, params);
    return { items: rows.map(r => this._map(r)), total, page, totalPages: Math.ceil(total / limit) };
  }

  async update(id: string, data: IUpdateProject): Promise<IProject | null> {
    const updates: string[] = [];
    const values: unknown[] = [];
    if (data.name        !== undefined) { updates.push('name = ?');        values.push(data.name); }
    if (data.description !== undefined) { updates.push('description = ?'); values.push(data.description); }
    if (data.location    !== undefined) { updates.push('location = ?');    values.push(data.location); }
    if (data.start_date  !== undefined) { updates.push('start_date = ?');  values.push(data.start_date); }
    if (data.end_date    !== undefined) { updates.push('end_date = ?');    values.push(data.end_date); }
    if (data.status      !== undefined) { updates.push('status = ?');      values.push(data.status); }
    if (!updates.length) return this.getById(id);

    await pool.query(
      `UPDATE projects SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );
    return this.getById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const [r] = await pool.query<any>(
      `UPDATE projects SET status = 'archived', updated_at = NOW() WHERE id = ?`, [id]
    );
    return r.affectedRows > 0;
  }

  async hardDelete(id: string): Promise<boolean> {
    const [r] = await pool.query<any>('DELETE FROM projects WHERE id = ?', [id]);
    return r.affectedRows > 0;
  }

  // v_project_synthesis existe en DB et calcule note_sur_20 inline
  async getSynthesis(projectId: string): Promise<any> {
    const [rows] = await pool.query<any[]>(
      'SELECT * FROM v_project_synthesis WHERE project_id = ?',
      [projectId]
    );
    return rows[0] ?? null;
  }

  private _map(r: any): IProject {
    return {
      id:          r.id,
      name:        r.name,
      description: r.description ?? null,
      location:    r.location    ?? null,
      start_date:  r.start_date  ? new Date(r.start_date) : null,
      end_date:    r.end_date    ? new Date(r.end_date)   : null,
      status:      r.status      as ProjectStatus,
      created_by:  r.created_by,
      created_at:  new Date(r.created_at),
      updated_at:  new Date(r.updated_at),
    };
  }
}

// =============================================================================
//  2. ADMIN TEMPLATE SERVICE  (table: default_form_questions)
// =============================================================================

export class AdminTemplateService {

  async createTemplate(
    data: Omit<IQuestionTemplate, 'id' | 'created_at'>
  ): Promise<IQuestionTemplate> {
    const id = newId();
    await pool.query(
      `INSERT INTO default_form_questions
         (id, form_type, section_key, question_id, question, hint,
          answer_type, options_json, scoring_weight, is_required, sort_order, active)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id, data.form_type, data.section_key, data.question_id,
        data.question, data.hint ?? null, data.answer_type,
        stringify(data.options_json),
        data.scoring_weight ?? 1.0,
        data.is_required ? 1 : 0,
        data.sort_order  ?? 0,
        data.active !== undefined ? (data.active ? 1 : 0) : 1,
      ]
    );
    return (await this.getTemplateById(id))!;
  }

  async getTemplateById(id: string): Promise<IQuestionTemplate | null> {
    const [rows] = await pool.query<any[]>(
      'SELECT * FROM default_form_questions WHERE id = ?', [id]
    );
    return rows[0] ? this._map(rows[0]) : null;
  }

  async getAllTemplates(
    page    = 1,
    limit   = 50,
    filters?: { form_type?: FormType; active?: boolean; section_key?: string; search?: string }
  ): Promise<Paginated<IQuestionTemplate>> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters?.form_type)            { conditions.push('form_type = ?');   params.push(filters.form_type); }
    if (filters?.active !== undefined) { conditions.push('active = ?');      params.push(filters.active ? 1 : 0); }
    if (filters?.section_key)          { conditions.push('section_key = ?'); params.push(filters.section_key); }
    if (filters?.search) {
      conditions.push('(question LIKE ? OR question_id LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const where  = conditions.length ? conditions.join(' AND ') : '1=1';
    const offset = (page - 1) * limit;

    const [rows] = await pool.query<any[]>(
      `SELECT * FROM default_form_questions WHERE ${where}
       ORDER BY form_type, section_key, sort_order LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const total = await countRows('default_form_questions', where, params);
    return { items: rows.map(r => this._map(r)), total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateTemplate(
    id:   string,
    data: Partial<Omit<IQuestionTemplate, 'id' | 'created_at'>>
  ): Promise<IQuestionTemplate | null> {
    const updates: string[] = [];
    const values:  unknown[] = [];

    if (data.form_type      !== undefined) { updates.push('form_type = ?');      values.push(data.form_type); }
    if (data.section_key    !== undefined) { updates.push('section_key = ?');    values.push(data.section_key); }
    if (data.question_id    !== undefined) { updates.push('question_id = ?');    values.push(data.question_id); }
    if (data.question       !== undefined) { updates.push('question = ?');       values.push(data.question); }
    if (data.hint           !== undefined) { updates.push('hint = ?');           values.push(data.hint); }
    if (data.answer_type    !== undefined) { updates.push('answer_type = ?');    values.push(data.answer_type); }
    if (data.options_json   !== undefined) { updates.push('options_json = ?');   values.push(stringify(data.options_json)); }
    if (data.scoring_weight !== undefined) { updates.push('scoring_weight = ?'); values.push(data.scoring_weight); }
    if (data.is_required    !== undefined) { updates.push('is_required = ?');    values.push(data.is_required ? 1 : 0); }
    if (data.sort_order     !== undefined) { updates.push('sort_order = ?');     values.push(data.sort_order); }
    if (data.active         !== undefined) { updates.push('active = ?');         values.push(data.active ? 1 : 0); }

    if (!updates.length) return this.getTemplateById(id);

    await pool.query(
      `UPDATE default_form_questions SET ${updates.join(', ')} WHERE id = ?`,
      [...values, id]
    );
    return this.getTemplateById(id);
  }

  // Soft-delete : active = 0
  async deleteTemplate(id: string): Promise<boolean> {
    const [r] = await pool.query<any>(
      'UPDATE default_form_questions SET active = 0 WHERE id = ?', [id]
    );
    return r.affectedRows > 0;
  }

  async hardDeleteTemplate(id: string): Promise<boolean> {
    const [r] = await pool.query<any>('DELETE FROM default_form_questions WHERE id = ?', [id]);
    return r.affectedRows > 0;
  }

  async duplicateTemplate(id: string): Promise<IQuestionTemplate> {
    const orig = await this.getTemplateById(id);
    if (!orig) throw new Error('Template introuvable');

    const newIdVal = newId();
    await pool.query(
      `INSERT INTO default_form_questions
         (id, form_type, section_key, question_id, question, hint,
          answer_type, options_json, scoring_weight, is_required, sort_order, active)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        newIdVal, orig.form_type, orig.section_key,
        `${orig.question_id}_copy`,
        `${orig.question} (copie)`,
        orig.hint, orig.answer_type,
        stringify(orig.options_json),
        orig.scoring_weight,
        orig.is_required ? 1 : 0,
        orig.sort_order + 1,
        1,
      ]
    );
    return (await this.getTemplateById(newIdVal))!;
  }

  private _map(r: any): IQuestionTemplate {
    return {
      id:             r.id,
      form_type:      r.form_type     as FormType,
      section_key:    r.section_key,
      question_id:    r.question_id,
      question:       r.question,
      hint:           r.hint          ?? null,
      answer_type:    r.answer_type   as AnswerType,
      options_json:   parseJson(r.options_json),
      scoring_weight: parseFloat(r.scoring_weight),
      is_required:    r.is_required   === 1,
      sort_order:     r.sort_order,
      active:         r.active        === 1,
      created_at:     new Date(r.created_at),
    };
  }
}

// =============================================================================
//  3. ADMIN PROJECT QUESTION SERVICE  (table: default_form_questions)
// =============================================================================

export interface ProjectQuestionWithStats extends IProjectQuestion {
  origin:               'DEFAULT' | 'MODIFIED' | 'CUSTOM';
  original_question?:   string | null;
  original_weight?:     number | null;
  original_is_required?: boolean | null;
}

export class AdminProjectQuestionService {

async getProjectQuestionsWithStats(
    projectId: string,
    formType?: FormType
  ): Promise<ProjectQuestionWithStats[]> {
    const params: unknown[] = [projectId];
    let filter = '';
    if (formType) { filter = ' AND pft.form_type = ?'; params.push(formType); }

    const [rows] = await pool.query<any[]>(`
      SELECT
        pft.id,
        pft.project_id,
        pft.template_id,
        pft.form_type,
        pft.section_key,
        pft.question_id,
        pft.question_text AS question,
        pft.hint,
        pft.question_type AS answer_type,
        pft.options_json,
        pft.scoring_weight,
        pft.is_required,
        pft.is_active,
        pft.sort_order,
        pft.modified_by_admin,
        pft.created_at,
        pft.updated_at,
        CASE
          WHEN pft.modified_by_admin = 1 THEN 'MODIFIED'
          WHEN pft.template_id IS NULL   THEN 'CUSTOM'
          ELSE 'DEFAULT'
        END AS origin,
        dfq.question_text AS original_question,
        dfq.scoring_weight AS original_weight,
        dfq.is_required    AS original_is_required
      FROM project_form_templates pft
      LEFT JOIN default_form_questions dfq ON dfq.id = pft.template_id
      WHERE pft.project_id = ? AND pft.is_active = 1${filter}
      ORDER BY pft.form_type, pft.section_key, pft.sort_order
    `, params);

    return rows.map(r => ({
      ...this._mapPQ(r),
      origin: r.origin as 'DEFAULT' | 'MODIFIED' | 'CUSTOM',
      original_question: r.original_question ?? null,
      original_weight: r.original_weight ? parseFloat(r.original_weight) : null,
      original_is_required: r.original_is_required != null ? r.original_is_required === 1 : null,
    }));
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
    return rows.map(r => this._mapPQ(r));
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
    return rows[0] ? this._mapPQ(rows[0]) : null;
  }

  async updateProjectQuestion(
    projectQuestionId: string,
    data: {
      question?: string;
      hint?: string;
      scoring_weight?: number;
      is_required?: boolean;
      sort_order?: number;
      is_active?: boolean;
    }
  ): Promise<IProjectQuestion | null> {
    const updates: string[] = ['modified_by_admin = 1', 'updated_at = NOW()'];
    const values: unknown[] = [];

    if (data.question !== undefined) { updates.push('question_text = ?'); values.push(data.question); }
    if (data.hint !== undefined) { updates.push('hint = ?'); values.push(data.hint ?? null); }
    if (data.scoring_weight !== undefined) { updates.push('scoring_weight = ?'); values.push(data.scoring_weight); }
    if (data.is_required !== undefined) { updates.push('is_required = ?'); values.push(data.is_required ? 1 : 0); }
    if (data.sort_order !== undefined) { updates.push('sort_order = ?'); values.push(data.sort_order); }
    if (data.is_active !== undefined) { updates.push('is_active = ?'); values.push(data.is_active ? 1 : 0); }

    if (updates.length === 2) return this.getProjectQuestionById(projectQuestionId);

    await pool.query(
      `UPDATE project_form_templates SET ${updates.join(', ')} WHERE id = ?`,
      [...values, projectQuestionId]
    );
    return this.getProjectQuestionById(projectQuestionId);
  }

  async resetProjectQuestions(
    projectId: string,
    formType: FormType
  ): Promise<ProjectQuestionWithStats[]> {
    await pool.query('CALL sp_reset_template_to_default(?,?)', [projectId, formType]);
    return this.getProjectQuestionsWithStats(projectId, formType);
  }

  async addCustomQuestion(
    projectId: string,
    data: {
      form_type: FormType;
      section_key: string;
      question_id: string;
      question: string;
      hint?: string;
      answer_type: AnswerType;
      scoring_weight?: number;
      is_required?: boolean;
      sort_order?: number;
      options_json?: any;
    }
  ): Promise<IProjectQuestion> {
    const id = newId();
    await pool.query(
      `INSERT INTO project_form_templates
         (id, project_id, template_id, form_type, section_key, question_id,
          question_text, hint, question_type, options_json, scoring_weight,
          is_required, is_active, sort_order, modified_by_admin)
       VALUES (?,?,NULL,?,?,?,?,?,?,?,?,?,1,?,0)`,
      [
        id, projectId,
        data.form_type, data.section_key, data.question_id,
        data.question, data.hint ?? null, data.answer_type,
        stringify(data.options_json ?? null),
        data.scoring_weight ?? 1.0,
        data.is_required !== undefined ? (data.is_required ? 1 : 0) : 1,
        data.sort_order ?? 0,
      ]
    );
    return (await this.getProjectQuestionById(id))!;
  }

  async deleteCustomQuestion(projectId: string, questionId: string): Promise<boolean> {
    const [r] = await pool.query<any>(
      `DELETE FROM project_form_templates
       WHERE project_id = ? AND question_id = ? AND template_id IS NULL`,
      [projectId, questionId]
    );
    return r.affectedRows > 0;
  }

  async cloneQuestionsToProject(
    sourceProjectId: string,
    targetProjectId: string,
    formType:        FormType
  ): Promise<ProjectQuestionWithStats[]> {
    const [sourceRows] = await pool.query<any[]>(
  `SELECT * FROM project_form_templates
   WHERE project_id = ? AND form_type = ? AND is_active = 1
   ORDER BY section_key, sort_order`,
  [sourceProjectId, formType]
);

    for (const row of sourceRows) {
      await pool.query(
        `INSERT IGNORE INTO project_form_templates
           (id, project_id, template_id, form_type, section_key, question_id,
            question, hint, answer_type, options_json, scoring_weight,
            is_required, is_active, sort_order, modified_by_admin)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          newId(), targetProjectId, row.template_id,
          row.form_type, row.section_key, row.question_id,
          row.question, row.hint, row.answer_type, row.options_json,
          row.scoring_weight, row.is_required, row.is_active,
          row.sort_order, row.modified_by_admin,
        ]
      );
    }
    return this.getProjectQuestionsWithStats(targetProjectId, formType);
  }

  async exportProjectQuestions(projectId: string): Promise<{
    project_id:  string;
    export_date: string;
    questions:   Record<FormType, ProjectQuestionWithStats[]>;
  }> {
    const questions = await this.getProjectQuestionsWithStats(projectId);
    const grouped: Record<string, ProjectQuestionWithStats[]> = {};
    for (const q of questions) { (grouped[q.form_type] ??= []).push(q); }
    return {
      project_id:  projectId,
      export_date: new Date().toISOString(),
      questions:   grouped as Record<FormType, ProjectQuestionWithStats[]>,
    };
  }

  async importProjectQuestions(
    projectId: string,
    questions: IProjectQuestion[],
    strategy:  'replace' | 'merge' = 'replace'
  ): Promise<ProjectQuestionWithStats[]> {
    if (strategy === 'replace') {
      await pool.query('DELETE FROM project_form_templates WHERE project_id = ?', [projectId]);
    }

    for (const q of questions) {
      const exists = await this._questionExists(projectId, q.form_type, q.question_id);

      if (strategy === 'merge' && exists) {
        await pool.query(
          `UPDATE project_form_templates
           SET question = ?, hint = ?, scoring_weight = ?, is_required = ?,
               answer_type = ?, options_json = ?, sort_order = ?,
               modified_by_admin = 1, updated_at = NOW()
           WHERE project_id = ? AND form_type = ? AND question_id = ?`,
          [
            q.question, q.hint ?? null, q.scoring_weight, q.is_required ? 1 : 0,
            q.answer_type, stringify(q.options_json), q.sort_order,
            projectId, q.form_type, q.question_id,
          ]
        );
      } else if (!exists) {
        await pool.query(
          `INSERT INTO project_form_templates
             (id, project_id, form_type, section_key, question_id,
              question, hint, answer_type, options_json, scoring_weight,
              is_required, is_active, sort_order, modified_by_admin)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            newId(), projectId, q.form_type, q.section_key, q.question_id,
            q.question, q.hint ?? null, q.answer_type,
            stringify(q.options_json), q.scoring_weight,
            q.is_required ? 1 : 0, q.is_active ? 1 : 0, q.sort_order, 1,
          ]
        );
      }
    }
    return this.getProjectQuestionsWithStats(projectId);
  }

  private async _questionExists(
    projectId:  string,
    formType:   FormType,
    questionId: string
  ): Promise<boolean> {
    const [rows] = await pool.query<any[]>(
  `SELECT 1 FROM project_form_templates
   WHERE project_id = ? AND form_type = ? AND question_id = ? LIMIT 1`,
  [projectId, formType, questionId]
);
    return rows.length > 0;
  }

  private _mapPQ(r: any): IProjectQuestion {
    return {
      id:               r.id,
      project_id:       r.project_id,
      template_id:      r.template_id      ?? null,
      form_type:        r.form_type        as FormType,
      section_key:      r.section_key,
      question_id:      r.question_id,
      question:         r.question,
      hint:             r.hint             ?? null,
      answer_type:      r.answer_type      as AnswerType,
      options_json:     parseJson(r.options_json),
      scoring_weight:   parseFloat(r.scoring_weight),
      is_required:      r.is_required      === 1,
      is_active:        r.is_active        === 1,
      sort_order:       r.sort_order,
      modified_by_admin: r.modified_by_admin === 1,
      created_at:       new Date(r.created_at),
      updated_at:       new Date(r.updated_at),
    };
  }
}

// =============================================================================
//  4. ADMIN SCORE SERVICE
// =============================================================================

export class AdminScoreService {

  async recalculateFormScore(
    projectId:      string,
    formType:       FormType,
    formInstanceId: string,
    answers:        Record<string, any>
  ): Promise<IFormScore> {
    const qSvc      = new AdminProjectQuestionService();
    const questions = await qSvc.getProjectQuestionsWithStats(projectId, formType);

    let rawScore = 0;
    let maxScore = 0;

    for (const q of questions) {
      const answer = answers[q.question_id];
      const weight = q.scoring_weight;
      maxScore += weight;

      switch (q.answer_type) {
        case 'conformite':
          if (answer === 'O')      rawScore += weight;
          else if (answer === 'P') rawScore += weight * 0.5;
          break;
        case 'reponse_booleenne':
          if (answer === 'oui')              rawScore += weight;
          else if (answer === 'partiellement') rawScore += weight * 0.5;
          break;
        case 'rating_5':
          if (typeof answer === 'number') rawScore += (answer / 5) * weight;
          break;
        case 'boolean':
          if (answer === true || answer === 'true' || answer === 1) rawScore += weight;
          break;
        case 'text':
        case 'select':
        case 'nuisances':
          if (answer && answer !== '') rawScore += weight;
          break;
        case 'score':
          if (typeof answer === 'number') rawScore += Math.min(answer, weight);
          break;
      }
    }

    // sp_save_form_score existe en DB (UPSERT sur form_instance_id + form_type)
    const scoreId = newId();
    await pool.query('CALL sp_save_form_score(?,?,?,?,?,?)', [
      scoreId, projectId, formType, formInstanceId,
      Math.round(rawScore * 100) / 100,
      Math.round(maxScore * 100) / 100,
    ]);

    const [rows] = await pool.query<any[]>(
      'SELECT * FROM form_scores WHERE form_instance_id = ? AND form_type = ?',
      [formInstanceId, formType]
    );
    if (!rows.length) throw new Error('Erreur lors de la persistance du score');
    return this._mapScore(rows[0]);
  }

  async getFormScore(formInstanceId: string, formType?: FormType): Promise<IFormScore | null> {
    const params: unknown[] = [formInstanceId];
    let sql = 'SELECT * FROM form_scores WHERE form_instance_id = ?';
    if (formType) { sql += ' AND form_type = ?'; params.push(formType); }

    const [rows] = await pool.query<any[]>(sql, params);
    return rows[0] ? this._mapScore(rows[0]) : null;
  }

  async getProjectScores(projectId: string): Promise<IFormScore[]> {
    const [rows] = await pool.query<any[]>(
      'SELECT * FROM form_scores WHERE project_id = ? ORDER BY computed_at DESC',
      [projectId]
    );
    return rows.map(r => this._mapScore(r));
  }

  // v_project_synthesis existe en DB
  async getProjectSynthesis(projectId: string): Promise<any> {
    const [rows] = await pool.query<any[]>(
      'SELECT * FROM v_project_synthesis WHERE project_id = ?',
      [projectId]
    );
    return rows[0] ?? null;
  }

  async validateFormCompleteness(
    projectId: string,
    formType:  FormType,
    answers:   Record<string, any>
  ): Promise<{
    valid:                    boolean;
    missingQuestions:         string[];
    missingRequiredQuestions: string[];
  }> {
    const qSvc      = new AdminProjectQuestionService();
    const questions = await qSvc.getProjectQuestionsWithStats(projectId, formType);

    const isEmpty = (v: any) =>
      v === undefined || v === null || v === '' ||
      (Array.isArray(v) && v.length === 0) ||
      (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);

    const missingRequired: string[] = [];
    const missing:         string[] = [];

    for (const q of questions) {
      if (isEmpty(answers[q.question_id])) {
        missing.push(`${q.question_id}: ${q.question}`);
        if (q.is_required) missingRequired.push(`${q.question_id}: ${q.question}`);
      }
    }

    return {
      valid:                    missingRequired.length === 0,
      missingQuestions:         missing,
      missingRequiredQuestions: missingRequired,
    };
  }

  // note_sur_20 et appreciation ne sont PAS des generated columns en DB réelle
  private _mapScore(r: any): IFormScore {
    const raw  = parseFloat(r.raw_score);
    const max  = parseFloat(r.max_score);
    const note = computeNote(raw, max);
    return {
      id:               r.id,
      project_id:       r.project_id,
      form_type:        r.form_type as FormType,
      form_instance_id: r.form_instance_id,
      raw_score:        raw,
      max_score:        max,
      note_sur_20:      note,
      appreciation:     computeAppreciation(note),
      computed_at:      new Date(r.computed_at),
    };
  }
}

// =============================================================================
//  5. ADMIN FORM DELETE SERVICE
//
//  form_data réel : id, project_id, project_info_id, status, submitted_at, ...
//  Pas de colonnes FK vers les annexes dans form_data.
//  Les annexes ont un form_id → on supprime via form_id, pas via FK inverse.
// =============================================================================

export class AdminFormDeleteService {

  // Supprime form_data + project_info associé + toutes les annexes via form_id
  async deleteAPESForm(id: string): Promise<boolean> {
    const [rows] = await pool.query<any[]>(
      'SELECT * FROM form_data WHERE id = ?', [id]
    );
    if (!rows.length) return false;
    const form = rows[0];

    // Supprimer toutes les annexes liées via form_id
    // Les FK ON DELETE CASCADE gèrent les sous-tables (gender_*, complaint_*)
    // mais on supprime explicitement pour être sûr
    await Promise.all([
      this._deleteGenderByFormId(id),
      this._deleteComplaintByFormId(id),
      pool.query('DELETE FROM document_review      WHERE form_id = ?', [id]),
      pool.query('DELETE FROM field_inspection      WHERE form_id = ?', [id]),
      pool.query('DELETE FROM stakeholder_interview WHERE form_id = ?', [id]),
    ]);

    // Supprimer form_data (cascade supprimera les éventuelles annexes restantes)
    const [result] = await pool.query<any>('DELETE FROM form_data WHERE id = ?', [id]);

    // Supprimer project_info orphelin
    if (form.project_info_id) {
      await pool.query('DELETE FROM project_info WHERE id = ?', [form.project_info_id]);
    }

    return result.affectedRows > 0;
  }

  async deleteGuideEntretien(id: string): Promise<boolean> {
    await pool.query('DELETE FROM guide_entretien_questions WHERE guide_entretien_id = ?', [id]);
    const [r] = await pool.query<any>('DELETE FROM guide_entretien WHERE id = ?', [id]);
    return r.affectedRows > 0;
  }

  async deleteChecklistAudit(id: string): Promise<boolean> {
    await Promise.all([
      pool.query('DELETE FROM checklist_audit_criteres  WHERE checklist_audit_id = ?', [id]),
      pool.query('DELETE FROM checklist_audit_documents WHERE checklist_audit_id = ?', [id]),
    ]);
    const [r] = await pool.query<any>('DELETE FROM checklist_audit WHERE id = ?', [id]);
    return r.affectedRows > 0;
  }

  async deleteChecklistConducteur(id: string): Promise<boolean> {
    await pool.query(
      'DELETE FROM checklist_conducteur_questions WHERE checklist_conducteur_id = ?', [id]
    );
    const [r] = await pool.query<any>('DELETE FROM checklist_conducteur WHERE id = ?', [id]);
    return r.affectedRows > 0;
  }

  async deleteDocumentReview(id: string): Promise<boolean> {
    const [r] = await pool.query<any>('DELETE FROM document_review WHERE id = ?', [id]);
    return r.affectedRows > 0;
  }

  async deleteFieldInspection(id: string): Promise<boolean> {
    const [r] = await pool.query<any>('DELETE FROM field_inspection WHERE id = ?', [id]);
    return r.affectedRows > 0;
  }

  async deleteStakeholderInterview(id: string): Promise<boolean> {
    const [r] = await pool.query<any>('DELETE FROM stakeholder_interview WHERE id = ?', [id]);
    return r.affectedRows > 0;
  }

  async deleteGenderAssessment(id: string): Promise<boolean> {
    await this._deleteGenderById(id);
    return true;
  }

  async deleteComplaintMechanism(id: string): Promise<boolean> {
    await this._deleteComplaintById(id);
    return true;
  }

  async deleteDataCollection(id: string): Promise<boolean> {
    const [r] = await pool.query<any>('DELETE FROM data_collection WHERE id = ?', [id]);
    return r.affectedRows > 0;
  }

  // Supprime gender_assessment lié à un form_id (via form_id)
  private async _deleteGenderByFormId(formId: string): Promise<void> {
    const [rows] = await pool.query<any[]>(
      'SELECT id FROM gender_assessment WHERE form_id = ?', [formId]
    );
    for (const row of rows) { await this._deleteGenderById(row.id); }
  }

  // Supprime gender_assessment par son propre id
  private async _deleteGenderById(id: string): Promise<void> {
    await Promise.all([
      pool.query('DELETE FROM gender_objectives      WHERE gender_assessment_id = ?', [id]),
      pool.query('DELETE FROM gender_consultations   WHERE gender_assessment_id = ?', [id]),
      pool.query('DELETE FROM gender_impacts         WHERE gender_assessment_id = ?', [id]),
      pool.query('DELETE FROM gender_recommendations WHERE gender_assessment_id = ?', [id]),
    ]);
    await pool.query('DELETE FROM gender_assessment WHERE id = ?', [id]);
  }

  // Supprime complaint_mechanism lié à un form_id
  private async _deleteComplaintByFormId(formId: string): Promise<void> {
    const [rows] = await pool.query<any[]>(
      'SELECT id FROM complaint_mechanism WHERE form_id = ?', [formId]
    );
    for (const row of rows) { await this._deleteComplaintById(row.id); }
  }

  // Supprime complaint_mechanism par son propre id
  private async _deleteComplaintById(id: string): Promise<void> {
    await Promise.all([
      pool.query('DELETE FROM complaint_strengths       WHERE complaint_mechanism_id = ?', [id]),
      pool.query('DELETE FROM complaint_weaknesses      WHERE complaint_mechanism_id = ?', [id]),
      pool.query('DELETE FROM complaint_recommendations WHERE complaint_mechanism_id = ?', [id]),
    ]);
    await pool.query('DELETE FROM complaint_mechanism WHERE id = ?', [id]);
  }
}

// =============================================================================
//  6. ADMIN DASHBOARD SERVICE
// =============================================================================

export class AdminDashboardService {

  async getDashboard(): Promise<{
    stats: {
      totalProjects:          number;
      totalTemplates:         number;
      totalProjectQuestions:  number;
      totalModifiedQuestions: number;
      totalCustomQuestions:   number;
      totalAPESForms:         number;
      totalGuideForms:        number;
      totalAuditForms:        number;
      totalDataCollectionForms: number;
      totalConducteurForms:   number;
      averageScore:           number;
    };
    recentActivity: any[];
    topProjects: Array<{
      project_id:    string;
      project_name:  string;
      nb_forms:      number;
      average_score: number;
    }>;
  }> {
    const [
      [projectCount],
      [templateCount],
      [pqCount],
      [modifiedCount],
      [customCount],
      [apesCount],
      [guideCount],
      [auditCount],
      [conducteurCount],
      [dataCollectionCount],
    ] = await Promise.all([
      pool.query<any[]>('SELECT COUNT(*) AS total FROM projects'),
      pool.query<any[]>('SELECT COUNT(*) AS total FROM default_form_questions WHERE active = 1'),
      pool.query<any[]>('SELECT COUNT(*) AS total FROM project_form_templates'),
      pool.query<any[]>('SELECT COUNT(*) AS total FROM project_form_templates WHERE modified_by_admin = 1'),
      pool.query<any[]>('SELECT COUNT(*) AS total FROM project_form_templates WHERE template_id IS NULL'),
      pool.query<any[]>('SELECT COUNT(*) AS total FROM form_data'),
      pool.query<any[]>('SELECT COUNT(*) AS total FROM guide_entretien'),
      pool.query<any[]>('SELECT COUNT(*) AS total FROM checklist_audit'),
      pool.query<any[]>('SELECT COUNT(*) AS total FROM checklist_conducteur'),
      pool.query<any[]>('SELECT COUNT(*) AS total FROM data_collection'),
    ]);

    // note_sur_20 n'est pas une colonne stockée → calcul inline
    const [avgRows] = await pool.query<any[]>(`
      SELECT ROUND(AVG(IF(max_score > 0, raw_score / max_score * 20, 0)), 2) AS average
      FROM form_scores
    `);
    const averageScore = parseFloat(avgRows[0]?.average) || 0;

    // Top projets — calcul inline
    const [topProjects] = await pool.query<any[]>(`
      SELECT
        p.id   AS project_id,
        p.name AS project_name,
        COUNT(fs.id) AS nb_forms,
        ROUND(AVG(IF(fs.max_score > 0, fs.raw_score / fs.max_score * 20, 0)), 2) AS average_score
      FROM projects p
      LEFT JOIN form_scores fs ON fs.project_id = p.id
      GROUP BY p.id, p.name
      ORDER BY average_score DESC
      LIMIT 10
    `);

    // Activité récente
    const [recentActivity] = await pool.query<any[]>(`
      SELECT 'project_created' AS type, id AS entity_id, name AS entity_name, created_at AS date
      FROM projects
      UNION ALL
      SELECT
        'question_modified'                    AS type,
        id                                     AS entity_id,
        CONCAT(form_type, ' - ', question_id)  AS entity_name,
        COALESCE(updated_at, created_at)       AS date
      FROM default_form_questions
      WHERE modified_by_admin = 1
      ORDER BY date DESC
      LIMIT 20
    `);

    return {
      stats: {
        totalProjects:          Number(projectCount[0]?.total)    || 0,
        totalTemplates:         Number(templateCount[0]?.total)   || 0,
        totalProjectQuestions:  Number(pqCount[0]?.total)         || 0,
        totalModifiedQuestions: Number(modifiedCount[0]?.total)   || 0,
        totalCustomQuestions:   Number(customCount[0]?.total)     || 0,
        totalAPESForms:         Number(apesCount[0]?.total)       || 0,
        totalGuideForms:        Number(guideCount[0]?.total)      || 0,
        totalAuditForms:        Number(auditCount[0]?.total)      || 0,
        totalDataCollectionForms: Number(dataCollectionCount[0]?.total) || 0,
        totalConducteurForms:   Number(conducteurCount[0]?.total) || 0,
        averageScore,
      },
      recentActivity: recentActivity.map((a: any) => ({ ...a, date: new Date(a.date) })),
      topProjects: topProjects.map((p: any) => ({
        project_id:    p.project_id,
        project_name:  p.project_name,
        nb_forms:      Number(p.nb_forms),
        average_score: parseFloat(p.average_score) || 0,
      })),
    };
  }
}

// =============================================================================
//  SERVICE PRINCIPAL
// =============================================================================

export class AdminService {
  public readonly projects         = new AdminProjectService();
  public readonly templates        = new AdminTemplateService();
  public readonly projectQuestions = new AdminProjectQuestionService();
  public readonly scores           = new AdminScoreService();
  public readonly delete           = new AdminFormDeleteService();
  public readonly dashboard        = new AdminDashboardService();
}