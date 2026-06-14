// ─────────────────────────────────────────────────────────────────────────────
//  words.service.ts  —  Service principal d'export Word
//  
//  Ce fichier réexporte toutes les fonctions d'export des différents formulaires
// ─────────────────────────────────────────────────────────────────────────────

// Réexportation de toutes les fonctions d'export
export {
  exportAPESWord,
  exportGuideWord,
  exportAuditWord,
  exportConducteurWord,
  exportDataCollectionWord,
} from './index';

// Export global
import { Document, Packer, Paragraph, Table } from 'docx';
import { PAGE } from './shared/styles';
import { sectionTitle, subTitle, pageBreak, buildNumbering, buildParagraphStyles, formatDate } from './shared/helpers';
import { buildCoverPage, buildTableOfContents, buildIntroduction, buildGeneralConclusion, buildHeader, buildFooter } from './shared/templates';
import { buildDocumentReviewSection, buildFieldInspectionSection, buildStakeholderInterviewSection, buildGenderAssessmentSection, buildComplaintMechanismSection, exportAPESWord } from './apes.word';
import { buildGuideEntretienSection, exportGuideWord } from './guide.word';
import { buildAuditSection, exportAuditWord } from './audit.word';
import { buildConducteurSection, exportConducteurWord } from './conducteur.word';
import { 
  buildDataCollectionRevueDocSection, 
  buildDataCollectionInspectionSection, 
  buildDataCollectionEntretienSection, 
  buildDataCollectionGenreSection, 
  buildDataCollectionMGPSection, 
  buildDataCollectionQuickSynthesis,
  exportDataCollectionWord 
} from './data_collection';

// Imports des services
import { APESFormService } from '../formulaire/APES_form';
import { guideEntretienService } from '../formulaire/Guide_entretient';
import { checklistAuditService, checklistConducteurService } from '../formulaire/Checklist.service';
import { dataCollectionService } from '../formulaire/data_collection.service';

// Instances des services
const apesFormService = new APESFormService();

// =============================================================================
//  EXPORT GLOBAL - TOUS LES FORMULAIRES D'UN PROJET
// =============================================================================

