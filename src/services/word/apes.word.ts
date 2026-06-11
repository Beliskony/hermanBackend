// ─────────────────────────────────────────────────────────────────────────────
//  word/apes.word.ts  —  Export APES (formulaire complet avec 5 annexes)
// ─────────────────────────────────────────────────────────────────────────────

import { Border, BorderStyle, Document, Packer, Paragraph, Table, TableRow, TextRun, WidthType } from 'docx';
import { C, TW, RISK_COLOR, PAGE } from './shared/styles';
import { 
  sectionTitle, subTitle, paragraph, kvParagraph, 
  pageBreak, spacer, tableCell, buildNumbering, buildParagraphStyles, formatDate,
  divider
} from './shared/helpers';
import { buildCoverPage, buildTableOfContents, buildIntroduction, buildGeneralConclusion, buildHeader, buildFooter } from './shared/templates';

export function buildDocumentReviewSection(data: any): (Paragraph | Table)[] {
  const dr = data.documentReview;
  if (!dr) return [];

  const docsPresents = dr.documents_presents ?? {};
  const docsAnalysis = dr.documents_analysis ?? {};
  const totalDocs = Object.keys(docsPresents).length;
  const presentCount = Object.values(docsPresents).filter((v: any) => v === true).length;
  const conformityCount = Object.values(docsAnalysis).filter((a: any) => a.rating === 'conforme').length;
  const partielCount = Object.values(docsAnalysis).filter((a: any) => a.rating === 'partiel').length;
  const nonConformeCount = Object.values(docsAnalysis).filter((a: any) => a.rating === 'non-conforme').length;

  const COL = [3200, 900, 3538, 2000];
  const ratingColor: Record<string, string> = {
    conforme: C.green,
    partiel: C.yellow,
    'non-conforme': C.red,
    'n/a': C.muted,
  };

  const rows: TableRow[] = [
    new TableRow({ tableHeader: true, children: [
      tableCell('Document', COL[0], { header: true }),
      tableCell('Présent', COL[1], { header: true, center: true }),
      tableCell('Observations', COL[2], { header: true }),
      tableCell('Conformité', COL[3], { header: true, center: true }),
    ] }),
    ...Object.keys(docsPresents).map((key, i) => {
      const present = docsPresents[key];
      const analysis = docsAnalysis[key];
      const rating = analysis?.rating || 'n/a';
      return new TableRow({ children: [
        tableCell(key, COL[0], { shade: i % 2 === 1 }),
        tableCell(present ? '✓' : '✗', COL[1], { shade: i % 2 === 1, center: true, bold: true, color: present ? C.green : C.red }),
        tableCell(analysis?.findings || '—', COL[2], { shade: i % 2 === 1 }),
        tableCell(rating.toUpperCase(), COL[3], { shade: i % 2 === 1, center: true, bold: true, color: ratingColor[rating] || C.text }),
      ]});
    }),
  ];

  return [
    sectionTitle('REVUE DOCUMENTAIRE'),
    divider(),
    subTitle('Analyse quantitative'),
    paragraph(`Sur les ${totalDocs} documents attendus, ${presentCount} ont été fournis, soit un taux de disponibilité de ${Math.round(presentCount / totalDocs * 100)}%.`),
    spacer(),
    subTitle('Analyse de conformité'),
    paragraph(`En matière de conformité documentaire, ${conformityCount} documents sont jugés conformes (${Math.round(conformityCount / totalDocs * 100)}%), ${partielCount} partiellement conformes et ${nonConformeCount} non conformes.`),
    spacer(),
    subTitle('Détail des documents analysés'),
    new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: COL, rows }),
    spacer(),
    ...(dr.documents_manquants ? [
      subTitle('Documents manquants'),
      paragraph(dr.documents_manquants, { italic: true, color: C.red }),
    ] : []),
    ...(dr.autres_documents ? [
      subTitle('Autres documents consultés'),
      paragraph(dr.autres_documents, { italic: true }),
    ] : []),
  ];
}

