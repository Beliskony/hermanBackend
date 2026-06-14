// ─────────────────────────────────────────────────────────────────────────────
//  word/data-collection.word.ts  —  Export Data Collection (5 annexes)
//  ACENVIRO — Cabinet d'audit environnemental et social
// ─────────────────────────────────────────────────────────────────────────────

import {
  BorderStyle, Document, Packer, Paragraph, Table, TableRow,
  TextRun, WidthType,
} from 'docx';
import {
  C, PAGE, TW,
  STATUS_LABEL, STATUS_COLOR, STATUT_POINT_COLOR, CRITICITE_COLOR,
  PARTIE_PRENANTE_LABELS, SCORE_GENRE_LABELS, SCORE_GENRE_COLORS,
  CONCLUSION_MGP_LABELS, CONCLUSION_MGP_COLORS,
} from './shared/styles';
import {
  sectionTitle, subTitle, paragraph, bulletPoint, kvParagraph,
  pageBreak, spacer, tableCell, buildNumbering, buildParagraphStyles,
  formatDate, divider,
} from './shared/helpers';
import {
  buildCoverPage, buildTableOfContents, buildIntroduction,
  buildGeneralConclusion, buildHeader, buildFooter,
} from './shared/templates';

// =============================================================================
//  UTILITAIRE — Tableau de synthèse 2 colonnes
// =============================================================================

function synthTable(
  rows: Array<{ label: string; value: string; valueColor?: string }>,
): Table {
  const COL = [4000, TW - 4000];
  return new Table({
    width: { size: TW, type: WidthType.DXA },
    columnWidths: COL,
    rows: rows.map((r, i) =>
      new TableRow({
        children: [
          tableCell(r.label, COL[0], { shade: i % 2 === 1 }),
          tableCell(r.value, COL[1], { shade: i % 2 === 1, bold: !!r.valueColor, color: r.valueColor }),
        ],
      }),
    ),
  });
}

// =============================================================================
//  ANNEXE 1 : REVUE DOCUMENTAIRE
// =============================================================================

export function buildDataCollectionRevueDocSection(rd: any): (Paragraph | Table)[] {
  if (!rd) return [paragraph('Aucune donnée de revue documentaire disponible.')];

  const documents       = rd.documents ?? [];
  const total           = documents.length;
  const presentCount    = documents.filter((d: any) => d.disponible === 'O').length;
  const conformCount    = documents.filter((d: any) => d.conformite === 'O').length;
  const partielCount    = documents.filter((d: any) => d.conformite === 'P').length;
  const nonConformCount = documents.filter((d: any) => d.conformite === 'N').length;
  const presentPct      = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  // Colonnes alignées sur les vrais documents de référence :
  // N° | Document | Objectif / Questions clés | Oui | Non | N/A | Observations
  // Total = TW (9638)
  const COL = [500, 2600, 2600, 600, 600, 600, 2138];

  const checkMark = (val: string | boolean | undefined, expected: string): string => {
    if (val === expected || val === true) return 'X';
    return '';
  };

  const rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        tableCell('N°',              COL[0], { header: true, center: true }),
        tableCell('Document',        COL[1], { header: true }),
        tableCell('Objectif / Questions clés', COL[2], { header: true }),
        tableCell('Oui',             COL[3], { header: true, center: true }),
        tableCell('Non',             COL[4], { header: true, center: true }),
        tableCell('N/A',             COL[5], { header: true, center: true }),
        tableCell('Observations',    COL[6], { header: true }),
      ],
    }),
    ...documents.map((doc: any, i: number) => {
      const disponible = doc.disponible;
      const isOui = disponible === 'O' || disponible === true  || disponible === 'oui';
      const isNon = disponible === 'N' || disponible === false || disponible === 'non';
      const isNA  = disponible === 'S.O.' || disponible === 'na';

      return new TableRow({
        children: [
          tableCell(doc.numero   || String(i + 1), COL[0], { shade: i % 2 === 1, center: true }),
          tableCell(doc.document || '—',           COL[1], { shade: i % 2 === 1 }),
          tableCell(doc.objectif || doc.questions_cles || '—', COL[2], { shade: i % 2 === 1, color: C.muted }),
          tableCell(isOui ? 'X' : '', COL[3], { shade: i % 2 === 1, center: true, bold: true, color: isOui ? C.green : C.ink }),
          tableCell(isNon ? 'X' : '', COL[4], { shade: i % 2 === 1, center: true, bold: true, color: isNon ? C.red   : C.ink }),
          tableCell(isNA  ? 'X' : '', COL[5], { shade: i % 2 === 1, center: true, color: C.muted }),
          tableCell(doc.observations || '—',       COL[6], { shade: i % 2 === 1 }),
        ],
      });
    }),
  ];

  return [
    sectionTitle('ANNEXE 1 : REVUE DOCUMENTAIRE'),
    divider(),

    paragraph(
      'Objectif : Examiner les documents clés du projet pour évaluer la disponibilité, ' +
      'la qualité et la conformité des informations environnementales et sociales.',
      { italic: true, color: C.muted },
    ),
    spacer(160),

    subTitle('Informations générales'),
    kvParagraph('Sous-projet',      rd.subprojet        ?? '—'),
    kvParagraph('Auditeurs',        rd.auditeurs        ?? '—'),
    kvParagraph('Date',             formatDate(rd.date)),
    kvParagraph('Période couverte', rd.periode_couverte ?? '—'),
    spacer(200),

    subTitle('Synthèse'),
    synthTable([
      { label: 'Documents attendus',    value: String(total) },
      { label: 'Documents disponibles', value: `${presentCount} / ${total}  (${presentPct} %)` },
      { label: 'Conformes',             value: String(conformCount),    valueColor: conformCount    > 0 ? C.green  : undefined },
      { label: 'Partiels',              value: String(partielCount),    valueColor: partielCount    > 0 ? C.yellow : undefined },
      { label: 'Non conformes',         value: String(nonConformCount), valueColor: nonConformCount > 0 ? C.red    : undefined },
    ]),
    spacer(200),

    ...(rd.documents_manquants ? [
      subTitle('Documents manquants'),
      paragraph(rd.documents_manquants, { italic: true, color: C.red }),
      spacer(),
    ] : []),

    ...(rd.observations_generales ? [
      subTitle('Observations générales'),
      paragraph(rd.observations_generales, { italic: true }),
      spacer(),
    ] : []),

    subTitle('Détail des documents analysés'),
    new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: COL, rows }),
    spacer(160),
  ];
}

