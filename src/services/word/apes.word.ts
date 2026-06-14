// ─────────────────────────────────────────────────────────────────────────────
//  word/apes.word.ts  —  Export APES dynamique (CORRIGÉ - TypeScript OK)
//  ACENVIRO — Cabinet d'audit environnemental et social
// ─────────────────────────────────────────────────────────────────────────────

import { BorderStyle, Document, Packer, Paragraph, Table, TableRow, TextRun, WidthType } from 'docx';
import { C, TW, RISK_COLOR, PAGE } from './shared/styles';
import {
  sectionTitle, subTitle, paragraph, kvParagraph,
  pageBreak, spacer, tableCell, buildNumbering, buildParagraphStyles, formatDate,
  divider,
} from './shared/helpers';
import {
  buildCoverPage, buildTableOfContents, buildIntroduction,
  buildGeneralConclusion, buildHeader, buildFooter,
} from './shared/templates';

// =============================================================================
//  LABELS POUR LES STATUTS
// =============================================================================

const STATUS_LABEL: Record<string, string> = {
  O:      'Conforme',
  P:      'Partiel',
  N:      'Non conforme',
  'S.O.': 'Sans objet',
};

const STATUS_COLOR: Record<string, string> = {
  O:      C.green,
  P:      C.yellow,
  N:      C.red,
  'S.O.': C.muted,
};

// =============================================================================
//  FONCTION DE PARSING DES RÉPONSES JSON
// =============================================================================

interface ParsedAnswer {
  reponse: string | null;
  observation: string | null;
}

/**
 * Parse une réponse qui peut être:
 * - Une string JSON: '{"reponse": "O", "observation": "..."}'
 * - Une string simple: 'O', 'N', 'P', 'true', 'false'
 * - Un objet: { reponse: "O", observation: "..." }
 */
function parseAnswer(rawAnswer: any): ParsedAnswer {
  if (rawAnswer === undefined || rawAnswer === null) {
    return { reponse: null, observation: null };
  }

  // CAS 1: Si c'est une string
  if (typeof rawAnswer === 'string') {
    // Essayer de parser du JSON
    if (rawAnswer.startsWith('{')) {
      try {
        const parsed = JSON.parse(rawAnswer);
        return {
          reponse: parsed.reponse || parsed.response || null,
          observation: parsed.observation || parsed.observations || null,
        };
      } catch (e) {
        // Ce n'est pas du JSON valide
      }
    }
    
    // Vérifier les réponses simples
    if (rawAnswer === 'O' || rawAnswer === 'N' || rawAnswer === 'P') {
      return { reponse: rawAnswer, observation: null };
    }
    if (rawAnswer === 'true') return { reponse: 'O', observation: null };
    if (rawAnswer === 'false') return { reponse: 'N', observation: null };
    
    // Sinon, c'est peut-être une observation
    return { reponse: null, observation: rawAnswer };
  }

  // CAS 2: Si c'est un objet
  if (typeof rawAnswer === 'object' && rawAnswer !== null) {
    return {
      reponse: rawAnswer.reponse || rawAnswer.response || null,
      observation: rawAnswer.observation || rawAnswer.observations || null,
    };
  }

  // CAS 3: Booléen
  if (typeof rawAnswer === 'boolean') {
    return { reponse: rawAnswer ? 'O' : 'N', observation: null };
  }

  return { reponse: null, observation: null };
}

// =============================================================================
//  RÉCUPÉRATION DE LA RÉPONSE POUR UNE QUESTION
// =============================================================================

// 🔥 CORRECTION: Type modifié pour accepter null dans observations
interface DirectQuestion {
  question_id: string;
  answer: any;
  observations?: string | null;  // 🔥 Accepte null
}

interface AnswerSources {
  // Réponses directes des questions (la source la plus fiable)
  questionsDirect?: DirectQuestion[];
  // Autres sources
  document_review?: Record<string, any>;
  field_inspection_water?: Record<string, any>;
  field_inspection_waste?: Record<string, any>;
  field_inspection_emissions?: Record<string, any>;
  field_inspection_health?: Record<string, any>;
  field_inspection_community?: Record<string, any>;
  stakeholder_responses?: Record<string, any>;
  gender_quantitative?: Record<string, any>;
  complaint_docs?: Record<string, any>;
}

