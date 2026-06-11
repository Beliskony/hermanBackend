// ─────────────────────────────────────────────────────────────────────────────
//  data-collection.service.ts  —  Service de Collecte de Données
//
//  UN SEUL formulaire composé de 5 annexes :
//  Annexe 1 – Revue Documentaire
//  Annexe 2 – Inspection Terrain
//  Annexe 3 – Entretien Parties Prenantes
//  Annexe 4 – Évaluation Genre
//  Annexe 5 – Mécanisme de Plainte (MGP)
//
//  Chaque annexe a ses propres sous-tables (documents, points de contrôle,
//  critères, etc.)
// ─────────────────────────────────────────────────────────────────────────────

import { pool } from '../../config/databaseConnect';
import { newId } from '../../utils/id';
import { BaseRepository, parseJson, stringify, Paginated } from './Base_form';

// =============================================================================
//  TYPES - ANNEXE 1 : REVUE DOCUMENTAIRE
// =============================================================================

export type DisponibiliteDoc = 'O' | 'N' | 'P' | 'S.O.';
export type CritereConformite = 'O' | 'N' | 'P' | 'S.O.';
export type CategorieDocument = 'conception' | 'mise_en_oeuvre' | 'organisationnel' | 'cloture';

export interface IDocumentRevue {
  id: string;
  numero: string;
  categorie: CategorieDocument;
  document: string;
  objectif_examen: string;
  questions_cles: string;
  disponible: DisponibiliteDoc;
  observations: string | null;
  conformite: CritereConformite;
  sort_order: number;
}

export interface IRevueDocumentaire {
  id: string;
  data_collection_id: string;
  subprojet: string;
  auditeurs: string;
  date: string;
  periode_couverte: string | null;
  documents: IDocumentRevue[];
  documents_manquants: string | null;
  autres_documents: string | null;
  observations_generales: string | null;
}

export interface ICreateRevueDocumentaire {
  subprojet: string;
  auditeurs: string;
  date: string;
  periode_couverte?: string | null;
  documents?: Omit<IDocumentRevue, 'id'>[];
  documents_manquants?: string | null;
  autres_documents?: string | null;
  observations_generales?: string | null;
}

// =============================================================================
//  TYPES - ANNEXE 2 : INSPECTION TERRAIN
// =============================================================================

export type ZoneInspection = 'traitement' | 'stockage' | 'externe' | 'bureaux';
export type ThemePointControle = 'eau' | 'dechets' | 'emissions' | 'sante_securite' | 'communaute';
export type StatutPointControle = 'oui' | 'non' | 'na';
export type NiveauCriticite = 'H' | 'M' | 'L' | null;

export interface IPointControle {
  id: string;
  code: string;
  theme: ThemePointControle;
  intitule: string;
  statut: StatutPointControle;
  observations: string | null;
  photo_ref: string | null;
  criticite: NiveauCriticite;
  sort_order: number;
}

export interface IInspectionTerrain {
  id: string;
  data_collection_id: string;
  subprojet: string;
  date: string;
  auditeurs: string;
  personnes_rencontrees: string | null;
  zones_inspectees: ZoneInspection[];
  points_controle: IPointControle[];
  observations_generales: string | null;
}

export interface ICreateInspectionTerrain {
  subprojet: string;
  date: string;
  auditeurs: string;
  personnes_rencontrees?: string | null;
  zones_inspectees?: ZoneInspection[];
  points_controle?: Omit<IPointControle, 'id'>[];
  observations_generales?: string | null;
}

// =============================================================================
//  TYPES - ANNEXE 3 : ENTRETIEN PARTIES PRENANTES
// =============================================================================

export type TypePartiePrenante =
  | 'communaute_locale'
  | 'employe'
  | 'autorite_locale'
  | 'ong_association'
  | 'fournisseur'
  | 'autre';

export type Genre = 'F' | 'H' | null;
export type TrancheAge = '18-35' | '36-60' | '60+' | null;

export interface IInterlocuteur {
  nom_ou_anonyme: string;
  genre: Genre;
  tranche_age: TrancheAge;
  role_fonction: string;
}

export interface IEntretienPartiePrenante {
  id: string;
  data_collection_id: string;
  subprojet: string;
  date: string;
  lieu: string;
  heure_debut: string | null;
  heure_fin: string | null;
  type_partie_prenante: TypePartiePrenante;
  type_partie_detail: string | null;
  interlocuteurs: IInterlocuteur[];
  auditeurs: string;
  mode: 'individuel' | 'collectif';
  taille_groupe: number | null;
  enregistre: boolean;
  consentement_participation: boolean;
  consentement_notes: boolean;
  consentement_enregistrement: boolean;
  confidentialite_expliquee: boolean;
  reponses: Record<string, { notes_citations: string; observations_auditeur: string }>;
  eval_qualite: 1 | 2 | 3 | 4 | 5;
  eval_franchise: 1 | 2 | 3 | 4 | 5;
  eval_pertinence: 1 | 2 | 3 | 4 | 5;
  eval_climat: 1 | 2 | 3 | 4 | 5;
  synthese_preoccupation_principale: string | null;
  synthese_suggestion_pertinente: string | null;
  synthese_element_surprenant: string | null;
  synthese_recommandation_prioritaire: string | null;
  actions_suivi: string | null;
}

