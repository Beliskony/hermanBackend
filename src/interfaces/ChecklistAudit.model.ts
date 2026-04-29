import { Schema, Document, model } from 'mongoose';

// ─── TYPES ───────────────────────────────────────────────────
export type Conformite = 'O' | 'N' | 'P' | 'S.O.';

// Ligne de critère standard (sections 1 à 5)
interface CritereItem {
  numero: string;           // ex: "1.1", "2.2.3"
  critere: string;
  sourcesMethode: string;
  conformite: Conformite;
  observations: string;
  risqueNonConformite: string;
}

// Ligne du bilan documentaire (section 6)
interface DocumentItem {
  numero: string;           // ex: "6.1"
  document: string;
  disponible: Conformite;
  commentaires: string;
}

// ─── INTERFACE CHECKLIST AUDIT ────────────────────────────────
export interface IChecklistAudit extends Document {
  subprojet: string;
  auditeurs: string;
  date: Date;

  // SECTION 1 : Cadre juridique, administratif et foncier
  section1_cadreJuridique: CritereItem[];

  // SECTION 2 : Conception, structure et sécurité des infrastructures
  section2_infraSecurite: {
    stabiliteStructure: CritereItem[];
    securiteIncendie: CritereItem[];
    accessibilitePMR: CritereItem[];
  };

  // SECTION 3 : Gestion environnementale et sociale du chantier
  section3_gestionEnvSociale: {
    gestionDechets: CritereItem[];
    nuisancesPollution: CritereItem[];
    santeSecuteTravailleurs: CritereItem[];
  };

  // SECTION 4 : Gestion sociale et parties prenantes
  section4_gestionSociale: {
    relationsCommunautes: CritereItem[];
    mgp: CritereItem[];
  };

  // SECTION 5 : Analyse des risques liés au futur ERP
  section5_risquesERP: {
    securiteSurete: CritereItem[];
    hygieneEnvironnement: CritereItem[];
  };

  // SECTION 6 : Bilan documentaire
  section6_bilanDocumentaire: DocumentItem[];

  // Synthèse
  synthese: {
    nombreNonConformitesMajeures: number;
    domainesCritiques: string;
    signatureAuditeur: string;
  };
}

// ─── INTERFACE CHECKLIST N°29 CONDUCTEUR DES TRAVAUX ─────────
export type ReponseOuiNon = 'oui' | 'non' | 'partiellement' | 'nsp' | 'sans_objet';

interface QuestionConducteur {
  numero: string;
  question: string;
  reponse: string;            // texte libre ou valeur enum
  reponseBooleenne?: ReponseOuiNon;
  observations?: string;
}

export interface IChecklistConducteurTravaux extends Document {
  subprojet: string;
  auditeur: string;
  date: Date;
  personneRencontree: string;
  fonction: string;
  entreprise: string;
  contact: string;
  dureeEntretien: string;
  lieu: string;

  // SECTION 1 : Informations générales et rôle
  section1_infoGenerales: QuestionConducteur[];

  // SECTION 2 : Processus environnemental et social initial (T1)
  section2_processusInitialT1: QuestionConducteur[];

  // SECTION 3 : Installation et organisation du chantier (T2)
  section3_installationT2: QuestionConducteur[];

  // SECTION 4 : Recrutement et conditions de travail (T2)
  section4_recrutementT2: QuestionConducteur[];

  // SECTION 5 : Santé et sécurité au travail HSE (T2)
  section5_hseT2: QuestionConducteur[];

  // SECTION 6 : Gestion environnementale du chantier (T2)
  section6_gestionEnvT2: QuestionConducteur[];

  // SECTION 7 : Campagnes de sensibilisation IST/MST VIH/SIDA (T2)
  section7_sensibilisationT2: QuestionConducteur[];

  // SECTION 8 : Mécanisme de gestion des plaintes MGP (T2)
  section8_mgpT2: QuestionConducteur[];

  // SECTION 9 : Fermeture et repli du chantier (T2)
  section9_fermetureT2: QuestionConducteur[];

  // SECTION 10 : Exploitation actuelle et retour d'expérience (T3)
  section10_exploitationT3: QuestionConducteur[];

  // SECTION 11 : Synthèse et recommandations
  section11_synthese: QuestionConducteur[];

  commentairesLibres?: string;
  signatureAuditeur?: string;
}

// ─── SCHEMAS ─────────────────────────────────────────────────

