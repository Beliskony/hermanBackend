// ─────────────────────────────────────────────────────────────────────────────
//  word/audit.word.ts  —  Export Checklist Audit
// ─────────────────────────────────────────────────────────────────────────────

import { Document, Packer, Paragraph, Table, TableRow, WidthType } from 'docx';
import { C, PAGE, TW, CONFORMITE_LABEL, CONFORMITE_COLOR } from './shared/styles';
import { sectionTitle, subTitle, paragraph, kvParagraph, pageBreak, spacer, tableCell, buildNumbering, buildParagraphStyles, formatDate, divider } from './shared/helpers';
import { buildCoverPage, buildTableOfContents, buildIntroduction, buildGeneralConclusion, buildHeader, buildFooter } from './shared/templates';

export function buildAuditSection(data: any): (Paragraph | Table)[] {
  if (!data || !data.subprojet) return [];

  const COL = [800, 3000, 2000, 2000, 1838];

  const sections = [
    { title: 'Cadre juridique', key: 'section1_cadreJuridique' },
    { title: 'Stabilité de la structure', key: 'section2_infraSecurite', sub: 'stabiliteStructure' },
    { title: 'Sécurité incendie', key: 'section2_infraSecurite', sub: 'securiteIncendie' },
    { title: 'Accessibilité PMR', key: 'section2_infraSecurite', sub: 'accessibilitePMR' },
    { title: 'Gestion des déchets', key: 'section3_gestionEnvSociale', sub: 'gestionDechets' },
    { title: 'Nuisances et pollution', key: 'section3_gestionEnvSociale', sub: 'nuisancesPollution' },
    { title: 'Santé sécurité travailleurs', key: 'section3_gestionEnvSociale', sub: 'santeSecuteTravailleurs' },
    { title: 'Relations communautés', key: 'section4_gestionSociale', sub: 'relationsCommunautes' },
    { title: 'MGP', key: 'section4_gestionSociale', sub: 'mgp' },
    { title: 'Sécurité sûreté', key: 'section5_risquesERP', sub: 'securiteSurete' },
    { title: 'Hygiène environnement', key: 'section5_risquesERP', sub: 'hygieneEnvironnement' },
  ];

  const result: (Paragraph | Table)[] = [
    sectionTitle('CHECKLIST D\'AUDIT'),
    divider(),
    subTitle('Informations générales'),
    kvParagraph('Sous-projet', data.subprojet ?? '—'),
    kvParagraph('Auditeurs', data.auditeurs ?? '—'),
    kvParagraph('Date', formatDate(data.date)),
    spacer(),
  ];

  for (const section of sections) {
    let items: any[] = [];
    if (section.sub) {
      items = data[section.key]?.[section.sub] ?? [];
    } else {
      items = data[section.key] ?? [];
    }

    if (items.length > 0) {
      result.push(subTitle(section.title));
      const rows: TableRow[] = [
        new TableRow({ tableHeader: true, children: [
          tableCell('N°', COL[0], { header: true, center: true }),
          tableCell('Critère', COL[1], { header: true }),
          tableCell('Observations', COL[2], { header: true }),
          tableCell('Conformité', COL[3], { header: true, center: true }),
          tableCell('Risque', COL[4], { header: true, center: true }),
        ] }),
        ...items.map((item, i) => new TableRow({ children: [
          tableCell(item.numero || '—', COL[0], { shade: i % 2 === 1, center: true }),
          tableCell(item.critere || '—', COL[1], { shade: i % 2 === 1 }),
          tableCell(item.observations || '—', COL[2], { shade: i % 2 === 1 }),
          tableCell(CONFORMITE_LABEL[item.conformite] || item.conformite, COL[3], { shade: i % 2 === 1, center: true, bold: true, color: CONFORMITE_COLOR[item.conformite] }),
          tableCell(item.risque_non_conformite || '—', COL[4], { shade: i % 2 === 1, center: true }),
        ]})),
      ];
      result.push(new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: COL, rows }));
      result.push(spacer(160));
    }
  }

  if (data.synthese) {
    result.push(subTitle('Synthèse'));
    result.push(kvParagraph('Non-conformités majeures', String(data.synthese.nombreNonConformitesMajeures ?? 0)));
    result.push(kvParagraph('Domaines critiques', data.synthese.domainesCritiques ?? '—'));
  }

  return result;
}

export async function exportAuditWord(data: any, projectName: string, projectLocation: string, auditors: string): Promise<Buffer> {
  const generatedAt = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const projectDate = data.date ? formatDate(data.date) : formatDate(new Date());

  const sectionsList = [
    'INTRODUCTION',
    'CHECKLIST D\'AUDIT',
    'CONCLUSION GÉNÉRALE',
  ];

  const doc = new Document({
    numbering: buildNumbering(),
    styles: buildParagraphStyles(),
    sections: [
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
        children: buildCoverPage(projectName, projectDate, projectLocation, auditors, 'audit'),
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
          ...buildAuditSection(data),
          pageBreak(),
          ...buildGeneralConclusion(),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}