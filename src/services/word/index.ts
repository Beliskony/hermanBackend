// ─────────────────────────────────────────────────────────────────────────────
//  word/index.ts  —  Point d'entrée pour les exports Word
// ─────────────────────────────────────────────────────────────────────────────

// Importer les helpers partagés
import { C, PAGE, TW, BORDER, CELL_MARGINS, TYPE_LABELS } from './shared/styles';
import { sectionTitle, subTitle, paragraph, bulletPoint, kvParagraph, pageBreak, spacer, tableCell, buildNumbering, buildParagraphStyles, formatDate } from './shared/helpers';
import { buildCoverPage, buildTableOfContents, buildIntroduction, buildGeneralConclusion, buildHeader, buildFooter } from './shared/templates';

// Importer les sections spécifiques
import { buildDocumentReviewSection, buildFieldInspectionSection, buildStakeholderInterviewSection, buildGenderAssessmentSection, buildComplaintMechanismSection, exportAPESWord } from './apes.word';
import { buildGuideEntretienSection } from './guide.word';
import { buildAuditSection } from './audit.word';
import { buildConducteurSection } from './conducteur.word';
import { 
  buildDataCollectionRevueDocSection, 
  buildDataCollectionInspectionSection, 
  buildDataCollectionEntretienSection, 
  buildDataCollectionGenreSection, 
  buildDataCollectionMGPSection, 
  buildDataCollectionQuickSynthesis 
} from './data_collection';

// Exports principaux
export { exportAPESWord } from './apes.word';
export { exportGuideWord } from './guide.word';
export { exportAuditWord } from './audit.word';
export { exportConducteurWord } from './conducteur.word';
export { exportDataCollectionWord } from './data_collection';

/**
 * Export global - Tous les formulaires d'un projet en un seul document
 */
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
  const generatedAt = formatDate(new Date());
  const projectDate = formatDate(new Date());

  // Construire la liste des sections pour la TOC
  const sectionsList = [
    'INTRODUCTION',
    ...(apesData ? ['RAPPORT APES (COMPLET)'] : []),
    ...(guideData && guideData.length > 0 ? ['GUIDES D\'ENTRETIEN'] : []),
    ...(auditData && auditData.length > 0 ? ['CHECKLISTS D\'AUDIT'] : []),
    ...(conducteurData && conducteurData.length > 0 ? ['CHECKLISTS CONDUCTEUR'] : []),
    ...(dataCollectionData && dataCollectionData.length > 0 ? ['COLLECTE DE DONNÉES'] : []),
    'CONCLUSION GÉNÉRALE',
  ];

  const children: any[] = [...buildIntroduction()];

  // 1. SECTION APES (complet)
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

  // 2. SECTION GUIDES D'ENTRETIEN
  if (guideData && guideData.length > 0) {
    children.push(sectionTitle('GUIDES D\'ENTRETIEN'));
    for (let i = 0; i < guideData.length; i++) {
      children.push(subTitle(`Guide d'entretien n°${i + 1}`));
      children.push(...buildGuideEntretienSection(guideData[i]));
      if (i < guideData.length - 1) children.push(pageBreak());
    }
    children.push(pageBreak());
  }

  // 3. SECTION CHECKLISTS AUDIT
  if (auditData && auditData.length > 0) {
    children.push(sectionTitle('CHECKLISTS D\'AUDIT'));
    for (let i = 0; i < auditData.length; i++) {
      children.push(subTitle(`Checklist d'audit n°${i + 1}`));
      children.push(...buildAuditSection(auditData[i]));
      if (i < auditData.length - 1) children.push(pageBreak());
    }
    children.push(pageBreak());
  }

  // 4. SECTION CHECKLISTS CONDUCTEUR
  if (conducteurData && conducteurData.length > 0) {
    children.push(sectionTitle('CHECKLISTS CONDUCTEUR'));
    for (let i = 0; i < conducteurData.length; i++) {
      children.push(subTitle(`Checklist conducteur n°${i + 1}`));
      children.push(...buildConducteurSection(conducteurData[i]));
      if (i < conducteurData.length - 1) children.push(pageBreak());
    }
    children.push(pageBreak());
  }

  // 5. SECTION DATA COLLECTION
  if (dataCollectionData && dataCollectionData.length > 0) {
    children.push(sectionTitle('COLLECTE DE DONNÉES'));
    for (let i = 0; i < dataCollectionData.length; i++) {
      const dc = dataCollectionData[i];
      children.push(subTitle(`Collecte de données n°${i + 1}`));
      
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

  // 6. CONCLUSION GÉNÉRALE
  children.push(...buildGeneralConclusion());

  // Création du document
  const { Document, Packer } = await import('docx');
  
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
        properties: { 
          page: { size: { width: PAGE.width, height: PAGE.height }, margin: { ...PAGE.margin, top: 1440, bottom: 1440 } } 
        },
        headers: { default: buildHeader(projectName) },
        footers: { default: buildFooter(generatedAt) },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}