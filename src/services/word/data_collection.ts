// ─────────────────────────────────────────────────────────────────────────────
//  word/data-collection.word.ts  —  Export Data Collection (5 annexes)
// ─────────────────────────────────────────────────────────────────────────────

import { Document, Packer, Table, TableRow, Paragraph, WidthType, BorderStyle, TextRun } from 'docx';
import { 
  C, PAGE, TW, STATUS_LABEL, STATUS_COLOR, STATUT_POINT_COLOR, CRITICITE_COLOR,
  PARTIE_PRENANTE_LABELS, SCORE_GENRE_LABELS, SCORE_GENRE_COLORS,
  CONCLUSION_MGP_LABELS, CONCLUSION_MGP_COLORS
} from './shared/styles';
import { 
  sectionTitle, subTitle, paragraph, bulletPoint, kvParagraph, 
  pageBreak, spacer, tableCell, buildNumbering, buildParagraphStyles, formatDate,
  divider
} from './shared/helpers';
import { buildCoverPage, buildTableOfContents, buildIntroduction, buildGeneralConclusion, buildHeader, buildFooter } from './shared/templates';

// =============================================================================
//  DATA COLLECTION - SECTION 1 : REVUE DOCUMENTAIRE
// =============================================================================

export function buildDataCollectionRevueDocSection(rd: any): (Paragraph | Table)[] {
  if (!rd) return [paragraph("Aucune donnée de revue documentaire disponible.")];

  const documents = rd.documents ?? [];
  const totalDocs = documents.length;
  const presentCount = documents.filter((d: any) => d.disponible === 'O').length;
  const conformCount = documents.filter((d: any) => d.conformite === 'O').length;
  const partielCount = documents.filter((d: any) => d.conformite === 'P').length;
  const nonConformCount = documents.filter((d: any) => d.conformite === 'N').length;

  const COL = [800, 1500, 2500, 1200, 1200, 1200];

  const rows: TableRow[] = [
    new TableRow({ tableHeader: true, children: [
      tableCell('N°', COL[0], { header: true, center: true }),
      tableCell('Catégorie', COL[1], { header: true }),
      tableCell('Document', COL[2], { header: true }),
      tableCell('Disponible', COL[3], { header: true, center: true }),
      tableCell('Observations', COL[4], { header: true }),
      tableCell('Conformité', COL[5], { header: true, center: true }),
    ] }),
    ...documents.map((doc: any, i: number) => new TableRow({ children: [
      tableCell(doc.numero || '—', COL[0], { shade: i % 2 === 1, center: true }),
      tableCell(doc.categorie || '—', COL[1], { shade: i % 2 === 1 }),
      tableCell(doc.document || '—', COL[2], { shade: i % 2 === 1 }),
      tableCell(STATUS_LABEL[doc.disponible] || doc.disponible, COL[3], { shade: i % 2 === 1, center: true, bold: true, color: STATUS_COLOR[doc.disponible] }),
      tableCell(doc.observations || '—', COL[4], { shade: i % 2 === 1 }),
      tableCell(STATUS_LABEL[doc.conformite] || doc.conformite, COL[5], { shade: i % 2 === 1, center: true, bold: true, color: STATUS_COLOR[doc.conformite] }),
    ]})),
  ];

  return [
    sectionTitle('ANNEXE 1 : REVUE DOCUMENTAIRE'),
    divider(),
    subTitle('Informations générales'),
    kvParagraph('Sous-projet', rd.subprojet ?? '—'),
    kvParagraph('Auditeurs', rd.auditeurs ?? '—'),
    kvParagraph('Date', formatDate(rd.date)),
    kvParagraph('Période couverte', rd.periode_couverte ?? '—'),
    spacer(),
    subTitle('Synthèse quantitative'),
    paragraph(`Total documents analysés : ${totalDocs}`),
    paragraph(`Documents disponibles : ${presentCount}/${totalDocs} (${Math.round(presentCount / totalDocs * 100)}%)`),
    paragraph(`Conformité : ${conformCount} conformes, ${partielCount} partiels, ${nonConformCount} non conformes`),
    spacer(),
    ...(rd.documents_manquants ? [
      subTitle('Documents manquants'),
      paragraph(rd.documents_manquants, { italic: true, color: C.red }),
      spacer(),
    ] : []),
    ...(rd.autres_documents ? [
      subTitle('Autres documents consultés'),
      paragraph(rd.autres_documents, { italic: true }),
      spacer(),
    ] : []),
    ...(rd.observations_generales ? [
      subTitle('Observations générales'),
      paragraph(rd.observations_generales, { italic: true }),
      spacer(),
    ] : []),
    subTitle('Détail des documents analysés'),
    new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: COL, rows }),
  ];
}