// =============================================================================
//  ANNEXE 2 : INSPECTION TERRAIN
// =============================================================================

export function buildDataCollectionInspectionSection(inspection: any): (Paragraph | Table)[] {
  if (!inspection) return [paragraph("Aucune donnée d'inspection terrain disponible.")];

  const points = inspection.points_controle ?? [];
  const total = points.length;
  
  const ouiCount = points.filter((p: any) => ['oui', 'o', 'true'].includes((p.statut || '').toLowerCase())).length;
  const nonCount = points.filter((p: any) => ['non', 'n', 'false'].includes((p.statut || '').toLowerCase())).length;
  const naCount = points.filter((p: any) => {
    const statut = (p.statut || '').toLowerCase();
    return statut === 'na' || statut === 's.o.' || statut === 's.o' || statut === '';
  }).length;
  const pCount = points.filter((p: any) => (p.statut || '').toLowerCase() === 'p').length;
  
  const criticiteHCount = points.filter((p: any) => ['h', 'haute', 'élevée'].includes((p.criticite || '').toLowerCase())).length;
  const criticiteMCount = points.filter((p: any) => ['m', 'moyenne'].includes((p.criticite || '').toLowerCase())).length;
  const ouiPct = total > 0 ? Math.round((ouiCount / total) * 100) : 0;

  const COL = [580, 1400, 2200, 1400, 520, 520, 520, 1758, 740];

  // Fonctions d'aide locales (sans this)
  const getThemeLabel = (theme: string): string => {
    const labels: Record<string, string> = {
      eau: 'Eau',
      dechets: 'Déchets',
      emissions: 'Émissions',
      sante_securite: 'Santé & Sécurité',
      communaute: 'Communauté',
    };
    return labels[theme] || theme || '—';
  };

  const getCriticiteLabel = (criticite: string): string => {
    const labels: Record<string, string> = {
      H: 'Haute',
      M: 'Moyenne',
      L: 'Basse',
    };
    return labels[criticite] || criticite || '—';
  };

  const getCriticiteColor = (criticite: string): string => {
    const colors: Record<string, string> = {
      H: C.red,
      M: C.yellow,
      L: C.green,
    };
    return colors[criticite] || C.ink;
  };

  const rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        tableCell('Code', COL[0], { header: true, center: true }),
        tableCell('Thème', COL[1], { header: true }),
        tableCell('Point de contrôle', COL[2], { header: true }),
        tableCell('Méthode', COL[3], { header: true }),
        tableCell('Oui', COL[4], { header: true, center: true }),
        tableCell('Non', COL[5], { header: true, center: true }),
        tableCell('N/A', COL[6], { header: true, center: true }),
        tableCell('Observations', COL[7], { header: true }),
        tableCell('Criticité', COL[8], { header: true, center: true }),
      ],
    }),
    ...points.map((pt: any, i: number) => {
      const statut = (pt.statut || '').toLowerCase();
      const isOui = statut === 'oui' || statut === 'o' || statut === 'true';
      const isNon = statut === 'non' || statut === 'n' || statut === 'false';
      const isNA = statut === 'na' || statut === 's.o.' || statut === 's.o' || statut === '';
      const isPartiel = statut === 'p' || statut === 'partiel';
      
      let naDisplay = '';
      if (isNA) naDisplay = 'X';
      else if (isPartiel) naDisplay = 'P';

      return new TableRow({
        children: [
          tableCell(pt.code || String(i + 1), COL[0], { shade: i % 2 === 1, center: true, bold: true }),
          tableCell(getThemeLabel(pt.theme), COL[1], { shade: i % 2 === 1 }),
          tableCell(pt.intitule || '—', COL[2], { shade: i % 2 === 1 }),
          tableCell(pt.methode || 'Observation directe', COL[3], { shade: i % 2 === 1, color: C.muted }),
          tableCell(isOui ? 'X' : '', COL[4], { shade: i % 2 === 1, center: true, bold: true, color: isOui ? C.green : C.ink }),
          tableCell(isNon ? 'X' : '', COL[5], { shade: i % 2 === 1, center: true, bold: true, color: isNon ? C.red : C.ink }),
          tableCell(naDisplay, COL[6], { shade: i % 2 === 1, center: true, color: isPartiel ? C.yellow : C.muted }),
          tableCell(pt.observations || '—', COL[7], { shade: i % 2 === 1 }),
          tableCell(getCriticiteLabel(pt.criticite), COL[8], {
            shade: i % 2 === 1, center: true, bold: !!pt.criticite,
            color: getCriticiteColor(pt.criticite),
          }),
        ],
      });
    }),
  ];

  return [
    sectionTitle('ANNEXE 2 : INSPECTION TERRAIN'),
    divider(),

    paragraph(
      'Objectif : Vérifier sur le terrain la mise en œuvre effective des mesures environnementales ' +
      'et sociales prévues dans le PGES et les documents contractuels.',
      { italic: true, color: C.muted },
    ),
    spacer(160),

    subTitle('Informations générales'),
    kvParagraph('Sous-projet', inspection.subprojet ?? '—'),
    kvParagraph('Auditeurs', inspection.auditeurs ?? '—'),
    kvParagraph('Date', formatDate(inspection.date)),
    kvParagraph('Personnes rencontrées', inspection.personnes_rencontrees ?? '—'),
    kvParagraph('Zones inspectées', Array.isArray(inspection.zones_inspectees) && inspection.zones_inspectees.length > 0
      ? inspection.zones_inspectees.join(', ') : '—'),
    spacer(200),

    subTitle('Synthèse'),
    synthTable([
      { label: 'Points de contrôle', value: String(total) },
      { label: 'Conformes (Oui)', value: `${ouiCount} (${ouiPct}%)`, valueColor: ouiCount > 0 ? C.green : undefined },
      { label: 'Non conformes (Non)', value: String(nonCount), valueColor: nonCount > 0 ? C.red : undefined },
      { label: 'Non applicables (N/A)', value: String(naCount) },
      { label: 'Partiels (P)', value: String(pCount), valueColor: pCount > 0 ? C.yellow : undefined },
      { label: 'Criticités élevées (H)', value: String(criticiteHCount), valueColor: criticiteHCount > 0 ? C.red : undefined },
      { label: 'Criticités moyennes (M)', value: String(criticiteMCount), valueColor: criticiteMCount > 0 ? C.yellow : undefined },
    ]),
    spacer(200),

    ...(inspection.observations_generales ? [
      subTitle('Observations générales'),
      paragraph(inspection.observations_generales, { italic: true }),
      spacer(),
    ] : []),

    subTitle('Grille d\'inspection détaillée'),
    new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: COL, rows }),
    spacer(160),
  ];
}

