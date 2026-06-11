// ─────────────────────────────────────────────────────────────────────────────
//  word/shared/templates.ts  —  Page de garde, sommaire, intro, conclusion
// ─────────────────────────────────────────────────────────────────────────────

import { Document, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType, TabStopType, TabStopPosition, PageNumber } from 'docx';
import { C, PAGE, CELL_MARGINS, TYPE_LABELS } from './styles';
import { sectionTitle, subTitle, paragraph, bulletPoint, kvParagraph, pageBreak, spacer, tableCell, divider } from './helpers';

export function buildCoverPage(projectName: string, projectDate: string, projectLocation: string, auditors: string, formType?: string): (Paragraph | Table)[] {
  const typeText = formType ? TYPE_LABELS[formType] || "RAPPORT D'AUDIT" : "RAPPORT D'AUDIT";

  return [
    new Paragraph({ spacing: { before: 2000, after: 0 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: typeText, bold: true, size: 48, color: C.primary, font: 'Calibri' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: projectName.toUpperCase(), bold: true, size: 36, color: C.secondary, font: 'Calibri' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.SINGLE, size: 16, color: C.accent, space: 1 } },
      spacing: { after: 600 },
      children: [],
    }),
    new Table({
      width: { size: 7000, type: WidthType.DXA },
      columnWidths: [2800, 4200],
      rows: [
        new TableRow({ children: [
          new TableCell({ width: { size: 2800, type: WidthType.DXA }, shading: { fill: C.primary }, margins: CELL_MARGINS, children: [new Paragraph({ children: [new TextRun({ text: 'Projet', bold: true, color: C.white, size: 20, font: 'Calibri' })] })] }),
          new TableCell({ width: { size: 4200, type: WidthType.DXA }, shading: { fill: C.lightGray }, margins: CELL_MARGINS, children: [new Paragraph({ children: [new TextRun({ text: projectName, size: 20, color: C.text, font: 'Calibri' })] })] }),
        ] }),
        new TableRow({ children: [
          new TableCell({ width: { size: 2800, type: WidthType.DXA }, shading: { fill: C.primary }, margins: CELL_MARGINS, children: [new Paragraph({ children: [new TextRun({ text: 'Lieu', bold: true, color: C.white, size: 20, font: 'Calibri' })] })] }),
          new TableCell({ width: { size: 4200, type: WidthType.DXA }, shading: { fill: C.white }, margins: CELL_MARGINS, children: [new Paragraph({ children: [new TextRun({ text: projectLocation, size: 20, color: C.text, font: 'Calibri' })] })] }),
        ] }),
        new TableRow({ children: [
          new TableCell({ width: { size: 2800, type: WidthType.DXA }, shading: { fill: C.primary }, margins: CELL_MARGINS, children: [new Paragraph({ children: [new TextRun({ text: 'Date', bold: true, color: C.white, size: 20, font: 'Calibri' })] })] }),
          new TableCell({ width: { size: 4200, type: WidthType.DXA }, shading: { fill: C.lightGray }, margins: CELL_MARGINS, children: [new Paragraph({ children: [new TextRun({ text: projectDate, size: 20, color: C.text, font: 'Calibri' })] })] }),
        ] }),
        new TableRow({ children: [
          new TableCell({ width: { size: 2800, type: WidthType.DXA }, shading: { fill: C.primary }, margins: CELL_MARGINS, children: [new Paragraph({ children: [new TextRun({ text: 'Auditeurs', bold: true, color: C.white, size: 20, font: 'Calibri' })] })] }),
          new TableCell({ width: { size: 4200, type: WidthType.DXA }, shading: { fill: C.white }, margins: CELL_MARGINS, children: [new Paragraph({ children: [new TextRun({ text: auditors, size: 20, color: C.text, font: 'Calibri' })] })] }),
        ] }),
      ],
    }),
    pageBreak(),
  ];
}

export function buildTableOfContents(sections: string[]): Paragraph[] {
  return [
    sectionTitle('SOMMAIRE'),
    spacer(200),
    ...sections.map((sec, idx) => new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({ text: `${idx + 1}. ${sec}`, size: 18, color: C.text, font: 'Calibri' })],
    })),
    pageBreak(),
  ];
}

