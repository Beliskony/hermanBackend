// guide-entretien.service.ts - Version avec procédures stockées (CORRIGÉE)

import { pool } from '../../config/databaseConnect';
import { newId } from '../../utils/id';
import { BaseRepository, Paginated } from './Base_form';
import type { IGuideEntretien, ICreateGuideEntretien, GuideType } from '../../interfaces/IGuideEntretien';

export interface IGuideEntretienQuestion {
  id: string;
  guide_entretien_id: string;
  theme_key: 't1' | 't2' | 't3' | 't4';
  question_id: string;
  question: string;
  reponse: string | null;
  nuisance_poussiere: boolean;
  nuisance_bruit: boolean;
  nuisance_circulation: boolean;
  nuisance_odeurs: boolean;
  nuisance_dechets: boolean;
  sort_order: number;
}

export interface IGuideEntretienComplet extends IGuideEntretien {
  questions: IGuideEntretienQuestion[];
}

export class GuideEntretienService extends BaseRepository {
  
  /**
   * Créer un nouveau guide d'entretien
   */
  async create(data: ICreateGuideEntretien & { questions?: any[] }): Promise<IGuideEntretienComplet> {
    const id = newId();
    const questionsJson = data.questions ? JSON.stringify(data.questions) : null;
    
    const [results] = await pool.query<any[]>(
      'CALL sp_create_guide_entretien(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
        questionsJson
      ]
    );
    
    const result = this._formatProcedureResult(results);
    
    // Soumettre un guide (changement de status draft → submitted)
    await pool.query<any[]>( 'CALL sp_submit_guide_entretien(?)', [id] );
    
    if (!result) {
      throw new Error(`Erreur lors de la création du guide d'entretien ${id}`);
    }
    return result;
    
  }

  /**
   * Récupérer un guide complet par son ID
   */
  async getById(id: string): Promise<IGuideEntretienComplet | null> {
    const [results] = await pool.query<any[]>(
      'CALL sp_get_guide_entretien_complet(?)',
      [id]
    );
    
    if (!results || !results[0] || results[0].length === 0) {
      return null;
    }
    
    return this._formatProcedureResult(results);
  }

  /**
   * Mettre à jour les réponses d'un guide
   */
  async updateReponses(guideId: string, questions: any[]): Promise<IGuideEntretienComplet> {
    const questionsJson = JSON.stringify(questions);
    
    const [results] = await pool.query<any[]>(
      'CALL sp_update_guide_entretien_reponses(?, ?)',
      [guideId, questionsJson]
    );
    
    const result = this._formatProcedureResult(results);
    if (!result) {
      throw new Error(`Erreur lors de la mise à jour des réponses du guide ${guideId}`);
    }
    return result;
  }

  /**
   * Soumettre un guide (changement de status draft → submitted)
   */
  async submit(id: string): Promise<IGuideEntretienComplet> {
    const [results] = await pool.query<any[]>(
      'CALL sp_submit_guide_entretien(?)',
      [id]
    );
    
    const result = this._formatProcedureResult(results);
    if (!result) {
      throw new Error(`Erreur lors de la soumission du guide ${id}`);
    }
    return result;
  }

  /**
   * Lister tous les guides d'un projet
   */
  async getAll(
    projectId?: string,
    guideType?: GuideType,
    page: number = 1,
    limit: number = 10
  ): Promise<Paginated<IGuideEntretien>> {
    const offset = (page - 1) * limit;
    
    const [results] = await pool.query<any[]>(
      'CALL sp_list_guide_entretien(?, ?, ?, ?)',
      [projectId ?? null, guideType ?? null, limit, offset]
    );
    
    const items = results[0] || [];
    const total = results[1]?.[0]?.total || 0;
    
    return {
      items: items.map((r: any) => this._mapGuide(r)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ===========================================================================
  //  MÉTHODES PRIVÉES
  // ===========================================================================

  /**
   * Formate le résultat d'une procédure (2 jeux de résultats)
   */
  private _formatProcedureResult(results: any[]): IGuideEntretienComplet | null {
    if (!results || !results[0] || results[0].length === 0) {
      return null;
    }
    
    const header = results[0][0];
    const questions = results[1] || [];
    
    return {
      id: header.id,
      project_id: header.project_id,
      guide_type: header.guide_type as GuideType,
      subprojet: header.subprojet,
      gi_nom: header.gi_nom,
      gi_fonction: header.gi_fonction,
      gi_contact: header.gi_contact ?? null,
      gi_date: new Date(header.gi_date),
      gi_lieu: header.gi_lieu,
      gi_type_entretien: header.gi_type_entretien ?? null,
      gi_employeur: header.gi_employeur ?? null,
      gi_type_contrat: header.gi_type_contrat ?? null,
      notes_auditeur: header.notes_auditeur ?? null,
      created_at: new Date(header.created_at),
      updated_at: new Date(header.updated_at),
      questions: questions.map((q: any) => ({
        id: q.question_id,
        guide_entretien_id: header.id,
        theme_key: q.theme_key,
        question_id: q.question_id,
        question: q.question_text,
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

  /**
   * Mappe une ligne de guide_entretien vers l'interface (sans les questions)
   */
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

// Export d'une instance unique
export const guideEntretienService = new GuideEntretienService();