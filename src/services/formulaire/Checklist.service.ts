// ─────────────────────────────────────────────────────────────────────────────
//  checklist.service.ts  —  Services complets des checklists (Audit & Conducteur)
// ─────────────────────────────────────────────────────────────────────────────

import { pool } from '../../config/databaseConnect';
import { newId } from '../../utils/id';
import { BaseRepository, parseJson, Paginated } from './Base_form';
import type {
  IChecklistAudit,
  IChecklistAuditCritere,
  ICreateChecklistAudit,
  Conformite,
} from '../../interfaces/IChecklistAudit';
import type {
  IChecklistConducteur,
  IChecklistConducteurQuestion,
  ICreateChecklistConducteur,
  ReponseBooleenne,
} from '../../interfaces/IChecklistConducteur';

// =============================================================================
//  CHECKLIST AUDIT SERVICE
// =============================================================================

export class ChecklistAuditService extends BaseRepository {
  async create(data: ICreateChecklistAudit & { criteres?: any[] }): Promise<IChecklistAudit> {
    const id = newId();

    // Démarrer une transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Insérer dans checklist_audit (en-tête) - AVEC LES BONS CHAMPS
      await connection.query(
        `
        INSERT INTO checklist_audit
          (id, project_id, subprojet, auditeurs, date,
           synth_nb_nc_majeures, synth_domaines_critiques, synth_signature_auditeur)
        VALUES (?,?,?,?,?,?,?,?)
        `,
        [
          id,
          data.project_id,
          data.subprojet,
          data.auditeurs,                    // ← auditeurs (pluriel)
          data.date,
          data.synth_nb_nc_majeures ?? 0,
          data.synth_domaines_critiques ?? null,
          data.synth_signature_auditeur ?? null,
        ]
      );

      // 2. Insérer les critères dans checklist_audit_criteres
      if (data.criteres && data.criteres.length > 0) {
        for (const c of data.criteres) {
          const critereId = newId();
          await connection.query(
            `
            INSERT INTO checklist_audit_criteres 
            (id, checklist_audit_id, section_key, numero, critere, 
             sources_methode, conformite, observations, risque_non_conformite, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
              critereId,
              id,
              c.section_key,
              c.numero,
              c.critere,
              c.sources_methode ?? null,
              c.conformite ?? 'S.O.',
              c.observations ?? null,
              c.risque_non_conformite ?? null,
              c.sort_order ?? 0
            ]
          );
        }
      }
      
      await connection.commit();

      // Retourner l'objet complet
      return (await this.getById(id))!;
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }


async getById(id: string): Promise<(IChecklistAudit & { criteres: IChecklistAuditCritere[] }) | null> {
  // 1. Récupérer l'en-tête
  const [header] = await pool.query<any[]>(
    'SELECT * FROM checklist_audit WHERE id = ?',
    [id]
  );
  if (!header[0]) return null;
  
  // 2. Récupérer les critères
  const [criteres] = await pool.query<any[]>(
    'SELECT * FROM checklist_audit_criteres WHERE checklist_audit_id = ? ORDER BY section_key, sort_order',
    [id]
  );
  
  // 3. Retourner l'objet complet
  const mapped = this._mapAudit(header[0]);
  return {
    ...mapped,
    criteres: criteres.map(c => ({
      id: c.id,
      checklist_audit_id: c.checklist_audit_id,
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

  async getAll(
    projectId?: string,
    page = 1,
    limit = 10
  ): Promise<Paginated<IChecklistAudit>> {
    const params: unknown[] = [];
    let where = '1=1';

    if (projectId) {
      where = 'project_id = ?';
      params.push(projectId);
    }

    const offset = (page - 1) * limit;

    const [rows] = await pool.query<any[]>(
      `SELECT * FROM checklist_audit WHERE ${where} ORDER BY date DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const total = await this.countRows('checklist_audit', where, params);

    return {
      items: rows.map(r => this._mapAudit(r)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    id: string,
    data: Partial<ICreateChecklistAudit>
  ): Promise<IChecklistAudit | null> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Audit introuvable');

    const fields: string[] = [];
    const values: unknown[] = [];

    const updatableFields = [
      'subprojet',
      'auditeurs',
      'date',
      'synth_nb_nc_majeures',
      'synth_domaines_critiques',
      'synth_signature_auditeur',
    ] as const;

    for (const field of updatableFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }

    if (fields.length) {
      await pool.query(
        `UPDATE checklist_audit SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        [...values, id]
      );
    }

    return this.getById(id);
  }

  async getCriteres(auditId: string): Promise<IChecklistAuditCritere[]> {
    const [rows] = await pool.query<any[]>(
      'SELECT * FROM checklist_audit_criteres WHERE checklist_audit_id = ? ORDER BY section_key, sort_order',
      [auditId]
    );
    return rows.map(r => ({
      id: r.id,
      checklist_audit_id: r.checklist_audit_id,
      section_key: r.section_key,
      numero: r.numero,
      critere: r.critere,
      sources_methode: r.sources_methode ?? null,
      conformite: r.conformite as Conformite,
      observations: r.observations ?? null,
      risque_non_conformite: r.risque_non_conformite ?? null,
      sort_order: r.sort_order,
    }));
  }

  async updateCritere(
    auditId: string,
    critereId: string,
    data: Partial<IChecklistAuditCritere>
  ): Promise<IChecklistAuditCritere | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    const updatableFields = [
      'conformite',
      'observations',
      'risque_non_conformite',
      'sources_methode',
    ] as const;

    for (const field of updatableFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }

    if (fields.length) {
      await pool.query(
        `UPDATE checklist_audit_criteres SET ${fields.join(', ')} WHERE id = ? AND checklist_audit_id = ?`,
        [...values, critereId, auditId]
      );
    }

    const [rows] = await pool.query<any[]>(
      'SELECT * FROM checklist_audit_criteres WHERE id = ?',
      [critereId]
    );
    if (!rows.length) return null;

    const r = rows[0];
    return {
      id: r.id,
      checklist_audit_id: r.checklist_audit_id,
      section_key: r.section_key,
      numero: r.numero,
      critere: r.critere,
      sources_methode: r.sources_methode ?? null,
      conformite: r.conformite as Conformite,
      observations: r.observations ?? null,
      risque_non_conformite: r.risque_non_conformite ?? null,
      sort_order: r.sort_order,
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

// =============================================================================
//  CHECKLIST CONDUCTEUR SERVICE
// =============================================================================

export class ChecklistConducteurService extends BaseRepository {
  async create(data: ICreateChecklistConducteur & { questions?: any[] }) {
  const id = newId();

  // Démarrer une transaction
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Insérer dans checklist_conducteur (en-tête)
    await connection.query(
      `
      INSERT INTO checklist_conducteur
        (id, project_id, subprojet, auditeur, date,
         personne_rencontree, fonction, entreprise, contact,
         duree_entretien, lieu, commentaires_libres, signature_auditeur)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
      `,
      [
        id,
        data.project_id,
        data.subprojet,
        data.auditeur,
        data.date,
        data.personne_rencontree,
        data.fonction,
        data.entreprise,
        data.contact ?? null,
        data.duree_entretien ?? null,
        data.lieu,
        data.commentaires_libres ?? null,
        data.signature_auditeur ?? null,
      ]
    );

    // 2. Insérer les questions dans checklist_conducteur_questions
    if (data.questions && data.questions.length > 0) {
      for (const q of data.questions) {
        const questionId = newId();
        await connection.query(
          `
          INSERT INTO checklist_conducteur_questions 
          (id, checklist_conducteur_id, section_key, numero, question, 
           reponse, reponse_booleenne, observations, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            questionId,
            id,  // ← Lien avec l'en-tête
            q.section_key,
            q.numero,
            q.question,
            q.reponse ?? null,
            q.reponse_booleenne ?? null,
            q.observations ?? null,
            q.sort_order ?? 0
          ]
        );
      }
    }
    await connection.commit();

    // retourner l'objet complet
    return (await this.getById(id))!;

    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async getById(id: string): Promise<(IChecklistConducteur & { questions: IChecklistConducteurQuestion[] }) | null> {
  // 1. Récupérer l'en-tête
  const [header] = await pool.query<any[]>(
    'SELECT * FROM checklist_conducteur WHERE id = ?',
    [id]
  );
  if (!header[0]) return null;
  
  // 2. Récupérer les questions
  const [questions] = await pool.query<any[]>(
    'SELECT * FROM checklist_conducteur_questions WHERE checklist_conducteur_id = ? ORDER BY section_key, sort_order',
    [id]
  );
  
  // 3. Retourner l'objet complet
  const mapped = this._mapConducteur(header[0]);
  return {
    ...mapped,
    questions: questions.map(q => ({
      id: q.id,
      checklist_conducteur_id: q.checklist_conducteur_id,
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

  async getAll(
    projectId?: string,
    page = 1,
    limit = 10
  ): Promise<Paginated<IChecklistConducteur>> {
    const params: unknown[] = [];
    let where = '1=1';

    if (projectId) {
      where = 'project_id = ?';
      params.push(projectId);
    }

    const offset = (page - 1) * limit;

    const [rows] = await pool.query<any[]>(
      `SELECT * FROM checklist_conducteur WHERE ${where} ORDER BY date DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const total = await this.countRows('checklist_conducteur', where, params);

    return {
      items: rows.map(r => this._mapConducteur(r)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    id: string,
    data: Partial<ICreateChecklistConducteur>
  ): Promise<IChecklistConducteur | null> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Checklist introuvable');

    const fields: string[] = [];
    const values: unknown[] = [];

    const updatableFields = [
      'subprojet',
      'auditeur',
      'date',
      'personne_rencontree',
      'fonction',
      'entreprise',
      'contact',
      'duree_entretien',
      'lieu',
      'commentaires_libres',
      'signature_auditeur',
    ] as const;

    for (const field of updatableFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field] ?? null);
      }
    }

    if (fields.length) {
      await pool.query(
        `UPDATE checklist_conducteur SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        [...values, id]
      );
    }

    return this.getById(id);
  }

  async getQuestions(conducteurId: string): Promise<IChecklistConducteurQuestion[]> {
    const [rows] = await pool.query<any[]>(
      'SELECT * FROM checklist_conducteur_questions WHERE checklist_conducteur_id = ? ORDER BY section_key, sort_order',
      [conducteurId]
    );
    return rows.map(r => ({
      id: r.id,
      checklist_conducteur_id: r.checklist_conducteur_id,
      section_key: r.section_key,
      numero: r.numero,
      question: r.question,
      reponse: r.reponse ?? null,
      reponse_booleenne: r.reponse_booleenne as ReponseBooleenne | null,
      observations: r.observations ?? null,
      sort_order: r.sort_order,
    }));
  }

  // Ajoutez cette méthode dans ChecklistConducteurService
async addQuestions(
  conducteurId: string, 
  questions: Omit<IChecklistConducteurQuestion, 'id'>[]
): Promise<void> {
  if (!questions.length) return;

  const values: unknown[] = [];
  const placeholders: string[] = [];

  for (const q of questions) {
    const id = newId();
    placeholders.push('(?, ?, ?, ?, ?, ?, ?, ?, ?)');
    values.push(
      id,
      conducteurId,
      q.section_key,
      q.numero,
      q.question,
      q.reponse ?? null,
      q.reponse_booleenne ?? null,
      q.observations ?? null,
      q.sort_order ?? 0
    );
  }

  await pool.query(
    `
    INSERT INTO checklist_conducteur_questions 
    (id, checklist_conducteur_id, section_key, numero, question, 
     reponse, reponse_booleenne, observations, sort_order)
    VALUES ${placeholders.join(', ')}
    `,
    values
  );
}

// Et aussi une méthode pour sauvegarder/remplacer toutes les questions
async saveAllQuestions(
  conducteurId: string,
  questions: Omit<IChecklistConducteurQuestion, 'id'>[]
): Promise<void> {
  // Supprimer les anciennes questions
  await pool.query(
    'DELETE FROM checklist_conducteur_questions WHERE checklist_conducteur_id = ?',
    [conducteurId]
  );
  
  // Ajouter les nouvelles
  if (questions.length) {
    await this.addQuestions(conducteurId, questions);
  }
}

  async updateQuestion(
    conducteurId: string,
    questionId: string,
    data: Partial<IChecklistConducteurQuestion>
  ): Promise<IChecklistConducteurQuestion | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    const updatableFields = ['reponse', 'reponse_booleenne', 'observations'] as const;

    for (const field of updatableFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }

    if (fields.length) {
      await pool.query(
        `UPDATE checklist_conducteur_questions SET ${fields.join(', ')} WHERE id = ? AND checklist_conducteur_id = ?`,
        [...values, questionId, conducteurId]
      );
    }

    const [rows] = await pool.query<any[]>(
      'SELECT * FROM checklist_conducteur_questions WHERE id = ?',
      [questionId]
    );
    if (!rows.length) return null;

    const r = rows[0];
    return {
      id: r.id,
      checklist_conducteur_id: r.checklist_conducteur_id,
      section_key: r.section_key,
      numero: r.numero,
      question: r.question,
      reponse: r.reponse ?? null,
      reponse_booleenne: r.reponse_booleenne as ReponseBooleenne | null,
      observations: r.observations ?? null,
      sort_order: r.sort_order,
    };
  }

  private _mapConducteur(r: any): IChecklistConducteur {
    return {
      id: r.id,
      project_id: r.project_id,
      subprojet: r.subprojet,
      auditeur: r.auditeur,
      date: new Date(r.date),
      personne_rencontree: r.personne_rencontree,
      fonction: r.fonction,
      entreprise: r.entreprise,
      contact: r.contact ?? null,
      duree_entretien: r.duree_entretien ?? null,
      lieu: r.lieu,
      commentaires_libres: r.commentaires_libres ?? null,
      signature_auditeur: r.signature_auditeur ?? null,
      created_at: new Date(r.created_at),
      updated_at: new Date(r.updated_at),
    };
  }
}