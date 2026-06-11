// ─────────────────────────────────────────────────────────────────────────────
//  word/shared/styles.ts  —  Constantes et styles partagés
// ─────────────────────────────────────────────────────────────────────────────

import { BorderStyle, ShadingType, WidthType, AlignmentType, UnderlineType, HeadingLevel } from 'docx';

export const C = {
  primary:    '1B3A5C',
  secondary:  '2E75B6',
  accent:     '00B0A0',
  headerBg:   '1B3A5C',
  headerText: 'FFFFFF',
  subBg:      'D6E4F0',
  altRow:     'F0F6FB',
  white:      'FFFFFF',
  lightGray:  'F5F5F5',
  borderCol:  'B8CCE4',
  muted:      '6B7A8D',
  text:       '1A1A2E',
  green:      '1A7A4A',
  red:        'C0392B',
  yellow:     'C07000',
  orange:     'E67E22',
};

export const PAGE = {
  width: 11906,
  height: 16838,
  margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
};

export const TW = 9638;

export const BORDER = (color = C.borderCol) => ({ style: BorderStyle.SINGLE, size: 4, color });

export const CELL_MARGINS = { top: 100, bottom: 100, left: 140, right: 140 };

export const TYPE_LABELS: Record<string, string> = {
  apes: "ÉVALUATION APES",
  guide: "GUIDE D'ENTRETIEN",
  audit: "CHECKLIST D'AUDIT",
  conducteur: "CHECKLIST CONDUCTEUR",
  'data-collection': "COLLECTE DE DONNÉES",
  global: "SYNTHÈSE GLOBALE",
};

export const GUIDE_LABELS: Record<string, string> = {
  autorites_locales: 'Autorités Locales',
  riverains_communaute: 'Riverains / Communauté',
  travailleurs_chantier: 'Travailleurs du Chantier',
  maitrise_ouvrage_entreprise: "Maîtrise d'Ouvrage",
  direction_cfpt: 'Direction CFPT',
};

export const PARTIE_PRENANTE_LABELS: Record<string, string> = {
  communaute_locale: 'Communauté locale',
  employe: 'Employé(e)',
  autorite_locale: 'Autorité locale',
  ong_association: 'ONG / Association',
  fournisseur: 'Fournisseur',
  autre: 'Autre',
};

export const SCORE_GENRE_LABELS: Record<string, string> = {
  exemplaire: 'Exemplaire',
  satisfaisant: 'Satisfaisant',
  ameliorer: 'À améliorer',
  insuffisant: 'Insuffisant',
  preoccupant: 'Préoccupant',
};

export const SCORE_GENRE_COLORS: Record<string, string> = {
  exemplaire: C.green,
  satisfaisant: C.green,
  ameliorer: C.yellow,
  insuffisant: C.red,
  preoccupant: C.red,
};

export const CONCLUSION_MGP_LABELS: Record<string, string> = {
  efficace: 'EFFICACE ET CONFORME',
  ameliorer: 'FONCTIONNEL MAIS À AMÉLIORER',
  inoperant: 'INOPÉRANT OU INEFFICACE',
  non_evalue: 'Non évalué',
};

export const CONCLUSION_MGP_COLORS: Record<string, string> = {
  efficace: C.green,
  ameliorer: C.yellow,
  inoperant: C.red,
  non_evalue: C.muted,
};

export const STATUS_COLOR: Record<string, string> = {
  O: C.green,
  P: C.yellow,
  N: C.red,
  'S.O.': C.muted,
};

export const STATUS_LABEL: Record<string, string> = {
  O: 'Oui',
  P: 'Partiel',
  N: 'Non',
  'S.O.': 'S.O.',
};

export const STATUT_POINT_COLOR: Record<string, string> = {
  oui: C.green,
  non: C.red,
  na: C.muted,
};

export const CRITICITE_COLOR: Record<string, string> = {
  H: C.red,
  M: C.yellow,
  L: C.green,
};

export const RISK_COLOR: Record<string, string> = {
  faible: C.green,
  moyen: C.yellow,
  élevé: C.red,
  critique: C.red,
};

export const CONFORMITE_LABEL: Record<string, string> = {
  O: 'Conforme',
  N: 'Non conforme',
  P: 'Partiel',
  'S.O.': 'S.O.',
};

export const CONFORMITE_COLOR: Record<string, string> = {
  O: C.green,
  N: C.red,
  P: C.yellow,
  'S.O.': C.muted,
};

export const REPONSE_BOOLEENNE_LABEL: Record<string, string> = {
  oui: 'Oui',
  non: 'Non',
  partiellement: 'Partiel',
  nsp: 'NSP',
};

export const REPONSE_BOOLEENNE_COLOR: Record<string, string> = {
  oui: C.green,
  non: C.red,
  partiellement: C.yellow,
  nsp: C.secondary,
};