export interface ICreateEntretienPartiePrenante {
  subprojet: string;
  date: string;
  lieu: string;
  heure_debut?: string | null;
  heure_fin?: string | null;
  type_partie_prenante: TypePartiePrenante;
  type_partie_detail?: string | null;
  interlocuteurs?: IInterlocuteur[];
  auditeurs: string;
  mode?: 'individuel' | 'collectif';
  taille_groupe?: number | null;
  enregistre?: boolean;
  consentement_participation?: boolean;
  consentement_notes?: boolean;
  consentement_enregistrement?: boolean;
  confidentialite_expliquee?: boolean;
  reponses?: Record<string, { notes_citations: string; observations_auditeur: string }>;
  eval_qualite?: 1 | 2 | 3 | 4 | 5;
  eval_franchise?: 1 | 2 | 3 | 4 | 5;
  eval_pertinence?: 1 | 2 | 3 | 4 | 5;
  eval_climat?: 1 | 2 | 3 | 4 | 5;
  synthese_preoccupation_principale?: string | null;
  synthese_suggestion_pertinente?: string | null;
  synthese_element_surprenant?: string | null;
  synthese_recommandation_prioritaire?: string | null;
  actions_suivi?: string | null;
}

// =============================================================================
//  TYPES - ANNEXE 4 : ÉVALUATION GENRE
// =============================================================================

export type ScoreGenre = 'exemplaire' | 'satisfaisant' | 'ameliorer' | 'insuffisant' | 'preoccupant';
export type Priorite = 'haute' | 'moyenne' | 'basse';
export type Portee = 'structurel' | 'operationnel' | 'pedagogique';
export type Fiabilite = 'haute' | 'moyenne' | 'faible';
export type TypeImpact = 'environnemental' | 'socioeconomique';

export interface IDonneeQuantitativeGenre {
  categorie: string;
  femmes: number | null;
  hommes: number | null;
  autres: number | null;
  non_specifie: number | null;
  source_document: string | null;
  fiabilite: Fiabilite;
}

export interface IImpactDifferencie {
  type_impact: TypeImpact;
  intitule: string;
  effets_femmes: string;
  effets_hommes: string;
  effets_groupes_vulnerables: string;
  gravite: 'H' | 'M' | 'L';
  opportunite_autonomisation: string | null;
  sort_order: number;
}

export interface IRecommandationGenre {
  recommandation: string;
  priorite: Priorite;
  portee: Portee;
  responsable: string;
  delai: string;
  sort_order: number;
}

export interface IEvaluationGenre {
  id: string;
  data_collection_id: string;
  subprojet: string;
  auditeurs: string;
  date: string;
  score_global: ScoreGenre;
  forces_principales: string | null;
  deficiences_critiques: string | null;
  donnees_quantitatives: IDonneeQuantitativeGenre[];
  impacts_differencies: IImpactDifferencie[];
  recommandations: IRecommandationGenre[];
  plan_suivi_json: Record<string, boolean>;
}

export interface ICreateEvaluationGenre {
  subprojet: string;
  auditeurs: string;
  date: string;
  score_global?: ScoreGenre;
  forces_principales?: string | null;
  deficiences_critiques?: string | null;
  donnees_quantitatives?: Omit<IDonneeQuantitativeGenre, never>[];
  impacts_differencies?: Omit<IImpactDifferencie, 'sort_order'>[];
  recommandations?: Omit<IRecommandationGenre, 'sort_order'>[];
  plan_suivi_json?: Record<string, boolean>;
}

// =============================================================================
//  TYPES - ANNEXE 5 : MÉCANISME DE PLAINTE (MGP)
// =============================================================================

export type ConclusionMGP = 'efficace' | 'ameliorer' | 'inoperant' | 'non_evalue';

export interface IBaseDocumentaireMGP {
  document: string;
  disponible: boolean;
  sort_order: number;
}

export interface ICritereMGP {
  code: string;
  critere: string;
  point_verification: string;
  methode: string | null;
  constat: string | null;
  donnee_quantitative: string | null;
  evaluation: CritereConformite;
  sort_order: number;
}

export interface IDeficienceMGP {
  deficience: string;
  consequence: string;
  gravite: 'H' | 'M' | 'L';
  sort_order: number;
}

export interface IRecommandationMGP {
  recommandation: string;
  priorite: 'H' | 'M' | 'L';
  responsable: string;
  delai: string;
  sort_order: number;
}