function getAnswer(questionId: string, sources: AnswerSources): ParsedAnswer {
  // PRIORITÉ 1: Chercher dans les questions directes
  if (sources.questionsDirect) {
    const direct = sources.questionsDirect.find(q => q.question_id === questionId);
    if (direct) {
      const parsed = parseAnswer(direct.answer);
      // Si l'observation est dans le champ observations de la question
      if (direct.observations && !parsed.observation) {
        return { reponse: parsed.reponse, observation: direct.observations };
      }
      return parsed;
    }
  }

  // PRIORITÉ 2: Chercher dans les autres sources
  const sourceMap: Array<Record<string, any>> = [
    sources.document_review || {},
    sources.field_inspection_water || {},
    sources.field_inspection_waste || {},
    sources.field_inspection_emissions || {},
    sources.field_inspection_health || {},
    sources.field_inspection_community || {},
    sources.stakeholder_responses || {},
    sources.gender_quantitative || {},
    sources.complaint_docs || {},
  ];

  for (const source of sourceMap) {
    if (source[questionId] !== undefined) {
      return parseAnswer(source[questionId]);
    }
  }

  return { reponse: null, observation: null };
}

// =============================================================================
//  GÉNÉRATION D'UN TABLEAU POUR UNE SECTION
// =============================================================================

function buildSectionTable(
  sectionKey: string,
  sectionLabel: string,
  questions: Array<{ question_id: string; question_text: string }>,
  sources: AnswerSources,
): (Paragraph | Table)[] {
  if (questions.length === 0) return [];

  const COL = [1200, 5500, 600, 600, 800, 3000];

  const rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        tableCell('Code', COL[0], { header: true, center: true }),
        tableCell('Question', COL[1], { header: true }),
        tableCell('Oui', COL[2], { header: true, center: true }),
        tableCell('Non', COL[3], { header: true, center: true }),
        tableCell('N/A', COL[4], { header: true, center: true }),
        tableCell('Observations', COL[5], { header: true }),
      ],
    }),
  ];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const parsed = getAnswer(q.question_id, sources);
    const { reponse, observation } = parsed;
    
    // Déterminer les cases à cocher
    let isOui = false;
    let isNon = false;
    let isNA = false;
    let naText = '';
    
    const statusUpper = (reponse || '').toUpperCase();
    
    if (statusUpper === 'O') {
      isOui = true;
    } else if (statusUpper === 'N') {
      isNon = true;
    } else if (statusUpper === 'P') {
      isNA = true;
      naText = 'Partiel';
    } else if (statusUpper === 'S.O.' || statusUpper === 'NA') {
      isNA = true;
      naText = 'S.O.';
    } else if (reponse && reponse !== 'null') {
      // Si la réponse est autre chose (ex: une observation directe)
      isNA = true;
      naText = reponse.length > 20 ? reponse.substring(0, 20) + '…' : reponse;
    }

    // Texte d'observation
    const observationText = observation && observation.trim() && observation !== 'null' 
      ? (observation.length > 80 ? observation.substring(0, 80) + '…' : observation)
      : '—';

    rows.push(new TableRow({
      children: [
        tableCell(q.question_id, COL[0], { shade: i % 2 === 1, center: true, bold: true }),
        tableCell(q.question_text, COL[1], { shade: i % 2 === 1 }),
        tableCell(isOui ? '✓' : '', COL[2], { shade: i % 2 === 1, center: true, bold: true, color: isOui ? C.green : C.ink }),
        tableCell(isNon ? '✓' : '', COL[3], { shade: i % 2 === 1, center: true, bold: true, color: isNon ? C.red : C.ink }),
        tableCell(isNA ? naText : '', COL[4], { shade: i % 2 === 1, center: true, color: C.muted }),
        tableCell(observationText, COL[5], { shade: i % 2 === 1, color: C.muted }),
      ],
    }));
  }

  return [
    subTitle(sectionLabel),
    new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: COL, rows }),
    spacer(160),
  ];
}


// =============================================================================
//  SECTIONS POUR L'EXPORT GLOBAL (À AJOUTER DANS apes.word.ts)
// =============================================================================

export function buildDocumentReviewSection(data: ApesFormData): (Paragraph | Table)[] {
  if (!data?.document_review?.documents_presents) {
    return [paragraph('Aucune donnée de revue documentaire disponible.')];
  }
  
  const docs = data.document_review.documents_presents;
  const rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        tableCell('Document', 4000, { header: true }),
        tableCell('Présent', 2000, { header: true, center: true }),
        tableCell('Observations', TW - 6000, { header: true }),
      ],
    }),
  ];
  
  let idx = 0;
  for (const [key, value] of Object.entries(docs)) {
    const parsed = parseAnswer(value);
    rows.push(new TableRow({
      children: [
        tableCell(key, 4000, { shade: idx % 2 === 1 }),
        tableCell(parsed.reponse === 'O' ? '✓' : (parsed.reponse === 'N' ? '✗' : '—'), 2000, { shade: idx % 2 === 1, center: true }),
        tableCell(parsed.observation || '—', TW - 6000, { shade: idx % 2 === 1 }),
      ],
    }));
    idx++;
  }
  
  return [
    subTitle('Revue documentaire'),
    new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: [4000, 2000, TW - 6000], rows }),
    spacer(),
  ];
}

