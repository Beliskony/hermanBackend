import { Schema, Document } from 'mongoose';

export interface IGenderAssessment extends Document {
  objectives: Array<{
    objective: string;
    indicator: string;
    status: string;
  }>;
  quantitativeData: Record<string, { 
    women: number; 
    men: number; 
    other: number; 
    source: string 
  }>;
  consultations: Array<{
    group: string;
    sessions: number;
    participants: number;
    method: string;
  }>;
  impacts: {
    environmental: Array<{ 
      impact: string; 
      women: string; 
      men: string; 
      vulnerable: string; 
      severity: string 
    }>;
    socioeconomic: Array<{ 
      impact: string; 
      women: string; 
      men: string; 
      vulnerable: string; 
      opportunity: string 
    }>;
  };
  recommendations: Array<{
    recommendation: string;
    priority: string;
    scope: string;
    responsible: string;
    deadline: string;
  }>;
}

const GenderAssessmentSchema = new Schema<IGenderAssessment>({
  objectives: [{
    objective: { type: String, required: true },
    indicator: { type: String, required: true },
    status: { type: String, required: true }
  }],
  quantitativeData: { type: Schema.Types.Mixed, required: true },
  consultations: [{
    group: { type: String, required: true },
    sessions: { type: Number, required: true },
    participants: { type: Number, required: true },
    method: { type: String, required: true }
  }],
  impacts: {
    environmental: [{
      impact: { type: String, required: true },
      women: { type: String, required: true },
      men: { type: String, required: true },
      vulnerable: { type: String, required: true },
      severity: { type: String, required: true }
    }],
    socioeconomic: [{
      impact: { type: String, required: true },
      women: { type: String, required: true },
      men: { type: String, required: true },
      vulnerable: { type: String, required: true },
      opportunity: { type: String, required: true }
    }]
  },
  recommendations: [{
    recommendation: { type: String, required: true },
    priority: { type: String, required: true },
    scope: { type: String, required: true },
    responsible: { type: String, required: true },
    deadline: { type: String, required: true }
  }]
});

export { GenderAssessmentSchema };