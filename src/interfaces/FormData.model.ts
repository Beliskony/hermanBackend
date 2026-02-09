// src/models/FormData.model.ts
import { Schema, Document, model } from 'mongoose';
import { ProjectInfoSchema, IProjectInfo } from './ProjectInfo.model';
import { DocumentReviewSchema, IDocumentReview } from './DocumentReview.model';
import { FieldInspectionSchema, IFieldInspection } from './FieldInspection.model';
import { StakeholderInterviewSchema, IStakeholderInterview } from './StakeholderInterview.model';
import { GenderAssessmentSchema, IGenderAssessment } from './GenderAssessment.model';
import { ComplaintMechanismSchema, IComplaintMechanism } from './ComplaintMechanism.model';

export interface IFormData extends Document {
  projectInfo: IProjectInfo;
  documentReview: IDocumentReview;
  fieldInspection: IFieldInspection;
  stakeholderInterview: IStakeholderInterview;
  genderAssessment: IGenderAssessment;
  complaintMechanism: IComplaintMechanism;
  status: 'draft' | 'submitted' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
}

const FormDataSchema = new Schema<IFormData>({
  projectInfo: { type: ProjectInfoSchema, required: true },
  documentReview: { type: DocumentReviewSchema, required: true },
  fieldInspection: { type: FieldInspectionSchema, required: true },
  stakeholderInterview: { type: StakeholderInterviewSchema, required: true },
  genderAssessment: { type: GenderAssessmentSchema, required: true },
  complaintMechanism: { type: ComplaintMechanismSchema, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'submitted', 'archived'], 
    default: 'draft' 
  },
  submittedAt: { type: Date }
}, {
  timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

// Index pour optimiser les recherches
FormDataSchema.index({ 'projectInfo.projectName': 1 });
FormDataSchema.index({ status: 1 });
FormDataSchema.index({ createdAt: -1 });

export const FormData = model<IFormData>('FormData', FormDataSchema);