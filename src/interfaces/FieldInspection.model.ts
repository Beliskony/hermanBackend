import { Schema, Document } from 'mongoose';

interface InspectionItem {
  status: string;
  observations: string;
  risk: string;
}

export interface IFieldInspection extends Document {
  projectName: string;
  date: Date;
  auditors: string;
  accompaniers: string;
  zones: string[];
  waterManagement: Record<string, InspectionItem>;
  wasteManagement: Record<string, InspectionItem>;
  emissions: Record<string, InspectionItem>;
  healthSafety: Record<string, InspectionItem>;
  community: Record<string, InspectionItem>;
}

const InspectionItemSchema = new Schema({
  status: { type: String, required: true },
  observations: { type: String, required: true },
  risk: { type: String, required: true }
}, { _id: false });

const FieldInspectionSchema = new Schema<IFieldInspection>({
  projectName: { type: String, required: true },
  date: { type: Date, required: true },
  auditors: { type: String, required: true },
  accompaniers: { type: String, default: '' },
  zones: [{ type: String }],
  waterManagement: { type: Schema.Types.Mixed, required: true },
  wasteManagement: { type: Schema.Types.Mixed, required: true },
  emissions: { type: Schema.Types.Mixed, required: true },
  healthSafety: { type: Schema.Types.Mixed, required: true },
  community: { type: Schema.Types.Mixed, required: true }
});

export { FieldInspectionSchema };