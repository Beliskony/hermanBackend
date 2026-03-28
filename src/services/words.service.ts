import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  LevelFormat,
  PageBreak,
} from 'docx';
import { IFormData } from '../interfaces/FormData.model';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COLORS = {
  primary: '1F4E79',
  secondary: '2E75B6',
  headerBg: 'D5E8F0',
  altRow: 'F2F8FC',
  white: 'FFFFFF',
  text: '000000',
  muted: '595959',
};

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = {
  top: cellBorder,
  bottom: cellBorder,
  left: cellBorder,
  right: cellBorder,
};

const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

/** Paragraph de titre de section */
function sectionTitle(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, color: COLORS.primary })],
    spacing: { before: 400, after: 200 },
  });
}

/** Paragraphe de sous-titre */
function subTitle(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, color: COLORS.secondary })],
    spacing: { before: 240, after: 120 },
  });
}

/** Ligne clé/valeur simple */
function kvRow(label: string, value: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true }),
      new TextRun({ text: value || '—' }),
    ],
    spacing: { after: 80 },
  });
}

/** Cellule d'en-tête de tableau */
function headerCell(text: string, width: number): TableCell {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, color: COLORS.primary })],
      }),
    ],
  });
}

/** Cellule de données */
function dataCell(
  text: string,
  width: number,
  shade = false
): TableCell {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: {
      fill: shade ? COLORS.altRow : COLORS.white,
      type: ShadingType.CLEAR,
    },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun(text || '—')] })],
  });
}

/** Page break */
function pageBreak(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] });
}

// ─── 1. Page de garde ─────────────────────────────────────────────────────────

function buildCoverPage(data: IFormData): Paragraph[] {
  const { projectInfo } = data;
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 2000, after: 400 },
      children: [
        new TextRun({
          text: 'RAPPORT D\'AUDIT ENVIRONNEMENTAL ET SOCIAL',
          bold: true,
          size: 48,
          color: COLORS.primary,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: projectInfo.projectName, bold: true, size: 36, color: COLORS.secondary }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: `Lieu : ${projectInfo.location}`, size: 26 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: `Période : ${projectInfo.period}`, size: 26 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `Date : ${new Date(projectInfo.date).toLocaleDateString('fr-FR')}`,
          size: 26,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: `Auditeurs : ${projectInfo.auditors}`, size: 26 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `Statut : ${data.status.toUpperCase()}`,
          bold: true,
          size: 24,
          color: COLORS.muted,
        }),
      ],
    }),
    pageBreak(),
  ];
}

// ─── 2. Revue documentaire ────────────────────────────────────────────────────

function buildDocumentReview(data: IFormData): (Paragraph | Table)[] {
  const { documentReview } = data;
  const TABLE_WIDTH = 9026;
  const COL = [2500, 2500, 2500, 1526];

  const rows: TableRow[] = [
    new TableRow({
      children: [
        headerCell('Document', COL[0]),
        headerCell('Présent', COL[1]),
        headerCell('Observations', COL[2]),
        headerCell('Conformité', COL[3]),
      ],
    }),
  ];

  const keys = Object.keys(documentReview.documentsPresents || {});
  keys.forEach((key, i) => {
    const present = documentReview.documentsPresents[key];
    const analysis = documentReview.documentsAnalysis?.[key];
    rows.push(
      new TableRow({
        children: [
          dataCell(key, COL[0], i % 2 === 1),
          dataCell(present ? 'Oui' : 'Non', COL[1], i % 2 === 1),
          dataCell(analysis?.findings || '—', COL[2], i % 2 === 1),
          dataCell(analysis?.rating || '—', COL[3], i % 2 === 1),
        ],
      })
    );
  });

  return [
    sectionTitle('1. Revue Documentaire'),
    new Table({ width: { size: TABLE_WIDTH, type: WidthType.DXA }, columnWidths: COL, rows }),
    new Paragraph({ spacing: { after: 120 } }),
    ...(documentReview.documentsManquants
      ? [kvRow('Documents manquants', documentReview.documentsManquants)]
      : []),
    ...(documentReview.autresDocuments
      ? [kvRow('Autres documents', documentReview.autresDocuments)]
      : []),
    pageBreak(),
  ];
}