export function buildIntroduction(): (Paragraph | Table)[] {
  return [
    sectionTitle('INTRODUCTION', '1'),
    divider(),
    subTitle('1.1 Contexte de l\'audit'),
    paragraph("Le présent rapport d'audit environnemental et social a été réalisé dans le cadre de l'évaluation des performances environnementales et sociales du projet. Il s'inscrit dans une démarche d'amélioration continue visant à garantir la conformité réglementaire et l'adoption des meilleures pratiques."),
    spacer(),
    subTitle('1.2 Objectifs et périmètre'),
    paragraph("L'audit avait pour objectifs de :"),
    bulletPoint("Évaluer la conformité du projet aux exigences légales et aux engagements du PGES"),
    bulletPoint("Identifier les non-conformités et les risques environnementaux et sociaux"),
    bulletPoint("Proposer des mesures correctives et préventives adaptées"),
    bulletPoint("Capitaliser les bonnes pratiques observées"),
    spacer(),
    subTitle('1.3 Méthodologie'),
    paragraph("La méthodologie déployée combine plusieurs approches complémentaires :"),
    bulletPoint("Revue documentaire exhaustive des documents de projet"),
    bulletPoint("Inspection terrain avec observation directe des installations"),
    bulletPoint("Entretiens semi-directifs avec les parties prenantes"),
    bulletPoint("Analyse des données quantitatives et qualitatives"),
    pageBreak(),
  ];
}

export function buildGeneralConclusion(): (Paragraph | Table)[] {
  return [
    sectionTitle('CONCLUSION GÉNÉRALE'),
    divider(),
    paragraph("Au terme de cet audit environnemental et social, l'évaluation globale du projet permet de dégager les constats suivants :"),
    spacer(),
    subTitle('Forces et atouts'),
    bulletPoint("Engagement de la direction dans la mise en œuvre des mesures environnementales"),
    bulletPoint("Mise en place d'un système de gestion environnementale structuré"),
    bulletPoint("Consultation régulière des parties prenantes locales"),
    spacer(),
    subTitle('Points d\'amélioration'),
    bulletPoint("Renforcement nécessaire de la documentation environnementale"),
    bulletPoint("Amélioration des mesures d'atténuation des nuisances"),
    bulletPoint("Formation continue du personnel aux enjeux HSE"),
    spacer(),
    subTitle('Recommandations stratégiques'),
    bulletPoint("Élaborer un plan d'actions correctives avec échéancier"),
    bulletPoint("Désigner des référents HSE par secteur d'activité"),
    bulletPoint("Instaurer des revues de direction trimestrielles sur les performances E&S"),
    bulletPoint("Renforcer le mécanisme de gestion des plaintes des communautés"),
    spacer(),
    paragraph("La mise en œuvre des recommandations formulées permettra d'atteindre un niveau de conformité satisfaisant et de garantir la pérennité des performances environnementales et sociales du projet.", { bold: true }),
    spacer(400),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: "Fait à ______, le ", size: 18, color: C.text, font: 'Calibri' }),
        new TextRun({ text: new Date().toLocaleDateString('fr-FR'), size: 18, color: C.text, font: 'Calibri' }),
      ],
    }),
    spacer(200),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: "L'équipe d'audit", bold: true, size: 20, color: C.primary, font: 'Calibri' }),
      ],
    }),
    pageBreak(),
  ];
}

export function buildHeader(title: string): Header {
  return new Header({
    children: [
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.primary, space: 1 } },
        spacing: { after: 0 },
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({ text: title.toUpperCase(), bold: true, size: 16, color: C.primary, font: 'Calibri' }),
          new TextRun({ text: `\t${new Date().toLocaleDateString('fr-FR')}`, size: 16, color: C.muted, font: 'Calibri', italics: true }),
        ],
      }),
    ],
  });
}

export function buildFooter(generatedAt?: string): Footer {
  const dateStr = generatedAt || new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  return new Footer({
    children: [
      new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 8, color: C.accent, space: 1 } },
        spacing: { before: 80 },
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({ text: `Document généré le ${dateStr}  —  Rapport confidentiel`, size: 14, color: C.muted, font: 'Calibri', italics: true }),
          new TextRun({ text: '\tPage ', size: 14, color: C.muted, font: 'Calibri' }),
          new TextRun({ children: [PageNumber.CURRENT], size: 14, color: C.primary, bold: true, font: 'Calibri' }),
          new TextRun({ text: ' / ', size: 14, color: C.muted, font: 'Calibri' }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 14, color: C.primary, bold: true, font: 'Calibri' }),
        ],
      }),
    ],
  });
}