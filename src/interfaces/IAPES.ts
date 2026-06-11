// src/interfaces/IAPESForm.ts
import { ICreateDocumentReview, IDocumentReview } from './IDocumentReview';
import { ICreateFieldInspection, IFieldInspection } from './IFieldInspection';
import { ICreateStakeholderInterview, IStakeholderInterview } from './IStakeholderInterview';
import { ICreateGenderAssessment, IGenderAssessment } from './IGenderAssessment';
import { IComplaintMechanism, ICreateComplaintMechanism } from './IComplaintMechanism';

export interface IAPESForm {
  id: string;                       // CHAR(16) - L'identifiant du formulaire APES
  project_id: string;
  project_name: string | null;     // ← Ajouté
  date: Date | null;   // ← Ajouté
  auditors: string | null;             // ← Ajouté
  location: string | null;             // ← Ajouté
  period: string | null;                 // ← Ajouté
  document_review_id: string | null;    // FK → document_review.id
  field_inspection_id: string | null;   // FK → field_inspection.id
  stakeholder_interview_id: string | null; // FK → stakeholder_interview.id
  gender_assessment_id: string | null;    // FK → gender_assessment.id
  complaint_mechanism_id: string | null;  // FK → complaint_mechanism.id
  status: 'draft' | 'submitted';
  created_at: Date;
  updated_at: Date;
  submitted_at?: Date;
}

export interface ICreateAPESForm {
  project_id: string;
   project_info?: {
    project_name: string;
    date: string;
    auditors: string;
    location: string;
    period: string;
  };
  
  document_review?: ICreateDocumentReview;
  field_inspection?: ICreateFieldInspection;
  stakeholder_interview?: ICreateStakeholderInterview;
  gender_assessment?: ICreateGenderAssessment;
  complaint_mechanism?: ICreateComplaintMechanism;
  status?: 'draft' | 'submitted';
}

export interface IAPESFormWithDetails extends IAPESForm {
  document_review: IDocumentReview | null;
  field_inspection: IFieldInspection | null;
  stakeholder_interview: IStakeholderInterview | null;
  gender_assessment: IGenderAssessment | null;
  complaint_mechanism: IComplaintMechanism | null;
  project: {
    id: string;
    name: string;
    location: string | null;
  };
}