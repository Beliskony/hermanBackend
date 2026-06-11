// ─────────────────────────────────────────────────────────────────────────────
//  word/guide.word.ts  —  Export Guide d'Entretien
// ─────────────────────────────────────────────────────────────────────────────

import { Document, Packer, Paragraph, Table } from 'docx';
import { C, PAGE, GUIDE_LABELS } from './shared/styles';
import { sectionTitle, subTitle, paragraph, kvParagraph, pageBreak, spacer, buildNumbering, buildParagraphStyles, formatDate, divider } from './shared/helpers';
import { buildCoverPage, buildTableOfContents, buildIntroduction, buildGeneralConclusion, buildHeader, buildFooter } from './shared/templates';

export function buildGuideEntretienSection(data: any): (Paragraph | Table)[] {
  if (!data || !data.guide_type) return [];

  const result: (Paragraph | Table)[] = [
    sectionTitle('GUIDE D\'ENTRETIEN'),
    divider(),
    subTitle('Informations générales'),
    kvParagraph('Type de guide', GUIDE_LABELS[data.guide_type] ?? data.guide_type),
    kvParagraph('Sous-projet', data.subprojet ?? '—'),
    kvParagraph('Nom', data.gi_nom ?? '—'),
    kvParagraph('Fonction', data.gi_fonction ?? '—'),
    kvParagraph('Contact', data.gi_contact ?? '—'),
    kvParagraph('Date', formatDate(data.gi_date)),
    kvParagraph('Lieu', data.gi_lieu ?? '—'),
    spacer(),
  ];

  const themes = [
    { key: 'theme1', title: 'Thème 1' },
    { key: 'theme2', title: 'Thème 2' },
    { key: 'theme3', title: 'Thème 3' },
    { key: 'theme4', title: 'Thème 4' },
  ];

  for (const theme of themes) {
    const themeData = data[theme.key];
    if (themeData?.questions?.length) {
      result.push(subTitle(theme.title));
      for (const q of themeData.questions) {
        result.push(paragraph(`${q.questionId || q.question_id}: ${q.question}`, { bold: true }));
        result.push(paragraph(`Réponse : ${q.reponse || '—'}`, { italic: true, spacing: 60 }));
        result.push(spacer(60));
      }
      result.push(spacer());
    }
  }

  if (data.notes_auditeur) {
    result.push(subTitle('Notes de l\'auditeur'));
    result.push(paragraph(data.notes_auditeur, { italic: true }));
  }

  return result;
}

export async function exportGuideWord(data: any, projectName: string, projectLocation: string, auditors: string): Promise<Buffer> {
  const generatedAt = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const projectDate = data.gi_date ? formatDate(data.gi_date) : formatDate(new Date());

  const sectionsList = [
    'INTRODUCTION',
    'GUIDE D\'ENTRETIEN',
    'CONCLUSION GÉNÉRALE',
  ];

  const doc = new Document({
    numbering: buildNumbering(),
    styles: buildParagraphStyles(),
    sections: [
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
        children: buildCoverPage(projectName, projectDate, projectLocation, auditors, 'guide'),
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
          ...buildGuideEntretienSection(data),
          pageBreak(),
          ...buildGeneralConclusion(),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}