// src/interfaces/IStakeholderInterview.ts
export interface IStakeholderInterview {
  id: string;                       // CHAR(16)
  form_id: string;                  // CHAR(16) FK → form_data.id
  date: Date;                       // DATE NOT NULL
  location: string;                 // VARCHAR(255) NOT NULL
  duration: string;                 // VARCHAR(50) NOT NULL
  stakeholder_type: string;         // VARCHAR(100) NOT NULL
  profile_name: string;             // VARCHAR(255) NOT NULL
  profile_function: string;         // VARCHAR(255) NOT NULL
  profile_gender: string;           // VARCHAR(50) NOT NULL
  profile_age_range: string;        // VARCHAR(50) NOT NULL
  consent_confidentiality: boolean; // TINYINT(1) NOT NULL DEFAULT 0
  consent_notes: boolean;           // TINYINT(1) NOT NULL DEFAULT 0
  consent_recording: boolean;       // TINYINT(1) NOT NULL DEFAULT 0
  responses: Record<string, string>; // JSON NOT NULL
  eval_quality: number;             // TINYINT (1-5)
  eval_frankness: number;           // TINYINT (1-5)
  eval_relevance: number;           // TINYINT (1-5)
  eval_climate: number;             // TINYINT (1-5)
}