// ─── 3. Inspection de terrain ─────────────────────────────────────────────────

function buildInspectionCategory(
  title: string,
  items: Record<string, { status: string; observations: string; risk: string }>,
  tableWidth: number,
  col: number[]
): (Paragraph | Table)[] {
  if (!items || Object.keys(items).length === 0) return [];

  const rows: TableRow[] = [
    new TableRow({
      children: [
        headerCell('Élément', col[0]),
        headerCell('Statut', col[1]),
        headerCell('Observations', col[2]),
        headerCell('Risque', col[3]),
      ],
    }),
  ];

  Object.entries(items).forEach(([key, val], i) => {
    rows.push(
      new TableRow({
        children: [
          dataCell(key, col[0], i % 2 === 1),
          dataCell(val.status, col[1], i % 2 === 1),
          dataCell(val.observations, col[2], i % 2 === 1),
          dataCell(val.risk, col[3], i % 2 === 1),
        ],
      })
    );
  });

  return [
    subTitle(title),
    new Table({ width: { size: tableWidth, type: WidthType.DXA }, columnWidths: col, rows }),
    new Paragraph({ spacing: { after: 160 } }),
  ];
}

function buildFieldInspection(data: IFormData): (Paragraph | Table)[] {
  const { fieldInspection } = data;
  const TW = 9026;
  const COL = [2800, 1500, 3226, 1500];

  return [
    sectionTitle('2. Inspection de Terrain'),
    kvRow('Projet', fieldInspection.projectName),
    kvRow('Date', new Date(fieldInspection.date).toLocaleDateString('fr-FR')),
    kvRow('Auditeurs', fieldInspection.auditors),
    kvRow('Accompagnateurs', fieldInspection.accompaniers || '—'),
    kvRow('Zones visitées', (fieldInspection.zones || []).join(', ')),
    new Paragraph({ spacing: { after: 200 } }),
    ...buildInspectionCategory('Gestion de l\'eau', fieldInspection.waterManagement, TW, COL),
    ...buildInspectionCategory('Gestion des déchets', fieldInspection.wasteManagement, TW, COL),
    ...buildInspectionCategory('Émissions', fieldInspection.emissions, TW, COL),
    ...buildInspectionCategory('Santé & Sécurité', fieldInspection.healthSafety, TW, COL),
    ...buildInspectionCategory('Communauté', fieldInspection.community, TW, COL),
    pageBreak(),
  ];
}

// ─── 4. Entretiens parties prenantes ──────────────────────────────────────────

