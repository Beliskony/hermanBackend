// src/interfaces/IGenderAssessment.ts
export interface IGenderAssessment {
  id: string;                       // CHAR(16)
  project_id: string;               // CHAR(16) FK → projects.id
  quantitative_data: Record<string, {
    women: number;
    men: number;
    other: number;
    source: string;
  }>;
  created_at: Date;
  updated_at: Date;
}

export interface IGenderObjective {
  id: string;
  gender_assessment_id: string;
  objective: string;
  indicator: string;
  status: string;
  sort_order: number;
}

export interface IGenderConsultation {
  id: string;
  gender_assessment_id: string;
  group: string;
  sessions: number;
  participants: number;
  method: string;
  sort_order: number;
}

export interface IGenderImpact {
  id: string;
  gender_assessment_id: string;
  impact_type: 'environmental' | 'socioeconomic';
  impact: string;
  women: string;
  men: string;
  vulnerable: string;
  severity?: string;
  opportunity?: string;
  sort_order: number;
}

export interface IGenderRecommendation {
  id: string;
  gender_assessment_id: string;
  recommendation: string;
  priority: string;
  scope: string;
  responsible: string;
  deadline: string;
  sort_order: number;
}

export interface ICreateGenderAssessment {
  project_id: string;
  quantitative_data: Record<string, any>;
}