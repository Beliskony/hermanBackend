// ─────────────────────────────────────────────────────────────────────────────
//  word/guide.word.ts  —  Export Guide d'Entretien
//  ACENVIRO — Cabinet d'audit environnemental et social
// ─────────────────────────────────────────────────────────────────────────────

import { Document, Packer, Paragraph, Table, TableRow, WidthType } from 'docx';
import { C, PAGE, TW, GUIDE_LABELS } from './shared/styles';
import {
  sectionTitle, subTitle, paragraph, kvParagraph,
  pageBreak, spacer, tableCell, buildNumbering, buildParagraphStyles, formatDate, divider,
} from './shared/helpers';
import {
  buildCoverPage, buildTableOfContents, buildIntroduction,
  buildGeneralConclusion, buildHeader, buildFooter,
} from './shared/templates';

// =============================================================================
//  MAPPING DES THÈMES
// =============================================================================

const THEME_MAPPING: Record<string, string> = {
  t1: 'Thème 1 — Information et perception',
  t2: 'Thème 2 — Nuisances et impacts',
  t3: 'Thème 3 — Gestion des plaintes',
  t4: 'Thème 4 — Attentes et recommandations',
};

const THEME_ORDER = ['t1', 't2', 't3', 't4'];

const CONTRAT_LABELS: Record<string, string> = {
  cdd:        'CDD',
  journalier: 'Journalier',
  interimaire:'Intérimaire',
};

const MODE_LABELS: Record<string, string> = {
  individuel:  'Individuel',
  focus_group: 'Focus group',
};

// =============================================================================
//  SECTION PRINCIPALE
// =============================================================================

export function buildGuideEntretienSection(data: any): (Paragraph | Table)[] {
  if (!data || !data.guide_type) return [];

  const questions = data.questions ?? [];

  // Grouper par thème
  const byTheme: Record<string, any[]> = {};
  for (const q of questions) {
    const k = q.theme_key;
    if (!byTheme[k]) byTheme[k] = [];
    byTheme[k].push(q);
  }

  const result: (Paragraph | Table)[] = [
    sectionTitle("GUIDE D'ENTRETIEN"),
    divider(),

    // ── Informations générales ──────────────────────────────────────────────
    subTitle('Informations générales'),
    kvParagraph('Type de guide', GUIDE_LABELS[data.guide_type] ?? data.guide_type),
    kvParagraph('Sous-projet',   data.subprojet  ?? '—'),
    kvParagraph('Nom',           data.gi_nom     ?? '—'),
    kvParagraph('Fonction',      data.gi_fonction ?? '—'),
    kvParagraph('Contact',       data.gi_contact ?? '—'),
    kvParagraph('Date',          formatDate(data.gi_date)),
    kvParagraph('Lieu',          data.gi_lieu    ?? '—'),
  ];

  // Champs conditionnels travailleurs
  if (data.gi_employeur) {
    result.push(kvParagraph('Employeur', data.gi_employeur));
  }
  if (data.gi_type_contrat) {
    result.push(kvParagraph('Type de contrat', CONTRAT_LABELS[data.gi_type_contrat] || data.gi_type_contrat));
  }
  if (data.gi_type_entretien) {
    result.push(kvParagraph("Type d'entretien", MODE_LABELS[data.gi_type_entretien] || data.gi_type_entretien));
  }
  result.push(spacer(200));

  // ── Thèmes ──────────────────────────────────────────────────────────────
  for (const themeKey of THEME_ORDER) {
    const items = byTheme[themeKey] ?? [];
    if (items.length === 0) continue;

    const themeTitle = THEME_MAPPING[themeKey] || themeKey;
    result.push(subTitle(themeTitle));

    // Tableau questions/réponses — 2 colonnes : Question | Réponse
    // Plus lisible qu'une alternance de paragraphes bold/italic
    const COL = [4200, TW - 4200]; // 4200 + 5438 = 9638

    const rows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          tableCell('Question',COL[0], { header: true }),
          tableCell('Réponse', COL[1], { header: true }),
        ],
      }),
      ...items.map((q: any, i: number) => {
        // Construire la cellule réponse : texte + nuisances si présentes
        const nuisances: string[] = [];
        if (q.nuisance_poussiere)  nuisances.push('Poussière');
        if (q.nuisance_bruit)      nuisances.push('Bruit');
        if (q.nuisance_circulation)nuisances.push('Circulation');
        if (q.nuisance_odeurs)     nuisances.push('Odeurs');
        if (q.nuisance_dechets)    nuisances.push('Déchets');

        const reponseText = [
          q.reponse || '—',
          nuisances.length > 0 ? `Nuisances : ${nuisances.join(', ')}` : '',
        ].filter(Boolean).join('\n');

        return new TableRow({
          children: [
            tableCell(
              `${q.question_id ? q.question_id + ' ' : ''}${q.question || '—'}`,
              COL[0], { shade: i % 2 === 1 },
            ),
            tableCell(reponseText, COL[1], { shade: i % 2 === 1 }),
          ],
        });
      }),
    ];

    result.push(new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: COL, rows }));
    result.push(spacer(160));
  }

  // ── Notes de l'auditeur ──────────────────────────────────────────────────
  if (data.notes_auditeur) {
    result.push(subTitle("Notes de l'auditeur"));
    result.push(paragraph(data.notes_auditeur, { italic: true }));
    result.push(spacer());
  }

  return result;
}

// =============================================================================
//  EXPORT PRINCIPAL
// =============================================================================

export async function exportGuideWord(
  data: any,
  projectName: string,
  projectLocation: string,
  auditors: string,
): Promise<Buffer> {
  const generatedAt = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const projectDate = data.gi_date ? formatDate(data.gi_date) : formatDate(new Date());

    const finalProjectName = data.subprojet || data.project_name || projectName || 'Projet';
  const finalLocation = data.lieu || data.location || projectLocation || 'Non renseigné';
  const finalAuditors = data.auditeurs || data.auditors || auditors || 'Non renseigné';

  const sectionsList = [
    'INTRODUCTION',
    "GUIDE D'ENTRETIEN",
    'CONCLUSION GÉNÉRALE',
  ];

  const doc = new Document({
    numbering: buildNumbering(),
    styles:    buildParagraphStyles(),
    sections:  [
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
        children: buildCoverPage(finalProjectName, projectDate, finalLocation, finalAuditors, 'guide'),
      },
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
        children: buildTableOfContents(sectionsList),
      },
      {
        properties: {
          page: {
            size:   { width: PAGE.width, height: PAGE.height },
            margin: { ...PAGE.margin, top: 1440, bottom: 1440 },
          },
        },
        headers: { default: buildHeader(projectName) },
        footers: { default: buildFooter(generatedAt) },
        children: [
          ...buildIntroduction(),
          ...buildGuideEntretienSection(data),
          pageBreak(),
          ...buildGeneralConclusion(),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}