// src/interfaces/IComplaintMechanism.ts
export interface IComplaintMechanism {
  id: string;                       // CHAR(16)
  form_id: string;                  // CHAR(16) FK → form_data.id
  documentary_basis: Record<string, {    // JSON
    finding: string;
    evidence: string;
    evaluation: string;
  }>;
  key_criteria: Record<string, {        // JSON
    findings: string;
    evaluation: string;
  }>;
  global_conclusion: string;        // TEXT NOT NULL
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