// =============================================================================
//  FONCTIONS D'AIDE (à ajouter dans la classe ou en dehors)
// =============================================================================

function _getThemeLabel(theme: string): string {
  const themeLabels: Record<string, string> = {
    eau: 'Eau',
    dechets: 'Déchets',
    emissions: 'Émissions',
    sante_securite: 'Santé & Sécurité',
    communaute: 'Communauté',
  };
  return themeLabels[theme] || theme;
}

function _getZoneLabel(zone: string): string {
  const zoneLabels: Record<string, string> = {
    traitement: 'Traitement',
    stockage: 'Stockage',
    externe: 'Externe',
    bureaux: 'Bureaux',
  };
  return zoneLabels[zone] || zone;
}

function _getCriticiteLabel(criticite: string): string {
  const criticiteLabels: Record<string, string> = {
    H: 'Haute',
    M: 'Moyenne',
    L: 'Basse',
  };
  return criticiteLabels[criticite] || criticite;
}

function _getCriticiteColor(criticite: string): string {
  const criticiteColors: Record<string, string> = {
    H: C.red,
    M: C.yellow,
    L: C.green,
  };
  return criticiteColors[criticite] || C.ink;
}

// =============================================================================
//  ANNEXE 3 : ENTRETIENS PARTIES PRENANTES
// =============================================================================

