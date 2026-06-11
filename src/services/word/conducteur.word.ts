// ─────────────────────────────────────────────────────────────────────────────
//  word/conducteur.word.ts  —  Export Checklist Conducteur
// ─────────────────────────────────────────────────────────────────────────────

import { Document, Packer, Paragraph, Table, TableRow, WidthType } from 'docx';
import { C, PAGE, TW, REPONSE_BOOLEENNE_LABEL, REPONSE_BOOLEENNE_COLOR } from './shared/styles';
import { sectionTitle, subTitle, paragraph, kvParagraph, pageBreak, spacer, tableCell, buildNumbering, buildParagraphStyles, formatDate, divider } from './shared/helpers';
import { buildCoverPage, buildTableOfContents, buildIntroduction, buildGeneralConclusion, buildHeader, buildFooter } from './shared/templates';

export function buildConducteurSection(data: any): (Paragraph | Table)[] {
  if (!data || !data.subprojet) return [];

  const COL = [600, 3500, 1000, 2000, 2538];

  const sections = [
    { num: '01', title: 'Informations générales', key: 'section1_infoGenerales' },
    { num: '02', title: 'Processus initial T1', key: 'section2_processusInitialT1' },
    { num: '03', title: 'Installation T2', key: 'section3_installationT2' },
    { num: '04', title: 'Recrutement T2', key: 'section4_recrutementT2' },
    { num: '05', title: 'HSE T2', key: 'section5_hseT2' },
    { num: '06', title: 'Gestion environnementale T2', key: 'section6_gestionEnvT2' },
    { num: '07', title: 'Sensibilisation T2', key: 'section7_sensibilisationT2' },
    { num: '08', title: 'MGP T2', key: 'section8_mgpT2' },
    { num: '09', title: 'Fermeture T2', key: 'section9_fermetureT2' },
    { num: '10', title: 'Exploitation T3', key: 'section10_exploitationT3' },
    { num: '11', title: 'Synthèse', key: 'section11_synthese' },
  ];

  const result: (Paragraph | Table)[] = [
    sectionTitle('CHECKLIST CONDUCTEUR DES TRAVAUX'),
    divider(),
    subTitle('Informations générales'),
    kvParagraph('Sous-projet', data.subprojet ?? '—'),
    kvParagraph('Auditeur', data.auditeur ?? '—'),
    kvParagraph('Entreprise', data.entreprise ?? '—'),
    kvParagraph('Personne rencontrée', data.personne_rencontree ?? '—'),
    kvParagraph('Fonction', data.fonction ?? '—'),
    kvParagraph('Date', formatDate(data.date)),
    kvParagraph('Lieu', data.lieu ?? '—'),
    spacer(),
  ];

  for (const section of sections) {
    const items = data[section.key] ?? [];
    if (items.length > 0) {
      result.push(subTitle(`${section.num} - ${section.title}`));
      const rows: TableRow[] = [
        new TableRow({ tableHeader: true, children: [
          tableCell('N°', COL[0], { header: true, center: true }),
          tableCell('Question', COL[1], { header: true }),
          tableCell('Réponse', COL[2], { header: true, center: true }),
          tableCell('Détail', COL[3], { header: true }),
          tableCell('Observations', COL[4], { header: true }),
        ] }),
        ...items.map((item: any, i: number) => new TableRow({ children: [
          tableCell(item.numero || '—', COL[0], { shade: i % 2 === 1, center: true }),
          tableCell((item.question || '').substring(0, 80), COL[1], { shade: i % 2 === 1 }),
          tableCell(REPONSE_BOOLEENNE_LABEL[item.reponse_booleenne] || '—', COL[2], { shade: i % 2 === 1, center: true, bold: true, color: REPONSE_BOOLEENNE_COLOR[item.reponse_booleenne] }),
          tableCell((item.reponse || '—').substring(0, 50), COL[3], { shade: i % 2 === 1 }),
          tableCell((item.observations || '—').substring(0, 50), COL[4], { shade: i % 2 === 1 }),
        ]})),
      ];
      result.push(new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: COL, rows }));
      result.push(spacer(160));
    }
  }

  if (data.commentaires_libres) {
    result.push(subTitle('Commentaires libres'));
    result.push(paragraph(data.commentaires_libres, { italic: true }));
  }

  return result;
}

export async function exportConducteurWord(data: any, projectName: string, projectLocation: string, auditors: string): Promise<Buffer> {
  const generatedAt = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const projectDate = data.date ? formatDate(data.date) : formatDate(new Date());

  const sectionsList = [
    'INTRODUCTION',
    'CHECKLIST CONDUCTEUR',
    'CONCLUSION GÉNÉRALE',
  ];

  const doc = new Document({
    numbering: buildNumbering(),
    styles: buildParagraphStyles(),
    sections: [
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
        children: buildCoverPage(projectName, projectDate, projectLocation, auditors, 'conducteur'),
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
          ...buildConducteurSection(data),
          pageBreak(),
          ...buildGeneralConclusion(),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}