export interface IEvaluationMGP {
  id: string;
  data_collection_id: string;
  subprojet: string;
  auditeurs: string;
  date: string;
  periode_couverte_debut: string | null;
  periode_couverte_fin: string | null;
  base_documentaire: IBaseDocumentaireMGP[];
  criteres: ICritereMGP[];
  points_forts: string[];
  deficiences: IDeficienceMGP[];
  recommandations: IRecommandationMGP[];
  conclusion_globale: ConclusionMGP;
  signature_auditeur: string | null;
}

export interface ICreateEvaluationMGP {
  subprojet: string;
  auditeurs: string;
  date: string;
  periode_couverte_debut?: string | null;
  periode_couverte_fin?: string | null;
  base_documentaire?: Omit<IBaseDocumentaireMGP, 'sort_order'>[];
  criteres?: Omit<ICritereMGP, 'sort_order'>[];
  points_forts?: string[];
  deficiences?: Omit<IDeficienceMGP, 'sort_order'>[];
  recommandations?: Omit<IRecommandationMGP, 'sort_order'>[];
  conclusion_globale?: ConclusionMGP;
  signature_auditeur?: string | null;
}

// =============================================================================
//  TYPE PRINCIPAL DATA COLLECTION
// =============================================================================

export interface IDataCollection {
  id: string;
  project_id: string;
  status: 'draft' | 'submitted';
  created_at: Date;
  updated_at: Date;
  submitted_at?: Date;
  revue_documentaire?: IRevueDocumentaire | null;
  inspection_terrain?: IInspectionTerrain | null;
  entretien_pp?: IEntretienPartiePrenante | null;
  evaluation_genre?: IEvaluationGenre | null;
  evaluation_mgp?: IEvaluationMGP | null;
}

export interface ICreateDataCollection {
  project_id: string;
  revue_documentaire?: ICreateRevueDocumentaire;
  inspection_terrain?: ICreateInspectionTerrain;
  entretien_pp?: ICreateEntretienPartiePrenante;
  evaluation_genre?: ICreateEvaluationGenre;
  evaluation_mgp?: ICreateEvaluationMGP;
}

// =============================================================================
//  DATA COLLECTION SERVICE
// =============================================================================

export class DataCollectionService extends BaseRepository {
  
  // =========================================================================
  //  CRUD PRINCIPAL
  // =========================================================================

