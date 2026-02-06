// models/StakeholderChecklist.ts
import { Schema, model, Document } from 'mongoose';

export interface IStakeholderChecklist extends Document {
  // Identification
  date: Date;
  lieu: string;
  heureDebut: Date;
  heureFin: Date;
  typePartiePrenante: {
    communauteLocale: boolean;
    societeCivile: boolean;
    employeProjet: boolean;
    autoriteLocale: boolean;
    representantGroupe: boolean;
    groupeSpecifique?: string;
  };
  interlocuteurs: Array<{
    nom?: string;
    genre: 'F' | 'H';
    age: '18-35' | '36-60' | '60+';
    role: string;
  }>;
  auditeurs: string[];
  mode: 'individuel' | 'collectif' | 'enregistre';
  tailleGroupe?: number;
  
  // Section 1 : Introduction
  introduction: {
    presentationFaite: boolean;
    consentementObt: boolean;
    confidentialiteExpliquee: boolean;
    dureeIndiquee: boolean;
  };
  
  // Section 2 : Questions et Constats
  connaissanceImplication: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
  };
  impactsEnvironnementaux: {
    q5: string;
    q6: string;
    q7: string;
    q8: string;
  };
  impactsSociaux: {
    q9: string;
    q10: string;
    q11: string;
  };
  mecanismeGestionPlaintes: {
    q12: string;
    q13: string;
    q14: string;
  };
  relationsGouvernance: {
    q15: string;
    q16: string;
    q17: string;
  };
  syntheseRecommandations: {
    q18: string;
    q19: string;
    q20: string;
  };
  
  // Observations
  observations: Array<{
    theme: string;
    question: string;
    notes: string;
    citations: string;
    observationsAuditeur: string;
  }>;
  
  // Section 3 : Évaluation de l'Entretien
  evaluation: {
    interlocuteurLibre: boolean;
    reponsesConcretes: boolean;
    informationsNouvelles: boolean;
    clarificationDocumentaire: boolean;
    langageAdapte: boolean;
    niveauFiabilite: 'eleve' | 'moyen' | 'faible';
    commentaire: string;
  };
  
  // Synthèse
  synthese: {
    preoccupationPrincipale: string;
    pointPositif: string;
    informationCritique: string;
  };
  
  actionsSuivi: string[];
  auditeurPrincipal: string;
  createdAt: Date;
  updatedAt: Date;
}

const StakeholderChecklistSchema = new Schema<IStakeholderChecklist>({
  date: { type: Date, default: Date.now },
  lieu: String,
  heureDebut: Date,
  heureFin: Date,
  typePartiePrenante: {
    communauteLocale: Boolean,
    societeCivile: Boolean,
    employeProjet: Boolean,
    autoriteLocale: Boolean,
    representantGroupe: Boolean,
    groupeSpecifique: String
  },
  interlocuteurs: [{
    nom: String,
    genre: { type: String, enum: ['F', 'H'] },
    age: { type: String, enum: ['18-35', '36-60', '60+'] },
    role: String
  }],
  auditeurs: [String],
  mode: { type: String, enum: ['individuel', 'collectif', 'enregistre'] },
  tailleGroupe: Number,
  introduction: {
    presentationFaite: Boolean,
    consentementObt: Boolean,
    confidentialiteExpliquee: Boolean,
    dureeIndiquee: Boolean
  },
  connaissanceImplication: {
    q1: String,
    q2: String,
    q3: String,
    q4: String
  },
  impactsEnvironnementaux: {
    q5: String,
    q6: String,
    q7: String,
    q8: String
  },
  impactsSociaux: {
    q9: String,
    q10: String,
    q11: String
  },
  mecanismeGestionPlaintes: {
    q12: String,
    q13: String,
    q14: String
  },
  relationsGouvernance: {
    q15: String,
    q16: String,
    q17: String
  },
  syntheseRecommandations: {
    q18: String,
    q19: String,
    q20: String
  },
  observations: [{
    theme: String,
    question: String,
    notes: String,
    citations: String,
    observationsAuditeur: String
  }],
  evaluation: {
    interlocuteurLibre: Boolean,
    reponsesConcretes: Boolean,
    informationsNouvelles: Boolean,
    clarificationDocumentaire: Boolean,
    langageAdapte: Boolean,
    niveauFiabilite: { type: String, enum: ['eleve', 'moyen', 'faible'] },
    commentaire: String
  },
  synthese: {
    preoccupationPrincipale: String,
    pointPositif: String,
    informationCritique: String
  },
  actionsSuivi: [String],
  auditeurPrincipal: String
}, { timestamps: true });

export const StakeholderChecklist = model<IStakeholderChecklist>('StakeholderChecklist', StakeholderChecklistSchema);