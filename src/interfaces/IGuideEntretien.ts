// src/interfaces/IGuideEntretien.ts
export type GuideType = 
  | 'autorites_locales'
  | 'riverains_communaute'
  | 'travailleurs_chantier'
  | 'maitrise_ouvrage_entreprise'
  | 'direction_cfpt';

export type ThemeKey = 't1' | 't2' | 't3' | 't4';

export interface IGuideEntretien {
  id: string;                       // CHAR(16)
  project_id: string;               // CHAR(16) FK → projects.id (AJOUTÉ)
  guide_type: GuideType;
  subprojet: string;                // VARCHAR(255)
  gi_nom: string;                   // VARCHAR(255)
  gi_fonction: string;              // VARCHAR(255)
  gi_contact: string | null;        // VARCHAR(100)
  gi_date: Date;                    // DATE
  gi_lieu: string;                  // VARCHAR(255)
  gi_type_entretien: 'individuel' | 'focus_group' | null;
  gi_employeur: string | null;      // VARCHAR(255)
  gi_type_contrat: 'cdd' | 'journalier' | 'interimaire' | null;
  notes_auditeur: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface IGuideEntretienQuestion {
  id: string;
  guide_entretien_id: string;
  theme_key: ThemeKey;
  question_id: string;              // VARCHAR(30) - correspond à question_id du template
  question: string;                 // Remplacé par question_text du template
  reponse: string | null;
  nuisance_poussiere: boolean | null;
  nuisance_bruit: boolean | null;
  nuisance_circulation: boolean | null;
  nuisance_odeurs: boolean | null;
  nuisance_dechets: boolean | null;
  sort_order: number;
}

export interface ICreateGuideEntretien {
  project_id: string;
  guide_type: GuideType;
  subprojet: string;
  gi_nom: string;
  gi_fonction: string;
  gi_contact?: string;
  gi_date: Date;
  gi_lieu: string;
  gi_type_entretien?: 'individuel' | 'focus_group';
  gi_employeur?: string;
  gi_type_contrat?: 'cdd' | 'journalier' | 'interimaire';
  notes_auditeur?: string;
}