  async create(data: ICreateDataCollection): Promise<IDataCollection> {
    const id = newId();

    await pool.query('START TRANSACTION');

    try {
      await pool.query(
        `INSERT INTO data_collection (id, project_id, status)
         VALUES (?, ?, 'draft')`,
        [id, data.project_id]
      );

      if (data.revue_documentaire) {
        await this._createRevueDocumentaire(id, data.revue_documentaire);
      }

      if (data.inspection_terrain) {
        await this._createInspectionTerrain(id, data.inspection_terrain);
      }

      if (data.entretien_pp) {
        await this._createEntretienPP(id, data.entretien_pp);
      }

      if (data.evaluation_genre) {
        await this._createEvaluationGenre(id, data.evaluation_genre);
      }

      if (data.evaluation_mgp) {
        await this._createEvaluationMGP(id, data.evaluation_mgp);
      }

      await pool.query('COMMIT');
      return (await this.getById(id))!;
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }

  async getById(id: string): Promise<IDataCollection | null> {
    const [rows] = await pool.query<any[]>(
      'SELECT * FROM data_collection WHERE id = ?',
      [id]
    );
    if (!rows.length) return null;

    const data = rows[0];

    const [revue, inspection, entretien, genre, mgp] = await Promise.all([
      this._getRevueDocumentaire(id),
      this._getInspectionTerrain(id),
      this._getEntretienPP(id),
      this._getEvaluationGenre(id),
      this._getEvaluationMGP(id)
    ]);

    return {
      id: data.id,
      project_id: data.project_id,
      status: data.status,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      submitted_at: data.submitted_at ? new Date(data.submitted_at) : undefined,
      revue_documentaire: revue,
      inspection_terrain: inspection,
      entretien_pp: entretien,
      evaluation_genre: genre,
      evaluation_mgp: mgp,
    };
  }

  async getAll(
    projectId?: string,
    status?: string,
    page = 1,
    limit = 10
  ): Promise<Paginated<IDataCollection>> {
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
      `SELECT * FROM data_collection WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const total = await this.countRows('data_collection', where, params);

    const items = await Promise.all(
      rows.map(async (r) => {
        const [revue, inspection, entretien, genre, mgp] = await Promise.all([
          this._getRevueDocumentaire(r.id),
          this._getInspectionTerrain(r.id),
          this._getEntretienPP(r.id),
          this._getEvaluationGenre(r.id),
          this._getEvaluationMGP(r.id)
        ]);
        return {
          id: r.id,
          project_id: r.project_id,
          status: r.status,
          created_at: new Date(r.created_at),
          updated_at: new Date(r.updated_at),
          submitted_at: r.submitted_at ? new Date(r.submitted_at) : undefined,
          revue_documentaire: revue,
          inspection_terrain: inspection,
          entretien_pp: entretien,
          evaluation_genre: genre,
          evaluation_mgp: mgp,
        };
      })
    );

    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async update(id: string, data: Partial<ICreateDataCollection>): Promise<IDataCollection | null> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Formulaire de collecte introuvable');
    if (existing.status === 'submitted') throw new Error('Impossible de modifier un formulaire soumis');

    await pool.query('START TRANSACTION');

    try {
      if (data.revue_documentaire !== undefined) {
        await this._deleteRevueDocumentaire(id);
        if (data.revue_documentaire) {
          await this._createRevueDocumentaire(id, data.revue_documentaire);
        }
      }

      if (data.inspection_terrain !== undefined) {
        await this._deleteInspectionTerrain(id);
        if (data.inspection_terrain) {
          await this._createInspectionTerrain(id, data.inspection_terrain);
        }
      }

      if (data.entretien_pp !== undefined) {
        await this._deleteEntretienPP(id);
        if (data.entretien_pp) {
          await this._createEntretienPP(id, data.entretien_pp);
        }
      }

      if (data.evaluation_genre !== undefined) {
        await this._deleteEvaluationGenre(id);
        if (data.evaluation_genre) {
          await this._createEvaluationGenre(id, data.evaluation_genre);
        }
      }

      if (data.evaluation_mgp !== undefined) {
        await this._deleteEvaluationMGP(id);
        if (data.evaluation_mgp) {
          await this._createEvaluationMGP(id, data.evaluation_mgp);
        }
      }

      await pool.query('COMMIT');
      return (await this.getById(id))!;
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }

  async submit(id: string): Promise<IDataCollection> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Formulaire de collecte introuvable');
    if (existing.status === 'submitted') throw new Error('Formulaire déjà soumis');

    await pool.query(
      `UPDATE data_collection 
       SET status = 'submitted', submitted_at = NOW(), updated_at = NOW() 
       WHERE id = ?`,
      [id]
    );

    return (await this.getById(id))!;
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.getById(id);
    if (!existing) return false;
    if (existing.status === 'submitted') throw new Error('Impossible de supprimer un formulaire soumis');

    await pool.query('START TRANSACTION');
    try {
      await this._deleteRevueDocumentaire(id);
      await this._deleteInspectionTerrain(id);
      await this._deleteEntretienPP(id);
      await this._deleteEvaluationGenre(id);
      await this._deleteEvaluationMGP(id);
      await pool.query('DELETE FROM data_collection WHERE id = ?', [id]);
      await pool.query('COMMIT');
      return true;
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }

  async getProjectSummary(projectId: string): Promise<{
    total: number;
    submitted: number;
    draft: number;
  }> {
    const [totalRows] = await pool.query<any[]>(
      'SELECT COUNT(*) AS total FROM data_collection WHERE project_id = ?',
      [projectId]
    );
    const [submittedRows] = await pool.query<any[]>(
      'SELECT COUNT(*) AS submitted FROM data_collection WHERE project_id = ? AND status = "submitted"',
      [projectId]
    );
    const total = Number(totalRows[0]?.total) || 0;
    const submitted = Number(submittedRows[0]?.submitted) || 0;

    return { total, submitted, draft: total - submitted };
  }

  // =========================================================================
  //  PRIVÉS - ANNEXE 1 : REVUE DOCUMENTAIRE
  // =========================================================================

  private async _createRevueDocumentaire(dcId: string, data: ICreateRevueDocumentaire) {
    const id = newId();
    await pool.query(
      `INSERT INTO data_collection_revue_doc
         (id, data_collection_id, subprojet, auditeurs, date, periode_couverte,
          documents_manquants, autres_documents, observations_generales)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, dcId, data.subprojet, data.auditeurs, data.date,
       data.periode_couverte ?? null, data.documents_manquants ?? null,
       data.autres_documents ?? null, data.observations_generales ?? null]
    );

