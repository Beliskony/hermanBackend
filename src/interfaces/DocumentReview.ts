import { Schema, model, Document } from 'mongoose';

export interface IDocumentReview extends Document {
  sousProjet: string;
  date: Date;
  auditeurs: string[];
  documentType: string;
  objectifExamen: string;
  questionsCles: string[];
  observations: string;
  conformite: 'Conforme' | 'Partiel' | 'Non-conforme';
  preuves: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DocumentReviewSchema = new Schema<IDocumentReview>({
  sousProjet: { type: String, required: true },
  date: { type: Date, default: Date.now },
  auditeurs: [{ type: String, required: true }],
  documentType: {
    type: String,
    enum: [
      'EIES',
      'CGES_PGES',
      'PAR',
      'Permis',
      'RSE',
      'Rapports_Sociaux',
      'Registre_Plaintes',
      'PV_Reunions',
      'Rapports_Avancement',
      'Contrats',
      'Organigramme',
      'Procedures',
      'PV_Comite',
      'Budgets',
      'Plan_Exploitation',
      'Rapports_Cloture',
      'Plans_Audit'
    ]
  },
  objectifExamen: String,
  questionsCles: [String],
  observations: String,
  conformite: {
    type: String,
    enum: ['Conforme', 'Partiel', 'Non-conforme']
  },
  preuves: [String]
}, { timestamps: true });

export const DocumentReview = model<IDocumentReview>('DocumentReview', DocumentReviewSchema);