export function buildFieldInspectionSection(data: ApesFormData): (Paragraph | Table)[] {
  return [
    subTitle('Inspection terrain'),
    paragraph('Les données d\'inspection terrain sont intégrées dans les tableaux d\'évaluation par thème.'),
    spacer(),
  ];
}

export function buildStakeholderInterviewSection(data: ApesFormData): (Paragraph | Table)[] {
  return [
    subTitle('Entretiens parties prenantes'),
    paragraph('Les données d\'entretien sont intégrées dans les tableaux d\'évaluation par thème.'),
    spacer(),
  ];
}

export function buildGenderAssessmentSection(data: ApesFormData): (Paragraph | Table)[] {
  return [
    subTitle('Évaluation genre et inclusion'),
    paragraph('Les données d\'évaluation genre sont intégrées dans les tableaux d\'évaluation par thème.'),
    spacer(),
  ];
}

export function buildComplaintMechanismSection(data: ApesFormData): (Paragraph | Table)[] {
  return [
    subTitle('Mécanisme de gestion des plaintes'),
    paragraph('Les données MGP sont intégrées dans les tableaux d\'évaluation par thème.'),
    spacer(),
  ];
}


// =============================================================================
//  SECTION SYNTHÈSE RAPIDE
// =============================================================================

function buildQuickSynthesis(
  questionsBySection: Record<string, Array<{ question_id: string; question_text: string }>>,
  sources: AnswerSources,
): (Paragraph | Table)[] {
  const stats: Array<{ label: string; value: string; valueColor?: string }> = [];

  const sectionLabels: Record<string, string> = {
    conformite_reglementaire: 'Conformité réglementaire',
    planification: 'Planification',
    entreprises: 'Entreprises',
    gestion_impacts_env: 'Gestion impacts environnementaux',
    gestion_impacts_sociaux: 'Gestion impacts sociaux',
    participation: 'Participation',
    suivi_evaluation: 'Suivi & évaluation',
    formation: 'Formation',
    gestion_risques: 'Gestion des risques',
    transparence: 'Transparence',
    amelioration_continue: 'Amélioration continue',
    exploitation: 'Exploitation',
  };

  for (const [sectionKey, questions] of Object.entries(questionsBySection)) {
    let total = 0;
    let conformes = 0;
    let partiels = 0;
    let nonConformes = 0;
    let nonRenseignes = 0;

    for (const q of questions) {
      const parsed = getAnswer(q.question_id, sources);
      const status = (parsed.reponse || '').toUpperCase();
      total++;
      if (status === 'O') conformes++;
      else if (status === 'P') partiels++;
      else if (status === 'N') nonConformes++;
      else nonRenseignes++;
    }

    let valueColor = C.green;
    if (nonConformes > 0) valueColor = C.red;
    else if (partiels > 0) valueColor = C.yellow;
    else if (nonRenseignes === total) valueColor = C.muted;

    stats.push({
      label: sectionLabels[sectionKey] || sectionKey,
      value: `${conformes}/${total} conformes, ${partiels} partiels, ${nonConformes} non conformes${nonRenseignes > 0 ? `, ${nonRenseignes} non renseignés` : ''}`,
      valueColor,
    });
  }

  return [
    sectionTitle('SYNTHÈSE RAPIDE'),
    divider(),
    new Table({
      width: { size: TW, type: WidthType.DXA },
      columnWidths: [4000, TW - 4000],
      rows: stats.map((s, i) => new TableRow({
        children: [
          tableCell(s.label, 4000, { shade: i % 2 === 1, bold: true }),
          tableCell(s.value, TW - 4000, { shade: i % 2 === 1, color: s.valueColor }),
        ],
      })),
    }),
    spacer(),
  ];
}

// =============================================================================
//  EXPORT PRINCIPAL
// =============================================================================

interface ApesFormData {
  project_name: string;
  subprojet?: string; 
  date: string;
  auditors: string;
  auditeurs?: string;
  location: string;
  lieu?: string;
  period: string;
  status?: string;
  // Données brutes de l'API
  document_review?: { documents_presents?: Record<string, any> };
  field_inspection?: {
    water_management?: Record<string, any>;
    waste_management?: Record<string, any>;
    emissions?: Record<string, any>;
    health_safety?: Record<string, any>;
    community?: Record<string, any>;
  };
  stakeholder_interview?: { responses?: Record<string, any> };
  gender_assessment?: { quantitative_data?: Record<string, any> };
  complaint_mechanism?: { documentary_basis?: Record<string, any> };
  // IMPORTANT: Les questions avec leurs réponses directes
  questions?: Array<{
    section_key: string;
    question_id: string;
    question_text: string;
    sort_order: number;
    answer: any;
    observations?: string | null;
  }>;
}

