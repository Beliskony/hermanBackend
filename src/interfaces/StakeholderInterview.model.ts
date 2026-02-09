import { Schema, Document } from 'mongoose';

export interface IStakeholderInterview extends Document {
  date: Date;
  location: string;
  duration: string;
  stakeholderType: string;
  profile: {
    name: string;
    function: string;
    gender: string;
    ageRange: string;
  };
  consent: {
    confidentiality: boolean;
    notes: boolean;
    recording: boolean;
  };
  responses: Record<string, string>;
  evaluation: {
    quality: number;
    frankness: number;
    relevance: number;
    climate: number;
  };
}

const StakeholderInterviewSchema = new Schema<IStakeholderInterview>({
  date: { type: Date, required: true },
  location: { type: String, required: true },
  duration: { type: String, required: true },
  stakeholderType: { type: String, required: true },
  profile: {
    name: { type: String, required: true },
    function: { type: String, required: true },
    gender: { type: String, required: true },
    ageRange: { type: String, required: true }
  },
  consent: {
    confidentiality: { type: Boolean, required: true },
    notes: { type: Boolean, required: true },
    recording: { type: Boolean, required: true }
  },
  responses: { type: Schema.Types.Mixed, required: true },
  evaluation: {
    quality: { type: Number, min: 1, max: 5, required: true },
    frankness: { type: Number, min: 1, max: 5, required: true },
    relevance: { type: Number, min: 1, max: 5, required: true },
    climate: { type: Number, min: 1, max: 5, required: true }
  }
});

export { StakeholderInterviewSchema };