    if (data.documents?.length) {
      for (const [i, doc] of data.documents.entries()) {
        await pool.query(
          `INSERT INTO data_collection_revue_doc_items
             (id, revue_doc_id, numero, categorie, document, objectif_examen, questions_cles,
              disponible, observations, conformite, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [newId(), id, doc.numero, doc.categorie, doc.document,
           doc.objectif_examen, doc.questions_cles, doc.disponible,
           doc.observations ?? null, doc.conformite, doc.sort_order ?? i]
        );
      }
    }
  }

  private async _getRevueDocumentaire(dcId: string): Promise<IRevueDocumentaire | null> {
    const [rows] = await pool.query<any[]>(
      'SELECT * FROM data_collection_revue_doc WHERE data_collection_id = ?',
      [dcId]
    );
    if (!rows.length) return null;

    const [items] = await pool.query<any[]>(
      'SELECT * FROM data_collection_revue_doc_items WHERE revue_doc_id = ? ORDER BY sort_order',
      [rows[0].id]
    );

    return {
      id: rows[0].id,
      data_collection_id: rows[0].data_collection_id,
      subprojet: rows[0].subprojet,
      auditeurs: rows[0].auditeurs,
      date: rows[0].date,
      periode_couverte: rows[0].periode_couverte ?? null,
      documents: items.map((i: any) => ({
        id: i.id,
        numero: i.numero,
        categorie: i.categorie,
        document: i.document,
        objectif_examen: i.objectif_examen,
        questions_cles: i.questions_cles,
        disponible: i.disponible,
        observations: i.observations ?? null,
        conformite: i.conformite,
        sort_order: i.sort_order,
      })),
      documents_manquants: rows[0].documents_manquants ?? null,
      autres_documents: rows[0].autres_documents ?? null,
      observations_generales: rows[0].observations_generales ?? null,
    };
  }

  private async _deleteRevueDocumentaire(dcId: string) {
    const [rows] = await pool.query<any[]>(
      'SELECT id FROM data_collection_revue_doc WHERE data_collection_id = ?',
      [dcId]
    );
    if (rows.length) {
      await pool.query('DELETE FROM data_collection_revue_doc_items WHERE revue_doc_id = ?', [rows[0].id]);
      await pool.query('DELETE FROM data_collection_revue_doc WHERE data_collection_id = ?', [dcId]);
    }
  }

  // =========================================================================
  //  PRIVÉS - ANNEXE 2 : INSPECTION TERRAIN
  // =========================================================================

  private async _createInspectionTerrain(dcId: string, data: ICreateInspectionTerrain) {
    const id = newId();
    await pool.query(
      `INSERT INTO data_collection_inspection
         (id, data_collection_id, subprojet, date, auditeurs, personnes_rencontrees,
          zones_inspectees, observations_generales)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, dcId, data.subprojet, data.date, data.auditeurs,
       data.personnes_rencontrees ?? null, stringify(data.zones_inspectees ?? []),
       data.observations_generales ?? null]
    );

    if (data.points_controle?.length) {
      for (const [i, pt] of data.points_controle.entries()) {
        await pool.query(
          `INSERT INTO data_collection_inspection_points
             (id, inspection_id, code, theme, intitule, statut, observations, photo_ref, criticite, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [newId(), id, pt.code, pt.theme, pt.intitule, pt.statut,
           pt.observations ?? null, pt.photo_ref ?? null, pt.criticite ?? null, pt.sort_order ?? i]
        );
      }
    }
  }

  private async _getInspectionTerrain(dcId: string): Promise<IInspectionTerrain | null> {
    const [rows] = await pool.query<any[]>(
      'SELECT * FROM data_collection_inspection WHERE data_collection_id = ?',
      [dcId]
    );
    if (!rows.length) return null;

    const [points] = await pool.query<any[]>(
      'SELECT * FROM data_collection_inspection_points WHERE inspection_id = ? ORDER BY sort_order',
      [rows[0].id]
    );

    return {
      id: rows[0].id,
      data_collection_id: rows[0].data_collection_id,
      subprojet: rows[0].subprojet,
      date: rows[0].date,
      auditeurs: rows[0].auditeurs,
      personnes_rencontrees: rows[0].personnes_rencontrees ?? null,
      zones_inspectees: parseJson(rows[0].zones_inspectees) ?? [],
      points_controle: points.map((p: any) => ({
        id: p.id,
        code: p.code,
        theme: p.theme,
        intitule: p.intitule,
        statut: p.statut,
        observations: p.observations ?? null,
        photo_ref: p.photo_ref ?? null,
        criticite: p.criticite ?? null,
        sort_order: p.sort_order,
      })),
      observations_generales: rows[0].observations_generales ?? null,
    };
  }

  private async _deleteInspectionTerrain(dcId: string) {
    const [rows] = await pool.query<any[]>(
      'SELECT id FROM data_collection_inspection WHERE data_collection_id = ?',
      [dcId]
    );
    if (rows.length) {
      await pool.query('DELETE FROM data_collection_inspection_points WHERE inspection_id = ?', [rows[0].id]);
      await pool.query('DELETE FROM data_collection_inspection WHERE data_collection_id = ?', [dcId]);
    }
  }

  // =========================================================================
  //  PRIVÉS - ANNEXE 3 : ENTRETIEN PARTIES PRENANTES
  // =========================================================================

  private async _createEntretienPP(dcId: string, data: ICreateEntretienPartiePrenante) {
    const id = newId();
    await pool.query(
      `INSERT INTO data_collection_entretien
         (id, data_collection_id, subprojet, date, lieu, heure_debut, heure_fin,
          type_partie_prenante, type_partie_detail, interlocuteurs, auditeurs,
          mode, taille_groupe, enregistre,
          consentement_participation, consentement_notes, consentement_enregistrement,
          confidentialite_expliquee, reponses, eval_qualite, eval_franchise,
          eval_pertinence, eval_climat, synthese_preoccupation_principale,
          synthese_suggestion_pertinente, synthese_element_surprenant,
          synthese_recommandation_prioritaire, actions_suivi)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, dcId, data.subprojet, data.date, data.lieu,
       data.heure_debut ?? null, data.heure_fin ?? null,
       data.type_partie_prenante, data.type_partie_detail ?? null,
       stringify(data.interlocuteurs ?? []), data.auditeurs,
       data.mode ?? 'individuel', data.taille_groupe ?? null, data.enregistre ? 1 : 0,
       data.consentement_participation ? 1 : 0, data.consentement_notes ? 1 : 0,
       data.consentement_enregistrement ? 1 : 0, data.confidentialite_expliquee ? 1 : 0,
       stringify(data.reponses ?? {}), data.eval_qualite ?? 3, data.eval_franchise ?? 3,
       data.eval_pertinence ?? 3, data.eval_climat ?? 3,
       data.synthese_preoccupation_principale ?? null,
       data.synthese_suggestion_pertinente ?? null,
       data.synthese_element_surprenant ?? null,
       data.synthese_recommandation_prioritaire ?? null,
       data.actions_suivi ?? null]
    );
  }

  private async _getEntretienPP(dcId: string): Promise<IEntretienPartiePrenante | null> {
    const [rows] = await pool.query<any[]>(
      'SELECT * FROM data_collection_entretien WHERE data_collection_id = ?',
      [dcId]
    );
    if (!rows.length) return null;

    const r = rows[0];
    return {
      id: r.id,
      data_collection_id: r.data_collection_id,
      subprojet: r.subprojet,
      date: r.date,
      lieu: r.lieu,
      heure_debut: r.heure_debut ?? null,
      heure_fin: r.heure_fin ?? null,
      type_partie_prenante: r.type_partie_prenante,
      type_partie_detail: r.type_partie_detail ?? null,
      interlocuteurs: parseJson(r.interlocuteurs) ?? [],
      auditeurs: r.auditeurs,
      mode: r.mode,
      taille_groupe: r.taille_groupe ?? null,
      enregistre: r.enregistre === 1,
      consentement_participation: r.consentement_participation === 1,
      consentement_notes: r.consentement_notes === 1,
      consentement_enregistrement: r.consentement_enregistrement === 1,
      confidentialite_expliquee: r.confidentialite_expliquee === 1,
      reponses: parseJson(r.reponses) ?? {},
      eval_qualite: r.eval_qualite,
      eval_franchise: r.eval_franchise,
      eval_pertinence: r.eval_pertinence,
      eval_climat: r.eval_climat,
      synthese_preoccupation_principale: r.synthese_preoccupation_principale ?? null,
      synthese_suggestion_pertinente: r.synthese_suggestion_pertinente ?? null,
      synthese_element_surprenant: r.synthese_element_surprenant ?? null,
      synthese_recommandation_prioritaire: r.synthese_recommandation_prioritaire ?? null,
      actions_suivi: r.actions_suivi ?? null,
    };
  }

  private async _deleteEntretienPP(dcId: string) {
    await pool.query('DELETE FROM data_collection_entretien WHERE data_collection_id = ?', [dcId]);
  }

  // =========================================================================
  //  PRIVÉS - ANNEXE 4 : ÉVALUATION GENRE
  // =========================================================================

  private async _createEvaluationGenre(dcId: string, data: ICreateEvaluationGenre) {
    const id = newId();
    await pool.query(
      `INSERT INTO data_collection_genre
         (id, data_collection_id, subprojet, auditeurs, date,
          score_global, forces_principales, deficiences_critiques, plan_suivi_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, dcId, data.subprojet, data.auditeurs, data.date,
       data.score_global ?? 'ameliorer', data.forces_principales ?? null,
       data.deficiences_critiques ?? null, stringify(data.plan_suivi_json ?? {})]
    );

    if (data.donnees_quantitatives?.length) {
      for (const [i, d] of data.donnees_quantitatives.entries()) {
        await pool.query(
          `INSERT INTO data_collection_genre_donnees
             (id, genre_id, categorie, femmes, hommes, autres, non_specifie, source_document, fiabilite, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [newId(), id, d.categorie, d.femmes ?? null, d.hommes ?? null,
           d.autres ?? null, d.non_specifie ?? null, d.source_document ?? null,
           d.fiabilite ?? 'moyenne', i]
        );
      }
    }

    if (data.impacts_differencies?.length) {
      for (const [i, imp] of data.impacts_differencies.entries()) {
        await pool.query(
          `INSERT INTO data_collection_genre_impacts
             (id, genre_id, type_impact, intitule, effets_femmes, effets_hommes,
              effets_groupes_vulnerables, gravite, opportunite_autonomisation, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [newId(), id, imp.type_impact, imp.intitule, imp.effets_femmes,
           imp.effets_hommes, imp.effets_groupes_vulnerables, imp.gravite ?? 'M',
           imp.opportunite_autonomisation ?? null, i]
        );
      }
    }

    if (data.recommandations?.length) {
      for (const [i, rec] of data.recommandations.entries()) {
        await pool.query(
          `INSERT INTO data_collection_genre_recs
             (id, genre_id, recommandation, priorite, portee, responsable, delai, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [newId(), id, rec.recommandation, rec.priorite, rec.portee,
           rec.responsable, rec.delai, i]
        );
      }
    }
  }

  private async _getEvaluationGenre(dcId: string): Promise<IEvaluationGenre | null> {
    const [rows] = await pool.query<any[]>(
      'SELECT * FROM data_collection_genre WHERE data_collection_id = ?',
      [dcId]
    );
    if (!rows.length) return null;

    const [donnees, impacts, recs] = await Promise.all([
      pool.query<any[]>('SELECT * FROM data_collection_genre_donnees WHERE genre_id = ? ORDER BY sort_order', [rows[0].id]),
      pool.query<any[]>('SELECT * FROM data_collection_genre_impacts WHERE genre_id = ? ORDER BY sort_order', [rows[0].id]),
      pool.query<any[]>('SELECT * FROM data_collection_genre_recs WHERE genre_id = ? ORDER BY sort_order', [rows[0].id])
    ]);

    const r = rows[0];
    return {
      id: r.id,
      data_collection_id: r.data_collection_id,
      subprojet: r.subprojet,
      auditeurs: r.auditeurs,
      date: r.date,
      score_global: r.score_global,
      forces_principales: r.forces_principales ?? null,
      deficiences_critiques: r.deficiences_critiques ?? null,
      donnees_quantitatives: donnees[0].map((d: any) => ({
        categorie: d.categorie,
        femmes: d.femmes,
        hommes: d.hommes,
        autres: d.autres,
        non_specifie: d.non_specifie,
        source_document: d.source_document ?? null,
        fiabilite: d.fiabilite,
      })),
      impacts_differencies: impacts[0].map((i: any) => ({
        type_impact: i.type_impact,
        intitule: i.intitule,
        effets_femmes: i.effets_femmes,
        effets_hommes: i.effets_hommes,
        effets_groupes_vulnerables: i.effets_groupes_vulnerables,
        gravite: i.gravite,
        opportunite_autonomisation: i.opportunite_autonomisation ?? null,
        sort_order: i.sort_order,
      })),
      recommandations: recs[0].map((r: any) => ({
        recommandation: r.recommandation,
        priorite: r.priorite,
        portee: r.portee,
        responsable: r.responsable,
        delai: r.delai,
        sort_order: r.sort_order,
      })),
      plan_suivi_json: parseJson(r.plan_suivi_json) ?? {},
    };
  }

  private async _deleteEvaluationGenre(dcId: string) {
    const [rows] = await pool.query<any[]>(
      'SELECT id FROM data_collection_genre WHERE data_collection_id = ?',
      [dcId]
    );
    if (rows.length) {
      await pool.query('DELETE FROM data_collection_genre_donnees WHERE genre_id = ?', [rows[0].id]);
      await pool.query('DELETE FROM data_collection_genre_impacts WHERE genre_id = ?', [rows[0].id]);
      await pool.query('DELETE FROM data_collection_genre_recs WHERE genre_id = ?', [rows[0].id]);
      await pool.query('DELETE FROM data_collection_genre WHERE data_collection_id = ?', [dcId]);
    }
  }

  // =========================================================================
  //  PRIVÉS - ANNEXE 5 : MÉCANISME DE PLAINTE (MGP)
  // =========================================================================

  private async _createEvaluationMGP(dcId: string, data: ICreateEvaluationMGP) {
    const id = newId();
    await pool.query(
      `INSERT INTO data_collection_mgp
         (id, data_collection_id, subprojet, auditeurs, date,
          periode_couverte_debut, periode_couverte_fin, conclusion_globale, signature_auditeur)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, dcId, data.subprojet, data.auditeurs, data.date,
       data.periode_couverte_debut ?? null, data.periode_couverte_fin ?? null,
       data.conclusion_globale ?? 'non_evalue', data.signature_auditeur ?? null]
    );

    if (data.base_documentaire?.length) {
      for (const [i, doc] of data.base_documentaire.entries()) {
        await pool.query(
          `INSERT INTO data_collection_mgp_base_docs (id, mgp_id, document, disponible, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
          [newId(), id, doc.document, doc.disponible ? 1 : 0, i]
        );
      }
    }

    if (data.criteres?.length) {
      for (const [i, c] of data.criteres.entries()) {
        await pool.query(
          `INSERT INTO data_collection_mgp_criteres
             (id, mgp_id, code, critere, point_verification, methode, constat, donnee_quantitative, evaluation, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [newId(), id, c.code, c.critere, c.point_verification,
           c.methode ?? null, c.constat ?? null, c.donnee_quantitative ?? null,
           c.evaluation ?? 'S.O.', i]
        );
      }
    }

    if (data.points_forts?.length) {
      for (const [i, pf] of data.points_forts.entries()) {
        await pool.query(
          `INSERT INTO data_collection_mgp_points_forts (id, mgp_id, point, sort_order) VALUES (?, ?, ?, ?)`,
          [newId(), id, pf, i]
        );
      }
    }

    if (data.deficiences?.length) {
      for (const [i, d] of data.deficiences.entries()) {
        await pool.query(
          `INSERT INTO data_collection_mgp_deficiences
             (id, mgp_id, deficience, consequence, gravite, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [newId(), id, d.deficience, d.consequence, d.gravite, i]
        );
      }
    }

    if (data.recommandations?.length) {
      for (const [i, r] of data.recommandations.entries()) {
        await pool.query(
          `INSERT INTO data_collection_mgp_recs
             (id, mgp_id, recommandation, priorite, responsable, delai, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [newId(), id, r.recommandation, r.priorite, r.responsable, r.delai, i]
        );
      }
    }
  }

  private async _getEvaluationMGP(dcId: string): Promise<IEvaluationMGP | null> {
    const [rows] = await pool.query<any[]>(
      'SELECT * FROM data_collection_mgp WHERE data_collection_id = ?',
      [dcId]
    );
    if (!rows.length) return null;

    const [baseDocs, criteres, pointsForts, deficiences, recs] = await Promise.all([
      pool.query<any[]>('SELECT * FROM data_collection_mgp_base_docs WHERE mgp_id = ? ORDER BY sort_order', [rows[0].id]),
      pool.query<any[]>('SELECT * FROM data_collection_mgp_criteres WHERE mgp_id = ? ORDER BY sort_order', [rows[0].id]),
      pool.query<any[]>('SELECT * FROM data_collection_mgp_points_forts WHERE mgp_id = ? ORDER BY sort_order', [rows[0].id]),
      pool.query<any[]>('SELECT * FROM data_collection_mgp_deficiences WHERE mgp_id = ? ORDER BY sort_order', [rows[0].id]),
      pool.query<any[]>('SELECT * FROM data_collection_mgp_recs WHERE mgp_id = ? ORDER BY sort_order', [rows[0].id])
    ]);

    const r = rows[0];
    return {
      id: r.id,
      data_collection_id: r.data_collection_id,
      subprojet: r.subprojet,
      auditeurs: r.auditeurs,
      date: r.date,
      periode_couverte_debut: r.periode_couverte_debut ?? null,
      periode_couverte_fin: r.periode_couverte_fin ?? null,
      base_documentaire: baseDocs[0].map((b: any) => ({
        document: b.document,
        disponible: b.disponible === 1,
        sort_order: b.sort_order,
      })),
      criteres: criteres[0].map((c: any) => ({
        code: c.code,
        critere: c.critere,
        point_verification: c.point_verification,
        methode: c.methode ?? null,
        constat: c.constat ?? null,
        donnee_quantitative: c.donnee_quantitative ?? null,
        evaluation: c.evaluation,
        sort_order: c.sort_order,
      })),
      points_forts: pointsForts[0].map((p: any) => p.point),
      deficiences: deficiences[0].map((d: any) => ({
        deficience: d.deficience,
        consequence: d.consequence,
        gravite: d.gravite,
        sort_order: d.sort_order,
      })),
      recommandations: recs[0].map((r: any) => ({
        recommandation: r.recommandation,
        priorite: r.priorite,
        responsable: r.responsable,
        delai: r.delai,
        sort_order: r.sort_order,
      })),
      conclusion_globale: r.conclusion_globale,
      signature_auditeur: r.signature_auditeur ?? null,
    };
  }

  private async _deleteEvaluationMGP(dcId: string) {
    const [rows] = await pool.query<any[]>(
      'SELECT id FROM data_collection_mgp WHERE data_collection_id = ?',
      [dcId]
    );
    if (rows.length) {
      await pool.query('DELETE FROM data_collection_mgp_base_docs WHERE mgp_id = ?', [rows[0].id]);
      await pool.query('DELETE FROM data_collection_mgp_criteres WHERE mgp_id = ?', [rows[0].id]);
      await pool.query('DELETE FROM data_collection_mgp_points_forts WHERE mgp_id = ?', [rows[0].id]);
      await pool.query('DELETE FROM data_collection_mgp_deficiences WHERE mgp_id = ?', [rows[0].id]);
      await pool.query('DELETE FROM data_collection_mgp_recs WHERE mgp_id = ?', [rows[0].id]);
      await pool.query('DELETE FROM data_collection_mgp WHERE data_collection_id = ?', [dcId]);
    }
  }
}