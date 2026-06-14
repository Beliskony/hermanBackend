import { ICreateDocumentReview, IDocumentReview } from './IDocumentReview';
import { ICreateFieldInspection, IFieldInspection } from './IFieldInspection';
import { ICreateStakeholderInterview, IStakeholderInterview } from './IStakeholderInterview';
import { ICreateGenderAssessment, IGenderAssessment } from './IGenderAssessment';
import { IComplaintMechanism, ICreateComplaintMechanism } from './IComplaintMechanism';

// Interface pour une question avec sa réponse
export interface IAPESQuestion {
  section_key: string;
  question_id: string;
  question_text: string;
  question_type: string;
  sort_order: number;
  answer: string | boolean | null;
  observations?: string | null;
}

export interface IAPESForm {
  id: string;
  project_id: string;
  project_name: string | null;
  date: Date | null;
  auditors: string | null;
  location: string | null;
  period: string | null;
  document_review_id: string | null;
  field_inspection_id: string | null;
  stakeholder_interview_id: string | null;
  gender_assessment_id: string | null;
  complaint_mechanism_id: string | null;
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
  // Propriétés ajoutées pour l'export Word et la récupération complète
  questions?: IAPESQuestion[];
  questions_by_section?: Record<string, IAPESQuestion[]>;
}