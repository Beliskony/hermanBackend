import { Schema, Document } from 'mongoose';

export interface IComplaintMechanism extends Document {
  documentaryBasis: Record<string, { 
    finding: string; 
    evidence: string; 
    evaluation: string 
  }>;
  keyCriteria: Record<string, { 
    findings: string; 
    evaluation: string 
  }>;
  strengths: string[];
  weaknesses: Array<{ 
    deficiency: string; 
    consequence: string; 
    severity: string 
  }>;
  recommendations: Array<{
    recommendation: string;
    priority: string;
    responsible: string;
    deadline: string;
  }>;
  globalConclusion: string;
}

const ComplaintMechanismSchema = new Schema<IComplaintMechanism>({
  documentaryBasis: { type: Schema.Types.Mixed, required: true },
  keyCriteria: { type: Schema.Types.Mixed, required: true },
  strengths: [{ type: String }],
  weaknesses: [{
    deficiency: { type: String, required: true },
    consequence: { type: String, required: true },
    severity: { type: String, required: true }
  }],
  recommendations: [{
    recommendation: { type: String, required: true },
    priority: { type: String, required: true },
    responsible: { type: String, required: true },
    deadline: { type: String, required: true }
  }],
  globalConclusion: { type: String, required: true }
});

export { ComplaintMechanismSchema };