// =============================================================================
//  DATA COLLECTION - SECTION 2 : INSPECTION TERRAIN
// =============================================================================

export function buildDataCollectionInspectionSection(inspection: any): (Paragraph | Table)[] {
  if (!inspection) return [paragraph("Aucune donnée d'inspection terrain disponible.")];

  const points = inspection.points_controle ?? [];
  const totalPoints = points.length;
  const ouiCount = points.filter((p: any) => p.statut === 'oui').length;
  const nonCount = points.filter((p: any) => p.statut === 'non').length;
  const criticiteHCount = points.filter((p: any) => p.criticite === 'H').length;
  const criticiteMCount = points.filter((p: any) => p.criticite === 'M').length;

  const COL = [800, 1500, 2000, 1200, 2000, 1200];

  const rows: TableRow[] = [
    new TableRow({ tableHeader: true, children: [
      tableCell('Code', COL[0], { header: true, center: true }),
      tableCell('Thème', COL[1], { header: true }),
      tableCell('Point de contrôle', COL[2], { header: true }),
      tableCell('Statut', COL[3], { header: true, center: true }),
      tableCell('Observations', COL[4], { header: true }),
      tableCell('Criticité', COL[5], { header: true, center: true }),
    ] }),
    ...points.map((pt: any, i: number) => new TableRow({ children: [
      tableCell(pt.code || '—', COL[0], { shade: i % 2 === 1, center: true }),
      tableCell(pt.theme || '—', COL[1], { shade: i % 2 === 1 }),
      tableCell(pt.intitule || '—', COL[2], { shade: i % 2 === 1 }),
      tableCell(pt.statut?.toUpperCase() || '—', COL[3], { shade: i % 2 === 1, center: true, bold: true, color: STATUT_POINT_COLOR[pt.statut] || C.text }),
      tableCell(pt.observations || '—', COL[4], { shade: i % 2 === 1 }),
      tableCell(pt.criticite || '—', COL[5], { shade: i % 2 === 1, center: true, bold: true, color: CRITICITE_COLOR[pt.criticite] || C.text }),
    ]})),
  ];

  return [
    sectionTitle('ANNEXE 2 : INSPECTION TERRAIN'),
    divider(),
    subTitle('Informations générales'),
    kvParagraph('Sous-projet', inspection.subprojet ?? '—'),
    kvParagraph('Auditeurs', inspection.auditeurs ?? '—'),
    kvParagraph('Date', formatDate(inspection.date)),
    kvParagraph('Personnes rencontrées', inspection.personnes_rencontrees ?? '—'),
    kvParagraph('Zones inspectées', Array.isArray(inspection.zones_inspectees) ? inspection.zones_inspectees.join(', ') : '—'),
    spacer(),
    subTitle('Synthèse des constats'),
    paragraph(`Total points contrôlés : ${totalPoints}`),
    paragraph(`Points conformes (Oui) : ${ouiCount} (${Math.round(ouiCount / totalPoints * 100)}%)`),
    paragraph(`Points non conformes (Non) : ${nonCount} (${Math.round(nonCount / totalPoints * 100)}%)`),
    paragraph(`Criticités : ${criticiteHCount} élevées, ${criticiteMCount} moyennes`),
    spacer(),
    ...(inspection.observations_generales ? [
      subTitle('Observations générales'),
      paragraph(inspection.observations_generales, { italic: true }),
      spacer(),
    ] : []),
    subTitle('Détail des points contrôlés'),
    new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: COL, rows }),
  ];
}

