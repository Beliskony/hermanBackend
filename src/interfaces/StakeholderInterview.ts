import { Schema, model, Document } from 'mongoose';

export interface IStakeholderInterview extends Document {
  // Partie 1 : Identification
  date: Date;
  heureDebut: Date;
  heureFin: Date;
  lieu: string;
  typePartiePrenante: {
    communauteLocale: boolean;
    employe: boolean;
    autoriteLocale: boolean;
    ong: boolean;
    fournisseur: boolean;
    autre?: string;
  };
  profilInterlocuteur: {
    nom?: string;
    fonction?: string;
    genre: 'F' | 'H';
    ageEstime: '-35' | '35-60' | '60+';
  };
  auditeurs: string[];
  
  // Partie 1 : Introduction
  introduction: {
    accueilRealise: boolean;
    raisonVisiteExpliquee: boolean;
    independancePrecisee: boolean;
    remerciementsExprimes: boolean;
    objectifEnonce: boolean;
  };
  cadrageEthique: {
    confidentialiteAcceptee: boolean;
    priseNotesAcceptee: boolean;
    enregistrementAccepte: boolean;
    dureeEstimeeAcceptee: boolean;
    questionsPossiblesAcceptees: boolean;
  };
  climatInitial: 'detendu' | 'reserve' | 'nerveux' | 'impatient' | 'autre';
  
  // Partie 2 : Questions thématiques
  theme1: {
    q1_1: string;
    q1_2: string;
    q1_3: string;
    evaluationFranchise: 'tres_franc' | 'moderement_franc' | 'reserve';
  };
  theme2: {
    q2_1: string;
    q2_2: string;
    q2_3: string;
    niveauPreoccupation: 'eleve' | 'moyen' | 'faible';
  };
  theme3: {
    q3_1: string;
    q3_2: string;
    q3_3: string;
    connaissanceCanaux: 'bonne' | 'moyenne' | 'faible';
  };
  theme4: {
    q4_1: string;
    q4_2: string;
    q4_3: string;
    constructivite: 'tres_constructif' | 'peu_constructif' | 'desabuse';
  };
  
  // Partie 3 : Conclusion
  questionsFinales: {
    sujetNonAborde?: string;
    questionsPourAuditeurs?: string;
    pointAClarifier?: string;
  };
  cloture: {
    remerciementsFormules: boolean;
    contributionSoulignee: boolean;
    prochainesEtapesExpliquees: boolean;
    modalitesPartagePrecisees: boolean;
    contactsLaisses: boolean;
    climatFin: 'positif' | 'neutre' | 'negatif';
  };
  
  // Analyse post-entretien
  analyse: {
    qualiteInformation: 1 | 2 | 3 | 4 | 5;
    franchiseAuthenticite: 1 | 2 | 3 | 4 | 5;
    pertinenceAudit: 1 | 2 | 3 | 4 | 5;
    climatGeneral: 1 | 2 | 3 | 4 | 5;
    preoccupationPrincipale: string;
    suggestionPertinente: string;
    elementSurprenant: string;
    recommandationPrioritaire: string;
  };
  actionsSuivi: string[];
  createdAt: Date;
  updatedAt: Date;
}

const StakeholderInterviewSchema = new Schema<IStakeholderInterview>({
  date: { type: Date, default: Date.now },
  heureDebut: Date,
  heureFin: Date,
  lieu: String,
  typePartiePrenante: {
    communauteLocale: Boolean,
    employe: Boolean,
    autoriteLocale: Boolean,
    ong: Boolean,
    fournisseur: Boolean,
    autre: String
  },
  profilInterlocuteur: {
    nom: String,
    fonction: String,
    genre: { type: String, enum: ['F', 'H'] },
    ageEstime: { type: String, enum: ['-35', '35-60', '60+'] }
  },
  auditeurs: [String],
  introduction: {
    accueilRealise: Boolean,
    raisonVisiteExpliquee: Boolean,
    independancePrecisee: Boolean,
    remerciementsExprimes: Boolean,
    objectifEnonce: Boolean
  },
  cadrageEthique: {
    confidentialiteAcceptee: Boolean,
    priseNotesAcceptee: Boolean,
    enregistrementAccepte: Boolean,
    dureeEstimeeAcceptee: Boolean,
    questionsPossiblesAcceptees: Boolean
  },
  climatInitial: { type: String, enum: ['detendu', 'reserve', 'nerveux', 'impatient', 'autre'] },
  theme1: {
    q1_1: String,
    q1_2: String,
    q1_3: String,
    evaluationFranchise: { type: String, enum: ['tres_franc', 'moderement_franc', 'reserve'] }
  },
  theme2: {
    q2_1: String,
    q2_2: String,
    q2_3: String,
    niveauPreoccupation: { type: String, enum: ['eleve', 'moyen', 'faible'] }
  },
  theme3: {
    q3_1: String,
    q3_2: String,
    q3_3: String,
    connaissanceCanaux: { type: String, enum: ['bonne', 'moyenne', 'faible'] }
  },
  theme4: {
    q4_1: String,
    q4_2: String,
    q4_3: String,
    constructivite: { type: String, enum: ['tres_constructif', 'peu_constructif', 'desabuse'] }
  },
  questionsFinales: {
    sujetNonAborde: String,
    questionsPourAuditeurs: String,
    pointAClarifier: String
  },
  cloture: {
    remerciementsFormules: Boolean,
    contributionSoulignee: Boolean,
    prochainesEtapesExpliquees: Boolean,
    modalitesPartagePrecisees: Boolean,
    contactsLaisses: Boolean,
    climatFin: { type: String, enum: ['positif', 'neutre', 'negatif'] }
  },
  analyse: {
    qualiteInformation: { type: Number, enum: [1, 2, 3, 4, 5] },
    franchiseAuthenticite: { type: Number, enum: [1, 2, 3, 4, 5] },
    pertinenceAudit: { type: Number, enum: [1, 2, 3, 4, 5] },
    climatGeneral: { type: Number, enum: [1, 2, 3, 4, 5] },
    preoccupationPrincipale: String,
    suggestionPertinente: String,
    elementSurprenant: String,
    recommandationPrioritaire: String
  },
  actionsSuivi: [String]
}, { timestamps: true });

export const StakeholderInterview = model<IStakeholderInterview>('StakeholderInterview', StakeholderInterviewSchema);