const CritereItemSchema = new Schema({
  numero:              { type: String, required: true },
  critere:             { type: String, required: true },
  sourcesMethode:      { type: String, default: '' },
  conformite:          { type: String, enum: ['O', 'N', 'P', 'S.O.'], default: 'S.O.' },
  observations:        { type: String, default: '' },
  risqueNonConformite: { type: String, default: '' }
}, { _id: false });

const DocumentItemSchema = new Schema({
  numero:       { type: String, required: true },
  document:     { type: String, required: true },
  disponible:   { type: String, enum: ['O', 'N', 'P', 'S.O.'], default: 'S.O.' },
  commentaires: { type: String, default: '' }
}, { _id: false });

const ChecklistAuditSchema = new Schema<IChecklistAudit>({
  subprojet: { type: String, required: true },
  auditeurs: { type: String, required: true },
  date:      { type: Date, required: true },

  section1_cadreJuridique: [CritereItemSchema],

  section2_infraSecurite: {
    stabiliteStructure: [CritereItemSchema],
    securiteIncendie:   [CritereItemSchema],
    accessibilitePMR:   [CritereItemSchema]
  },

  section3_gestionEnvSociale: {
    gestionDechets:           [CritereItemSchema],
    nuisancesPollution:       [CritereItemSchema],
    santeSecuteTravailleurs:  [CritereItemSchema]
  },

  section4_gestionSociale: {
    relationsCommunautes: [CritereItemSchema],
    mgp:                  [CritereItemSchema]
  },

  section5_risquesERP: {
    securiteSurete:       [CritereItemSchema],
    hygieneEnvironnement: [CritereItemSchema]
  },

  section6_bilanDocumentaire: [DocumentItemSchema],

  synthese: {
    nombreNonConformitesMajeures: { type: Number, default: 0 },
    domainesCritiques:            { type: String, default: '' },
    signatureAuditeur:            { type: String, default: '' }
  }
}, { timestamps: true });

// ─────────────────────────────────────────────────────────────

const QuestionConducteurSchema = new Schema({
  numero:           { type: String, required: true },
  question:         { type: String, required: true },
  reponse:          { type: String, default: '' },
  reponseBooleenne: { type: String, enum: ['oui', 'non', 'partiellement', 'nsp', 'sans_objet'] },
  observations:     { type: String, default: '' }
}, { _id: false });

const ChecklistConducteurTravauxSchema = new Schema<IChecklistConducteurTravaux>({
  subprojet:          { type: String, required: true },
  auditeur:           { type: String, required: true },
  date:               { type: Date, required: true },
  personneRencontree: { type: String, required: true },
  fonction:           { type: String, required: true },
  entreprise:         { type: String, required: true },
  contact:            { type: String, default: '' },
  dureeEntretien:     { type: String, default: '' },
  lieu:               { type: String, required: true },

  section1_infoGenerales:     [QuestionConducteurSchema],
  section2_processusInitialT1:[QuestionConducteurSchema],
  section3_installationT2:    [QuestionConducteurSchema],
  section4_recrutementT2:     [QuestionConducteurSchema],
  section5_hseT2:             [QuestionConducteurSchema],
  section6_gestionEnvT2:      [QuestionConducteurSchema],
  section7_sensibilisationT2: [QuestionConducteurSchema],
  section8_mgpT2:             [QuestionConducteurSchema],
  section9_fermetureT2:       [QuestionConducteurSchema],
  section10_exploitationT3:   [QuestionConducteurSchema],
  section11_synthese:         [QuestionConducteurSchema],

  commentairesLibres: { type: String, default: '' },
  signatureAuditeur:  { type: String, default: '' }
}, { timestamps: true });

// Index
ChecklistAuditSchema.index({ subprojet: 1 });
ChecklistAuditSchema.index({ date: -1 });
ChecklistConducteurTravauxSchema.index({ subprojet: 1 });
ChecklistConducteurTravauxSchema.index({ entreprise: 1 });
ChecklistConducteurTravauxSchema.index({ date: -1 });

// ─── MODELS ──────────────────────────────────────────────────
export const ChecklistAudit = model<IChecklistAudit>(
  'ChecklistAudit',
  ChecklistAuditSchema
);

export const ChecklistConducteurTravaux = model<IChecklistConducteurTravaux>(
  'ChecklistConducteurTravaux',
  ChecklistConducteurTravauxSchema
);

export { ChecklistAuditSchema, ChecklistConducteurTravauxSchema };