// =============================================================================
//  DATA COLLECTION - SECTION 3 : ENTRETIEN PARTIES PRENANTES
// =============================================================================

export function buildDataCollectionEntretienSection(entretien: any): (Paragraph | Table)[] {
  if (!entretien) return [paragraph("Aucune donnée d'entretien disponible.")];

  const avgScore = (entretien.eval_qualite + entretien.eval_franchise + entretien.eval_pertinence + entretien.eval_climat) / 4;

  const interlocuteurs = entretien.interlocuteurs ?? [];
  const reponses = entretien.reponses ?? {};
  const reponsesEntries = Object.entries(reponses);

  const COL = [3000, 6638];
  const EVAL_COL = [2400, 2000, 5238];
  const evalEntries: [string, number][] = [
    ['Qualité de l\'information', entretien.eval_qualite ?? 0],
    ['Franchise et authenticité', entretien.eval_franchise ?? 0],
    ['Pertinence pour l\'audit', entretien.eval_pertinence ?? 0],
    ['Climat général de l\'échange', entretien.eval_climat ?? 0],
  ];

  const result: (Paragraph | Table)[] = [
    sectionTitle('ANNEXE 3 : ENTRETIENS PARTIES PRENANTES'),
    divider(),
    subTitle('Informations générales'),
    kvParagraph('Sous-projet', entretien.subprojet ?? '—'),
    kvParagraph('Auditeurs', entretien.auditeurs ?? '—'),
    kvParagraph('Date', formatDate(entretien.date)),
    kvParagraph('Lieu', entretien.lieu ?? '—'),
    kvParagraph('Type partie prenante', PARTIE_PRENANTE_LABELS[entretien.type_partie_prenante] || entretien.type_partie_prenante),
    kvParagraph('Mode', entretien.mode === 'collectif' ? `Collectif (${entretien.taille_groupe} pers.)` : 'Individuel'),
    spacer(),
  ];

  if (interlocuteurs.length > 0) {
    result.push(subTitle('Interlocuteurs'));
    const interlocuteursRows: TableRow[] = [
      new TableRow({ tableHeader: true, children: [
        tableCell('Nom', COL[0], { header: true }),
        tableCell('Fonction / Rôle', COL[1], { header: true }),
      ] }),
      ...interlocuteurs.map((i: any, idx: number) => new TableRow({ children: [
        tableCell(`${i.nom_ou_anonyme} (${i.genre === 'F' ? 'F' : i.genre === 'H' ? 'H' : '—'}, ${i.tranche_age || '—'})`, COL[0], { shade: idx % 2 === 1 }),
        tableCell(i.role_fonction || '—', COL[1], { shade: idx % 2 === 1 }),
      ]})),
    ];
    result.push(new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: COL, rows: interlocuteursRows }));
    result.push(spacer());
  }

  if (reponsesEntries.length > 0) {
    result.push(subTitle('Synthèse des entretiens'));
    for (const [question, answer] of reponsesEntries.slice(0, 5)) {
      result.push(paragraph(question, { bold: true }));
      const ans = answer as any;
      if (ans.notes_citations) result.push(paragraph(`Citations : ${ans.notes_citations}`, { italic: true, spacing: 40 }));
      if (ans.observations_auditeur) result.push(paragraph(`Observations : ${ans.observations_auditeur}`, { color: C.muted, spacing: 60 }));
      result.push(spacer(60));
    }
    if (reponsesEntries.length > 5) {
      result.push(paragraph(`... et ${reponsesEntries.length - 5} autres questions traitées en détail.`, { italic: true }));
    }
    result.push(spacer());
  }

  result.push(
    subTitle('Évaluation de la qualité des entretiens'),
    paragraph(`Note globale moyenne : ${avgScore.toFixed(1)}/5, témoignant d'une ${avgScore >= 4 ? 'excellente' : avgScore >= 3 ? 'bonne' : 'moyenne'} qualité d'échange.`),
    new Table({
      width: { size: TW, type: WidthType.DXA },
      columnWidths: EVAL_COL,
      rows: [
        new TableRow({ tableHeader: true, children: [
          tableCell('Critère', EVAL_COL[0], { header: true }),
          tableCell('Note /5', EVAL_COL[1], { header: true, center: true }),
          tableCell('Représentation', EVAL_COL[2], { header: true }),
        ] }),
        ...evalEntries.map(([k, v], i) => new TableRow({ children: [
          tableCell(k, EVAL_COL[0], { shade: i % 2 === 1 }),
          tableCell(String(v), EVAL_COL[1], { shade: i % 2 === 1, center: true, bold: true, color: C.secondary }),
          tableCell('★'.repeat(v) + '☆'.repeat(5 - v), EVAL_COL[2], { shade: i % 2 === 1, color: C.secondary }),
        ]})),
      ],
    }),
    spacer()
  );

  const syntheses = [
    { title: 'Préoccupation principale', value: entretien.synthese_preoccupation_principale },
    { title: 'Suggestion pertinente', value: entretien.synthese_suggestion_pertinente },
    { title: 'Élément surprenant', value: entretien.synthese_element_surprenant },
    { title: 'Recommandation prioritaire', value: entretien.synthese_recommandation_prioritaire },
    { title: 'Actions de suivi', value: entretien.actions_suivi },
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
//  DATA COLLECTION - SECTION 4 : ÉVALUATION GENRE
// =============================================================================

export function buildDataCollectionGenreSection(genre: any): (Paragraph | Table)[] {
  if (!genre) return [paragraph("Aucune donnée d'évaluation genre disponible.")];

  const donnees = genre.donnees_quantitatives ?? [];
  const impacts = genre.impacts_differencies ?? [];
  const recommandations = genre.recommandations ?? [];

  const COL = [3000, 1500, 1500, 1500];
  const IMPACT_COL = [2500, 2500, 4638];

  const result: (Paragraph | Table)[] = [
    sectionTitle('ANNEXE 4 : ÉVALUATION GENRE ET INCLUSION'),
    divider(),
    subTitle('Informations générales'),
    kvParagraph('Sous-projet', genre.subprojet ?? '—'),
    kvParagraph('Auditeurs', genre.auditeurs ?? '—'),
    kvParagraph('Date', formatDate(genre.date)),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: 'Score global : ', bold: true, size: 20, color: C.primary, font: 'Calibri' }),
        new TextRun({ text: SCORE_GENRE_LABELS[genre.score_global] || genre.score_global, bold: true, size: 20, color: SCORE_GENRE_COLORS[genre.score_global] || C.text, font: 'Calibri' }),
      ],
    }),
    spacer(),
  ];

  if (donnees.length > 0) {
    result.push(
      subTitle('Données quantitatives désagrégées'),
      new Table({
        width: { size: TW, type: WidthType.DXA },
        columnWidths: COL,
        rows: [
          new TableRow({ tableHeader: true, children: [
            tableCell('Catégorie', COL[0], { header: true }),
            tableCell('Femmes', COL[1], { header: true, center: true }),
            tableCell('Hommes', COL[2], { header: true, center: true }),
            tableCell('Source / Fiabilité', COL[3], { header: true }),
          ] }),
          ...donnees.map((d: any, i: number) => new TableRow({ children: [
            tableCell(d.categorie, COL[0], { shade: i % 2 === 1 }),
            tableCell(String(d.femmes ?? '—'), COL[1], { shade: i % 2 === 1, center: true }),
            tableCell(String(d.hommes ?? '—'), COL[2], { shade: i % 2 === 1, center: true }),
            tableCell(`${d.source_document || '—'} (${d.fiabilite || '—'})`, COL[3], { shade: i % 2 === 1 }),
          ]})),
        ],
      }),
      spacer()
    );
  }

  if (impacts.length > 0) {
    result.push(
      subTitle('Impacts différenciés'),
      new Table({
        width: { size: TW, type: WidthType.DXA },
        columnWidths: IMPACT_COL,
        rows: [
          new TableRow({ tableHeader: true, children: [
            tableCell('Type / Intitulé', IMPACT_COL[0], { header: true }),
            tableCell('Effets sur', IMPACT_COL[1], { header: true }),
            tableCell('Groupes vulnérables', IMPACT_COL[2], { header: true }),
          ] }),
          ...impacts.map((imp: any, i: number) => new TableRow({ children: [
            tableCell(`${imp.type_impact === 'environnemental' ? '🌍 Environnemental' : '👥 Socioéconomique'}\n${imp.intitule}`, IMPACT_COL[0], { shade: i % 2 === 1 }),
            tableCell(`Femmes : ${imp.effets_femmes}\nHommes : ${imp.effets_hommes}`, IMPACT_COL[1], { shade: i % 2 === 1 }),
            tableCell(imp.effets_groupes_vulnerables, IMPACT_COL[2], { shade: i % 2 === 1 }),
          ]})),
        ],
      }),
      spacer()
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
        paragraph(`${i + 1}. ${rec.recommandation} — ${rec.priorite} — Responsable : ${rec.responsable}, Délai : ${rec.delai}`, { spacing: 60 })
      ),
      spacer()
    );
  }

  return result;
}