function normalizeValue(value: string | undefined | null): string {
  if (!value || value === '---' || value === '—' || value.trim() === '') {
    return 'Non renseigné';
  }
  return value;
}

export async function exportAPESWord(
  data: ApesFormData,
  projectName: string,
  projectLocation: string,
  auditors: string,
  questions: Array<{ section_key: string; question_id: string; question_text: string; sort_order: number }>,
): Promise<Buffer> {
  const generatedAt = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  const finalProjectName = data.subprojet || data.project_name || projectName || 'Projet';
  const finalLocation = data.location || data.lieu || projectLocation || 'Non renseigné';
  const finalAuditors = data.auditors || data.auditeurs || auditors || 'Non renseigné';

  
  const projectDate = data.date ? formatDate(data.date) : formatDate(new Date());

  // Construire la liste des questions par section
  const questionsBySection: Record<string, Array<{ question_id: string; question_text: string }>> = {};
  for (const q of questions) {
    if (!questionsBySection[q.section_key]) questionsBySection[q.section_key] = [];
    questionsBySection[q.section_key].push({
      question_id: q.question_id,
      question_text: q.question_text,
    });
  }

  // Construire les sources de réponses
  const sources: AnswerSources = {
    // Le plus important: les réponses directes des questions
    questionsDirect: data.questions || [],
    // Autres sources
    document_review: data.document_review?.documents_presents ?? {},
    field_inspection_water: data.field_inspection?.water_management ?? {},
    field_inspection_waste: data.field_inspection?.waste_management ?? {},
    field_inspection_emissions: data.field_inspection?.emissions ?? {},
    field_inspection_health: data.field_inspection?.health_safety ?? {},
    field_inspection_community: data.field_inspection?.community ?? {},
    stakeholder_responses: data.stakeholder_interview?.responses ?? {},
    gender_quantitative: data.gender_assessment?.quantitative_data ?? {},
    complaint_docs: data.complaint_mechanism?.documentary_basis ?? {},
  };

  // Log de débogage (apparaîtra dans la console du serveur)
  console.log('Export APES Word - Nombre de questions:', questions.length);
  console.log('Réponses directes disponibles:', sources.questionsDirect?.length || 0);
  if (sources.questionsDirect && sources.questionsDirect.length > 0) {
    console.log('Exemple de réponse:', JSON.stringify(sources.questionsDirect[0], null, 2));
  }

  const sectionLabels: Record<string, string> = {
    conformite_reglementaire: 'Conformité réglementaire',
    planification: 'Planification',
    entreprises: 'Entreprises',
    gestion_impacts_env: 'Gestion des impacts environnementaux',
    gestion_impacts_sociaux: 'Gestion des impacts sociaux',
    participation: 'Participation des parties prenantes',
    suivi_evaluation: 'Suivi et évaluation',
    formation: 'Formation et sensibilisation',
    gestion_risques: 'Gestion des risques',
    transparence: 'Transparence et information',
    amelioration_continue: 'Amélioration continue',
    exploitation: 'Exploitation',
  };

  const sectionsList = [
    'INTRODUCTION',
    'ÉVALUATION PAR THÈME',
    'SYNTHÈSE RAPIDE',
    'CONCLUSION GÉNÉRALE',
  ];

  const doc = new Document({
    numbering: buildNumbering(),
    styles: buildParagraphStyles(),
    sections: [
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
        children: buildCoverPage(finalProjectName, projectDate, finalLocation, finalAuditors, 'apes'),
      },
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
        children: buildTableOfContents(sectionsList),
      },
      {
        properties: {
          page: {
            size: { width: PAGE.width, height: PAGE.height },
            margin: { ...PAGE.margin, top: 1440, bottom: 1440 },
          },
        },
        headers: { default: buildHeader(projectName) },
        footers: { default: buildFooter(generatedAt) },
        children: [
          ...buildIntroduction(),
          sectionTitle('ÉVALUATION PAR THÈME'),
          divider(),
          ...Object.entries(questionsBySection).flatMap(([sectionKey, qs]) =>
            buildSectionTable(sectionKey, sectionLabels[sectionKey] || sectionKey, qs, sources)
          ),
          pageBreak(),
          ...buildQuickSynthesis(questionsBySection, sources),
          pageBreak(),
          ...buildGeneralConclusion(),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}