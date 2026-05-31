// src/interfaces/IFieldInspection.ts
export interface InspectionItem {
  status: string;
  observations: string;
  risk: string;
}

export interface IFieldInspection {
  id: string;                       // CHAR(16)
  form_id: string;                  // CHAR(16) FK → form_data.id
  project_name: string;             // VARCHAR(255) NOT NULL
  date: Date;                       // DATE NOT NULL
  auditors: string;                 // VARCHAR(500) NOT NULL
  accompaniers: string | null;      // VARCHAR(500) NULL
  zones: string[] | null;           // JSON NULL
  water_management: Record<string, InspectionItem>;   // JSON NOT NULL
  waste_management: Record<string, InspectionItem>;   // JSON NOT NULL
  emissions: Record<string, InspectionItem>;          // JSON NOT NULL
  health_safety: Record<string, InspectionItem>;      // JSON NOT NULL
  community: Record<string, InspectionItem>;          // JSON NOT NULL
}

export interface ICreateFieldInspection {
  form_id: string;
  project_name: string;
  date: Date;
  auditors: string;
  accompaniers?: string;
  zones?: string[];
  water_management: Record<string, InspectionItem>;
  waste_management: Record<string, InspectionItem>;
  emissions: Record<string, InspectionItem>;
  health_safety: Record<string, InspectionItem>;
  community: Record<string, InspectionItem>;
}