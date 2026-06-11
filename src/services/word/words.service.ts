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

// Export global (conserve ta fonction existante ou réécris-la)
import { Document, Packer, Paragraph, Table } from 'docx';
import { PAGE } from './shared/styles';
import { sectionTitle, subTitle, pageBreak, buildNumbering, buildParagraphStyles, formatDate } from './shared/helpers';
import { buildCoverPage, buildTableOfContents, buildIntroduction, buildGeneralConclusion, buildHeader, buildFooter } from './shared/templates';
import { buildDocumentReviewSection, buildFieldInspectionSection, buildStakeholderInterviewSection, buildGenderAssessmentSection, buildComplaintMechanismSection } from './apes.word';
import { buildGuideEntretienSection } from './guide.word';
import { buildAuditSection } from './audit.word';
import { buildConducteurSection } from './conducteur.word';
import { buildDataCollectionRevueDocSection, buildDataCollectionInspectionSection, buildDataCollectionEntretienSection, buildDataCollectionGenreSection, buildDataCollectionMGPSection, buildDataCollectionQuickSynthesis } from './data_collection';


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

  const children: (Paragraph | Table)[] = [
    ...buildIntroduction(),
  ];

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
      children.push(...buildDataCollectionRevueDocSection(dc.revue_documentaire));
      children.push(pageBreak());
      children.push(...buildDataCollectionInspectionSection(dc.inspection_terrain));
      children.push(pageBreak());
      children.push(...buildDataCollectionEntretienSection(dc.entretien_pp));
      children.push(pageBreak());
      children.push(...buildDataCollectionGenreSection(dc.evaluation_genre));
      children.push(pageBreak());
      children.push(...buildDataCollectionMGPSection(dc.evaluation_mgp));
      children.push(pageBreak());
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