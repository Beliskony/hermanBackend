// models/ComplaintMechanism.ts
import { Schema, model, Document } from 'mongoose';

export interface IComplaintMechanism extends Document {
  // Identification
  projet: string;
  dateAudit: Date;
  auditeurs: string[];
  periodeAnalyse: {
    debut: Date;
    fin: Date;
  };
  documentsExamines: {
    politique: boolean;
    procedures: boolean;
    formulaires: boolean;
    registre: boolean;
    rapportsEnquete: boolean;
    rapportsSynthese: boolean;
    materielCommunication: boolean;
    autre?: string;
  };
  
  // Section A : Évaluation Documentaire & Quantitative
  evaluationDocumentaire: Array<{
    critere: string;
    pointVerification: string;
    constat: string;
    donneeQuantitative?: string;
    cotesPreuves: string;
    evaluation: 'Conforme' | 'Partiel' | 'Non-conforme';
  }>;
  
  // Section B : Évaluation par Critères Clés
  evaluationCriteres: Array<{
    critereCle: string;
    pointVerification: string;
    methodeEvaluation: string;
    constatsCitations: string;
    evaluation: 'Efficace' | 'Partiel' | 'Inefficace';
  }>;
  
  // Section C : Analyse et Recommandations
  pointsForts: string[];
  deficiences: Array<{
    deficience: string;
    consequence: string;
    gravite: 'H' | 'M' | 'L';
  }>;
  recommendations: Array<{
    recommendation: string;
    priorite: 'H' | 'M' | 'L';
    responsable: string;
    delai: string;
  }>;
  conclusionGlobale: 'efficace_conforme' | 'fonctionnel_ameliorer' | 'inoperant_inefficace';
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintMechanismSchema = new Schema<IComplaintMechanism>({
  projet: { type: String, required: true },
  dateAudit: { type: Date, default: Date.now },
  auditeurs: [{ type: String, required: true }],
  periodeAnalyse: {
    debut: Date,
    fin: Date
  },
  documentsExamines: {
    politique: Boolean,
    procedures: Boolean,
    formulaires: Boolean,
    registre: Boolean,
    rapportsEnquete: Boolean,
    rapportsSynthese: Boolean,
    materielCommunication: Boolean,
    autre: String
  },
  evaluationDocumentaire: [{
    critere: String,
    pointVerification: String,
    constat: String,
    donneeQuantitative: String,
    cotesPreuves: String,
    evaluation: { type: String, enum: ['Conforme', 'Partiel', 'Non-conforme'] }
  }],
  evaluationCriteres: [{
    critereCle: String,
    pointVerification: String,
    methodeEvaluation: String,
    constatsCitations: String,
    evaluation: { type: String, enum: ['Efficace', 'Partiel', 'Inefficace'] }
  }],
  pointsForts: [String],
  deficiences: [{
    deficience: String,
    consequence: String,
    gravite: { type: String, enum: ['H', 'M', 'L'] }
  }],
  recommendations: [{
    recommendation: String,
    priorite: { type: String, enum: ['H', 'M', 'L'] },
    responsable: String,
    delai: String
  }],
  conclusionGlobale: { 
    type: String, 
    enum: ['efficace_conforme', 'fonctionnel_ameliorer', 'inoperant_inefficace'] 
  }
}, { timestamps: true });

export const ComplaintMechanism = model<IComplaintMechanism>('ComplaintMechanism', ComplaintMechanismSchema);