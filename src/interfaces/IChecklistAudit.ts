// src/interfaces/IChecklistAudit.ts
export type Conformite = 'O' | 'N' | 'P' | 'S.O.';

export interface IChecklistAudit {
  id: string;                       // CHAR(16)
  project_id: string;               // CHAR(16) FK → projects.id (AJOUTÉ)
  subprojet: string;                // VARCHAR(255) NOT NULL
  auditeurs: string;                // VARCHAR(500) NOT NULL
  date: Date;                       // DATE NOT NULL
  synth_nb_nc_majeures: number;     // SMALLINT NOT NULL DEFAULT 0
  synth_domaines_critiques: string | null;
  synth_signature_auditeur: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface IChecklistAuditCritere {
  id: string;
  checklist_audit_id: string;
  section_key: string;              // VARCHAR(60)
  numero: string;                   // VARCHAR(20) - correspond à question_id
  critere: string;                  // Remplacé par la question_text du template
  sources_methode: string | null;
  conformite: Conformite;
  observations: string | null;
  risque_non_conformite: string | null;
  sort_order: number;
}

export interface ICreateChecklistAudit {
  project_id: string;
  subprojet: string;
  auditeurs: string;
  date: Date;
  synth_nb_nc_majeures?: number;
  synth_domaines_critiques?: string;
  synth_signature_auditeur?: string;
}