export async function exportAllFormsWord(
  projectName: string,
  projectLocation: string,
  auditors: string,
  apesData: any | null,
  guideData: any[] | null,
  auditData: any[] | null,
  conducteurData: any[] | null,
  dataCollectionData?: any[] | null
): Promise<Buffer> {
  const generatedAt = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const projectDate = formatDate(new Date());

  const sectionsList = [
    'INTRODUCTION',
    ...(apesData ? ['RAPPORT APES (COMPLET)'] : []),
    ...(guideData && guideData.length > 0 ? ['GUIDES D\'ENTRETIEN'] : []),
    ...(auditData && auditData.length > 0 ? ['CHECKLISTS D\'AUDIT'] : []),
    ...(conducteurData && conducteurData.length > 0 ? ['CHECKLISTS CONDUCTEUR'] : []),
    ...(dataCollectionData && dataCollectionData.length > 0 ? ['COLLECTE DE DONNÉES'] : []),
    'CONCLUSION GÉNÉRALE',
  ];

  const children: (Paragraph | Table)[] = [...buildIntroduction()];

  // APES complet
  if (apesData) {
    children.push(sectionTitle('RAPPORT APES (COMPLET)'));
    children.push(...buildDocumentReviewSection(apesData));
    children.push(pageBreak());
    children.push(...buildFieldInspectionSection(apesData));
    children.push(pageBreak());
    children.push(...buildStakeholderInterviewSection(apesData));
    children.push(pageBreak());
    children.push(...buildGenderAssessmentSection(apesData));
    children.push(pageBreak());
    children.push(...buildComplaintMechanismSection(apesData));
    children.push(pageBreak());
  }

  // Guides d'entretien
  if (guideData && guideData.length > 0) {
    children.push(sectionTitle('GUIDES D\'ENTRETIEN'));
    for (let i = 0; i < guideData.length; i++) {
      children.push(subTitle(`Guide ${i + 1}`));
      children.push(...buildGuideEntretienSection(guideData[i]));
      if (i < guideData.length - 1) children.push(pageBreak());
    }
    children.push(pageBreak());
  }

  // Checklists audit
  if (auditData && auditData.length > 0) {
    children.push(sectionTitle('CHECKLISTS D\'AUDIT'));
    for (let i = 0; i < auditData.length; i++) {
      children.push(subTitle(`Audit ${i + 1}`));
      children.push(...buildAuditSection(auditData[i]));
      if (i < auditData.length - 1) children.push(pageBreak());
    }
    children.push(pageBreak());
  }

  // Checklists conducteur
  if (conducteurData && conducteurData.length > 0) {
    children.push(sectionTitle('CHECKLISTS CONDUCTEUR'));
    for (let i = 0; i < conducteurData.length; i++) {
      children.push(subTitle(`Conducteur ${i + 1}`));
      children.push(...buildConducteurSection(conducteurData[i]));
      if (i < conducteurData.length - 1) children.push(pageBreak());
    }
    children.push(pageBreak());
  }

  // Data Collection
  if (dataCollectionData && dataCollectionData.length > 0) {
    children.push(sectionTitle('COLLECTE DE DONNÉES'));
    for (let i = 0; i < dataCollectionData.length; i++) {
      const dc = dataCollectionData[i];
      children.push(subTitle(`Collecte ${i + 1}`));
      
      if (dc.revue_documentaire) {
        children.push(...buildDataCollectionRevueDocSection(dc.revue_documentaire));
        children.push(pageBreak());
      }
      if (dc.inspection_terrain) {
        children.push(...buildDataCollectionInspectionSection(dc.inspection_terrain));
        children.push(pageBreak());
      }
      if (dc.entretien_pp) {
        children.push(...buildDataCollectionEntretienSection(dc.entretien_pp));
        children.push(pageBreak());
      }
      if (dc.evaluation_genre) {
        children.push(...buildDataCollectionGenreSection(dc.evaluation_genre));
        children.push(pageBreak());
      }
      if (dc.evaluation_mgp) {
        children.push(...buildDataCollectionMGPSection(dc.evaluation_mgp));
        children.push(pageBreak());
      }
      children.push(...buildDataCollectionQuickSynthesis(dc));
      
      if (i < dataCollectionData.length - 1) children.push(pageBreak());
    }
    children.push(pageBreak());
  }

  // Conclusion générale
  children.push(...buildGeneralConclusion());

  const doc = new Document({
    numbering: buildNumbering(),
    styles: buildParagraphStyles(),
    sections: [
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
        children: buildCoverPage(projectName, projectDate, projectLocation, auditors, 'global'),
      },
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
        children: buildTableOfContents(sectionsList),
      },
      {
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: { ...PAGE.margin, top: 1440, bottom: 1440 } } },
        headers: { default: buildHeader(projectName) },
        footers: { default: buildFooter(generatedAt) },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

// =============================================================================
//  EXPORTS INDIVIDUELS PAR FORMULAIRE
// =============================================================================

export async function exportSingleAPESWord(
  formId: string,
  projectName: string,
  projectLocation: string,
  auditors: string
): Promise<Buffer> {
  const fullForm = await apesFormService.getById(formId);
  if (!fullForm) throw new Error('Formulaire non trouvé');

  // Utiliser les propriétés directes de IAPESFormWithDetails
  // project_name, date, auditors, location, period sont directement sur l'objet
  const wordData = {
    project_name: fullForm.project_name || '',
    date: fullForm.date ? fullForm.date.toISOString().split('T')[0] : new Date().toISOString(),
    auditors: fullForm.auditors || '',
    location: fullForm.location || '',
    period: fullForm.period || '',
    document_review: fullForm.document_review ? {
      documents_presents: fullForm.document_review.documents_presents,
    } : undefined,
    field_inspection: fullForm.field_inspection ? {
      water_management: fullForm.field_inspection.water_management,
      waste_management: fullForm.field_inspection.waste_management,
      emissions: fullForm.field_inspection.emissions,
      health_safety: fullForm.field_inspection.health_safety,
      community: fullForm.field_inspection.community,
    } : undefined,
    stakeholder_interview: fullForm.stakeholder_interview ? {
      responses: fullForm.stakeholder_interview.responses,
    } : undefined,
    gender_assessment: fullForm.gender_assessment ? {
      quantitative_data: fullForm.gender_assessment.quantitative_data,
    } : undefined,
    complaint_mechanism: fullForm.complaint_mechanism ? {
      documentary_basis: fullForm.complaint_mechanism.documentary_basis,
    } : undefined,
  };

  // Récupérer les questions depuis l'objet (si disponible)
  // Dans IAPESFormWithDetails, les questions peuvent être dans une propriété 'questions'
  // ou dans 'questions_by_section'
  let questions: any[] = [];
  if (fullForm.questions_by_section) {
    // Transformer les questions groupées en tableau plat
    for (const section of Object.values(fullForm.questions_by_section)) {
      if (Array.isArray(section)) {
        questions.push(...section);
      }
    }
  } else if (fullForm.questions) {
    questions = fullForm.questions;
  }

  const formattedQuestions = questions.map((q: any) => ({
    section_key: q.section_key,
    question_id: q.question_id,
    question_text: q.question_text,
    sort_order: q.sort_order,
  }));

  return exportAPESWord(wordData, projectName, projectLocation, auditors, formattedQuestions);
}

export async function exportSingleGuideWord(
  guideId: string,
  projectName: string,
  projectLocation: string,
  auditors: string
): Promise<Buffer> {
  const guide = await guideEntretienService.getById(guideId);
  if (!guide) throw new Error('Guide non trouvé');
  
  return exportGuideWord(guide, projectName, projectLocation, auditors);
}

export async function exportSingleAuditWord(
  auditId: string,
  projectName: string,
  projectLocation: string,
  auditors: string
): Promise<Buffer> {
  const audit = await checklistAuditService.getById(auditId);
  if (!audit) throw new Error('Audit non trouvé');
  
  return exportAuditWord(audit, projectName, projectLocation, auditors);
}

export async function exportSingleConducteurWord(
  conducteurId: string,
  projectName: string,
  projectLocation: string,
  auditors: string
): Promise<Buffer> {
  const conducteur = await checklistConducteurService.getById(conducteurId);
  if (!conducteur) throw new Error('Checklist conducteur non trouvée');
  
  return exportConducteurWord(conducteur, projectName, projectLocation, auditors);
}

export async function exportSingleDataCollectionWord(
  collectionId: string,
  projectName: string,
  projectLocation: string,
  auditors: string
): Promise<Buffer> {
  const collection = await dataCollectionService.getById(collectionId);
  if (!collection) throw new Error('Collecte de données non trouvée');
  
  return exportDataCollectionWord(collection, projectName, projectLocation, auditors);
}