export function buildDataCollectionEntretienSection(entretien: any): (Paragraph | Table)[] {
  if (!entretien) return [paragraph("Aucune donnée d'entretien disponible.")];

  const interlocuteurs  = entretien.interlocuteurs ?? [];
  const reponses        = entretien.reponses ?? {};
  const reponsesEntries = Object.entries(reponses);
  const avgScore = (
    (entretien.eval_qualite    ?? 0) +
    (entretien.eval_franchise  ?? 0) +
    (entretien.eval_pertinence ?? 0) +
    (entretien.eval_climat     ?? 0)
  ) / 4;

  const INTER_COL = [3000, TW - 3000];
  const EVAL_COL  = [3200, 1000, TW - 3200 - 1000];

  const evalEntries: Array<[string, number]> = [
    ["Qualité de l'information",   entretien.eval_qualite    ?? 0],
    ['Franchise et authenticité',  entretien.eval_franchise  ?? 0],
    ["Pertinence pour l'audit",    entretien.eval_pertinence ?? 0],
    ["Climat général de l'échange",entretien.eval_climat     ?? 0],
  ];

  const qualLabel = avgScore >= 4 ? 'excellente' : avgScore >= 3 ? 'bonne' : 'moyenne';

  const result: (Paragraph | Table)[] = [
    sectionTitle('ANNEXE 3 : ENTRETIENS PARTIES PRENANTES'),
    divider(),

    subTitle('Informations générales'),
    kvParagraph('Sous-projet',         entretien.subprojet ?? '—'),
    kvParagraph('Auditeurs',           entretien.auditeurs ?? '—'),
    kvParagraph('Date',                formatDate(entretien.date)),
    kvParagraph('Lieu',                entretien.lieu ?? '—'),
    kvParagraph('Type partie prenante',PARTIE_PRENANTE_LABELS[entretien.type_partie_prenante] || entretien.type_partie_prenante || '—'),
    kvParagraph('Mode',                entretien.mode === 'collectif'
      ? `Collectif (${entretien.taille_groupe} pers.)` : 'Individuel'),
    spacer(200),
  ];

  // Interlocuteurs
  if (interlocuteurs.length > 0) {
    result.push(subTitle('Interlocuteurs'));
    result.push(new Table({
      width: { size: TW, type: WidthType.DXA },
      columnWidths: INTER_COL,
      rows: [
        new TableRow({ tableHeader: true, children: [
          tableCell('Nom / Anonyme',   INTER_COL[0], { header: true }),
          tableCell('Fonction / Rôle', INTER_COL[1], { header: true }),
        ] }),
        ...interlocuteurs.map((person: any, idx: number) => new TableRow({ children: [
          tableCell(
            `${person.nom_ou_anonyme} (${person.genre === 'F' ? 'F' : person.genre === 'H' ? 'H' : '—'}, ${person.tranche_age || '—'})`,
            INTER_COL[0], { shade: idx % 2 === 1 },
          ),
          tableCell(person.role_fonction || '—', INTER_COL[1], { shade: idx % 2 === 1 }),
        ]})),
      ],
    }));
    result.push(spacer(160));
  }

  // Réponses — tableau question | synthèse
  if (reponsesEntries.length > 0) {
    const REP_COL = [3800, TW - 3800];
    result.push(subTitle('Synthèse des entretiens'));
    result.push(new Table({
      width: { size: TW, type: WidthType.DXA },
      columnWidths: REP_COL,
      rows: [
        new TableRow({ tableHeader: true, children: [
          tableCell('Question',  REP_COL[0], { header: true }),
          tableCell('Synthèse',  REP_COL[1], { header: true }),
        ] }),
        ...reponsesEntries.slice(0, 8).map(([question, answer], i) => {
          const ans = answer as any;
          const synthese = [
            ans.notes_citations       ? `Citations : ${ans.notes_citations}` : '',
            ans.observations_auditeur ? `Observations : ${ans.observations_auditeur}` : '',
          ].filter(Boolean).join('\n') || '—';
          return new TableRow({ children: [
            tableCell(question,  REP_COL[0], { shade: i % 2 === 1 }),
            tableCell(synthese,  REP_COL[1], { shade: i % 2 === 1 }),
          ]});
        }),
      ],
    }));
    if (reponsesEntries.length > 8) {
      result.push(paragraph(
        `… et ${reponsesEntries.length - 8} autres questions traitées.`,
        { italic: true, color: C.muted },
      ));
    }
    result.push(spacer(200));
  }

  // Évaluation qualitative — sans étoiles
  result.push(
    subTitle('Qualité des entretiens'),
    paragraph(`Note globale : ${avgScore.toFixed(1)} / 5 — qualité ${qualLabel}.`, { color: C.muted, italic: true }),
    spacer(80),
    new Table({
      width: { size: TW, type: WidthType.DXA },
      columnWidths: EVAL_COL,
      rows: [
        new TableRow({ tableHeader: true, children: [
          tableCell('Critère',      EVAL_COL[0], { header: true }),
          tableCell('Note / 5',     EVAL_COL[1], { header: true, center: true }),
          tableCell('Appréciation', EVAL_COL[2], { header: true }),
        ] }),
        ...evalEntries.map(([k, v], i) => {
          const appre = v >= 4 ? 'Excellente' : v >= 3 ? 'Bonne' : v >= 2 ? 'Moyenne' : 'Insuffisante';
          const col   = v >= 4 ? C.green : v >= 3 ? C.ink : v >= 2 ? C.yellow : C.red;
          return new TableRow({ children: [
            tableCell(k,         EVAL_COL[0], { shade: i % 2 === 1 }),
            tableCell(String(v), EVAL_COL[1], { shade: i % 2 === 1, center: true, bold: true }),
            tableCell(appre,     EVAL_COL[2], { shade: i % 2 === 1, color: col }),
          ]});
        }),
      ],
    }),
    spacer(200),
  );

  // Synthèses textuelles
  const syntheses = [
    { title: 'Préoccupation principale',   value: entretien.synthese_preoccupation_principale },
    { title: 'Suggestion pertinente',      value: entretien.synthese_suggestion_pertinente },
    { title: 'Élément surprenant',         value: entretien.synthese_element_surprenant },
    { title: 'Recommandation prioritaire', value: entretien.synthese_recommandation_prioritaire },
    { title: 'Actions de suivi',           value: entretien.actions_suivi },
  ];
  for (const syn of syntheses) {
    if (syn.value) {
      result.push(subTitle(syn.title));
      result.push(paragraph(syn.value, { italic: true }));
      result.push(spacer());
    }
  }

  return result;
}

