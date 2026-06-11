// src/interfaces/IFieldInspection.ts
export interface InspectionItem {
  status: string;
  observations: string;
  risk: string;
}

export interface IFieldInspection {
  id: string;                       // CHAR(16)
  project_id: string;               // CHAR(16) FK → projects.id
  project_name: string;
  date: Date;
  auditors: string;
  accompaniers: string | null;
  zones: string[] | null;
  water_management: Record<string, InspectionItem>;
  waste_management: Record<string, InspectionItem>;
  emissions: Record<string, InspectionItem>;
  health_safety: Record<string, InspectionItem>;
  community: Record<string, InspectionItem>;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateFieldInspection {
  project_id: string;
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