export function buildInspectionAnalysis(items: Record<string, any>, title: string): (Paragraph | Table)[] {
  if (!items || Object.keys(items).length === 0) return [];

  const values = Object.values(items);
  const statusCount = values.reduce((acc: any, v: any) => {
    const s = (v.status || '').toLowerCase();
    if (s.includes('conforme') || s.includes('ok') || s.includes('bon')) acc.conforme++;
    else if (s.includes('non conforme') || s.includes('critique')) acc.nonConforme++;
    else if (s.includes('partiel') || s.includes('amélioration')) acc.partiel++;
    else acc.nonEvalue++;
    return acc;
  }, { conforme: 0, nonConforme: 0, partiel: 0, nonEvalue: 0 });

  const riskCount = values.reduce((acc: any, v: any) => {
    const r = (v.risk || '').toLowerCase();
    if (r.includes('élevé') || r.includes('critique')) acc.eleve++;
    else if (r.includes('moyen')) acc.moyen++;
    else if (r.includes('faible')) acc.faible++;
    else acc.nonEvalue++;
    return acc;
  }, { eleve: 0, moyen: 0, faible: 0, nonEvalue: 0 });

  return [
    subTitle(title),
    paragraph(`Statut des vérifications : ${statusCount.conforme} conformes, ${statusCount.partiel} partiels, ${statusCount.nonConforme} non conformes.`),
    paragraph(`Niveaux de risque identifiés : ${riskCount.eleve} élevés, ${riskCount.moyen} moyens, ${riskCount.faible} faibles.`),
  ];
}

export function buildInspectionTable(title: string, items: Record<string, any>): (Paragraph | Table)[] {
  if (!items || Object.keys(items).length === 0) return [];

  const COL = [2800, 1400, 3638, 1800];

  const rows: TableRow[] = [
    new TableRow({ tableHeader: true, children: [
      tableCell('Élément inspecté', COL[0], { header: true }),
      tableCell('Statut', COL[1], { header: true, center: true }),
      tableCell('Observations', COL[2], { header: true }),
      tableCell('Niveau de risque', COL[3], { header: true, center: true }),
    ] }),
    ...Object.entries(items).map(([key, val]: [string, any], i) => {
      const riskKey = (val.risk || '').toLowerCase();
      const rColor = Object.keys(RISK_COLOR).find(k => riskKey.includes(k));
      return new TableRow({ children: [
        tableCell(key, COL[0], { shade: i % 2 === 1 }),
        tableCell(val.status, COL[1], { shade: i % 2 === 1, center: true }),
        tableCell(val.observations, COL[2], { shade: i % 2 === 1 }),
        tableCell(val.risk, COL[3], { shade: i % 2 === 1, center: true, bold: true, color: rColor ? RISK_COLOR[rColor] : C.text }),
      ]});
    }),
  ];

  return [new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: COL, rows }), spacer(160)];
}

export function buildFieldInspectionSection(data: any): (Paragraph | Table)[] {
  const fi = data.fieldInspection;
  if (!fi) return [];

  return [
    sectionTitle('INSPECTION DE TERRAIN'),
    divider(),
    subTitle('Informations générales'),
    kvParagraph('Projet', fi.project_name ?? '—'),
    kvParagraph('Date', formatDate(fi.date)),
    kvParagraph('Auditeurs', fi.auditors ?? '—'),
    kvParagraph('Accompagnateurs', fi.accompaniers ?? '—'),
    kvParagraph('Zones visitées', Array.isArray(fi.zones) ? fi.zones.join(', ') || '—' : '—'),
    spacer(),
    subTitle('Synthèse des constats terrain'),
    ...buildInspectionAnalysis(fi.water_management, 'Gestion de l\'eau'),
    ...buildInspectionAnalysis(fi.waste_management, 'Gestion des déchets'),
    ...buildInspectionAnalysis(fi.emissions, 'Émissions atmosphériques'),
    ...buildInspectionAnalysis(fi.health_safety, 'Santé et sécurité'),
    ...buildInspectionAnalysis(fi.community, 'Relations communautaires'),
    spacer(),
    subTitle('Détail par thématique'),
    ...buildInspectionTable('Gestion de l\'eau', fi.water_management ?? {}),
    ...buildInspectionTable('Gestion des déchets', fi.waste_management ?? {}),
    ...buildInspectionTable('Émissions atmosphériques', fi.emissions ?? {}),
    ...buildInspectionTable('Santé et sécurité', fi.health_safety ?? {}),
    ...buildInspectionTable('Relations communautaires', fi.community ?? {}),
  ];
}

