// ─────────────────────────────────────────────────────────────────────────────
//  word/shared/helpers.ts  —  Fonctions helpers pour la génération Word
// ─────────────────────────────────────────────────────────────────────────────

import {
  Paragraph, TextRun, Table, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageBreak, PageNumber,
  HeadingLevel,
} from 'docx';
import { C, TW, BORDER, CELL_MARGINS } from './styles';

// =============================================================================
//  TITRES
// =============================================================================

/** Titre de section principal (H1) — sans numéro de couleur différente */
export function sectionTitle(text: string, num?: string): Paragraph {
  const children: TextRun[] = [];
  if (num) {
    children.push(new TextRun({ text: `${num}  `, bold: true, size: 30, color: C.muted, font: 'Calibri' }));
  }
  children.push(new TextRun({ text, bold: true, size: 30, color: C.navy, font: 'Calibri' }));

  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 160 },
    children,
  });
}

/** Sous-titre de section (H2) — sans soulignement */
export function subTitle(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({ text, bold: true, size: 22, color: C.ink, font: 'Calibri' }),
    ],
  });
}

// =============================================================================
//  TEXTE
// =============================================================================

export function paragraph(
  text: string,
  options?: { bold?: boolean; italic?: boolean; color?: string; spacing?: number },
): Paragraph {
  return new Paragraph({
    spacing: { after: options?.spacing ?? 120 },
    children: [
      new TextRun({
        text,
        bold: options?.bold ?? false,
        italics: options?.italic ?? false,
        color: options?.color ?? C.ink,
        size: 20,
        font: 'Calibri',
      }),
    ],
  });
}

export function bulletPoint(text: string): Paragraph {
  return new Paragraph({
    numbering: { reference: 'bullet-list', level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, size: 20, font: 'Calibri', color: C.ink })],
  });
}

/** Paire clé : valeur — libellé en navy gras, valeur en noir normal */
export function kvParagraph(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text: `${label} : `, bold: true, size: 20, color: C.navy, font: 'Calibri' }),
      new TextRun({ text: value || '—', size: 20, color: C.ink, font: 'Calibri' }),
    ],
  });
}

// =============================================================================
//  SÉPARATEURS ET ESPACEMENT
// =============================================================================

/** Ligne horizontale fine sous les titres de section */
export function divider(): Paragraph {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.border, space: 1 } },
    spacing: { after: 200 },
    children: [],
  });
}

export function pageBreak(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] });
}

export function spacer(after = 120): Paragraph {
  return new Paragraph({ spacing: { after }, children: [] });
}

// =============================================================================
//  CELLULES DE TABLEAU
// =============================================================================

export interface TableCellOptions {
  center?: boolean;
  bold?: boolean;
  header?: boolean;
  shade?: boolean;
  color?: string;
}

export function tableCell(text: string, width: number, options: TableCellOptions = {}): TableCell {
  const textColor = options.header
    ? C.headerText
    : (options.color || C.ink);

  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: options.header
      ? { fill: C.headerBg, type: ShadingType.CLEAR }
      : { fill: options.shade ? C.altRow : C.white, type: ShadingType.CLEAR },
    margins: CELL_MARGINS,
    borders: {
      top:    BORDER(),
      bottom: BORDER(),
      left:   BORDER(),
      right:  BORDER(),
    },
    children: [
      new Paragraph({
        alignment: options.center ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [
          new TextRun({
            text,
            bold: options.bold ?? options.header ?? false,
            color: textColor,
            size: 18,
            font: 'Calibri',
          }),
        ],
      }),
    ],
  });
}

// =============================================================================
//  CONFIGURATION DOCX
// =============================================================================

export function buildNumbering() {
  return {
    config: [{
      reference: 'bullet-list',
      levels: [{
        level: 0,
        format: LevelFormat.BULLET,
        text: '\u2013',          // tiret demi-cadratin — plus sobre que •
        alignment: AlignmentType.LEFT,
        style: {
          paragraph: { indent: { left: 600, hanging: 300 } },
          run: { color: C.navy, font: 'Calibri', size: 20 },
        },
      }],
    }],
  };
}

export function buildParagraphStyles() {
  return {
    default: {
      document: { run: { font: 'Calibri', size: 20, color: C.ink } },
    },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 30, bold: true, font: 'Calibri', color: C.navy },
        paragraph: { spacing: { before: 480, after: 160 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 22, bold: true, font: 'Calibri', color: C.ink },
        paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 1 },
      },
    ],
  };
}

// =============================================================================
//  UTILITAIRES
// =============================================================================

export function formatDate(date: Date | string | null): string {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR');
}