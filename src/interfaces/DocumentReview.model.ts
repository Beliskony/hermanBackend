import { Schema, Document } from 'mongoose';

export interface IDocumentReview extends Document {
  documentsPresents: Record<string, boolean>;
  documentsAnalysis: Record<string, {
    findings: string;
    rating: 'conforme' | 'partiel' | 'non-conforme' | 'n/a';
  }>;
  documentsManquants: string;
  autresDocuments: string;
}

const DocumentReviewSchema = new Schema<IDocumentReview>({
  documentsPresents: { type: Schema.Types.Mixed, required: true },
  documentsAnalysis: { type: Schema.Types.Mixed, required: true },
  documentsManquants: { type: String, default: '' },
  autresDocuments: { type: String, default: '' }
});

export { DocumentReviewSchema };