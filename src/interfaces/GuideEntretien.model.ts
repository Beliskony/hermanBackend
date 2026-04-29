import { Schema, Document, model } from 'mongoose';

// ─── TYPES DE GUIDES ─────────────────────────────────────────
export type GuideType =
  | 'autorites_locales'
  | 'riverains_communaute'
  | 'travailleurs_chantier'
  | 'maitrise_ouvrage_entreprise'
  | 'direction_cfpt';

// ─── INTERFACE ───────────────────────────────────────────────
export interface IGuideEntretien extends Document {
  guideType: GuideType;
  subprojet: string;

  // Informations générales (communes à tous les guides)
  generalInfo: {
    nom: string;
    fonction: string;
    contact: string;
    date: Date;
    lieu: string;
    typeEntretien?: 'individuel' | 'focus_group'; // Guide N°2 seulement
    employeur?: string;                            // Guide N°3 seulement
    typeContrat?: 'cdd' | 'journalier' | 'interimaire'; // Guide N°3 seulement
  };

  // THÈME 1 : Statut foncier (guide 1) / Information & perception (guides 2,3,4,5) / Infra (guide 5)
  theme1: {
    questions: Array<{
      questionId: string;   // ex: "1.1", "1.2"
      question: string;
      reponse: string;
    }>;
  };

  // THÈME 2 : Perception projet (guide 1) / Nuisances travaux (guide 2) / EPI & santé (guide 3) / Gestion E&S (guide 4) / Accessibilité & sécurité ERP (guide 5)
  theme2: {
    questions: Array<{
      questionId: string;
      question: string;
      reponse: string;
      // Pour guide 2 : cases à cocher nuisances
      nuisancesObservees?: {
        poussiere: boolean;
        bruit: boolean;
        circulation: boolean;
        odeurs: boolean;
        dechets: boolean;
      };
    }>;
  };

  // THÈME 3 : Gestion des plaintes (guides 1,2) / Conditions emploi & MGP (guide 3) / Gestion travailleurs (guide 4) / Gestion quotidienne (guide 5)
  theme3: {
    questions: Array<{
      questionId: string;
      question: string;
      reponse: string;
    }>;
  };

  // THÈME 4 : Attentes futur (guide 2) / Relations riverains & MGP (guide 4)
  theme4?: {
    questions: Array<{
      questionId: string;
      question: string;
      reponse: string;
    }>;
  };

  // Notes de l'auditeur
  notesAuditeur?: string;
}

// ─── SCHEMA ──────────────────────────────────────────────────
const QuestionSchema = new Schema({
  questionId: { type: String, required: true },
  question:   { type: String, required: true },
  reponse:    { type: String, default: '' }
}, { _id: false });

const ThemeSchema = new Schema({
  questions: [QuestionSchema]
}, { _id: false });

const GuideEntretienSchema = new Schema<IGuideEntretien>({
  guideType: {
    type: String,
    enum: [
      'autorites_locales',
      'riverains_communaute',
      'travailleurs_chantier',
      'maitrise_ouvrage_entreprise',
      'direction_cfpt'
    ],
    required: true
  },
  subprojet: { type: String, required: true },

  generalInfo: {
    nom:          { type: String, required: true },
    fonction:     { type: String, required: true },
    contact:      { type: String, default: '' },
    date:         { type: Date, required: true },
    lieu:         { type: String, required: true },
    typeEntretien:{ type: String, enum: ['individuel', 'focus_group'] },
    employeur:    { type: String },
    typeContrat:  { type: String, enum: ['cdd', 'journalier', 'interimaire'] }
  },

  theme1: { type: ThemeSchema, required: true },
  theme2: {
    questions: [{
      questionId: { type: String, required: true },
      question:   { type: String, required: true },
      reponse:    { type: String, default: '' },
      nuisancesObservees: {
        poussiere:   { type: Boolean },
        bruit:       { type: Boolean },
        circulation: { type: Boolean },
        odeurs:      { type: Boolean },
        dechets:     { type: Boolean }
      }
    }]
  },
  theme3: { type: ThemeSchema, required: true },
  theme4: { type: ThemeSchema },

  notesAuditeur: { type: String, default: '' }
}, { timestamps: true });

// Index utiles
GuideEntretienSchema.index({ guideType: 1 });
GuideEntretienSchema.index({ subprojet: 1 });
GuideEntretienSchema.index({ 'generalInfo.date': -1 });

export const GuideEntretien = model<IGuideEntretien>('GuideEntretien', GuideEntretienSchema);
export { GuideEntretienSchema };
