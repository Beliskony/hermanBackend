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
  
  /**
   * Créer une collecte complète (utilise sp_create_data_collection)
   */
/**
 * Créer une collecte complète (utilise sp_create_data_collection)
 */
async create(data: ICreateDataCollection): Promise<IDataCollection> {
    const id = newId();
    
    // 🔥 CORRECTION : Inclure TOUS les tableaux dans les JSON
    const revueDocJson = data.revue_documentaire ? JSON.stringify({
        subprojet: data.revue_documentaire.subprojet,
        auditeurs: data.revue_documentaire.auditeurs,
        date: data.revue_documentaire.date,
        periode_couverte: data.revue_documentaire.periode_couverte,
        documents: data.revue_documentaire.documents || [],           //AJOUTÉ
        documents_manquants: data.revue_documentaire.documents_manquants,
        autres_documents: data.revue_documentaire.autres_documents,
        observations_generales: data.revue_documentaire.observations_generales
    }) : null;
    
    const inspectionJson = data.inspection_terrain ? JSON.stringify({
        subprojet: data.inspection_terrain.subprojet,
        date: data.inspection_terrain.date,
        auditeurs: data.inspection_terrain.auditeurs,
        personnes_rencontrees: data.inspection_terrain.personnes_rencontrees,
        zones_inspectees: data.inspection_terrain.zones_inspectees || [],
        points_controle: data.inspection_terrain.points_controle || [], //AJOUTÉ
        observations_generales: data.inspection_terrain.observations_generales
    }) : null;
    
    const entretienJson = data.entretien_pp ? JSON.stringify({
        subprojet: data.entretien_pp.subprojet,
        date: data.entretien_pp.date,
        lieu: data.entretien_pp.lieu,
        type_partie_prenante: data.entretien_pp.type_partie_prenante,
        auditeurs: data.entretien_pp.auditeurs,
        mode: data.entretien_pp.mode ?? 'individuel',
        interlocuteurs: data.entretien_pp.interlocuteurs || [],        //AJOUTÉ
        reponses: data.entretien_pp.reponses || {},                    //AJOUTÉ
        eval_qualite: data.entretien_pp.eval_qualite ?? 3,
        eval_franchise: data.entretien_pp.eval_franchise ?? 3,
        eval_pertinence: data.entretien_pp.eval_pertinence ?? 3,
        eval_climat: data.entretien_pp.eval_climat ?? 3
    }) : null;
    
    const genreJson = data.evaluation_genre ? JSON.stringify({
        subprojet: data.evaluation_genre.subprojet,
        auditeurs: data.evaluation_genre.auditeurs,
        date: data.evaluation_genre.date,
        score_global: data.evaluation_genre.score_global ?? 'ameliorer',
        forces_principales: data.evaluation_genre.forces_principales,
        deficiences_critiques: data.evaluation_genre.deficiences_critiques,
        donnees_quantitatives: data.evaluation_genre.donnees_quantitatives || [],   //AJOUTÉ
        impacts_differencies: data.evaluation_genre.impacts_differencies || [],     //AJOUTÉ
        recommandations: data.evaluation_genre.recommandations || []                //AJOUTÉ
    }) : null;
    
    const mgpJson = data.evaluation_mgp ? JSON.stringify({
        subprojet: data.evaluation_mgp.subprojet,
        auditeurs: data.evaluation_mgp.auditeurs,
        date: data.evaluation_mgp.date,
        periode_couverte_debut: data.evaluation_mgp.periode_couverte_debut,
        periode_couverte_fin: data.evaluation_mgp.periode_couverte_fin,
        base_documentaire: data.evaluation_mgp.base_documentaire || [],   //AJOUTÉ
        criteres: data.evaluation_mgp.criteres || [],                     //AJOUTÉ
        points_forts: data.evaluation_mgp.points_forts || [],             //AJOUTÉ
        deficiences: data.evaluation_mgp.deficiences || [],               //AJOUTÉ
        recommandations: data.evaluation_mgp.recommandations || [],       //AJOUTÉ
        conclusion_globale: data.evaluation_mgp.conclusion_globale ?? 'non_evalue',
        signature_auditeur: data.evaluation_mgp.signature_auditeur
    }) : null;
    
    const [results] = await pool.query<any[]>(
        'CALL sp_create_data_collection(?, ?, ?, ?, ?, ?, ?)',
        [id, data.project_id, revueDocJson, inspectionJson, entretienJson, genreJson, mgpJson]
    );
    
    const result = this._formatProcedureResult(results);
    if (!result) {
        throw new Error(`Erreur lors de la création de la collecte ${id}`);
    }
    return result;
}

  /**
   * Récupérer une collecte complète (utilise sp_get_data_collection_complet)
   */
  async getById(id: string): Promise<IDataCollection | null> {
    const [results] = await pool.query<any[]>(
      'CALL sp_get_data_collection_complet(?)',
      [id]
    );
    
    if (!results || !results[0] || results[0].length === 0) {
      return null;
    }
    
    return this._formatProcedureResult(results);
  }

  /**
   * Mettre à jour une collecte (supprime et recrée les annexes)
   */
  async update(id: string, data: Partial<ICreateDataCollection>): Promise<IDataCollection | null> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Formulaire de collecte introuvable');
    if (existing.status === 'submitted') throw new Error('Impossible de modifier un formulaire soumis');

    // Pour la mise à jour, on récupère l'existant et on fusionne
    const mergedData: ICreateDataCollection = {
      project_id: existing.project_id,
      revue_documentaire: data.revue_documentaire ?? existing.revue_documentaire ?? undefined,
      inspection_terrain: data.inspection_terrain ?? existing.inspection_terrain ?? undefined,
      entretien_pp: data.entretien_pp ?? existing.entretien_pp ?? undefined,
      evaluation_genre: data.evaluation_genre ?? existing.evaluation_genre ?? undefined,
      evaluation_mgp: data.evaluation_mgp ?? existing.evaluation_mgp ?? undefined,
    };
    
    // Supprimer l'ancienne collecte
    await this._deleteCompleteCollection(id);
    
    // Recréer avec les nouvelles données
    return this.create(mergedData);
  }

  /**
   * Lister toutes les collectes d'un projet
   */
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
        const [results] = await pool.query<any[]>(
          'CALL sp_get_data_collection_complet(?)',
          [r.id]
        );
        return this._formatProcedureResult(results);
      })
    );

    return {
      items: items.filter(i => i !== null),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Supprimer une collecte
   */
  async delete(id: string): Promise<boolean> {
    const existing = await this.getById(id);
    if (!existing) return false;
    if (existing.status === 'submitted') throw new Error('Impossible de supprimer un formulaire soumis');

    await this._deleteCompleteCollection(id);
    await pool.query('DELETE FROM data_collection WHERE id = ?', [id]);
    return true;
  }

  /**
   * Récupérer le résumé d'un projet
   */
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
  //  MÉTHODES PRIVÉES
  // =========================================================================

  /**
   * Formate le résultat d'une procédure (6 jeux de résultats)
   */
  private _formatProcedureResult(results: any[]): IDataCollection | null {
    if (!results || !results[0] || results[0].length === 0) {
      return null;
    }
    
    const header = results[0][0];
    const revueDoc = results[1]?.[0] || null;
    const inspection = results[2]?.[0] || null;
    const entretien = results[3]?.[0] || null;
    const genre = results[4]?.[0] || null;
    const mgp = results[5]?.[0] || null;
    
    return {
      id: header.id,
      project_id: header.project_id,
      status: header.status,
      created_at: new Date(header.created_at),
      updated_at: new Date(header.updated_at),
      submitted_at: header.submitted_at ? new Date(header.submitted_at) : undefined,
      
      revue_documentaire: revueDoc ? {
        id: revueDoc.revue_doc_id,
        data_collection_id: header.id,
        subprojet: revueDoc.subprojet,
        auditeurs: revueDoc.auditeurs,
        date: revueDoc.date,
        periode_couverte: revueDoc.periode_couverte ?? null,
        documents: revueDoc.documents ? JSON.parse(revueDoc.documents) : [],
        documents_manquants: revueDoc.documents_manquants ?? null,
        autres_documents: revueDoc.autres_documents ?? null,
        observations_generales: revueDoc.observations_generales ?? null,
      } : null,
      
      inspection_terrain: inspection ? {
        id: inspection.inspection_id,
        data_collection_id: header.id,
        subprojet: inspection.subprojet,
        date: inspection.date,
        auditeurs: inspection.auditeurs,
        personnes_rencontrees: inspection.personnes_rencontrees ?? null,
        zones_inspectees: inspection.zones_inspectees ? JSON.parse(inspection.zones_inspectees) : [],
        points_controle: inspection.points_controle ? JSON.parse(inspection.points_controle) : [],
        observations_generales: inspection.observations_generales ?? null,
      } : null,
      
      entretien_pp: entretien ? {
        id: entretien.entretien_id,
        data_collection_id: header.id,
        subprojet: entretien.subprojet,
        date: entretien.date,
        lieu: entretien.lieu,
        heure_debut: null,
        heure_fin: null,
        type_partie_prenante: entretien.type_partie_prenante,
        type_partie_detail: null,
        interlocuteurs: [],
        auditeurs: entretien.auditeurs,
        mode: entretien.mode,
        taille_groupe: null,
        enregistre: false,
        consentement_participation: false,
        consentement_notes: false,
        consentement_enregistrement: false,
        confidentialite_expliquee: false,
        reponses: entretien.reponses ? JSON.parse(entretien.reponses) : {},
        eval_qualite: entretien.eval_qualite,
        eval_franchise: entretien.eval_franchise,
        eval_pertinence: entretien.eval_pertinence,
        eval_climat: entretien.eval_climat,
        synthese_preoccupation_principale: entretien.synthese_preoccupation_principale ?? null,
        synthese_suggestion_pertinente: entretien.synthese_suggestion_pertinente ?? null,
        synthese_element_surprenant: entretien.synthese_element_surprenant ?? null,
        synthese_recommandation_prioritaire: entretien.synthese_recommandation_prioritaire ?? null,
        actions_suivi: entretien.actions_suivi ?? null,
      } : null,
      
      evaluation_genre: genre ? {
        id: genre.genre_id,
        data_collection_id: header.id,
        subprojet: genre.subprojet,
        auditeurs: genre.auditeurs,
        date: genre.date,
        score_global: genre.score_global,
        forces_principales: genre.forces_principales ?? null,
        deficiences_critiques: genre.deficiences_critiques ?? null,
        donnees_quantitatives: genre.donnees_quantitatives ? JSON.parse(genre.donnees_quantitatives) : [],
        impacts_differencies: genre.impacts_differencies ? JSON.parse(genre.impacts_differencies) : [],
        recommandations: genre.recommandations ? JSON.parse(genre.recommandations) : [],
        plan_suivi_json: {},
      } : null,
      
      evaluation_mgp: mgp ? {
        id: mgp.mgp_id,
        data_collection_id: header.id,
        subprojet: mgp.subprojet,
        auditeurs: mgp.auditeurs,
        date: mgp.date,
        periode_couverte_debut: mgp.periode_couverte_debut ?? null,
        periode_couverte_fin: mgp.periode_couverte_fin ?? null,
        base_documentaire: mgp.base_documentaire ? JSON.parse(mgp.base_documentaire) : [],
        criteres: mgp.criteres ? JSON.parse(mgp.criteres) : [],
        points_forts: mgp.points_forts ? JSON.parse(mgp.points_forts).map((p: any) => p.point) : [],
        deficiences: mgp.deficiences ? JSON.parse(mgp.deficiences) : [],
        recommandations: mgp.recommandations ? JSON.parse(mgp.recommandations) : [],
        conclusion_globale: mgp.conclusion_globale,
        signature_auditeur: mgp.signature_auditeur ?? null,
      } : null,
    };
  }

  /**
   * Supprimer toutes les annexes d'une collecte
   */
  private async _deleteCompleteCollection(collectionId: string): Promise<void> {
    // Récupérer les IDs des annexes
    const [revueRows] = await pool.query<any[]>(
      'SELECT id FROM data_collection_revue_doc WHERE data_collection_id = ?',
      [collectionId]
    );
    const [inspectionRows] = await pool.query<any[]>(
      'SELECT id FROM data_collection_inspection WHERE data_collection_id = ?',
      [collectionId]
    );
    const [genreRows] = await pool.query<any[]>(
      'SELECT id FROM data_collection_genre WHERE data_collection_id = ?',
      [collectionId]
    );
    const [mgpRows] = await pool.query<any[]>(
      'SELECT id FROM data_collection_mgp WHERE data_collection_id = ?',
      [collectionId]
    );
    
    // Supprimer les items enfants
    if (revueRows[0]) {
      await pool.query('DELETE FROM data_collection_revue_doc_items WHERE revue_doc_id = ?', [revueRows[0].id]);
      await pool.query('DELETE FROM data_collection_revue_doc WHERE id = ?', [revueRows[0].id]);
    }
    
    if (inspectionRows[0]) {
      await pool.query('DELETE FROM data_collection_inspection_points WHERE inspection_id = ?', [inspectionRows[0].id]);
      await pool.query('DELETE FROM data_collection_inspection WHERE id = ?', [inspectionRows[0].id]);
    }
    
    await pool.query('DELETE FROM data_collection_entretien WHERE data_collection_id = ?', [collectionId]);
    
    if (genreRows[0]) {
      await pool.query('DELETE FROM data_collection_genre_donnees WHERE genre_id = ?', [genreRows[0].id]);
      await pool.query('DELETE FROM data_collection_genre_impacts WHERE genre_id = ?', [genreRows[0].id]);
      await pool.query('DELETE FROM data_collection_genre_recs WHERE genre_id = ?', [genreRows[0].id]);
      await pool.query('DELETE FROM data_collection_genre WHERE id = ?', [genreRows[0].id]);
    }
    
    if (mgpRows[0]) {
      await pool.query('DELETE FROM data_collection_mgp_base_docs WHERE mgp_id = ?', [mgpRows[0].id]);
      await pool.query('DELETE FROM data_collection_mgp_criteres WHERE mgp_id = ?', [mgpRows[0].id]);
      await pool.query('DELETE FROM data_collection_mgp_points_forts WHERE mgp_id = ?', [mgpRows[0].id]);
      await pool.query('DELETE FROM data_collection_mgp_deficiences WHERE mgp_id = ?', [mgpRows[0].id]);
      await pool.query('DELETE FROM data_collection_mgp_recs WHERE mgp_id = ?', [mgpRows[0].id]);
      await pool.query('DELETE FROM data_collection_mgp WHERE id = ?', [mgpRows[0].id]);
    }
  }
}

export const dataCollectionService = new DataCollectionService();