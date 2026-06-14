// checklist-audit.service.ts - Version avec procédures stockées

import { pool } from '../../config/databaseConnect';
import { newId } from '../../utils/id';
import { BaseRepository, Paginated } from './Base_form';
import type { IChecklistAudit, ICreateChecklistAudit, Conformite } from '../../interfaces/IChecklistAudit';
import type { IChecklistConducteur, ICreateChecklistConducteur, ReponseBooleenne } from '../../interfaces/IChecklistConducteur';

export interface IChecklistAuditCritere {
  id: string;
  checklist_audit_id: string;
  section_key: string;
  numero: string;
  critere: string;
  sources_methode: string | null;
  conformite: Conformite;
  observations: string | null;
  risque_non_conformite: string | null;
  sort_order: number;
}

export interface IChecklistAuditComplet extends IChecklistAudit {
  criteres: IChecklistAuditCritere[];
}

export class ChecklistAuditService extends BaseRepository {
  
  /**
   * Créer un audit complet
   */
  async create(data: ICreateChecklistAudit & { criteres?: any[] }): Promise<IChecklistAuditComplet> {
    const id = newId();
    const criteresJson = data.criteres ? JSON.stringify(data.criteres) : null;
    
    const [results] = await pool.query<any[]>(
      'CALL sp_create_checklist_audit(?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        data.project_id,
        data.subprojet,
        data.auditeurs,
        data.date,
        data.synth_nb_nc_majeures ?? 0,
        data.synth_domaines_critiques ?? null,
        data.synth_signature_auditeur ?? null,
        criteresJson
      ]
    );
    
