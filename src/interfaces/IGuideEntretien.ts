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
  guide_type: GuideType;            // ENUM
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
  question_id: string;              // VARCHAR(20)
  question: string;
  reponse: string | null;
  nuisance_poussiere: boolean | null;
  nuisance_bruit: boolean | null;
  nuisance_circulation: boolean | null;
  nuisance_odeurs: boolean | null;
  nuisance_dechets: boolean | null;
  sort_order: number;
}