// =============================================================================
//  ANNEXE 4 : ÉVALUATION GENRE ET INCLUSION
// =============================================================================

export function buildDataCollectionGenreSection(genre: any): (Paragraph | Table)[] {
  if (!genre) return [paragraph("Aucune donnée d'évaluation genre disponible.")];

  const donnees        = genre.donnees_quantitatives ?? [];
  const impacts        = genre.impacts_differencies  ?? [];
  const recommandations = genre.recommandations      ?? [];

  const QUANT_COL  = [3200, 1400, 1400, TW - 3200 - 1400 - 1400]; // total = TW
  const IMPACT_COL = [2400, 2400, TW - 2400 - 2400];               // total = TW

  const scoreLabel = SCORE_GENRE_LABELS[genre.score_global]  || genre.score_global  || '—';
  const scoreColor = SCORE_GENRE_COLORS[genre.score_global]  || C.ink;

  const result: (Paragraph | Table)[] = [
    sectionTitle('ANNEXE 4 : ÉVALUATION GENRE ET INCLUSION'),
    divider(),

    subTitle('Informations générales'),
    kvParagraph('Sous-projet', genre.subprojet ?? '—'),
    kvParagraph('Auditeurs',   genre.auditeurs ?? '—'),
    kvParagraph('Date',        formatDate(genre.date)),
    spacer(80),
    // Score global — paragraphe simple, sans C.primary
    new Paragraph({
      spacing: { after: 160 },
      children: [
        new TextRun({ text: 'Score global : ', bold: true, size: 20, color: C.navy, font: 'Calibri' }),
        new TextRun({ text: scoreLabel, bold: true, size: 20, color: scoreColor, font: 'Calibri' }),
      ],
    }),
    spacer(200),
  ];

  // Données quantitatives désagrégées
  if (donnees.length > 0) {
    result.push(
      subTitle('Données quantitatives désagrégées'),
      new Table({
        width: { size: TW, type: WidthType.DXA },
        columnWidths: QUANT_COL,
        rows: [
          new TableRow({ tableHeader: true, children: [
            tableCell('Catégorie',         QUANT_COL[0], { header: true }),
            tableCell('Femmes',            QUANT_COL[1], { header: true, center: true }),
            tableCell('Hommes',            QUANT_COL[2], { header: true, center: true }),
            tableCell('Source / Fiabilité',QUANT_COL[3], { header: true }),
          ] }),
          ...donnees.map((d: any, i: number) => new TableRow({ children: [
            tableCell(d.categorie,                                        QUANT_COL[0], { shade: i % 2 === 1 }),
            tableCell(String(d.femmes ?? '—'),                           QUANT_COL[1], { shade: i % 2 === 1, center: true }),
            tableCell(String(d.hommes ?? '—'),                           QUANT_COL[2], { shade: i % 2 === 1, center: true }),
            tableCell(`${d.source_document || '—'} (${d.fiabilite || '—'})`, QUANT_COL[3], { shade: i % 2 === 1 }),
          ]})),
        ],
      }),
      spacer(160),
    );
  }

  // Impacts différenciés — sans emojis
  if (impacts.length > 0) {
    result.push(
      subTitle('Impacts différenciés'),
      new Table({
        width: { size: TW, type: WidthType.DXA },
        columnWidths: IMPACT_COL,
        rows: [
          new TableRow({ tableHeader: true, children: [
            tableCell('Type / Intitulé',     IMPACT_COL[0], { header: true }),
            tableCell('Effets par genre',     IMPACT_COL[1], { header: true }),
            tableCell('Groupes vulnérables',  IMPACT_COL[2], { header: true }),
          ] }),
          ...impacts.map((imp: any, i: number) => new TableRow({ children: [
            tableCell(
              `${imp.type_impact === 'environnemental' ? 'Environnemental' : 'Socioéconomique'} — ${imp.intitule}`,
              IMPACT_COL[0], { shade: i % 2 === 1 },
            ),
            tableCell(`Femmes : ${imp.effets_femmes || '—'}\nHommes : ${imp.effets_hommes || '—'}`, IMPACT_COL[1], { shade: i % 2 === 1 }),
            tableCell(imp.effets_groupes_vulnerables || '—',             IMPACT_COL[2], { shade: i % 2 === 1 }),
          ]})),
        ],
      }),
      spacer(160),
    );
  }

  if (genre.forces_principales) {
    result.push(subTitle('Forces principales'), paragraph(genre.forces_principales, { italic: true }), spacer());
  }

  if (genre.deficiences_critiques) {
    result.push(subTitle('Déficiences critiques'), paragraph(genre.deficiences_critiques, { italic: true, color: C.red }), spacer());
  }

  if (recommandations.length > 0) {
    result.push(
      subTitle('Recommandations prioritaires'),
      ...recommandations.map((rec: any, i: number) =>
        paragraph(
          `${i + 1}. ${rec.recommandation} — ${rec.priorite} — Responsable : ${rec.responsable}, Délai : ${rec.delai}`,
          { spacing: 80 },
        ),
      ),
      spacer(),
    );
  }

  return result;
}

