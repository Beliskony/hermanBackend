// models/GenderAudit.ts
import { Schema, model, Document } from 'mongoose';

export interface IGenderAudit extends Document {
  // Section 1 : Préparation et Cadrage
  objectifs: Array<{
    objectif: string;
    specificite: string;
    indicateurSucces: string;
    statut: 'defini' | 'a_preciser';
  }>;
  
  // Section 2 : Collecte de Données Genre
  donneesQuantitatives: Array<{
    donnee: string;
    femmes: number;
    hommes: number;
    autres: number;
    nonSpecifie: number;
    source: string;
    fiabilite: 'haute' | 'moyenne' | 'faible';
  }>;
  disponibiliteDonnees: 'excellente' | 'partielle' | 'insuffisante' | 'absente';
  
  consultationsSpecifiques: Array<{
    groupe: string;
    sessions: number;
    participants: number;
    methode: 'focus_group' | 'entretiens' | 'autre';
    personnesVulnerablesIncluses: boolean;
    details?: string;
  }>;
  
  analyseContextuelle: Array<{
    elementAnalyse: string;
    sources: string;
    constatsCles: string;
    influenceProjet: string;
  }>;
  
  // Section 3 : Analyse des Impacts Différenciés
  impactsEnvironnementaux: Array<{
    impact: string;
    effetsFemmes: string;
    effetsHommes: string;
    effetsGroupesVulnerables: string;
    gravite: 'H' | 'M' | 'L';
  }>;
  
  impactsSocioEconomiques: Array<{
    impact: string;
    effetsFemmes: string;
    effetsHommes: string;
    effetsGroupesVulnerables: string;
    opportuniteAutonomisation: boolean;
    details?: string;
  }>;
  
  vulnerabilites: Array<{
    vulnerabilite: string;
    groupeTouche: string;
    lienProjet: string;
    mesureAtténuation: string;
  }>;
  
  // Section 4 : Évaluation des Processus et Pratiques
  participationInclusive: Array<{
    critere: string;
    evaluation: 'excellent' | 'satisfaisant' | 'insuffisant' | 'absent';
    preuve: string;
    recommendation: string;
  }>;
  
  mesuresAtténuation: Array<{
    mesure: string;
    miseEnOeuvre: 'complete' | 'partielle' | 'symbolique' | 'absente';
    efficacite: 'efficace' | 'limitee' | 'nulle';
    suiviEvalue: boolean;
    details?: string;
  }>;
  
  sensibilisationPersonnel: {
    formationObligatoire: '100_forme' | 'plus50_forme' | 'moins50_forme' | 'aucune';
    niveauHierarchiqueTouche: string;
    evaluationApprentissage: 'applique' | 'connaissance_theorique' | 'non_acquis';
    pointFocalIdentifie: 'oui_actif' | 'oui_peu_actif' | 'non';
    ressourcesAllouees: string;
    integrationProcedures: 'systematique' | 'ponctuelle' | 'absente';
    exemplesIntegration: string;
    indicateursGenreSuivi: 'definis_suivis' | 'definis_non_suivis' | 'absents';
    typesIndicateurs: string;
  };
  
  // Section 5 : Synthèse et Recommandations
  evaluationGlobale: {
    score: 'exemplaire' | 'satisfaisant' | 'a_ameliorer' | 'insuffisant' | 'preoccupant';
    forces: string[];
    deficiences: string[];
  };
  
  recommendations: Array<{
    recommendation: string;
    priorite: 'haute' | 'moyenne' | 'basse';
    portee: 'structurel' | 'operationnel' | 'pedagogique';
    responsable: string;
    delai: string;
  }>;
  
  planSuivi: {
    indicateursCles: string;
    pointFocal: string;
    revueTrimestrielle: boolean;
    mecanismeRedevabilite: string;
    budgetGenre: string;
  };
  
  projet: string;
  auditeurs: string[];
  date: Date;
  validation: 'complete' | 'partielle' | 'a_finaliser';
  createdAt: Date;
  updatedAt: Date;
}

