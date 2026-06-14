// ─────────────────────────────────────────────────────────────────────────────
//  word/shared/templates.ts  —  Page de garde, sommaire, intro, conclusion
//  ACENVIRO — Cabinet d'audit environnemental et social
// ─────────────────────────────────────────────────────────────────────────────

import {
  Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, BorderStyle,
  WidthType, ShadingType, TabStopType, PageNumber,
  TabStopPosition,
} from 'docx';
import { C, PAGE, TW, CELL_MARGINS, TYPE_LABELS, ACENVIRO } from './styles';
import {
  sectionTitle, subTitle, paragraph, bulletPoint,
  kvParagraph, pageBreak, spacer, tableCell, divider,
} from './helpers';

// =============================================================================
//  PAGE DE GARDE
// =============================================================================

export function buildCoverPage(
  projectName: string,
  projectDate: string,
  projectLocation: string,
  auditors: string,
  formType?: string,
): (Paragraph | Table)[] {
  const typeText = formType ? TYPE_LABELS[formType] || "RAPPORT D'AUDIT" : "RAPPORT D'AUDIT";

  // Tableau info-projet — pleine largeur (TW)
  // Colonnes : libellé 2800 + valeur (TW - 2800)
  const labelW = 2800;
  const valueW = TW - labelW; // 6838

  const infoRow = (label: string, value: string, shade: boolean) =>
    new TableRow({
      children: [
        new TableCell({
          width: { size: labelW, type: WidthType.DXA },
          shading: { fill: C.headerBg, type: ShadingType.CLEAR },
          margins: CELL_MARGINS,
          borders: {
            top:    { style: BorderStyle.NONE, size: 0, color: 'auto' },
            bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            left:   { style: BorderStyle.NONE, size: 0, color: 'auto' },
            right:  { style: BorderStyle.NONE, size: 0, color: 'auto' },
          },
          children: [new Paragraph({
            children: [new TextRun({ text: label, bold: true, color: C.headerText, size: 20, font: 'Calibri' })],
          })],
        }),
        new TableCell({
          width: { size: valueW, type: WidthType.DXA },
          shading: { fill: shade ? C.altRow : C.white, type: ShadingType.CLEAR },
          margins: CELL_MARGINS,
          borders: {
            top:    { style: BorderStyle.NONE, size: 0, color: 'auto' },
            bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            left:   { style: BorderStyle.SINGLE, size: 4, color: C.border },
            right:  { style: BorderStyle.NONE, size: 0, color: 'auto' },
          },
          children: [new Paragraph({
            children: [new TextRun({ text: value || '—', color: C.ink, size: 20, font: 'Calibri' })],
          })],
        }),
      ],
    });

  return [
    // ── Espace haut de page ──────────────────────────────────────────────────
    spacer(1800),

    // ── Nom de l'entreprise ──────────────────────────────────────────────────
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: ACENVIRO.name, bold: true, size: 52, color: C.navy, font: 'Calibri' }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({ text: ACENVIRO.tagline, size: 20, color: C.muted, font: 'Calibri', italics: true }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 500 },
      children: [
        new TextRun({ text: ACENVIRO.website, size: 18, color: C.muted, font: 'Calibri' }),
      ],
    }),

    // ── Ligne de séparation ──────────────────────────────────────────────────
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: C.navy, space: 1 } },
      spacing: { after: 500 },
      children: [],
    }),

    // ── Type de document ────────────────────────────────────────────────────
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: typeText, bold: true, size: 40, color: C.navy, font: 'Calibri' }),
      ],
    }),

    // ── Nom du projet ───────────────────────────────────────────────────────
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 700 },
      children: [
        new TextRun({ text: projectName.toUpperCase(), bold: true, size: 28, color: C.ink, font: 'Calibri' }),
      ],
    }),

    // ── Tableau d'informations — pleine largeur ──────────────────────────────
    new Table({
      width: { size: TW, type: WidthType.DXA },
      columnWidths: [labelW, valueW],
      borders: {
        top:    { style: BorderStyle.NONE, size: 0, color: 'auto' },
        bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        left:   { style: BorderStyle.NONE, size: 0, color: 'auto' },
        right:  { style: BorderStyle.NONE, size: 0, color: 'auto' },
      },
      rows: [
        infoRow('Projet',     projectName,     false),
        infoRow('Lieu',       projectLocation, true),
        infoRow('Date',       projectDate,     false),
        infoRow('Auditeurs',  auditors,        true),
      ],
    }),

    pageBreak(),
  ];
}