function buildStakeholderInterview(data: IFormData): (Paragraph | Table)[] {
  const { stakeholderInterview } = data;
  const TW = 9026;
  const COL2 = [4513, 4513];

  const profileRows: TableRow[] = [
    new TableRow({
      children: [headerCell('Champ', COL2[0]), headerCell('Valeur', COL2[1])],
    }),
    ...([
      ['Nom', stakeholderInterview.profile?.name],
      ['Fonction', stakeholderInterview.profile?.function],
      ['Genre', stakeholderInterview.profile?.gender],
      ['Tranche d\'âge', stakeholderInterview.profile?.ageRange],
      ['Type de partie prenante', stakeholderInterview.stakeholderType],
      ['Lieu', stakeholderInterview.location],
      ['Durée', stakeholderInterview.duration],
      ['Date', new Date(stakeholderInterview.date).toLocaleDateString('fr-FR')],
    ] as [string, string][]).map(([k, v], i) =>
      new TableRow({
        children: [dataCell(k, COL2[0], i % 2 === 1), dataCell(v || '—', COL2[1], i % 2 === 1)],
      })
    ),
  ];

  const consentRows: TableRow[] = [
    new TableRow({
      children: [headerCell('Consentement', COL2[0]), headerCell('Accordé', COL2[1])],
    }),
    ...(
      [
        ['Confidentialité', stakeholderInterview.consent?.confidentiality],
        ['Prise de notes', stakeholderInterview.consent?.notes],
        ['Enregistrement', stakeholderInterview.consent?.recording],
      ] as [string, boolean][]
    ).map(([k, v], i) =>
      new TableRow({
        children: [
          dataCell(k, COL2[0], i % 2 === 1),
          dataCell(v ? 'Oui' : 'Non', COL2[1], i % 2 === 1),
        ],
      })
    ),
  ];

  const evalRows: TableRow[] = [
    new TableRow({
      children: [headerCell('Critère', COL2[0]), headerCell('Note /5', COL2[1])],
    }),
    ...(
      [
        ['Qualité', stakeholderInterview.evaluation?.quality],
        ['Franchise', stakeholderInterview.evaluation?.frankness],
        ['Pertinence', stakeholderInterview.evaluation?.relevance],
        ['Climat', stakeholderInterview.evaluation?.climate],
      ] as [string, number][]
    ).map(([k, v], i) =>
      new TableRow({
        children: [
          dataCell(k, COL2[0], i % 2 === 1),
          dataCell(String(v ?? '—'), COL2[1], i % 2 === 1),
        ],
      })
    ),
  ];

  const responseKeys = Object.keys(stakeholderInterview.responses || {});
  const responseRows: TableRow[] = [
    new TableRow({
      children: [headerCell('Question', COL2[0]), headerCell('Réponse', COL2[1])],
    }),
    ...responseKeys.map((k, i) =>
      new TableRow({
        children: [
          dataCell(k, COL2[0], i % 2 === 1),
          dataCell(stakeholderInterview.responses[k], COL2[1], i % 2 === 1),
        ],
      })
    ),
  ];

  return [
    sectionTitle('3. Entretiens Parties Prenantes'),
    subTitle('Profil'),
    new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: COL2, rows: profileRows }),
    new Paragraph({ spacing: { after: 160 } }),
    subTitle('Consentement'),
    new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: COL2, rows: consentRows }),
    new Paragraph({ spacing: { after: 160 } }),
    subTitle('Réponses'),
    new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: COL2, rows: responseRows }),
    new Paragraph({ spacing: { after: 160 } }),
    subTitle('Évaluation de l\'entretien'),
    new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: COL2, rows: evalRows }),
    new Paragraph({ spacing: { after: 160 } }),
    pageBreak(),
  ];
}

// ─── 5. Évaluation Genre ──────────────────────────────────────────────────────

