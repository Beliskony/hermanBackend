// src/interfaces/IDocumentReview.ts
export interface IDocumentReview {
  id: string;                       // CHAR(16)
  project_id: string;               // CHAR(16) FK → projects.id
  documents_presents: Record<string, boolean>;
  documents_analysis: Record<string, {
    findings: string;
    rating: 'conforme' | 'partiel' | 'non-conforme' | 'n/a';
  }>;
  documents_manquants: string | null;
  autres_documents: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateDocumentReview {
  project_id: string;
  documents_presents: Record<string, boolean>;
  documents_analysis: Record<string, any>;
  documents_manquants?: string;
  autres_documents?: string;
}