// =============================================================================
//  SOMMAIRE
// =============================================================================

export function buildTableOfContents(sections: string[]): Paragraph[] {
  return [
    // Titre SOMMAIRE
    new Paragraph({
      spacing: { before: 200, after: 400 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.navy, space: 4 } },
      children: [
        new TextRun({ text: 'SOMMAIRE', bold: true, size: 32, color: C.navy, font: 'Calibri' }),
      ],
    }),

    // Entrées du sommaire
    ...sections.map((sec, idx) =>
      new Paragraph({
        spacing: { after: 120 },
        tabStops: [
          { type: TabStopType.RIGHT, position: TW },
        ],
        children: [
          new TextRun({
            text: `${idx + 1}.`,
            bold: true,
            size: 20,
            color: C.navy,
            font: 'Calibri',
          }),
          new TextRun({
            text: `\u2002${sec}`,   // espace fine après le numéro
            size: 20,
            color: C.ink,
            font: 'Calibri',
          }),
        ],
      }),
    ),

    pageBreak(),
  ];
}

// =============================================================================
//  INTRODUCTION
// =============================================================================

export function buildIntroduction(): (Paragraph | Table)[] {
  return [
    sectionTitle('INTRODUCTION', '1'),
    divider(),

    subTitle('1.1 Contexte de l\'audit'),
    paragraph(
      "Le présent rapport d'audit environnemental et social a été réalisé dans le cadre de l'évaluation " +
      "des performances environnementales et sociales du projet. Il s'inscrit dans une démarche " +
      "d'amélioration continue visant à garantir la conformité réglementaire et l'adoption des meilleures pratiques.",
    ),
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

// =============================================================================
//  CONCLUSION GÉNÉRALE
// =============================================================================

export function buildGeneralConclusion(): (Paragraph | Table)[] {
  return [
    sectionTitle('CONCLUSION GÉNÉRALE'),
    divider(),

    paragraph(
      "Au terme de cet audit environnemental et social, l'évaluation globale du projet " +
      "permet de dégager les constats suivants :",
    ),
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

    paragraph(
      "La mise en œuvre des recommandations formulées permettra d'atteindre un niveau de conformité " +
      "satisfaisant et de garantir la pérennité des performances environnementales et sociales du projet.",
      { bold: true },
    ),
    spacer(600),

    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: `Fait à ______, le ${new Date().toLocaleDateString('fr-FR')}`,
          size: 18, color: C.muted, font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 40 },
      children: [
        new TextRun({ text: ACENVIRO.name, bold: true, size: 20, color: C.navy, font: 'Calibri' }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: ACENVIRO.tagline, size: 16, color: C.muted, font: 'Calibri', italics: true }),
      ],
    }),
    // Pas de pageBreak() ici — évite les pages blanches en fin de document
  ];
}

// =============================================================================
//  EN-TÊTE
// =============================================================================

export function buildHeader(title: string): Header {
  return new Header({
    children: [
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.navy, space: 2 } },
        spacing: { after: 0 },
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({
            text: ACENVIRO.name,
            bold: true, size: 16, color: C.navy, font: 'Calibri',
          }),
          new TextRun({
            text: `\u2002—\u2002${title}`,
            size: 16, color: C.muted, font: 'Calibri',
          }),
          new TextRun({
            text: `\t${new Date().toLocaleDateString('fr-FR')}`,
            size: 14, color: C.muted, font: 'Calibri', italics: true,
          }),
        ],
      }),
    ],
  });
}

// =============================================================================
//  PIED DE PAGE
// =============================================================================

export function buildFooter(generatedAt?: string): Footer {
  const dateStr = generatedAt ||
    new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  return new Footer({
    children: [
      new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 6, color: C.border, space: 2 } },
        spacing: { before: 80 },
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({
            text: `${ACENVIRO.website}  —  Document confidentiel  —  ${dateStr}`,
            size: 14, color: C.muted, font: 'Calibri', italics: true,
          }),
          new TextRun({ text: '\tPage ', size: 14, color: C.muted, font: 'Calibri' }),
          new TextRun({ children: [PageNumber.CURRENT], size: 14, color: C.navy, bold: true, font: 'Calibri' }),
          new TextRun({ text: ' / ', size: 14, color: C.muted, font: 'Calibri' }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 14, color: C.navy, bold: true, font: 'Calibri' }),
        ],
      }),
    ],
  });
}