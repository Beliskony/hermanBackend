// src/interfaces/IComplaintMechanism.ts
export interface IComplaintMechanism {
  id: string;                       // CHAR(16)
  project_id: string;               // CHAR(16) FK → projects.id
  documentary_basis: Record<string, {
    finding: string;
    evidence: string;
    evaluation: string;
  }>;
  key_criteria: Record<string, {
    findings: string;
    evaluation: string;
  }>;
  global_conclusion: string;
  created_at: Date;
  updated_at: Date;
}

export interface IComplaintStrength {
  id: string;
  complaint_mechanism_id: string;
  strength: string;
  sort_order: number;
}

export interface IComplaintWeakness {
  id: string;
  complaint_mechanism_id: string;
  deficiency: string;
  consequence: string;
  severity: string;
  sort_order: number;
}

export interface IComplaintRecommendation {
  id: string;
  complaint_mechanism_id: string;
  recommendation: string;
  priority: string;
  responsible: string;
  deadline: string;
  sort_order: number;
}

export interface ICreateComplaintMechanism {
  project_id: string;
  documentary_basis: Record<string, any>;
  key_criteria: Record<string, any>;
  global_conclusion: string;
}