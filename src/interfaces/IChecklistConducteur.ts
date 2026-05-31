// src/interfaces/IChecklistConducteur.ts
export type ReponseBooleenne = 'oui' | 'non' | 'partiellement' | 'nsp' | 'sans_objet';

export interface IChecklistConducteur {
  id: string;                       // CHAR(16)
  subprojet: string;                // VARCHAR(255) NOT NULL
  auditeur: string;                 // VARCHAR(255) NOT NULL
  date: Date;                       // DATE NOT NULL
  personne_rencontree: string;      // VARCHAR(255) NOT NULL
  fonction: string;                 // VARCHAR(255) NOT NULL
  entreprise: string;               // VARCHAR(255) NOT NULL
  contact: string | null;           // VARCHAR(100) NULL
  duree_entretien: string | null;   // VARCHAR(50) NULL
  lieu: string;                     // VARCHAR(255) NOT NULL
  commentaires_libres: string | null;
  signature_auditeur: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface IChecklistConducteurQuestion {
  id: string;
  checklist_conducteur_id: string;
  section_key: string;              // VARCHAR(10) 's1'..'s11'
  numero: string;                   // VARCHAR(20)
  question: string;
  reponse: string | null;
  reponse_booleenne: ReponseBooleenne | null;
  observations: string | null;
  sort_order: number;
}