// =============================================================================
//  ANNEXE 5 : MÉCANISME DE GESTION DES PLAINTES (MGP)
// =============================================================================

export function buildDataCollectionMGPSection(mgp: any): (Paragraph | Table)[] {
  if (!mgp) return [paragraph("Aucune donnée d'évaluation MGP disponible.")];

  const baseDocs        = mgp.base_documentaire ?? [];
  const criteres        = mgp.criteres          ?? [];
  const pointsForts     = mgp.points_forts      ?? [];
  const deficiences     = mgp.deficiences       ?? [];
  const recommandations = mgp.recommandations   ?? [];

  const DOC_COL  = [600, 3800, TW - 600 - 3800];     // total = TW
  const CRIT_COL = [700, 2800, 2000, 2000, TW - 700 - 2800 - 2000 - 2000]; // total = TW

  const conclusionColor = CONCLUSION_MGP_COLORS[mgp.conclusion_globale] || C.muted;
  const conclusionLabel = CONCLUSION_MGP_LABELS[mgp.conclusion_globale] || mgp.conclusion_globale || 'Non évalué';

  const result: (Paragraph | Table)[] = [
    sectionTitle('ANNEXE 5 : MÉCANISME DE GESTION DES PLAINTES'),
    divider(),

    subTitle('Informations générales'),
    kvParagraph('Sous-projet', mgp.subprojet ?? '—'),
    kvParagraph('Auditeurs',   mgp.auditeurs ?? '—'),
    kvParagraph('Date',        formatDate(mgp.date)),
    spacer(200),
  ];

  // Base documentaire — colonnes Oui / Non / N/A séparées
  if (baseDocs.length > 0) {
    const BDOC_COL = [500, 2800, 2200, 600, 600, 600, 1338]; // total = TW
    result.push(
      subTitle('Base documentaire'),
      new Table({
        width: { size: TW, type: WidthType.DXA },
        columnWidths: BDOC_COL,
        rows: [
          new TableRow({ tableHeader: true, children: [
            tableCell('N°',                BDOC_COL[0], { header: true, center: true }),
            tableCell('Document',          BDOC_COL[1], { header: true }),
            tableCell('Objectif de la vérification', BDOC_COL[2], { header: true }),
            tableCell('Oui',               BDOC_COL[3], { header: true, center: true }),
            tableCell('Non',               BDOC_COL[4], { header: true, center: true }),
            tableCell('N/A',               BDOC_COL[5], { header: true, center: true }),
            tableCell('Observations',      BDOC_COL[6], { header: true }),
          ] }),
          ...baseDocs.map((doc: any, i: number) => {
            const isOui = doc.disponible === true  || doc.disponible === 'O'   || doc.disponible === 'oui';
            const isNon = doc.disponible === false || doc.disponible === 'N'   || doc.disponible === 'non';
            const isNA  = doc.disponible === 'S.O.' || doc.disponible === 'na';
            return new TableRow({ children: [
              tableCell(String(i + 1),          BDOC_COL[0], { shade: i % 2 === 1, center: true }),
              tableCell(doc.document   || '—',  BDOC_COL[1], { shade: i % 2 === 1 }),
              tableCell(doc.objectif   || '—',  BDOC_COL[2], { shade: i % 2 === 1, color: C.muted }),
              tableCell(isOui ? 'X' : '', BDOC_COL[3], { shade: i % 2 === 1, center: true, bold: true, color: isOui ? C.green : C.ink }),
              tableCell(isNon ? 'X' : '', BDOC_COL[4], { shade: i % 2 === 1, center: true, bold: true, color: isNon ? C.red   : C.ink }),
              tableCell(isNA  ? 'X' : '', BDOC_COL[5], { shade: i % 2 === 1, center: true, color: C.muted }),
              tableCell(doc.observations || '—',BDOC_COL[6], { shade: i % 2 === 1 }),
            ]});
          }),
        ],
      }),
      spacer(160),
    );
  }

  // Critères d'évaluation
  if (criteres.length > 0) {
    result.push(
      subTitle("Critères d'évaluation"),
      new Table({
        width: { size: TW, type: WidthType.DXA },
        columnWidths: CRIT_COL,
        rows: [
          new TableRow({ tableHeader: true, children: [
            tableCell('Code',               CRIT_COL[0], { header: true, center: true }),
            tableCell('Critère',            CRIT_COL[1], { header: true }),
            tableCell('Méthode / Constat',  CRIT_COL[2], { header: true }),
            tableCell('Donnée quantitative',CRIT_COL[3], { header: true }),
            tableCell('Évaluation',         CRIT_COL[4], { header: true, center: true }),
          ] }),
          ...criteres.map((c: any, i: number) => {
            const evalColor = STATUS_COLOR[c.evaluation] || C.ink;
            return new TableRow({ children: [
              tableCell(c.code || '—',                                   CRIT_COL[0], { shade: i % 2 === 1, center: true }),
              tableCell(c.critere || '—',                                CRIT_COL[1], { shade: i % 2 === 1 }),
              tableCell(`${c.methode || '—'}\n${c.constat || '—'}`,     CRIT_COL[2], { shade: i % 2 === 1 }),
              tableCell(c.donnee_quantitative || '—',                    CRIT_COL[3], { shade: i % 2 === 1 }),
              tableCell(c.evaluation || '—',                             CRIT_COL[4], {
                shade: i % 2 === 1, center: true, bold: true, color: evalColor,
              }),
            ]});
          }),
        ],
      }),
      spacer(160),
    );
  }

  if (pointsForts.length > 0) {
    result.push(subTitle('Points forts'), ...pointsForts.map((p: string) => bulletPoint(p)), spacer());
  }

  if (deficiences.length > 0) {
    result.push(
      subTitle('Déficiences / Risques'),
      ...deficiences.map((d: any) =>
        bulletPoint(`${d.deficience} — Conséquence : ${d.consequence} (Gravité : ${d.gravite})`),
      ),
      spacer(),
    );
  }

  if (recommandations.length > 0) {
    result.push(
      subTitle('Recommandations'),
      ...recommandations.map((r: any) =>
        bulletPoint(`${r.recommandation} — Priorité ${r.priorite} — Responsable : ${r.responsable}, Délai : ${r.delai}`),
      ),
      spacer(),
    );
  }

  // Conclusion — barre latérale colorée sobre
  result.push(
    subTitle('Conclusion'),
    new Paragraph({
      spacing: { after: 160 },
      border: { left: { style: BorderStyle.SINGLE, size: 16, color: conclusionColor, space: 20 } },
      indent: { left: 280 },
      children: [
        new TextRun({ text: conclusionLabel, size: 20, color: conclusionColor, font: 'Calibri', bold: true }),
      ],
    }),
    spacer(),
  );

  if (mgp.signature_auditeur) {
    result.push(kvParagraph("Signature de l'auditeur", mgp.signature_auditeur));
  }

  return result;
}

