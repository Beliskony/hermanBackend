// src/interfaces/IGenderAssessment.ts
export interface IGenderAssessment {
  id: string;                       // CHAR(16)
  form_id: string;                  // CHAR(16) FK → form_data.id
  quantitative_data: Record<string, {   // JSON
    women: number;
    men: number;
    other: number;
    source: string;
  }>;
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
  severity?: string;      // Pour environmental
  opportunity?: string;    // Pour socioeconomic
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