// guide-entretien.service.ts - Version COMPLÈTE

import { pool } from '../../config/databaseConnect';
import { newId } from '../../utils/id';
import { BaseRepository, Paginated } from './Base_form';
import type { IGuideEntretien, ICreateGuideEntretien, GuideType } from '../../interfaces/IGuideEntretien';

// Interface pour les questions
export interface IGuideEntretienQuestion {
  id: string;
  guide_entretien_id: string;
  theme_key: 't1' | 't2' | 't3' | 't4';
  question_id: string;
  question: string;
  reponse: string | null;
  nuisance_poussiere: boolean | null;
  nuisance_bruit: boolean | null;
  nuisance_circulation: boolean | null;
  nuisance_odeurs: boolean | null;
  nuisance_dechets: boolean | null;
  sort_order: number;
}

export interface IGuideEntretienComplet extends IGuideEntretien {
  questions: IGuideEntretienQuestion[];
}

export class GuideEntretienService extends BaseRepository {
  
  async create(data: ICreateGuideEntretien & { questions?: any[] }): Promise<IGuideEntretienComplet> {
    const id = newId();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. Insérer l'en-tête
      await connection.query(
        `
        INSERT INTO guide_entretien
          (id, project_id, guide_type, subprojet,
           gi_nom, gi_fonction, gi_contact, gi_date, gi_lieu,
           gi_type_entretien, gi_employeur, gi_type_contrat, notes_auditeur)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
        `,
        [
          id,
          data.project_id,
          data.guide_type,
          data.subprojet,
          data.gi_nom,
          data.gi_fonction,
          data.gi_contact ?? null,
          data.gi_date,
          data.gi_lieu,
          data.gi_type_entretien ?? null,
          data.gi_employeur ?? null,
          data.gi_type_contrat ?? null,
          data.notes_auditeur ?? null,
        ]
      );

      // 2. Insérer les questions
      if (data.questions && data.questions.length > 0) {
        for (const q of data.questions) {
          const questionId = newId();
          await connection.query(
            `
            INSERT INTO guide_entretien_questions 
            (id, guide_entretien_id, theme_key, question_id, question, 
             reponse, nuisance_poussiere, nuisance_bruit, 
             nuisance_circulation, nuisance_odeurs, nuisance_dechets, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
              questionId,
              id,
              q.theme_key,
              q.question_id,
              q.question,
              q.reponse ?? null,
              q.nuisance_poussiere ?? null,
              q.nuisance_bruit ?? null,
              q.nuisance_circulation ?? null,
              q.nuisance_odeurs ?? null,
              q.nuisance_dechets ?? null,
              q.sort_order ?? 0
            ]
          );
        }
      }

      await connection.commit();
      return (await this.getById(id))!;
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getById(id: string): Promise<IGuideEntretienComplet | null> {
    // 1. Récupérer l'en-tête
    const [header] = await pool.query<any[]>(
      'SELECT * FROM guide_entretien WHERE id = ?',
      [id]
    );
    if (!header[0]) return null;
    
    // 2. Récupérer les questions
    const [questions] = await pool.query<any[]>(
      'SELECT * FROM guide_entretien_questions WHERE guide_entretien_id = ? ORDER BY theme_key, sort_order',
      [id]
    );
    
    // 3. Retourner l'objet complet
    return {
      ...this._mapGuide(header[0]),
      questions: questions.map(q => ({
        id: q.id,
        guide_entretien_id: q.guide_entretien_id,
        theme_key: q.theme_key,
        question_id: q.question_id,
        question: q.question,
        reponse: q.reponse ?? null,
        nuisance_poussiere: q.nuisance_poussiere === 1,
        nuisance_bruit: q.nuisance_bruit === 1,
        nuisance_circulation: q.nuisance_circulation === 1,
        nuisance_odeurs: q.nuisance_odeurs === 1,
        nuisance_dechets: q.nuisance_dechets === 1,
        sort_order: q.sort_order,
      }))
    };
  }

  async getQuestions(guideId: string): Promise<IGuideEntretienQuestion[]> {
    const [rows] = await pool.query<any[]>(
      'SELECT * FROM guide_entretien_questions WHERE guide_entretien_id = ? ORDER BY theme_key, sort_order',
      [guideId]
    );
    return rows.map(q => ({
      id: q.id,
      guide_entretien_id: q.guide_entretien_id,
      theme_key: q.theme_key,
      question_id: q.question_id,
      question: q.question,
      reponse: q.reponse ?? null,
      nuisance_poussiere: q.nuisance_poussiere === 1,
      nuisance_bruit: q.nuisance_bruit === 1,
      nuisance_circulation: q.nuisance_circulation === 1,
      nuisance_odeurs: q.nuisance_odeurs === 1,
      nuisance_dechets: q.nuisance_dechets === 1,
      sort_order: q.sort_order,
    }));
  }

  // Garde tes méthodes existantes
  async getAll(
    projectId?: string,
    guideType?: GuideType,
    page = 1,
    limit = 10
  ): Promise<Paginated<IGuideEntretien>> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (projectId) {
      conditions.push('project_id = ?');
      params.push(projectId);
    }
    if (guideType) {
      conditions.push('guide_type = ?');
      params.push(guideType);
    }

    const where = conditions.length ? conditions.join(' AND ') : '1=1';
    const offset = (page - 1) * limit;

    const [rows] = await pool.query<any[]>(
      `SELECT * FROM guide_entretien WHERE ${where} ORDER BY gi_date DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const total = await this.countRows('guide_entretien', where, params);

    return {
      items: rows.map(r => this._mapGuide(r)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    id: string,
    data: Partial<ICreateGuideEntretien>
  ): Promise<IGuideEntretien | null> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Guide introuvable');

    const fields: string[] = [];
    const values: unknown[] = [];

    const updatableFields = [
      'guide_type',
      'subprojet',
      'gi_nom',
      'gi_fonction',
      'gi_contact',
      'gi_date',
      'gi_lieu',
      'gi_type_entretien',
      'gi_employeur',
      'gi_type_contrat',
      'notes_auditeur',
    ] as const;

    for (const field of updatableFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field] ?? null);
      }
    }

    if (fields.length) {
      await pool.query(
        `UPDATE guide_entretien SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        [...values, id]
      );
    }

    const updated = await this.getById(id);
    return updated ? this._mapGuide(updated) : null;
  }

  private _mapGuide(r: any): IGuideEntretien {
    return {
      id: r.id,
      project_id: r.project_id,
      guide_type: r.guide_type as GuideType,
      subprojet: r.subprojet,
      gi_nom: r.gi_nom,
      gi_fonction: r.gi_fonction,
      gi_contact: r.gi_contact ?? null,
      gi_date: new Date(r.gi_date),
      gi_lieu: r.gi_lieu,
      gi_type_entretien: r.gi_type_entretien ?? null,
      gi_employeur: r.gi_employeur ?? null,
      gi_type_contrat: r.gi_type_contrat ?? null,
      notes_auditeur: r.notes_auditeur ?? null,
      created_at: new Date(r.created_at),
      updated_at: new Date(r.updated_at),
    };
  }
}