// =============================================================================
//  DATA COLLECTION - SECTION 5 : MÉCANISME DE PLAINTE (MGP)
// =============================================================================

export function buildDataCollectionMGPSection(mgp: any): (Paragraph | Table)[] {
  if (!mgp) return [paragraph("Aucune donnée d'évaluation MGP disponible.")];

  const baseDocs = mgp.base_documentaire ?? [];
  const criteres = mgp.criteres ?? [];
  const pointsForts = mgp.points_forts ?? [];
  const deficiences = mgp.deficiences ?? [];
  const recommandations = mgp.recommandations ?? [];

  const DOC_COL = [1000, 3000, 2000];
  const CRIT_COL = [1000, 3000, 2000, 2000, 1638];

  const result: (Paragraph | Table)[] = [
    sectionTitle('ANNEXE 5 : MÉCANISME DE GESTION DES PLAINTES'),
    divider(),
    subTitle('Informations générales'),
    kvParagraph('Sous-projet', mgp.subprojet ?? '—'),
    kvParagraph('Auditeurs', mgp.auditeurs ?? '—'),
    kvParagraph('Date', formatDate(mgp.date)),
    spacer(),
  ];

  if (baseDocs.length > 0) {
    result.push(
      subTitle('Base documentaire'),
      new Table({
        width: { size: TW, type: WidthType.DXA },
        columnWidths: DOC_COL,
        rows: [
          new TableRow({ tableHeader: true, children: [
            tableCell('N°', DOC_COL[0], { header: true, center: true }),
            tableCell('Document', DOC_COL[1], { header: true }),
            tableCell('Disponible', DOC_COL[2], { header: true, center: true }),
          ] }),
          ...baseDocs.map((doc: any, i: number) => new TableRow({ children: [
            tableCell(String(i + 1), DOC_COL[0], { shade: i % 2 === 1, center: true }),
            tableCell(doc.document, DOC_COL[1], { shade: i % 2 === 1 }),
            tableCell(doc.disponible ? '✓' : '✗', DOC_COL[2], { shade: i % 2 === 1, center: true, bold: true, color: doc.disponible ? C.green : C.red }),
          ]})),
        ],
      }),
      spacer()
    );
  }

  if (criteres.length > 0) {
    result.push(
      subTitle('Critères d\'évaluation'),
      new Table({
        width: { size: TW, type: WidthType.DXA },
        columnWidths: CRIT_COL,
        rows: [
          new TableRow({ tableHeader: true, children: [
            tableCell('Code', CRIT_COL[0], { header: true, center: true }),
            tableCell('Critère', CRIT_COL[1], { header: true }),
            tableCell('Méthode / Constat', CRIT_COL[2], { header: true }),
            tableCell('Donnée quantitative', CRIT_COL[3], { header: true }),
            tableCell('Évaluation', CRIT_COL[4], { header: true, center: true }),
          ] }),
          ...criteres.map((c: any, i: number) => {
            const evalColor = STATUS_COLOR[c.evaluation] || C.text;
            return new TableRow({ children: [
              tableCell(c.code, CRIT_COL[0], { shade: i % 2 === 1, center: true }),
              tableCell(c.critere, CRIT_COL[1], { shade: i % 2 === 1 }),
              tableCell(`${c.methode || '—'}\n${c.constat || '—'}`, CRIT_COL[2], { shade: i % 2 === 1 }),
              tableCell(c.donnee_quantitative || '—', CRIT_COL[3], { shade: i % 2 === 1 }),
              tableCell(c.evaluation, CRIT_COL[4], { shade: i % 2 === 1, center: true, bold: true, color: evalColor }),
            ]});
          }),
        ],
      }),
      spacer()
    );
  }

  if (pointsForts.length > 0) {
    result.push(subTitle('Points forts'), ...pointsForts.map((p: string) => bulletPoint(p)), spacer());
  }

  if (deficiences.length > 0) {
    result.push(subTitle('Déficiences / Risques'), ...deficiences.map((d: any) => bulletPoint(`${d.deficience} — Conséquence : ${d.consequence} (Gravité : ${d.gravite})`)), spacer());
  }

  if (recommandations.length > 0) {
    result.push(subTitle('Recommandations'), ...recommandations.map((r: any) => bulletPoint(`${r.recommandation} — Priorité ${r.priorite} — Responsable : ${r.responsable}, Délai : ${r.delai}`)), spacer());
  }

  result.push(
    subTitle('Conclusion'),
    new Paragraph({
      spacing: { after: 160 },
      border: { left: { style: BorderStyle.SINGLE, size: 12, color: CONCLUSION_MGP_COLORS[mgp.conclusion_globale] || C.muted, space: 20 } },
      indent: { left: 280 },
      children: [new TextRun({ text: CONCLUSION_MGP_LABELS[mgp.conclusion_globale] || mgp.conclusion_globale, size: 20, color: CONCLUSION_MGP_COLORS[mgp.conclusion_globale] || C.muted, font: 'Calibri', bold: true })],
    }),
    spacer()
  );

  if (mgp.signature_auditeur) {
    result.push(kvParagraph('Signature de l\'auditeur', mgp.signature_auditeur));
  }

  return result;
}

