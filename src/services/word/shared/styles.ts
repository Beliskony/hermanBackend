// ─────────────────────────────────────────────────────────────────────────────
//  word/shared/styles.ts  —  Constantes et styles partagés
//  ACENVIRO — Cabinet d'audit environnemental et social
// ─────────────────────────────────────────────────────────────────────────────

import { BorderStyle } from 'docx';

// -----------------------------------------------------------------------------
//  PALETTE — 3 couleurs structurantes + statuts fonctionnels uniquement
// -----------------------------------------------------------------------------
export const C = {
  // Couleurs structurantes
  navy:       '1C2B4A',   // Bleu marine foncé — titres, en-têtes de tableaux
  ink:        '1A1A1A',   // Quasi-noir — corps de texte
  muted:      '6B7280',   // Gris moyen — sous-titres, notes, pieds de page

  // Arrière-plans tableaux
  headerBg:   '1C2B4A',   // En-tête tableau = navy
  headerText: 'FFFFFF',   // Texte en-tête = blanc
  altRow:     'F4F6F9',   // Ligne alternée = gris très clair
  white:      'FFFFFF',

  // Bordures
  border:     'D1D5DB',   // Gris léger pour les bordures de tableaux

  // Statuts fonctionnels — utilisés uniquement dans les cellules de statut
  green:      '166534',   // Conforme / Oui
  red:        '991B1B',   // Non conforme / Non
  yellow:     '92400E',   // Partiel / À améliorer
};

// -----------------------------------------------------------------------------
//  PAGE — Format A4, marges 2 cm
// -----------------------------------------------------------------------------
export const PAGE = {
  width:  11906,
  height: 16838,
  margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
};

// Largeur utile du contenu (page - marges gauche/droite)
export const TW = 9638;

// -----------------------------------------------------------------------------
//  BORDURES ET MARGES CELLULES
// -----------------------------------------------------------------------------
export const BORDER = (color = C.border) => ({
  style: BorderStyle.SINGLE,
  size: 4,
  color,
});

export const CELL_MARGINS = { top: 100, bottom: 100, left: 160, right: 160 };

// -----------------------------------------------------------------------------
//  ACENVIRO — Identité de l'entreprise
// -----------------------------------------------------------------------------
export const ACENVIRO = {
  name:    'ACENVIRO',
  tagline: "Cabinet d'audit environnemental et social",
  website: 'acenviro.pro',
};

// -----------------------------------------------------------------------------
//  LABELS — Types de formulaires
// -----------------------------------------------------------------------------
export const TYPE_LABELS: Record<string, string> = {
  apes:              "ÉVALUATION APES",
  guide:             "GUIDE D'ENTRETIEN",
  audit:             "CHECKLIST D'AUDIT",
  conducteur:        "CHECKLIST CONDUCTEUR",
  'data-collection': "COLLECTE DE DONNÉES",
  global:            "SYNTHÈSE GLOBALE",
};

export const GUIDE_LABELS: Record<string, string> = {
  autorites_locales:         'Autorités Locales',
  riverains_communaute:      'Riverains / Communauté',
  travailleurs_chantier:     'Travailleurs du Chantier',
  maitrise_ouvrage_entreprise: "Maîtrise d'Ouvrage",
  direction_cfpt:            'Direction CFPT',
};

export const PARTIE_PRENANTE_LABELS: Record<string, string> = {
  communaute_locale: 'Communauté locale',
  employe:           'Employé(e)',
  autorite_locale:   'Autorité locale',
  ong_association:   'ONG / Association',
  fournisseur:       'Fournisseur',
  autre:             'Autre',
};

export const SCORE_GENRE_LABELS: Record<string, string> = {
  exemplaire:   'Exemplaire',
  satisfaisant: 'Satisfaisant',
  ameliorer:    'À améliorer',
  insuffisant:  'Insuffisant',
  preoccupant:  'Préoccupant',
};

export const SCORE_GENRE_COLORS: Record<string, string> = {
  exemplaire:   C.green,
  satisfaisant: C.green,
  ameliorer:    C.yellow,
  insuffisant:  C.red,
  preoccupant:  C.red,
};

export const CONCLUSION_MGP_LABELS: Record<string, string> = {
  efficace:   'EFFICACE ET CONFORME',
  ameliorer:  'FONCTIONNEL MAIS À AMÉLIORER',
  inoperant:  'INOPÉRANT OU INEFFICACE',
  non_evalue: 'Non évalué',
};

export const CONCLUSION_MGP_COLORS: Record<string, string> = {
  efficace:   C.green,
  ameliorer:  C.yellow,
  inoperant:  C.red,
  non_evalue: C.muted,
};

// -----------------------------------------------------------------------------
//  STATUTS — Réponses et conformités
// -----------------------------------------------------------------------------
export const STATUS_COLOR: Record<string, string> = {
  O:      C.green,
  P:      C.yellow,
  N:      C.red,
  'S.O.': C.muted,
};

export const STATUS_LABEL: Record<string, string> = {
  O:      'Oui',
  P:      'Partiel',
  N:      'Non',
  'S.O.': 'S.O.',
};

export const STATUT_POINT_COLOR: Record<string, string> = {
  oui: C.green,
  non: C.red,
  na:  C.muted,
};

export const CRITICITE_COLOR: Record<string, string> = {
  H: C.red,
  M: C.yellow,
  L: C.green,
};

export const RISK_COLOR: Record<string, string> = {
  faible:   C.green,
  moyen:    C.yellow,
  'élevé':  C.red,
  critique: C.red,
};

export const CONFORMITE_LABEL: Record<string, string> = {
  O:      'Conforme',
  N:      'Non conforme',
  P:      'Partiel',
  'S.O.': 'S.O.',
};

export const CONFORMITE_COLOR: Record<string, string> = {
  O:      C.green,
  N:      C.red,
  P:      C.yellow,
  'S.O.': C.muted,
};

export const REPONSE_BOOLEENNE_LABEL: Record<string, string> = {
  oui:          'Oui',
  non:          'Non',
  partiellement: 'Partiel',
  nsp:          'NSP',
};

export const REPONSE_BOOLEENNE_COLOR: Record<string, string> = {
  oui:           C.green,
  non:           C.red,
  partiellement: C.yellow,
  nsp:           C.muted,
};