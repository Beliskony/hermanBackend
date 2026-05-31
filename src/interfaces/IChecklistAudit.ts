// src/interfaces/IChecklistAudit.ts
export type Conformite = 'O' | 'N' | 'P' | 'S.O.';

export interface IChecklistAudit {
  id: string;                       // CHAR(16)
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
  numero: string;                   // VARCHAR(20)
  critere: string;
  sources_methode: string | null;
  conformite: Conformite;
  observations: string | null;
  risque_non_conformite: string | null;
  sort_order: number;
}

export interface IChecklistAuditDocument {
  id: string;
  checklist_audit_id: string;
  numero: string;
  document: string;
  disponible: Conformite;
  commentaires: string | null;
  sort_order: number;
}