// =============================================================================
//  DATA COLLECTION - SYNTHÈSE RAPIDE
// =============================================================================

export function buildDataCollectionQuickSynthesis(data: any): (Paragraph | Table)[] {
  const result: (Paragraph | Table)[] = [
    sectionTitle('SYNTHÈSE RAPIDE'),
    divider(),
  ];

  let hasData = false;

  if (data.revue_documentaire) {
    const rd = data.revue_documentaire;
    const docs = rd.documents ?? [];
    const presentCount = docs.filter((d: any) => d.disponible === 'O').length;
    const conformCount = docs.filter((d: any) => d.conformite === 'O').length;
    result.push(paragraph(`📄 Revue documentaire : ${presentCount}/${docs.length} documents disponibles, ${conformCount} conformes`));
    hasData = true;
  }

  if (data.inspection_terrain) {
    const ins = data.inspection_terrain;
    const points = ins.points_controle ?? [];
    const nonCount = points.filter((p: any) => p.statut === 'non').length;
    const criticiteHCount = points.filter((p: any) => p.criticite === 'H').length;
    result.push(paragraph(`🔍 Inspection terrain : ${points.length} points contrôlés, ${nonCount} non conformes, ${criticiteHCount} criticités élevées`));
    hasData = true;
  }

  if (data.entretien_pp) {
    const ent = data.entretien_pp;
    const avgScore = (ent.eval_qualite + ent.eval_franchise + ent.eval_pertinence + ent.eval_climat) / 4;
    const nbReponses = Object.keys(ent.reponses ?? {}).length;
    result.push(paragraph(`💬 Entretiens : ${nbReponses} questions traitées, note moyenne ${avgScore.toFixed(1)}/5`));
    hasData = true;
  }

  if (data.evaluation_genre) {
    const gen = data.evaluation_genre;
    const nbRecs = (gen.recommandations ?? []).length;
    result.push(paragraph(`👥 Évaluation genre : ${SCORE_GENRE_LABELS[gen.score_global] || gen.score_global || 'Non évalué'}, ${nbRecs} recommandations`));
    hasData = true;
  }

  if (data.evaluation_mgp) {
    const mgp = data.evaluation_mgp;
    const nbRecs = (mgp.recommandations ?? []).length;
    result.push(paragraph(`⚖️ Mécanisme de plainte : ${CONCLUSION_MGP_LABELS[mgp.conclusion_globale] || mgp.conclusion_globale || 'Non évalué'}, ${nbRecs} recommandations`));
    hasData = true;
  }

  if (!hasData) {
    result.push(paragraph("Aucune donnée disponible pour la synthèse."));
  }

  result.push(pageBreak());
  return result;
}

