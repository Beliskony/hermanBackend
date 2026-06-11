// src/interfaces/IStakeholderInterview.ts
export interface IStakeholderInterview {
  id: string;                       // CHAR(16)
  project_id: string;               // CHAR(16) FK → projects.id
  date: Date;
  location: string;
  duration: string;
  stakeholder_type: string;
  profile_name: string;
  profile_function: string;
  profile_gender: string;
  profile_age_range: string;
  consent_confidentiality: boolean;
  consent_notes: boolean;
  consent_recording: boolean;
  responses: Record<string, string>;
  eval_quality: number;
  eval_frankness: number;
  eval_relevance: number;
  eval_climate: number;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateStakeholderInterview {
  project_id: string;
  date: Date;
  location: string;
  duration: string;
  stakeholder_type: string;
  profile_name: string;
  profile_function: string;
  profile_gender: string;
  profile_age_range: string;
  consent_confidentiality?: boolean;
  consent_notes?: boolean;
  consent_recording?: boolean;
  responses: Record<string, string>;
  eval_quality: number;
  eval_frankness: number;
  eval_relevance: number;
  eval_climate: number;
}