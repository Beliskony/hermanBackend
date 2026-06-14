// ─────────────────────────────────────────────────────────────────────────────
//  word/conducteur.word.ts  —  Export Checklist Conducteur
//  ACENVIRO — Cabinet d'audit environnemental et social
// ─────────────────────────────────────────────────────────────────────────────

import { Document, Packer, Paragraph, Table, TableRow, WidthType } from 'docx';
import { C, PAGE, TW, REPONSE_BOOLEENNE_LABEL, REPONSE_BOOLEENNE_COLOR } from './shared/styles';
import {
  sectionTitle, subTitle, paragraph, kvParagraph,
  pageBreak, spacer, tableCell, buildNumbering, buildParagraphStyles, formatDate, divider,
} from './shared/helpers';
import {
  buildCoverPage, buildTableOfContents, buildIntroduction,
  buildGeneralConclusion, buildHeader, buildFooter,
} from './shared/templates';

const SECTION_MAPPING: Record<string, { num: string; title: string }> = {
  s01: { num: '01', title: 'Présentation' },
  s02: { num: '02', title: 'Documents E&S' },
  s03: { num: '03', title: 'Sécurité chantier' },
  s04: { num: '04', title: "Main d'œuvre" },
  s05: { num: '05', title: 'Santé & sécurité travailleurs' },
  s06: { num: '06', title: 'Gestion des déchets' },
  s07: { num: '07', title: 'VIH/SIDA' },
  s08: { num: '08', title: 'Mécanisme de plainte' },
  s09: { num: '09', title: 'Fermeture chantier' },
  s10: { num: '10', title: 'Exploitation' },
  s11: { num: '11', title: 'Bilan général' },
};

const SECTION_ORDER = ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09', 's10', 's11'];

export function buildConducteurSection(data: any): (Paragraph | Table)[] {
  if (!data || !data.subprojet) return [];

  const COL = [500, 3400, 1200, 2400, 2138];
  const questions = data.questions ?? [];

  const bySection: Record<string, any[]> = {};
  for (const q of questions) {
    const k = q.section_key;
    if (!bySection[k]) bySection[k] = [];
    bySection[k].push(q);
  }

  const total = questions.length;
  const stats = questions.reduce(
    (acc: any, q: any) => {
      switch (q.reponse_booleenne) {
        case 'oui': acc.oui++; break;
        case 'non': acc.non++; break;
        case 'partiellement': acc.partiel++; break;
        case 'nsp': acc.nsp++; break;
        case 'sans_objet': acc.sansObjet++; break;
      }
      return acc;
    },
    { oui: 0, non: 0, partiel: 0, nsp: 0, sansObjet: 0 }
  );

  const pct = (n: number) => total > 0 ? `${n} (${Math.round((n / total) * 100)}%)` : '0';

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
    kvParagraph('Durée (min)', data.duree_entretien ?? '—'),
    kvParagraph('Lieu', data.lieu ?? '—'),
    spacer(200),
  ];

  for (const sectionKey of SECTION_ORDER) {
    const items = bySection[sectionKey] ?? [];
    if (items.length === 0) continue;

    const { num, title } = SECTION_MAPPING[sectionKey] || { num: sectionKey, title: sectionKey };
    result.push(subTitle(`${num} — ${title}`));

    const rows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          tableCell('N°', COL[0], { header: true, center: true }),
          tableCell('Question', COL[1], { header: true }),
          tableCell('Réponse', COL[2], { header: true, center: true }),
          tableCell('Détail', COL[3], { header: true }),
          tableCell('Observations', COL[4], { header: true }),
        ],
      }),
      ...items.map((item: any, i: number) => new TableRow({
        children: [
          tableCell(item.numero || '—', COL[0], { shade: i % 2 === 1, center: true }),
          tableCell((item.question || '').substring(0, 120), COL[1], { shade: i % 2 === 1 }),
          tableCell(REPONSE_BOOLEENNE_LABEL[item.reponse_booleenne] || '—', COL[2], {
            shade: i % 2 === 1, center: true, bold: true,
            color: REPONSE_BOOLEENNE_COLOR[item.reponse_booleenne] || C.ink,
          }),
          tableCell((item.reponse || '—').substring(0, 120), COL[3], { shade: i % 2 === 1 }),
          tableCell((item.observations || '—').substring(0, 120), COL[4], { shade: i % 2 === 1 }),
        ],
      })),
    ];

    result.push(new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: COL, rows }));
    result.push(spacer(160));
  }

  if (total > 0) {
    result.push(subTitle('Synthèse des résultats'));
    result.push(new Table({
      width: { size: TW, type: WidthType.DXA },
      columnWidths: [4000, TW - 4000],
      rows: [
        new TableRow({ children: [tableCell('Questions évaluées', 4000), tableCell(String(total), TW - 4000, { bold: true })] }),
        new TableRow({ children: [tableCell('Conformes (Oui)', 4000, { shade: true }), tableCell(pct(stats.oui), TW - 4000, { shade: true, bold: true, color: stats.oui > 0 ? C.green : undefined })] }),
        new TableRow({ children: [tableCell('Non conformes (Non)', 4000), tableCell(pct(stats.non), TW - 4000, { bold: true, color: stats.non > 0 ? C.red : undefined })] }),
        new TableRow({ children: [tableCell('Partiellement conformes', 4000, { shade: true }), tableCell(pct(stats.partiel), TW - 4000, { shade: true, bold: true, color: stats.partiel > 0 ? C.yellow : undefined })] }),
        ...(stats.nsp > 0 ? [new TableRow({ children: [tableCell('Non déterminé (NSP)', 4000), tableCell(pct(stats.nsp), TW - 4000, { bold: true, color: C.muted }) ] })] : []),
        ...(stats.sansObjet > 0 ? [new TableRow({ children: [tableCell('Sans objet', 4000, { shade: true }), tableCell(pct(stats.sansObjet), TW - 4000, { shade: true, color: C.muted }) ] })] : []),
      ],
    }));
    result.push(spacer(200));
  }

  if (data.commentaires_libres) {
    result.push(subTitle('Commentaires libres'));
    result.push(paragraph(data.commentaires_libres, { italic: true }));
    result.push(spacer());
  }

  if (data.signature_auditeur) {
    result.push(spacer(200));
    result.push(kvParagraph("Signature de l'auditeur", data.signature_auditeur));
  }

  return result;
}

export async function exportConducteurWord(
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

  const sectionsList = ['INTRODUCTION', 'CHECKLIST CONDUCTEUR', 'CONCLUSION GÉNÉRALE'];

  const doc = new Document({
    numbering: buildNumbering(),
    styles: buildParagraphStyles(),
    sections: [
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
        children: buildCoverPage(finalProjectName, projectDate, finalLocation, finalAuditors, 'conducteur'),
      },
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
        children: buildTableOfContents(sectionsList),
      },
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: { ...PAGE.margin, top: 1440, bottom: 1440 } } },
        headers: { default: buildHeader(projectName) },
        footers: { default: buildFooter(generatedAt) },
        children: [...buildIntroduction(), ...buildConducteurSection(data), pageBreak(), ...buildGeneralConclusion()],
      },
    ],
  });

  return Packer.toBuffer(doc);
}