const GenderAuditSchema = new Schema<IGenderAudit>({
  objectifs: [{
    objectif: String,
    specificite: String,
    indicateurSucces: String,
    statut: { type: String, enum: ['defini', 'a_preciser'] }
  }],
  donneesQuantitatives: [{
    donnee: String,
    femmes: Number,
    hommes: Number,
    autres: Number,
    nonSpecifie: Number,
    source: String,
    fiabilite: { type: String, enum: ['haute', 'moyenne', 'faible'] }
  }],
  disponibiliteDonnees: { 
    type: String, 
    enum: ['excellente', 'partielle', 'insuffisante', 'absente'] 
  },
  consultationsSpecifiques: [{
    groupe: String,
    sessions: Number,
    participants: Number,
    methode: { type: String, enum: ['focus_group', 'entretiens', 'autre'] },
    personnesVulnerablesIncluses: Boolean,
    details: String
  }],
  analyseContextuelle: [{
    elementAnalyse: String,
    sources: String,
    constatsCles: String,
    influenceProjet: String
  }],
  impactsEnvironnementaux: [{
    impact: String,
    effetsFemmes: String,
    effetsHommes: String,
    effetsGroupesVulnerables: String,
    gravite: { type: String, enum: ['H', 'M', 'L'] }
  }],
  impactsSocioEconomiques: [{
    impact: String,
    effetsFemmes: String,
    effetsHommes: String,
    effetsGroupesVulnerables: String,
    opportuniteAutonomisation: Boolean,
    details: String
  }],
  vulnerabilites: [{
    vulnerabilite: String,
    groupeTouche: String,
    lienProjet: String,
    mesureAtténuation: String
  }],
  participationInclusive: [{
    critere: String,
    evaluation: { type: String, enum: ['excellent', 'satisfaisant', 'insuffisant', 'absent'] },
    preuve: String,
    recommendation: String
  }],
  mesuresAtténuation: [{
    mesure: String,
    miseEnOeuvre: { type: String, enum: ['complete', 'partielle', 'symbolique', 'absente'] },
    efficacite: { type: String, enum: ['efficace', 'limitee', 'nulle'] },
    suiviEvalue: Boolean,
    details: String
  }],
  sensibilisationPersonnel: {
    formationObligatoire: { 
      type: String, 
      enum: ['100_forme', 'plus50_forme', 'moins50_forme', 'aucune'] 
    },
    niveauHierarchiqueTouche: String,
    evaluationApprentissage: { 
      type: String, 
      enum: ['applique', 'connaissance_theorique', 'non_acquis'] 
    },
    pointFocalIdentifie: { 
      type: String, 
      enum: ['oui_actif', 'oui_peu_actif', 'non'] 
    },
    ressourcesAllouees: String,
    integrationProcedures: { 
      type: String, 
      enum: ['systematique', 'ponctuelle', 'absente'] 
    },
    exemplesIntegration: String,
    indicateursGenreSuivi: { 
      type: String, 
      enum: ['definis_suivis', 'definis_non_suivis', 'absents'] 
    },
    typesIndicateurs: String
  },
  evaluationGlobale: {
    score: { 
      type: String, 
      enum: ['exemplaire', 'satisfaisant', 'a_ameliorer', 'insuffisant', 'preoccupant'] 
    },
    forces: [String],
    deficiences: [String]
  },
  recommendations: [{
    recommendation: String,
    priorite: { type: String, enum: ['haute', 'moyenne', 'basse'] },
    portee: { type: String, enum: ['structurel', 'operationnel', 'pedagogique'] },
    responsable: String,
    delai: String
  }],
  planSuivi: {
    indicateursCles: String,
    pointFocal: String,
    revueTrimestrielle: Boolean,
    mecanismeRedevabilite: String,
    budgetGenre: String
  },
  projet: String,
  auditeurs: [String],
  date: { type: Date, default: Date.now },
  validation: { type: String, enum: ['complete', 'partielle', 'a_finaliser'] }
}, { timestamps: true });

export const GenderAudit = model<IGenderAudit>('GenderAudit', GenderAuditSchema);