
import { IProjectInfo } from './IProjectInfo';
import { IDocumentReview } from './IDocumentReview';
import { IFieldInspection } from './IFieldInspection';
import { IStakeholderInterview } from './IStakeholderInterview';
import { IGenderAssessment } from './IGenderAssessment';
import { IComplaintMechanism } from './IComplaintMechanism';

export interface IFormData  {
  projectInfo: IProjectInfo;
  documentReview: IDocumentReview | null;
  fieldInspection: IFieldInspection | null;
  stakeholderInterview: IStakeholderInterview | null;
  genderAssessment: IGenderAssessment | null;
  complaintMechanism: IComplaintMechanism | null;
  status: 'draft' | 'submitted';
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
}