export function buildStakeholderInterviewSection(data: any): (Paragraph | Table)[] {
  const si = data.stakeholderInterview;
  if (!si) return [];

  const responses = si.responses ?? {};
  const avgScore = (si.eval_quality + si.eval_frankness + si.eval_relevance + si.eval_climate) / 4;

  const COL = [3200, 6438];
  const EVAL_COL = [2400, 2000, 5238];
  const evalEntries: [string, number][] = [
    ['Qualité de l\'information', si.eval_quality ?? 0],
    ['Franchise et authenticité', si.eval_frankness ?? 0],
    ['Pertinence pour l\'audit', si.eval_relevance ?? 0],
    ['Climat général de l\'échange', si.eval_climate ?? 0],
  ];

  return [
    sectionTitle('ENTRETIENS PARTIES PRENANTES'),
    divider(),
    subTitle('Profil des interviewés'),
    new Table({
      width: { size: TW, type: WidthType.DXA },
      columnWidths: COL,
      rows: [
        new TableRow({ tableHeader: true, children: [tableCell('Champ', COL[0], { header: true }), tableCell('Valeur', COL[1], { header: true })] }),
        new TableRow({ children: [tableCell('Nom complet', COL[0]), tableCell(si.profile_name ?? '—', COL[1])] }),
        new TableRow({ children: [tableCell('Fonction', COL[0]), tableCell(si.profile_function ?? '—', COL[1])] }),
        new TableRow({ children: [tableCell('Genre', COL[0]), tableCell(si.profile_gender ?? '—', COL[1])] }),
        new TableRow({ children: [tableCell('Tranche d\'âge', COL[0]), tableCell(si.profile_age_range ?? '—', COL[1])] }),
        new TableRow({ children: [tableCell('Type partie prenante', COL[0]), tableCell(si.stakeholder_type ?? '—', COL[1])] }),
        new TableRow({ children: [tableCell('Lieu', COL[0]), tableCell(si.location ?? '—', COL[1])] }),
        new TableRow({ children: [tableCell('Durée', COL[0]), tableCell(si.duration ?? '—', COL[1])] }),
        new TableRow({ children: [tableCell('Date', COL[0]), tableCell(formatDate(si.date), COL[1])] }),
      ],
    }),
    spacer(),
    subTitle('Analyse des réponses'),
    paragraph("Les entretiens ont permis de recueillir des informations précieuses sur la perception du projet par les parties prenantes."),
    spacer(),
    ...Object.entries(responses).slice(0, 5).map(([question, answer]) => [
      paragraph(question, { bold: true }),
      paragraph(String(answer), { italic: true, spacing: 60 }),
      spacer(60),
    ]).flat(),
    spacer(),
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
  ];
}

export function buildGenderAssessmentSection(data: any): (Paragraph | Table)[] {
  const ga = data.genderAssessment;
  if (!ga) return [];

  const objectives = ga.objectives ?? [];
  const achievements = objectives.filter((o: any) => o.status === 'atteint').length;
  const inProgress = objectives.filter((o: any) => o.status === 'en-cours').length;
  const notAchieved = objectives.filter((o: any) => o.status === 'non-atteint').length;

  const envImpacts = (ga.impacts ?? []).filter((imp: any) => imp.impact_type === 'environmental');
  const socioImpacts = (ga.impacts ?? []).filter((imp: any) => imp.impact_type === 'socioeconomic');

  return [
    sectionTitle('ÉVALUATION GENRE ET INCLUSION'),
    divider(),
    subTitle('Objectifs de genre'),
    paragraph(`Sur les ${objectives.length} objectifs définis, ${achievements} sont atteints, ${inProgress} en cours et ${notAchieved} non atteints.`),
    spacer(),
    subTitle('Impacts différenciés'),
    ...(envImpacts.length > 0 ? [
      paragraph(`Impacts environnementaux : ${envImpacts.length} impacts différenciés ont été identifiés.`),
    ] : []),
    ...(socioImpacts.length > 0 ? [
      paragraph(`Impacts socioéconomiques : ${socioImpacts.length} impacts différenciés ont été identifiés.`),
    ] : []),
    spacer(),
    subTitle('Recommandations genre'),
    paragraph(`Un total de ${(ga.recommendations ?? []).length} recommandations ont été formulées pour renforcer l'intégration du genre.`),
  ];
}

export function buildComplaintMechanismSection(data: any): (Paragraph | Table)[] {
  const cm = data.complaintMechanism;
  if (!cm) return [];

  const docCount = Object.keys(cm.documentary_basis ?? {}).length;
  const weaknessesCount = (cm.weaknesses ?? []).length;
  const strengthsCount = (cm.strengths ?? []).length;
  const recCount = (cm.recommendations ?? []).length;

  const conclusionMap: Record<string, { text: string; color: string }> = {
    efficace: { text: 'EFFICACE ET CONFORME', color: C.green },
    ameliorer: { text: 'FONCTIONNEL MAIS À AMÉLIORER', color: C.yellow },
    inoperant: { text: 'INOPÉRANT OU INEFFICACE', color: C.red },
  };
  const conclusion = conclusionMap[cm.global_conclusion] || { text: 'Non évalué', color: C.muted };

  return [
    sectionTitle('MÉCANISME DE GESTION DES PLAINTES'),
    divider(),
    subTitle('Analyse documentaire'),
    paragraph(`La base documentaire du MGP comprend ${docCount} documents analysés.`),
    spacer(),
    subTitle('Points forts et faiblesses'),
    paragraph(`Le MGP présente ${strengthsCount} points forts et ${weaknessesCount} faiblesses identifiées.`),
    spacer(),
    subTitle('Conclusion'),
    new Paragraph({
      spacing: { after: 160 },
      border: { left: { style: BorderStyle.SINGLE, size: 12, color: conclusion.color, space: 20 } },
      indent: { left: 280 },
      children: [new TextRun({ text: conclusion.text, size: 20, color: conclusion.color, font: 'Calibri', bold: true })],
    }),
    spacer(),
    subTitle('Recommandations'),
    paragraph(`${recCount} recommandations ont été formulées pour améliorer l'efficacité du MGP.`),
  ];
}