/**
 * Export un formulaire Data Collection complet (5 annexes)
 */
export async function exportDataCollectionWord(
  data: any,
  projectName: string,
  projectLocation: string,
  auditors: string
): Promise<Buffer> {
  const generatedAt = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const projectDate = data.revue_documentaire?.date ? formatDate(data.revue_documentaire.date) : formatDate(new Date());

  const sectionsList = [
    'INTRODUCTION',
    'ANNEXE 1 : REVUE DOCUMENTAIRE',
    'ANNEXE 2 : INSPECTION TERRAIN',
    'ANNEXE 3 : ENTRETIENS PARTIES PRENANTES',
    'ANNEXE 4 : ÉVALUATION GENRE',
    'ANNEXE 5 : MÉCANISME DE PLAINTE (MGP)',
    'SYNTHÈSE RAPIDE',
    'CONCLUSION GÉNÉRALE',
  ];

  const doc = new Document({
    numbering: buildNumbering(),
    styles: buildParagraphStyles(),
    sections: [
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
        children: buildCoverPage(projectName, projectDate, projectLocation, auditors, 'data-collection'),
      },
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
        children: buildTableOfContents(sectionsList),
      },
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: { ...PAGE.margin, top: 1440, bottom: 1440 } } },
        headers: { default: buildHeader(projectName) },
        footers: { default: buildFooter(generatedAt) },
        children: [
          ...buildIntroduction(),
          ...buildDataCollectionRevueDocSection(data.revue_documentaire),
          pageBreak(),
          ...buildDataCollectionInspectionSection(data.inspection_terrain),
          pageBreak(),
          ...buildDataCollectionEntretienSection(data.entretien_pp),
          pageBreak(),
          ...buildDataCollectionGenreSection(data.evaluation_genre),
          pageBreak(),
          ...buildDataCollectionMGPSection(data.evaluation_mgp),
          pageBreak(),
          ...buildDataCollectionQuickSynthesis(data),
          ...buildGeneralConclusion(),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}