function buildGenderAssessment(data: IFormData): (Paragraph | Table)[] {
  const { genderAssessment } = data;
  const TW = 9026;

  // Objectifs
  const objCols = [3500, 3000, 2526];
  const objRows: TableRow[] = [
    new TableRow({
      children: [
        headerCell('Objectif', objCols[0]),
        headerCell('Indicateur', objCols[1]),
        headerCell('Statut', objCols[2]),
      ],
    }),
    ...(genderAssessment.objectives || []).map((o, i) =>
      new TableRow({
        children: [
          dataCell(o.objective, objCols[0], i % 2 === 1),
          dataCell(o.indicator, objCols[1], i % 2 === 1),
          dataCell(o.status, objCols[2], i % 2 === 1),
        ],
      })
    ),
  ];

  // Données quantitatives
  const qtCols = [2300, 1500, 1500, 1500, 2226];
  const qtRows: TableRow[] = [
    new TableRow({
      children: [
        headerCell('Catégorie', qtCols[0]),
        headerCell('Femmes', qtCols[1]),
        headerCell('Hommes', qtCols[2]),
        headerCell('Autres', qtCols[3]),
        headerCell('Source', qtCols[4]),
      ],
    }),
    ...Object.entries(genderAssessment.quantitativeData || {}).map(([k, v], i) =>
      new TableRow({
        children: [
          dataCell(k, qtCols[0], i % 2 === 1),
          dataCell(String(v.women), qtCols[1], i % 2 === 1),
          dataCell(String(v.men), qtCols[2], i % 2 === 1),
          dataCell(String(v.other), qtCols[3], i % 2 === 1),
          dataCell(v.source, qtCols[4], i % 2 === 1),
        ],
      })
    ),
  ];

  // Consultations
  const consCols = [2500, 1500, 2000, 3026];
  const consRows: TableRow[] = [
    new TableRow({
      children: [
        headerCell('Groupe', consCols[0]),
        headerCell('Sessions', consCols[1]),
        headerCell('Participants', consCols[2]),
        headerCell('Méthode', consCols[3]),
      ],
    }),
    ...(genderAssessment.consultations || []).map((c, i) =>
      new TableRow({
        children: [
          dataCell(c.group, consCols[0], i % 2 === 1),
          dataCell(String(c.sessions), consCols[1], i % 2 === 1),
          dataCell(String(c.participants), consCols[2], i % 2 === 1),
          dataCell(c.method, consCols[3], i % 2 === 1),
        ],
      })
    ),
  ];

  // Recommandations
  const recCols = [2800, 1200, 1200, 1826, 2000];
  const recRows: TableRow[] = [
    new TableRow({
      children: [
        headerCell('Recommandation', recCols[0]),
        headerCell('Priorité', recCols[1]),
        headerCell('Portée', recCols[2]),
        headerCell('Responsable', recCols[3]),
        headerCell('Échéance', recCols[4]),
      ],
    }),
    ...(genderAssessment.recommendations || []).map((r, i) =>
      new TableRow({
        children: [
          dataCell(r.recommendation, recCols[0], i % 2 === 1),
          dataCell(r.priority, recCols[1], i % 2 === 1),
          dataCell(r.scope, recCols[2], i % 2 === 1),
          dataCell(r.responsible, recCols[3], i % 2 === 1),
          dataCell(r.deadline, recCols[4], i % 2 === 1),
        ],
      })
    ),
  ];

  return [
    sectionTitle('4. Évaluation Genre'),
    subTitle('Objectifs'),
    new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: objCols, rows: objRows }),
    new Paragraph({ spacing: { after: 160 } }),
    subTitle('Données Quantitatives'),
    new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: qtCols, rows: qtRows }),
    new Paragraph({ spacing: { after: 160 } }),
    subTitle('Consultations'),
    new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: consCols, rows: consRows }),
    new Paragraph({ spacing: { after: 160 } }),
    subTitle('Recommandations'),
    new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: recCols, rows: recRows }),
    new Paragraph({ spacing: { after: 160 } }),
    pageBreak(),
  ];
}

// ─── 6. Mécanisme de plainte ──────────────────────────────────────────────────