// =============================================================================
//  SYNTHÈSE RAPIDE
// =============================================================================

export function buildDataCollectionQuickSynthesis(data: any): (Paragraph | Table)[] {
  const rows: Array<{ label: string; value: string; valueColor?: string }> = [];

  if (data.revue_documentaire) {
    const rd    = data.revue_documentaire;
    const docs  = rd.documents ?? [];
    const total = docs.length;
    const present = docs.filter((d: any) => d.disponible === 'O').length;
    const conform = docs.filter((d: any) => d.conformite === 'O').length;
    rows.push({
      label: 'Revue documentaire',
      value: `${present} / ${total} disponibles — ${conform} conformes`,
    });
  }

  if (data.inspection_terrain) {
    const ins    = data.inspection_terrain;
    const points = ins.points_controle ?? [];
    const nonCount = points.filter((p: any) => p.statut === 'non').length;
    const hCount   = points.filter((p: any) => p.criticite === 'H').length;
    rows.push({
      label: 'Inspection terrain',
      value: `${points.length} points — ${nonCount} non conformes — ${hCount} criticités élevées`,
      valueColor: hCount > 0 ? C.red : nonCount > 0 ? C.yellow : undefined,
    });
  }

  if (data.entretien_pp) {
    const ent      = data.entretien_pp;
    const avgScore = ((ent.eval_qualite ?? 0) + (ent.eval_franchise ?? 0) + (ent.eval_pertinence ?? 0) + (ent.eval_climat ?? 0)) / 4;
    const nbRep    = Object.keys(ent.reponses ?? {}).length;
    rows.push({ label: 'Entretiens', value: `${nbRep} questions traitées — note ${avgScore.toFixed(1)} / 5` });
  }

  if (data.evaluation_genre) {
    const gen    = data.evaluation_genre;
    const nbRecs = (gen.recommandations ?? []).length;
    rows.push({ label: 'Évaluation genre', value: `${SCORE_GENRE_LABELS[gen.score_global] || gen.score_global || 'Non évalué'} — ${nbRecs} recommandation(s)` });
  }

  if (data.evaluation_mgp) {
    const mgp    = data.evaluation_mgp;
    const nbRecs = (mgp.recommandations ?? []).length;
    rows.push({ label: 'MGP', value: `${CONCLUSION_MGP_LABELS[mgp.conclusion_globale] || mgp.conclusion_globale || 'Non évalué'} — ${nbRecs} recommandation(s)` });
  }

  if (rows.length === 0) {
    return [
      sectionTitle('SYNTHÈSE RAPIDE'),
      divider(),
      paragraph('Aucune donnée disponible pour la synthèse.'),
    ];
  }

  return [
    sectionTitle('SYNTHÈSE RAPIDE'),
    divider(),
    synthTable(rows),
    spacer(),
  ];
}

