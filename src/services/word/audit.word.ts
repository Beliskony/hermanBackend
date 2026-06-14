// ─────────────────────────────────────────────────────────────────────────────
//  word/audit.word.ts  —  Export Checklist Audit
//  ACENVIRO — Cabinet d'audit environnemental et social
// ─────────────────────────────────────────────────────────────────────────────

import { Document, Packer, Paragraph, Table, TableRow, WidthType } from 'docx';
import { C, PAGE, TW, CONFORMITE_LABEL, CONFORMITE_COLOR } from './shared/styles';
import {
  sectionTitle, subTitle, paragraph, kvParagraph,
  pageBreak, spacer, tableCell, buildNumbering, buildParagraphStyles, formatDate, divider,
} from './shared/helpers';
import {
  buildCoverPage, buildTableOfContents, buildIntroduction,
  buildGeneralConclusion, buildHeader, buildFooter,
} from './shared/templates';

const SECTION_MAPPING: Record<string, string> = {
  s1: 'Cadre juridique & autorisations',
  s2_stabilite: 'Stabilité de la structure',
  s2_incendie: 'Sécurité incendie',
  s2_accessibilite: 'Accessibilité PMR',
  s3_dechets: 'Gestion des déchets',
  s3_nuisances: 'Nuisances et pollution',
  s3_sante: 'Santé & sécurité travailleurs',
  s4_relations: 'Relations communautés',
  s4_mgp: 'Mécanisme de gestion des plaintes (MGP)',
  s5_securite: 'Sécurité générale du site',
  s5_hygiene: 'Hygiène et environnement',
  s6_documents: 'Documents',
};

const SECTION_ORDER = [
  's1',
  's2_stabilite', 's2_incendie', 's2_accessibilite',
  's3_dechets', 's3_nuisances', 's3_sante',
  's4_relations', 's4_mgp',
  's5_securite', 's5_hygiene',
  's6_documents',
];

export function buildAuditSection(data: any): (Paragraph | Table)[] {
  if (!data || !data.subprojet) return [];

  const COL = [600, 3600, 2800, 1300, 1338];
  const criteres = data.criteres ?? [];

  const bySection: Record<string, any[]> = {};
  for (const c of criteres) {
    const k = c.section_key;
    if (!bySection[k]) bySection[k] = [];
    bySection[k].push(c);
  }

  const totalItems = criteres.length;
  const conformCount = criteres.filter((c: any) => c.conformite === 'O').length;
  const partielCount = criteres.filter((c: any) => c.conformite === 'P').length;
  const nonConformCount = criteres.filter((c: any) => c.conformite === 'N').length;

  const result: (Paragraph | Table)[] = [
    sectionTitle("CHECKLIST D'AUDIT"),
    divider(),

    subTitle('Informations générales'),
    kvParagraph('Sous-projet', data.subprojet ?? '—'),
    kvParagraph('Auditeurs', data.auditeurs ?? '—'),
    kvParagraph('Date', formatDate(data.date)),
    spacer(200),

    subTitle('Synthèse'),
    new Table({
      width: { size: TW, type: WidthType.DXA },
      columnWidths: [4000, TW - 4000],
      rows: [
        new TableRow({ children: [tableCell('Critères évalués', 4000), tableCell(String(totalItems), TW - 4000, { bold: true })] }),
        new TableRow({ children: [tableCell('Conformes', 4000, { shade: true }), tableCell(String(conformCount), TW - 4000, { shade: true, bold: true, color: conformCount > 0 ? C.green : undefined })] }),
        new TableRow({ children: [tableCell('Partiels', 4000), tableCell(String(partielCount), TW - 4000, { bold: true, color: partielCount > 0 ? C.yellow : undefined })] }),
        new TableRow({ children: [tableCell('Non conformes', 4000, { shade: true }), tableCell(String(nonConformCount), TW - 4000, { shade: true, bold: true, color: nonConformCount > 0 ? C.red : undefined })] }),
        ...(data.synth_nb_nc_majeures !== undefined ? [new TableRow({ children: [tableCell('Non-conformités majeures', 4000), tableCell(String(data.synth_nb_nc_majeures), TW - 4000, { bold: true, color: data.synth_nb_nc_majeures > 0 ? C.red : undefined })] })] : []),
        ...(data.synth_domaines_critiques ? [new TableRow({ children: [tableCell('Domaines critiques', 4000, { shade: true }), tableCell(data.synth_domaines_critiques, TW - 4000, { shade: true })] })] : []),
      ],
    }),
    spacer(200),
  ];

  for (const sectionKey of SECTION_ORDER) {
    const items = bySection[sectionKey] ?? [];
    if (items.length === 0) continue;

    const title = SECTION_MAPPING[sectionKey] || sectionKey;
    result.push(subTitle(title));

    const rows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          tableCell('N°', COL[0], { header: true, center: true }),
          tableCell('Critère', COL[1], { header: true }),
          tableCell('Observations', COL[2], { header: true }),
          tableCell('Conformité', COL[3], { header: true, center: true }),
          tableCell('Risque', COL[4], { header: true, center: true }),
        ],
      }),
      ...items.map((item: any, i: number) => {
        const conformite = item.conformite || 'S.O.';
        return new TableRow({
          children: [
            tableCell(item.numero || '—', COL[0], { shade: i % 2 === 1, center: true }),
            tableCell(item.critere || '—', COL[1], { shade: i % 2 === 1 }),
            tableCell(item.observations || '—', COL[2], { shade: i % 2 === 1 }),
            tableCell(CONFORMITE_LABEL[conformite] || conformite, COL[3], { shade: i % 2 === 1, center: true, bold: true, color: CONFORMITE_COLOR[conformite] || C.ink }),
            tableCell(item.risque_non_conformite || '—', COL[4], { shade: i % 2 === 1, center: true }),
          ],
        });
      }),
    ];

    result.push(new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: COL, rows }));
    result.push(spacer(160));
  }

  if (data.synth_signature_auditeur) {
    result.push(spacer(200));
    result.push(kvParagraph('Signature auditeur', data.synth_signature_auditeur));
  }

  return result;
}

export async function exportAuditWord(
  data: any,
  projectName: string,
  projectLocation: string,
  auditors: string,
): Promise<Buffer> {
  const generatedAt = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const projectDate = data.date ? formatDate(data.date) : formatDate(new Date());

  const finalProjectName = data.subprojet || data.project_name || projectName || 'Projet';
  const finalLocation = data.lieu || data.location || projectLocation || 'Non renseigné';
  const finalAuditors = data.auditeurs || data.auditors || auditors || 'Non renseigné';

  const sectionsList = ['INTRODUCTION', "CHECKLIST D'AUDIT", 'CONCLUSION GÉNÉRALE'];

  const doc = new Document({
    numbering: buildNumbering(),
    styles: buildParagraphStyles(),
    sections: [
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
        children: buildCoverPage(finalProjectName, projectDate, finalLocation, finalAuditors, 'audit'),
      },
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
        children: buildTableOfContents(sectionsList),
      },
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: { ...PAGE.margin, top: 1440, bottom: 1440 } } },
        headers: { default: buildHeader(projectName) },
        footers: { default: buildFooter(generatedAt) },
        children: [...buildIntroduction(), ...buildAuditSection(data), pageBreak(), ...buildGeneralConclusion()],
      },
    ],
  });

  return Packer.toBuffer(doc);
}