// src/interfaces/IDocumentReview.ts
export interface IDocumentReview {
  id: string;                       // CHAR(16)
  form_id: string;                  // CHAR(16) FK → form_data.id
  documents_presents: Record<string, boolean>;     // JSON
  documents_analysis: Record<string, {              // JSON
    findings: string;
    rating: 'conforme' | 'partiel' | 'non-conforme' | 'n/a';
  }>;
  documents_manquants: string | null;
  autres_documents: string | null;
}

export interface ICreateDocumentReview {
  form_id: string;
  documents_presents: Record<string, boolean>;
  documents_analysis: Record<string, any>;
  documents_manquants?: string;
  autres_documents?: string;
}