export function buildQuickSynthesis(data: any): (Paragraph | Table)[] {
  const result: (Paragraph | Table)[] = [
    sectionTitle('SYNTHÈSE RAPIDE'),
    divider(),
  ];

  let hasData = false;

  if (data.documentReview) {
    const dr = data.documentReview;
    const docsPresents = dr.documents_presents ?? {};
    const presentCount = Object.values(docsPresents).filter((v: any) => v === true).length;
    const totalDocs = Object.keys(docsPresents).length;
    result.push(paragraph(`Revue documentaire : ${presentCount}/${totalDocs} documents disponibles (${Math.round(presentCount / totalDocs * 100)}%)`));
    hasData = true;
  }

  if (data.fieldInspection) {
    const fi = data.fieldInspection;
    const allItems = {
      ...(fi.water_management ?? {}),
      ...(fi.waste_management ?? {}),
      ...(fi.emissions ?? {}),
      ...(fi.health_safety ?? {}),
      ...(fi.community ?? {}),
    };
    const total = Object.keys(allItems).length;
    const risks = Object.values(allItems).filter((v: any) => (v.risk || '').toLowerCase().includes('élevé')).length;
    result.push(paragraph(`Inspection terrain : ${total} points vérifiés, ${risks} risques élevés identifiés`));
    hasData = true;
  }

  if (data.stakeholderInterview) {
    const si = data.stakeholderInterview;
    const avgScore = (si.eval_quality + si.eval_frankness + si.eval_relevance + si.eval_climate) / 4;
    result.push(paragraph(`Entretiens : Note moyenne ${avgScore.toFixed(1)}/5`));
    hasData = true;
  }

  if (data.genderAssessment) {
    const ga = data.genderAssessment;
    const recCount = (ga.recommendations ?? []).length;
    result.push(paragraph(`👥 Évaluation genre : ${recCount} recommandations formulées`));
    hasData = true;
  }

  if (data.complaintMechanism) {
    const cm = data.complaintMechanism;
    const weakCount = (cm.weaknesses ?? []).length;
    const strongCount = (cm.strengths ?? []).length;
    result.push(paragraph(`MGP : ${strongCount} points forts, ${weakCount} points faibles`));
    hasData = true;
  }

  if (!hasData) {
    result.push(paragraph("Aucune donnée disponible pour la synthèse."));
  }

  result.push(pageBreak());
  return result;
}

/**
 * Export un formulaire APES complet (5 annexes)
 */
export async function exportAPESWord(data: any, projectName: string, projectLocation: string, auditors: string): Promise<Buffer> {
  const generatedAt = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const projectDate = data.project_date ? formatDate(data.project_date) : formatDate(new Date());

  const sectionsList = [
    'INTRODUCTION',
    'REVUE DOCUMENTAIRE',
    'INSPECTION DE TERRAIN',
    'ENTRETIENS PARTIES PRENANTES',
    'ÉVALUATION GENRE',
    'MÉCANISME DE PLAINTE',
    'SYNTHÈSE RAPIDE',
    'CONCLUSION GÉNÉRALE',
  ];

  const doc = new Document({
    numbering: buildNumbering(),
    styles: buildParagraphStyles(),
    sections: [
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
        children: buildCoverPage(projectName, projectDate, projectLocation, auditors, 'apes'),
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
          ...buildDocumentReviewSection(data),
          pageBreak(),
          ...buildFieldInspectionSection(data),
          pageBreak(),
          ...buildStakeholderInterviewSection(data),
          pageBreak(),
          ...buildGenderAssessmentSection(data),
          pageBreak(),
          ...buildComplaintMechanismSection(data),
          pageBreak(),
          ...buildQuickSynthesis(data),
          ...buildGeneralConclusion(),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}