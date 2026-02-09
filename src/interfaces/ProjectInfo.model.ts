import { Schema, Document } from 'mongoose';

export interface IProjectInfo extends Document {
  projectName: string;
  date: Date;
  auditors: string;
  location: string;
  period: string;
}

const ProjectInfoSchema = new Schema<IProjectInfo>({
  projectName: { type: String, required: true },
  date: { type: Date, required: true },
  auditors: { type: String, required: true },
  location: { type: String, required: true },
  period: { type: String, required: true }
});

export { ProjectInfoSchema };