function buildComplaintMechanism(data: IFormData): (Paragraph | Table)[] {
  const { complaintMechanism } = data;
  const TW = 9026;
  const COL3 = [3200, 3200, 2626];
  const COL2 = [4513, 4513];

  // Base documentaire
  const docRows: TableRow[] = [
    new TableRow({
      children: [
        headerCell('Document', COL3[0]),
        headerCell('Constat', COL3[1]),
        headerCell('Évaluation', COL3[2]),
      ],
    }),
    ...Object.entries(complaintMechanism.documentaryBasis || {}).map(([k, v], i) =>
      new TableRow({
        children: [
          dataCell(k, COL3[0], i % 2 === 1),
          dataCell(v.finding, COL3[1], i % 2 === 1),
          dataCell(v.evaluation, COL3[2], i % 2 === 1),
        ],
      })
    ),
  ];

  // Critères clés
  const critRows: TableRow[] = [
    new TableRow({
      children: [headerCell('Critère', COL2[0]), headerCell('Évaluation', COL2[1])],
    }),
    ...Object.entries(complaintMechanism.keyCriteria || {}).map(([k, v], i) =>
      new TableRow({
        children: [
          dataCell(k, COL2[0], i % 2 === 1),
          dataCell(v.evaluation, COL2[1], i % 2 === 1),
        ],
      })
    ),
  ];

  // Faiblesses
  const weakCols = [3500, 3000, 2526];
  const weakRows: TableRow[] = [
    new TableRow({
      children: [
        headerCell('Déficience', weakCols[0]),
        headerCell('Conséquence', weakCols[1]),
        headerCell('Sévérité', weakCols[2]),
      ],
    }),
    ...(complaintMechanism.weaknesses || []).map((w, i) =>
      new TableRow({
        children: [
          dataCell(w.deficiency, weakCols[0], i % 2 === 1),
          dataCell(w.consequence, weakCols[1], i % 2 === 1),
          dataCell(w.severity, weakCols[2], i % 2 === 1),
        ],
      })
    ),
  ];

  // Recommandations
  const recCols = [3000, 1200, 2000, 2826];
  const recRows: TableRow[] = [
    new TableRow({
      children: [
        headerCell('Recommandation', recCols[0]),
        headerCell('Priorité', recCols[1]),
        headerCell('Responsable', recCols[2]),
        headerCell('Échéance', recCols[3]),
      ],
    }),
    ...(complaintMechanism.recommendations || []).map((r, i) =>
      new TableRow({
        children: [
          dataCell(r.recommendation, recCols[0], i % 2 === 1),
          dataCell(r.priority, recCols[1], i % 2 === 1),
          dataCell(r.responsible, recCols[2], i % 2 === 1),
          dataCell(r.deadline, recCols[3], i % 2 === 1),
        ],
      })
    ),
  ];

  return [
    sectionTitle('5. Mécanisme de Plainte'),
    subTitle('Base Documentaire'),
    new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: COL3, rows: docRows }),
    new Paragraph({ spacing: { after: 160 } }),
    subTitle('Critères Clés'),
    new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: COL2, rows: critRows }),
    new Paragraph({ spacing: { after: 160 } }),
    subTitle('Points Forts'),
    ...(complaintMechanism.strengths || []).map(
      (s) =>
        new Paragraph({
          numbering: { reference: 'bullets', level: 0 },
          children: [new TextRun(s)],
        })
    ),
    new Paragraph({ spacing: { after: 160 } }),
    subTitle('Faiblesses'),
    new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: weakCols, rows: weakRows }),
    new Paragraph({ spacing: { after: 160 } }),
    subTitle('Recommandations'),
    new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: recCols, rows: recRows }),
    new Paragraph({ spacing: { after: 240 } }),
    subTitle('Conclusion Générale'),
    new Paragraph({
      children: [new TextRun(complaintMechanism.globalConclusion || '—')],
      spacing: { after: 160 },
    }),
  ];
}

// ─── Export principal ─────────────────────────────────────────────────────────

export async function generateFormDataWordDocument(data: IFormData): Promise<Buffer> {
  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '•',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    styles: {
      default: {
        document: { run: { font: 'Arial', size: 22 } },
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 32, bold: true, font: 'Arial', color: COLORS.primary },
          paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 26, bold: true, font: 'Arial', color: COLORS.secondary },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: [
          ...buildCoverPage(data),
          ...buildDocumentReview(data),
          ...buildFieldInspection(data),
          ...buildStakeholderInterview(data),
          ...buildGenderAssessment(data),
          ...buildComplaintMechanism(data),
        ] as Paragraph[],
      },
    ],
  });

  return Packer.toBuffer(doc);
}