// =============================================================================
//  EXPORT PRINCIPAL
// =============================================================================

export async function exportDataCollectionWord(
  data: any,
  projectName: string,
  projectLocation: string,
  auditors: string,
): Promise<Buffer> {
  const generatedAt = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  
  const finalProjectName = data.subprojet || data.project_name || projectName || 'Projet';
  const finalLocation = data.lieu || data.location || projectLocation || 'Non renseigné';
  const finalAuditors = data.auditeurs || data.auditors || auditors || 'Non renseigné';

  const projectDate = data.revue_documentaire?.date
    ? formatDate(data.revue_documentaire.date)
    : formatDate(new Date());

  const sectionsList = [
    'INTRODUCTION',
    'ANNEXE 1 : REVUE DOCUMENTAIRE',
    'ANNEXE 2 : INSPECTION TERRAIN',
    'ANNEXE 3 : ENTRETIENS PARTIES PRENANTES',
    'ANNEXE 4 : ÉVALUATION GENRE ET INCLUSION',
    'ANNEXE 5 : MÉCANISME DE GESTION DES PLAINTES',
    'SYNTHÈSE RAPIDE',
    'CONCLUSION GÉNÉRALE',
  ];

  const doc = new Document({
    numbering: buildNumbering(),
    styles:    buildParagraphStyles(),
    sections:  [
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
        children: buildCoverPage(finalProjectName, projectDate, finalLocation, finalAuditors, 'data-collection'),
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
          ...buildDataCollectionRevueDocSection(data.revue_documentaire),   pageBreak(),
          ...buildDataCollectionInspectionSection(data.inspection_terrain), pageBreak(),
          ...buildDataCollectionEntretienSection(data.entretien_pp),        pageBreak(),
          ...buildDataCollectionGenreSection(data.evaluation_genre),        pageBreak(),
          ...buildDataCollectionMGPSection(data.evaluation_mgp),            pageBreak(),
          ...buildDataCollectionQuickSynthesis(data),                       pageBreak(),
          ...buildGeneralConclusion(),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}