    const result = this._formatProcedureResult(results);
    if (!result) {
      throw new Error(`Erreur lors de la création de l'audit ${id}`);
    }
    return result;
  }

  /**
   * Récupérer un audit complet par son ID
   */
  async getById(id: string): Promise<IChecklistAuditComplet | null> {
    const [results] = await pool.query<any[]>(
      'CALL sp_get_checklist_audit_complet(?)',
      [id]
    );
    
    if (!results || !results[0] || results[0].length === 0) {
      return null;
    }
    
    return this._formatProcedureResult(results);
  }

  /**
   * Mettre à jour les réponses d'un audit
   */
  async updateReponses(auditId: string, criteres: any[]): Promise<IChecklistAuditComplet> {
    const criteresJson = JSON.stringify(criteres);
    
    const [results] = await pool.query<any[]>(
      'CALL sp_update_checklist_audit_reponses(?, ?)',
      [auditId, criteresJson]
    );
    
    const result = this._formatProcedureResult(results);
    if (!result) {
      throw new Error(`Erreur lors de la mise à jour de l'audit ${auditId}`);
    }
    return result;
  }

  /**
   * Soumettre un audit
   */
  async submit(id: string): Promise<IChecklistAuditComplet> {
    const [results] = await pool.query<any[]>(
      'CALL sp_submit_checklist_audit(?)',
      [id]
    );
    
    const result = this._formatProcedureResult(results);
    if (!result) {
      throw new Error(`Erreur lors de la soumission de l'audit ${id}`);
    }
    return result;
  }

  /**
   * Lister tous les audits d'un projet
   */
  async getAll(
    projectId?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<Paginated<IChecklistAudit>> {
    const offset = (page - 1) * limit;
    
    const params: unknown[] = [];
    let where = '1=1';
    
    if (projectId) {
      where = 'project_id = ?';
      params.push(projectId);
    }
    
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM checklist_audit WHERE ${where} ORDER BY date DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const total = await this.countRows('checklist_audit', where, params);
    
    return {
      items: rows.map((r: any) => this._mapAudit(r)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ===========================================================================
  //  MÉTHODES PRIVÉES
  // ===========================================================================

  private _formatProcedureResult(results: any[]): IChecklistAuditComplet | null {
    if (!results || !results[0] || results[0].length === 0) {
      return null;
    }
    
    const header = results[0][0];
    const criteres = results[1] || [];
    
    return {
      id: header.id,
      project_id: header.project_id,
      subprojet: header.subprojet,
      auditeurs: header.auditeurs,
      date: new Date(header.date),
      synth_nb_nc_majeures: header.synth_nb_nc_majeures,
      synth_domaines_critiques: header.synth_domaines_critiques ?? null,
      synth_signature_auditeur: header.synth_signature_auditeur ?? null,
      status: header.status ?? 'submitted',
      created_at: new Date(header.created_at),
      updated_at: new Date(header.updated_at),
      criteres: criteres.map((c: any) => ({
        id: c.numero,
        checklist_audit_id: header.id,
        section_key: c.section_key,
        numero: c.numero,
        critere: c.critere,
        sources_methode: c.sources_methode ?? null,
        conformite: c.conformite as Conformite,
        observations: c.observations ?? null,
        risque_non_conformite: c.risque_non_conformite ?? null,
        sort_order: c.sort_order,
      }))
    };
  }

  private _mapAudit(r: any): IChecklistAudit {
    return {
      id: r.id,
      project_id: r.project_id,
      subprojet: r.subprojet,
      auditeurs: r.auditeurs,
      date: new Date(r.date),
      synth_nb_nc_majeures: r.synth_nb_nc_majeures,
      synth_domaines_critiques: r.synth_domaines_critiques ?? null,
      synth_signature_auditeur: r.synth_signature_auditeur ?? null,
      created_at: new Date(r.created_at),
      updated_at: new Date(r.updated_at),
    };
  }
}

export const checklistAuditService = new ChecklistAuditService();









export interface IChecklistConducteurQuestion {
  id: string;
  checklist_conducteur_id: string;
  section_key: string;
  numero: string;
  question: string;
  reponse: string | null;
  reponse_booleenne: ReponseBooleenne | null;
  observations: string | null;
  sort_order: number;
}

export interface IChecklistConducteurComplet extends IChecklistConducteur {
  questions: IChecklistConducteurQuestion[];
}

export class ChecklistConducteurService extends BaseRepository {
  
  /**
   * Créer un conducteur complet
   */
  async create(data: ICreateChecklistConducteur & { questions?: any[] }): Promise<IChecklistConducteurComplet> {
    const id = newId();
    const questionsJson = data.questions ? JSON.stringify(data.questions) : null;
    
    const [results] = await pool.query<any[]>(
      'CALL sp_create_checklist_conducteur(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        data.project_id,
        data.subprojet,
        data.auditeur,
        data.entreprise,
        data.personne_rencontree,
        data.fonction,
        data.contact ?? null,
        data.duree_entretien ?? null,
        data.date,
        data.lieu,
        data.commentaires_libres ?? null,
        data.signature_auditeur ?? null,
        questionsJson
      ]
    );
    
    const result = this._formatProcedureResult(results);
    if (!result) {
      throw new Error(`Erreur lors de la création du conducteur ${id}`);
    }
    return result;
  }

  /**
   * Récupérer un conducteur complet par son ID
   */
  async getById(id: string): Promise<IChecklistConducteurComplet | null> {
    const [results] = await pool.query<any[]>(
      'CALL sp_get_checklist_conducteur_complet(?)',
      [id]
    );
    
    if (!results || !results[0] || results[0].length === 0) {
      return null;
    }
    
    return this._formatProcedureResult(results);
  }

  /**
   * Mettre à jour les réponses d'un conducteur
   */
  async updateReponses(conducteurId: string, questions: any[]): Promise<IChecklistConducteurComplet> {
    const questionsJson = JSON.stringify(questions);
    
    const [results] = await pool.query<any[]>(
      'CALL sp_update_checklist_conducteur_reponses(?, ?)',
      [conducteurId, questionsJson]
    );
    
    const result = this._formatProcedureResult(results);
    if (!result) {
      throw new Error(`Erreur lors de la mise à jour du conducteur ${conducteurId}`);
    }
    return result;
  }

  /**
   * Soumettre un conducteur
   */
  async submit(id: string): Promise<IChecklistConducteurComplet> {
    const [results] = await pool.query<any[]>(
      'CALL sp_submit_checklist_conducteur(?)',
      [id]
    );
    
    const result = this._formatProcedureResult(results);
    if (!result) {
      throw new Error(`Erreur lors de la soumission du conducteur ${id}`);
    }
    return result;
  }

  /**
   * Lister tous les conducteurs d'un projet
   */
  async getAll(
    projectId?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<Paginated<IChecklistConducteur>> {
    const offset = (page - 1) * limit;
    
    const [results] = await pool.query<any[]>(
      'CALL sp_list_checklist_conducteur(?, ?, ?)',
      [projectId ?? null, limit, offset]
    );
    
    const items = results[0] || [];
    const total = results[1]?.[0]?.total || 0;
    
    return {
      items: items.map((r: any) => this._mapConducteur(r)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ===========================================================================
  //  MÉTHODES PRIVÉES
  // ===========================================================================

  private _formatProcedureResult(results: any[]): IChecklistConducteurComplet | null {
    if (!results || !results[0] || results[0].length === 0) {
      return null;
    }
    
    const header = results[0][0];
    const questions = results[1] || [];
    
    return {
      id: header.id,
      project_id: header.project_id,
      subprojet: header.subprojet,
      auditeur: header.auditeur,
      entreprise: header.entreprise,
      personne_rencontree: header.personne_rencontree,
      fonction: header.fonction,
      contact: header.contact ?? null,
      duree_entretien: header.duree_entretien ?? null,
      date: new Date(header.date),
      lieu: header.lieu,
      commentaires_libres: header.commentaires_libres ?? null,
      signature_auditeur: header.signature_auditeur ?? null,
      status: header.status ?? 'submitted',
      created_at: new Date(header.created_at),
      updated_at: new Date(header.updated_at),
      questions: questions.map((q: any) => ({
        id: q.numero,
        checklist_conducteur_id: header.id,
        section_key: q.section_key,
        numero: q.numero,
        question: q.question,
        reponse: q.reponse ?? null,
        reponse_booleenne: q.reponse_booleenne as ReponseBooleenne | null,
        observations: q.observations ?? null,
        sort_order: q.sort_order,
      }))
    };
  }

  private _mapConducteur(r: any): IChecklistConducteur {
    return {
      id: r.id,
      project_id: r.project_id,
      subprojet: r.subprojet,
      auditeur: r.auditeur,
      entreprise: r.entreprise,
      personne_rencontree: r.personne_rencontree,
      fonction: r.fonction,
      contact: r.contact ?? null,
      duree_entretien: r.duree_entretien ?? null,
      date: new Date(r.date),
      lieu: r.lieu,
      commentaires_libres: r.commentaires_libres ?? null,
      signature_auditeur: r.signature_auditeur ?? null,
      created_at: new Date(r.created_at),
      updated_at: new Date(r.updated_at),
    };
  }
}

export const checklistConducteurService = new ChecklistConducteurService();