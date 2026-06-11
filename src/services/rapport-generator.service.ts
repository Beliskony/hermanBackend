// src/services/rapport-generator.service.ts
import { pool } from '../config/databaseConnect';
import {
  exportAPESWord,
  exportGuideWord,
  exportAuditWord,
  exportConducteurWord,
  exportAllFormsWord,
} from './word/words.service';

// Interfaces
import { IAPESFormWithDetails } from '../interfaces/IAPES';
import { IGuideEntretien, IGuideEntretienQuestion, GuideType } from '../interfaces/IGuideEntretien';
import { IChecklistAudit, IChecklistAuditCritere } from '../interfaces/IChecklistAudit';
import { IChecklistConducteur, IChecklistConducteurQuestion } from '../interfaces/IChecklistConducteur';
import { IDocumentReview } from '../interfaces/IDocumentReview';
import { IFieldInspection } from '../interfaces/IFieldInspection';
import { IStakeholderInterview } from '../interfaces/IStakeholderInterview';
import { IGenderAssessment, IGenderObjective, IGenderImpact, IGenderRecommendation } from '../interfaces/IGenderAssessment';
import { IComplaintMechanism, IComplaintStrength, IComplaintWeakness, IComplaintRecommendation } from '../interfaces/IComplaintMechanism';
import { IProject } from '../interfaces/IProject';

// =============================================================================
//  TYPES POUR LES DONNÉES FORMATÉES
// =============================================================================

interface FormattedAPESData {
  project_date: Date;
  documentReview: {
    documents_presents: Record<string, boolean>;
    documents_analysis: Record<string, any>;
    documents_manquants: string | null;
    autres_documents: string | null;
  } | null;
  fieldInspection: {
    project_name: string;
    date: Date;
    auditors: string;
    accompaniers: string | null;
    zones: string[] | null;
    water_management: Record<string, any>;
    waste_management: Record<string, any>;
    emissions: Record<string, any>;
    health_safety: Record<string, any>;
    community: Record<string, any>;
  } | null;
  stakeholderInterview: {
    date: Date;
    location: string;
    duration: string;
    stakeholder_type: string;
    profile_name: string;
    profile_function: string;
    profile_gender: string;
    profile_age_range: string;
    responses: Record<string, string>;
    eval_quality: number;
    eval_frankness: number;
    eval_relevance: number;
    eval_climate: number;
  } | null;
  genderAssessment: {
    objectives: Array<{ description: string; status: string }>;
    impacts: Array<{ impact_type: string; impact: string; women: string; men: string; vulnerable: string }>;
    recommendations: Array<{ recommendation: string; priority: string; responsible: string; deadline: string }>;
  } | null;
  complaintMechanism: {
    documentary_basis: Record<string, any>;
    key_criteria: Record<string, any>;
    global_conclusion: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  } | null;
}

interface FormattedGuideData {
  guide_type: GuideType;
  subprojet: string;
  gi_nom: string;
  gi_fonction: string;
  gi_contact: string | null;
  gi_date: Date;
  gi_lieu: string;
  gi_type_entretien: 'individuel' | 'focus_group' | null;
  gi_employeur: string | null;
  gi_type_contrat: string | null;
  notes_auditeur: string | null;
  theme1: { questions: Array<{ questionId: string; question: string; reponse: string }> };
  theme2: { questions: Array<{ questionId: string; question: string; reponse: string }> };
  theme3: { questions: Array<{ questionId: string; question: string; reponse: string }> };
  theme4: { questions: Array<{ questionId: string; question: string; reponse: string }> };
}

interface FormattedAuditData {
  subprojet: string;
  auditeurs: string;
  date: Date;
  synthese?: {
    nombreNonConformitesMajeures: number;
    domainesCritiques: string;
  };
  section1_cadreJuridique: Array<{
    numero: string;
    critere: string;
    observations: string;
    conformite: string;
    risque_non_conformite: string;
  }>;
  section2_infraSecurite: {
    stabiliteStructure: any[];
    securiteIncendie: any[];
    accessibilitePMR: any[];
  };
  section3_gestionEnvSociale: {
    gestionDechets: any[];
    nuisancesPollution: any[];
    santeSecuteTravailleurs: any[];
  };
  section4_gestionSociale: {
    relationsCommunautes: any[];
    mgp: any[];
  };
  section5_risquesERP: {
    securiteSurete: any[];
    hygieneEnvironnement: any[];
  };
}

interface FormattedConducteurData {
  subprojet: string;
  auditeur: string;
  entreprise: string;
  personne_rencontree: string;
  fonction: string;
  date: Date;
  lieu: string;
  commentaires_libres: string | null;
  section1_infoGenerales: any[];
  section2_processusInitialT1: any[];
  section3_installationT2: any[];
  section4_recrutementT2: any[];
  section5_hseT2: any[];
  section6_gestionEnvT2: any[];
  section7_sensibilisationT2: any[];
  section8_mgpT2: any[];
  section9_fermetureT2: any[];
  section10_exploitationT3: any[];
  section11_synthese: any[];
}

// =============================================================================
//  SERVICE PRINCIPAL DE GÉNÉRATION DE RAPPORTS
// =============================================================================

export class RapportGeneratorService {
  
  /**
   * Génère un rapport APES complet à partir d'un formulaire soumis
   */
  async genererRapportAPES(formId: string): Promise<Buffer> {
    console.log(`📄 Génération du rapport APES pour le formulaire: ${formId}`);

    const form = await this.getAPESFormWithDetails(formId);
    if (!form) {
      throw new Error(`Formulaire APES ${formId} non trouvé`);
    }

    const project = await this.getProjectById(form.project_id);
    if (!project) {
      throw new Error(`Projet ${form.project_id} non trouvé`);
    }

    const [documentReview, fieldInspection, stakeholderInterview, genderAssessmentRaw, complaintMechanism] = await Promise.all([
      this.getDocumentReviewByFormId(formId),
      this.getFieldInspectionByFormId(formId),
      this.getStakeholderInterviewByFormId(formId),
      this.getGenderAssessmentWithDetails(formId),
      this.getComplaintMechanismWithDetails(formId),
    ]);

    // CORRECTION : Construire correctement genderAssessment
    let genderAssessment = null;
    if (genderAssessmentRaw) {
      genderAssessment = {
        objectives: genderAssessmentRaw.objectives.map(o => ({ 
          description: o.objective, 
          status: o.status 
        })),
        impacts: genderAssessmentRaw.impacts.map(i => ({ 
          impact_type: i.impact_type, 
          impact: i.impact, 
          women: i.women, 
          men: i.men, 
          vulnerable: i.vulnerable 
        })),
        recommendations: genderAssessmentRaw.recommendations.map(r => ({ 
          recommendation: r.recommendation, 
          priority: r.priority, 
          responsible: r.responsible, 
          deadline: r.deadline 
        })),
      };
    }

    // CORRECTION : Utiliser l'interface du haut (pas de redéfinition)
    const formattedData: FormattedAPESData = {
      project_date: new Date(),
      documentReview: documentReview ? {
        documents_presents: documentReview.documents_presents,
        documents_analysis: documentReview.documents_analysis,
        documents_manquants: documentReview.documents_manquants,
        autres_documents: documentReview.autres_documents,
      } : null,
      fieldInspection: fieldInspection ? {
        project_name: fieldInspection.project_name,
        date: fieldInspection.date,
        auditors: fieldInspection.auditors,
        accompaniers: fieldInspection.accompaniers,
        zones: fieldInspection.zones,
        water_management: fieldInspection.water_management,
        waste_management: fieldInspection.waste_management,
        emissions: fieldInspection.emissions,
        health_safety: fieldInspection.health_safety,
        community: fieldInspection.community,
      } : null,
      stakeholderInterview: stakeholderInterview ? {
        date: stakeholderInterview.date,
        location: stakeholderInterview.location,
        duration: stakeholderInterview.duration,
        stakeholder_type: stakeholderInterview.stakeholder_type,
        profile_name: stakeholderInterview.profile_name,
        profile_function: stakeholderInterview.profile_function,
        profile_gender: stakeholderInterview.profile_gender,
        profile_age_range: stakeholderInterview.profile_age_range,
        responses: stakeholderInterview.responses,
        eval_quality: stakeholderInterview.eval_quality,
        eval_frankness: stakeholderInterview.eval_frankness,
        eval_relevance: stakeholderInterview.eval_relevance,
        eval_climate: stakeholderInterview.eval_climate,
      } : null,
      genderAssessment: genderAssessment,
      complaintMechanism: complaintMechanism ? {
        documentary_basis: complaintMechanism.documentary_basis,
        key_criteria: complaintMechanism.key_criteria,
        global_conclusion: complaintMechanism.global_conclusion,
        strengths: complaintMechanism.strengths,
        weaknesses: complaintMechanism.weaknesses,
        recommendations: complaintMechanism.recommendations,
      } : null,
    };

    const buffer = await exportAPESWord(
      formattedData,
      project.name,
      project.location || 'Non spécifié',
      'Auditeur'
    );

    console.log(`✅ Rapport APES généré avec succès`);
    return buffer;
  }

  /**
   * Génère un rapport Guide d'Entretien
   */
  async genererRapportGuideEntretien(guideId: string): Promise<Buffer> {
    console.log(`📄 Génération du Guide d'entretien: ${guideId}`);

    const guide = await this.getGuideById(guideId);
    if (!guide) {
      throw new Error(`Guide d'entretien ${guideId} non trouvé`);
    }

    const questions = await this.getGuideQuestions(guideId);
    const project = await this.getProjectById(guide.project_id);

    const formattedData: FormattedGuideData = {
      guide_type: guide.guide_type,
      subprojet: guide.subprojet,
      gi_nom: guide.gi_nom,
      gi_fonction: guide.gi_fonction,
      gi_contact: guide.gi_contact,
      gi_date: guide.gi_date,
      gi_lieu: guide.gi_lieu,
      gi_type_entretien: guide.gi_type_entretien,
      gi_employeur: guide.gi_employeur,
      gi_type_contrat: guide.gi_type_contrat,
      notes_auditeur: guide.notes_auditeur,
      theme1: { questions: [] },
      theme2: { questions: [] },
      theme3: { questions: [] },
      theme4: { questions: [] },
    };

    for (const q of questions) {
      const themeNumber = q.theme_key.replace('t', '');
      const themeKey = `theme${themeNumber}` as keyof Pick<FormattedGuideData, 'theme1' | 'theme2' | 'theme3' | 'theme4'>;
      
      formattedData[themeKey].questions.push({
        questionId: q.question_id,
        question: q.question,
        reponse: this.formatGuideResponse(q),
      });
    }

    const buffer = await exportGuideWord(
      formattedData,
      project?.name || guide.subprojet,
      guide.gi_lieu,
      'Auditeur'
    );

    console.log(`✅ Guide d'entretien généré avec succès`);
    return buffer;
  }

  /**
   * Génère un rapport Checklist Audit
   */
  async genererRapportChecklistAudit(auditId: string): Promise<Buffer> {
    console.log(`📄 Génération de la Checklist Audit: ${auditId}`);

    const audit = await this.getChecklistAuditById(auditId);
    if (!audit) {
      throw new Error(`Checklist Audit ${auditId} non trouvée`);
    }

    const criteres = await this.getChecklistAuditCriteres(auditId);
    const project = await this.getProjectById(audit.project_id);

    const formattedData: FormattedAuditData = {
      subprojet: audit.subprojet,
      auditeurs: audit.auditeurs,
      date: audit.date,
      synthese: {
        nombreNonConformitesMajeures: audit.synth_nb_nc_majeures,
        domainesCritiques: audit.synth_domaines_critiques || '',
      },
      section1_cadreJuridique: [],
      section2_infraSecurite: {
        stabiliteStructure: [],
        securiteIncendie: [],
        accessibilitePMR: [],
      },
      section3_gestionEnvSociale: {
        gestionDechets: [],
        nuisancesPollution: [],
        santeSecuteTravailleurs: [],
      },
      section4_gestionSociale: {
        relationsCommunautes: [],
        mgp: [],
      },
      section5_risquesERP: {
        securiteSurete: [],
        hygieneEnvironnement: [],
      },
    };

    for (const c of criteres) {
      const critereObj = {
        numero: c.numero,
        critere: c.critere,
        observations: c.observations || '—',
        conformite: c.conformite,
        risque_non_conformite: c.risque_non_conformite || '—',
      };
      this.mapCritereToSection(formattedData, c.section_key, critereObj);
    }

    const buffer = await exportAuditWord(
      formattedData,
      project?.name || audit.subprojet,
      project?.location || 'Non spécifié',
      audit.auditeurs
    );

    console.log(`✅ Checklist Audit générée avec succès`);
    return buffer;
  }

  /**
   * Génère un rapport Checklist Conducteur
   */
  async genererRapportChecklistConducteur(conducteurId: string): Promise<Buffer> {
    console.log(`📄 Génération de la Checklist Conducteur: ${conducteurId}`);

    const conducteur = await this.getChecklistConducteurById(conducteurId);
    if (!conducteur) {
      throw new Error(`Checklist Conducteur ${conducteurId} non trouvée`);
    }

    const questions = await this.getChecklistConducteurQuestions(conducteurId);
    const project = await this.getProjectById(conducteur.project_id);

    const formattedData: FormattedConducteurData = {
      subprojet: conducteur.subprojet,
      auditeur: conducteur.auditeur,
      entreprise: conducteur.entreprise,
      personne_rencontree: conducteur.personne_rencontree,
      fonction: conducteur.fonction,
      date: conducteur.date,
      lieu: conducteur.lieu,
      commentaires_libres: conducteur.commentaires_libres,
      section1_infoGenerales: [],
      section2_processusInitialT1: [],
      section3_installationT2: [],
      section4_recrutementT2: [],
      section5_hseT2: [],
      section6_gestionEnvT2: [],
      section7_sensibilisationT2: [],
      section8_mgpT2: [],
      section9_fermetureT2: [],
      section10_exploitationT3: [],
      section11_synthese: [],
    };

    const sectionMapping: Record<string, keyof FormattedConducteurData> = {
      s01: 'section1_infoGenerales',
      s02: 'section2_processusInitialT1',
      s03: 'section3_installationT2',
      s04: 'section4_recrutementT2',
      s05: 'section5_hseT2',
      s06: 'section6_gestionEnvT2',
      s07: 'section7_sensibilisationT2',
      s08: 'section8_mgpT2',
      s09: 'section9_fermetureT2',
      s10: 'section10_exploitationT3',
      s11: 'section11_synthese',
    };

    for (const q of questions) {
      const sectionKey = sectionMapping[q.section_key];
      if (sectionKey && formattedData[sectionKey]) {
        (formattedData[sectionKey] as any[]).push({
          numero: q.numero,
          question: q.question,
          reponse_booleenne: q.reponse_booleenne,
          reponse: q.reponse || '—',
          observations: q.observations || '—',
        });
      }
    }

    const buffer = await exportConducteurWord(
      formattedData,
      project?.name || conducteur.subprojet,
      conducteur.lieu,
      conducteur.auditeur
    );

    console.log(`✅ Checklist Conducteur générée avec succès`);
    return buffer;
  }

  /**
   * Génère une synthèse globale de tous les formulaires d'un projet
   */
  async genererSyntheseGlobale(projectId: string): Promise<Buffer> {
    console.log(`📄 Génération de la synthèse globale pour le projet: ${projectId}`);

    const project = await this.getProjectById(projectId);
    if (!project) {
      throw new Error(`Projet ${projectId} non trouvé`);
    }

    const apesForms = await this.getSubmittedAPESForms(projectId);
    let apesData = null;
    
    if (apesForms.length > 0) {
      const latestApes = apesForms[0];
      apesData = await this.buildAPESDataForExport(latestApes.id);
    }

    const guides = await this.getGuidesByProject(projectId);
    const guideDataList = [];
    for (const guide of guides) {
      const formattedGuide = await this.buildGuideDataForExport(guide.id);
      if (formattedGuide) guideDataList.push(formattedGuide);
    }

    const audits = await this.getChecklistAuditsByProject(projectId);
    const auditDataList = [];
    for (const audit of audits) {
      const formattedAudit = await this.buildAuditDataForExport(audit.id);
      if (formattedAudit) auditDataList.push(formattedAudit);
    }

    const conducteurs = await this.getChecklistConducteursByProject(projectId);
    const conducteurDataList = [];
    for (const conducteur of conducteurs) {
      const formattedConducteur = await this.buildConducteurDataForExport(conducteur.id);
      if (formattedConducteur) conducteurDataList.push(formattedConducteur);
    }

    const buffer = await exportAllFormsWord(
      project.name,
      project.location || 'Non spécifié',
      'Auditeur Principal',
      apesData,
      guideDataList.length > 0 ? guideDataList : null,
      auditDataList.length > 0 ? auditDataList : null,
      conducteurDataList.length > 0 ? conducteurDataList : null
    );

    console.log(`✅ Synthèse globale générée avec succès`);
    return buffer;
  }

  // =============================================================================
  //  MÉTHODES PRIVÉES DE RÉCUPÉRATION DES DONNÉES
  // =============================================================================

  private async getAPESFormWithDetails(formId: string): Promise<any | null> {
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM form_data WHERE id = ? AND status = 'submitted'`,
      [formId]
    );
    return rows[0] || null;
  }

  private async getProjectById(projectId: string): Promise<IProject | null> {
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM projects WHERE id = ?`,
      [projectId]
    );
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      name: r.name,
      description: r.description,
      location: r.location,
      start_date: r.start_date,
      end_date: r.end_date,
      status: r.status,
      created_by: r.created_by,
      created_at: new Date(r.created_at),
      updated_at: new Date(r.updated_at),
    };
  }

  private async getDocumentReviewByFormId(formId: string): Promise<IDocumentReview | null> {
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM document_review WHERE form_id = ?`,
      [formId]
    );
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      project_id: r.project_id,
      documents_presents: JSON.parse(r.documents_presents || '{}'),
      documents_analysis: JSON.parse(r.documents_analysis || '{}'),
      documents_manquants: r.documents_manquants,
      autres_documents: r.autres_documents,
      created_at: new Date(r.created_at),
      updated_at: new Date(r.updated_at),
    };
  }

  private async getFieldInspectionByFormId(formId: string): Promise<IFieldInspection | null> {
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM field_inspection WHERE form_id = ?`,
      [formId]
    );
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      project_id: r.project_id,
      project_name: r.project_name,
      date: new Date(r.date),
      auditors: r.auditors,
      accompaniers: r.accompaniers,
      zones: JSON.parse(r.zones || '[]'),
      water_management: JSON.parse(r.water_management || '{}'),
      waste_management: JSON.parse(r.waste_management || '{}'),
      emissions: JSON.parse(r.emissions || '{}'),
      health_safety: JSON.parse(r.health_safety || '{}'),
      community: JSON.parse(r.community || '{}'),
      created_at: new Date(r.created_at),
      updated_at: new Date(r.updated_at),
    };
  }

  private async getStakeholderInterviewByFormId(formId: string): Promise<IStakeholderInterview | null> {
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM stakeholder_interview WHERE form_id = ?`,
      [formId]
    );
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      project_id: r.project_id,
      date: new Date(r.date),
      location: r.location,
      duration: r.duration,
      stakeholder_type: r.stakeholder_type,
      profile_name: r.profile_name,
      profile_function: r.profile_function,
      profile_gender: r.profile_gender,
      profile_age_range: r.profile_age_range,
      consent_confidentiality: r.consent_confidentiality === 1,
      consent_notes: r.consent_notes === 1,
      consent_recording: r.consent_recording === 1,
      responses: JSON.parse(r.responses || '{}'),
      eval_quality: r.eval_quality,
      eval_frankness: r.eval_frankness,
      eval_relevance: r.eval_relevance,
      eval_climate: r.eval_climate,
      created_at: new Date(r.created_at),
      updated_at: new Date(r.updated_at),
    };
  }

  private async getGenderAssessmentWithDetails(formId: string): Promise<{
    objectives: IGenderObjective[];
    impacts: IGenderImpact[];
    recommendations: IGenderRecommendation[];
  } | null> {
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM gender_assessment WHERE form_id = ?`,
      [formId]
    );
    if (!rows.length) return null;
    const assessmentId = rows[0].id;

    const [objectives] = await pool.query<any[]>(
      `SELECT * FROM gender_objectives WHERE gender_assessment_id = ? ORDER BY sort_order`,
      [assessmentId]
    );

    const [impacts] = await pool.query<any[]>(
      `SELECT * FROM gender_impacts WHERE gender_assessment_id = ? ORDER BY sort_order`,
      [assessmentId]
    );

    const [recommendations] = await pool.query<any[]>(
      `SELECT * FROM gender_recommendations WHERE gender_assessment_id = ? ORDER BY sort_order`,
      [assessmentId]
    );

    return {
      objectives: objectives.map(o => ({
        id: o.id,
        gender_assessment_id: o.gender_assessment_id,
        objective: o.objective,
        indicator: o.indicator,
        status: o.status,
        sort_order: o.sort_order,
      })),
      impacts: impacts.map(i => ({
        id: i.id,
        gender_assessment_id: i.gender_assessment_id,
        impact_type: i.impact_type,
        impact: i.impact,
        women: i.women,
        men: i.men,
        vulnerable: i.vulnerable,
        severity: i.severity,
        opportunity: i.opportunity,
        sort_order: i.sort_order,
      })),
      recommendations: recommendations.map(r => ({
        id: r.id,
        gender_assessment_id: r.gender_assessment_id,
        recommendation: r.recommendation,
        priority: r.priority,
        scope: r.scope,
        responsible: r.responsible,
        deadline: r.deadline,
        sort_order: r.sort_order,
      })),
    };
  }

  private async getComplaintMechanismWithDetails(formId: string): Promise<{
    documentary_basis: Record<string, any>;
    key_criteria: Record<string, any>;
    global_conclusion: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  } | null> {
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM complaint_mechanism WHERE form_id = ?`,
      [formId]
    );
    if (!rows.length) return null;
    const mechanismId = rows[0].id;
    const r = rows[0];

    const [strengths] = await pool.query<any[]>(
      `SELECT strength FROM complaint_strengths WHERE complaint_mechanism_id = ? ORDER BY sort_order`,
      [mechanismId]
    );

    const [weaknesses] = await pool.query<any[]>(
      `SELECT deficiency FROM complaint_weaknesses WHERE complaint_mechanism_id = ? ORDER BY sort_order`,
      [mechanismId]
    );

    const [recommendations] = await pool.query<any[]>(
      `SELECT recommendation FROM complaint_recommendations WHERE complaint_mechanism_id = ? ORDER BY sort_order`,
      [mechanismId]
    );

    return {
      documentary_basis: JSON.parse(r.documentary_basis || '{}'),
      key_criteria: JSON.parse(r.key_criteria || '{}'),
      global_conclusion: r.global_conclusion,
      strengths: strengths.map(s => s.strength),
      weaknesses: weaknesses.map(w => w.deficiency),
      recommendations: recommendations.map(r => r.recommendation),
    };
  }

  private async getGuideById(guideId: string): Promise<IGuideEntretien | null> {
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM guide_entretien WHERE id = ?`,
      [guideId]
    );
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      project_id: r.project_id,
      guide_type: r.guide_type,
      subprojet: r.subprojet,
      gi_nom: r.gi_nom,
      gi_fonction: r.gi_fonction,
      gi_contact: r.gi_contact,
      gi_date: new Date(r.gi_date),
      gi_lieu: r.gi_lieu,
      gi_type_entretien: r.gi_type_entretien,
      gi_employeur: r.gi_employeur,
      gi_type_contrat: r.gi_type_contrat,
      notes_auditeur: r.notes_auditeur,
      created_at: new Date(r.created_at),
      updated_at: new Date(r.updated_at),
    };
  }

  private async getGuideQuestions(guideId: string): Promise<IGuideEntretienQuestion[]> {
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM guide_entretien_questions WHERE guide_entretien_id = ? ORDER BY theme_key, sort_order`,
      [guideId]
    );
    return rows.map(r => ({
      id: r.id,
      guide_entretien_id: r.guide_entretien_id,
      theme_key: r.theme_key,
      question_id: r.question_id,
      question: r.question,
      reponse: r.reponse,
      nuisance_poussiere: r.nuisance_poussiere === 1,
      nuisance_bruit: r.nuisance_bruit === 1,
      nuisance_circulation: r.nuisance_circulation === 1,
      nuisance_odeurs: r.nuisance_odeurs === 1,
      nuisance_dechets: r.nuisance_dechets === 1,
      sort_order: r.sort_order,
    }));
  }

  private async getChecklistAuditById(auditId: string): Promise<IChecklistAudit | null> {
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM checklist_audit WHERE id = ?`,
      [auditId]
    );
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      project_id: r.project_id,
      subprojet: r.subprojet,
      auditeurs: r.auditeurs,
      date: new Date(r.date),
      synth_nb_nc_majeures: r.synth_nb_nc_majeures,
      synth_domaines_critiques: r.synth_domaines_critiques,
      synth_signature_auditeur: r.synth_signature_auditeur,
      created_at: new Date(r.created_at),
      updated_at: new Date(r.updated_at),
    };
  }

  private async getChecklistAuditCriteres(auditId: string): Promise<IChecklistAuditCritere[]> {
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM checklist_audit_criteres WHERE checklist_audit_id = ? ORDER BY section_key, sort_order`,
      [auditId]
    );
    return rows.map(r => ({
      id: r.id,
      checklist_audit_id: r.checklist_audit_id,
      section_key: r.section_key,
      numero: r.numero,
      critere: r.critere,
      sources_methode: r.sources_methode,
      conformite: r.conformite,
      observations: r.observations,
      risque_non_conformite: r.risque_non_conformite,
      sort_order: r.sort_order,
    }));
  }

  private async getChecklistConducteurById(conducteurId: string): Promise<IChecklistConducteur | null> {
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM checklist_conducteur WHERE id = ?`,
      [conducteurId]
    );
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      project_id: r.project_id,
      subprojet: r.subprojet,
      auditeur: r.auditeur,
      date: new Date(r.date),
      personne_rencontree: r.personne_rencontree,
      fonction: r.fonction,
      entreprise: r.entreprise,
      contact: r.contact,
      duree_entretien: r.duree_entretien,
      lieu: r.lieu,
      commentaires_libres: r.commentaires_libres,
      signature_auditeur: r.signature_auditeur,
      created_at: new Date(r.created_at),
      updated_at: new Date(r.updated_at),
    };
  }

  private async getChecklistConducteurQuestions(conducteurId: string): Promise<IChecklistConducteurQuestion[]> {
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM checklist_conducteur_questions WHERE checklist_conducteur_id = ? ORDER BY section_key, sort_order`,
      [conducteurId]
    );
    return rows.map(r => ({
      id: r.id,
      checklist_conducteur_id: r.checklist_conducteur_id,
      section_key: r.section_key,
      numero: r.numero,
      question: r.question,
      reponse: r.reponse,
      reponse_booleenne: r.reponse_booleenne,
      observations: r.observations,
      sort_order: r.sort_order,
    }));
  }

  private async getSubmittedAPESForms(projectId: string): Promise<any[]> {
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM form_data WHERE project_id = ? AND status = 'submitted' ORDER BY created_at DESC`,
      [projectId]
    );
    return rows;
  }

  private async getGuidesByProject(projectId: string): Promise<IGuideEntretien[]> {
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM guide_entretien WHERE project_id = ? ORDER BY gi_date DESC`,
      [projectId]
    );
    return rows.map(r => ({
      id: r.id,
      project_id: r.project_id,
      guide_type: r.guide_type,
      subprojet: r.subprojet,
      gi_nom: r.gi_nom,
      gi_fonction: r.gi_fonction,
      gi_contact: r.gi_contact,
      gi_date: new Date(r.gi_date),
      gi_lieu: r.gi_lieu,
      gi_type_entretien: r.gi_type_entretien,
      gi_employeur: r.gi_employeur,
      gi_type_contrat: r.gi_type_contrat,
      notes_auditeur: r.notes_auditeur,
      created_at: new Date(r.created_at),
      updated_at: new Date(r.updated_at),
    }));
  }

  private async getChecklistAuditsByProject(projectId: string): Promise<IChecklistAudit[]> {
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM checklist_audit WHERE project_id = ? ORDER BY date DESC`,
      [projectId]
    );
    return rows.map(r => ({
      id: r.id,
      project_id: r.project_id,
      subprojet: r.subprojet,
      auditeurs: r.auditeurs,
      date: new Date(r.date),
      synth_nb_nc_majeures: r.synth_nb_nc_majeures,
      synth_domaines_critiques: r.synth_domaines_critiques,
      synth_signature_auditeur: r.synth_signature_auditeur,
      created_at: new Date(r.created_at),
      updated_at: new Date(r.updated_at),
    }));
  }

  private async getChecklistConducteursByProject(projectId: string): Promise<IChecklistConducteur[]> {
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM checklist_conducteur WHERE project_id = ? ORDER BY date DESC`,
      [projectId]
    );
    return rows.map(r => ({
      id: r.id,
      project_id: r.project_id,
      subprojet: r.subprojet,
      auditeur: r.auditeur,
      date: new Date(r.date),
      personne_rencontree: r.personne_rencontree,
      fonction: r.fonction,
      entreprise: r.entreprise,
      contact: r.contact,
      duree_entretien: r.duree_entretien,
      lieu: r.lieu,
      commentaires_libres: r.commentaires_libres,
      signature_auditeur: r.signature_auditeur,
      created_at: new Date(r.created_at),
      updated_at: new Date(r.updated_at),
    }));
  }

  // =============================================================================
  //  MÉTHODES PRIVÉES DE FORMATAGE
  // =============================================================================

  private formatGuideResponse(question: IGuideEntretienQuestion): string {
    let response = question.reponse || '—';
    
    if (question.theme_key === 't2') {
      const nuisances = [];
      if (question.nuisance_poussiere) nuisances.push('Poussière');
      if (question.nuisance_bruit) nuisances.push('Bruit');
      if (question.nuisance_circulation) nuisances.push('Circulation');
      if (question.nuisance_odeurs) nuisances.push('Odeurs');
      if (question.nuisance_dechets) nuisances.push('Déchets');
      
      if (nuisances.length > 0) {
        response += ` (Nuisances constatées : ${nuisances.join(', ')})`;
      }
    }
    
    return response;
  }

  private mapCritereToSection(data: FormattedAuditData, sectionKey: string, critereObj: any): void {
    switch (sectionKey) {
      case 's1':
        data.section1_cadreJuridique.push(critereObj);
        break;
      case 's2_stabilite':
        data.section2_infraSecurite.stabiliteStructure.push(critereObj);
        break;
      case 's2_incendie':
        data.section2_infraSecurite.securiteIncendie.push(critereObj);
        break;
      case 's2_accessibilite':
        data.section2_infraSecurite.accessibilitePMR.push(critereObj);
        break;
      case 's3_dechets':
        data.section3_gestionEnvSociale.gestionDechets.push(critereObj);
        break;
      case 's3_nuisances':
        data.section3_gestionEnvSociale.nuisancesPollution.push(critereObj);
        break;
      case 's3_sante':
        data.section3_gestionEnvSociale.santeSecuteTravailleurs.push(critereObj);
        break;
      case 's4_relations':
        data.section4_gestionSociale.relationsCommunautes.push(critereObj);
        break;
      case 's4_mgp':
        data.section4_gestionSociale.mgp.push(critereObj);
        break;
      case 's5_securite':
        data.section5_risquesERP.securiteSurete.push(critereObj);
        break;
      case 's5_hygiene':
        data.section5_risquesERP.hygieneEnvironnement.push(critereObj);
        break;
    }
  }

  private async buildAPESDataForExport(formId: string): Promise<FormattedAPESData | null> {
    const form = await this.getAPESFormWithDetails(formId);
    if (!form) return null;

    const [documentReview, fieldInspection, stakeholderInterview, genderAssessmentRaw, complaintMechanism] = await Promise.all([
      this.getDocumentReviewByFormId(formId),
      this.getFieldInspectionByFormId(formId),
      this.getStakeholderInterviewByFormId(formId),
      this.getGenderAssessmentWithDetails(formId),
      this.getComplaintMechanismWithDetails(formId),
    ]);

    let genderAssessment = null;
    if (genderAssessmentRaw) {
      genderAssessment = {
        objectives: genderAssessmentRaw.objectives.map(o => ({ 
          description: o.objective, 
          status: o.status 
        })),
        impacts: genderAssessmentRaw.impacts.map(i => ({ 
          impact_type: i.impact_type, 
          impact: i.impact, 
          women: i.women, 
          men: i.men, 
          vulnerable: i.vulnerable 
        })),
        recommendations: genderAssessmentRaw.recommendations.map(r => ({ 
          recommendation: r.recommendation, 
          priority: r.priority, 
          responsible: r.responsible, 
          deadline: r.deadline 
        })),
      };
    }

    return {
      project_date: new Date(),
      documentReview: documentReview ? {
        documents_presents: documentReview.documents_presents,
        documents_analysis: documentReview.documents_analysis,
        documents_manquants: documentReview.documents_manquants,
        autres_documents: documentReview.autres_documents,
      } : null,
      fieldInspection: fieldInspection ? {
        project_name: fieldInspection.project_name,
        date: fieldInspection.date,
        auditors: fieldInspection.auditors,
        accompaniers: fieldInspection.accompaniers,
        zones: fieldInspection.zones,
        water_management: fieldInspection.water_management,
        waste_management: fieldInspection.waste_management,
        emissions: fieldInspection.emissions,
        health_safety: fieldInspection.health_safety,
        community: fieldInspection.community,
      } : null,
      stakeholderInterview: stakeholderInterview ? {
        date: stakeholderInterview.date,
        location: stakeholderInterview.location,
        duration: stakeholderInterview.duration,
        stakeholder_type: stakeholderInterview.stakeholder_type,
        profile_name: stakeholderInterview.profile_name,
        profile_function: stakeholderInterview.profile_function,
        profile_gender: stakeholderInterview.profile_gender,
        profile_age_range: stakeholderInterview.profile_age_range,
        responses: stakeholderInterview.responses,
        eval_quality: stakeholderInterview.eval_quality,
        eval_frankness: stakeholderInterview.eval_frankness,
        eval_relevance: stakeholderInterview.eval_relevance,
        eval_climate: stakeholderInterview.eval_climate,
      } : null,
      genderAssessment: genderAssessment,
      complaintMechanism: complaintMechanism ? {
        documentary_basis: complaintMechanism.documentary_basis,
        key_criteria: complaintMechanism.key_criteria,
        global_conclusion: complaintMechanism.global_conclusion,
        strengths: complaintMechanism.strengths,
        weaknesses: complaintMechanism.weaknesses,
        recommendations: complaintMechanism.recommendations,
      } : null,
    };
  }

  private async buildGuideDataForExport(guideId: string): Promise<FormattedGuideData | null> {
    const guide = await this.getGuideById(guideId);
    if (!guide) return null;

    const questions = await this.getGuideQuestions(guideId);

    const formattedData: FormattedGuideData = {
      guide_type: guide.guide_type,
      subprojet: guide.subprojet,
      gi_nom: guide.gi_nom,
      gi_fonction: guide.gi_fonction,
      gi_contact: guide.gi_contact,
      gi_date: guide.gi_date,
      gi_lieu: guide.gi_lieu,
      gi_type_entretien: guide.gi_type_entretien,
      gi_employeur: guide.gi_employeur,
      gi_type_contrat: guide.gi_type_contrat,
      notes_auditeur: guide.notes_auditeur,
      theme1: { questions: [] },
      theme2: { questions: [] },
      theme3: { questions: [] },
      theme4: { questions: [] },
    };

    for (const q of questions) {
      const themeNumber = q.theme_key.replace('t', '');
      const themeKey = `theme${themeNumber}` as keyof Pick<FormattedGuideData, 'theme1' | 'theme2' | 'theme3' | 'theme4'>;
      
      formattedData[themeKey].questions.push({
        questionId: q.question_id,
        question: q.question,
        reponse: this.formatGuideResponse(q),
      });
    }

    return formattedData;
  }

  private async buildAuditDataForExport(auditId: string): Promise<FormattedAuditData | null> {
    const audit = await this.getChecklistAuditById(auditId);
    if (!audit) return null;

    const criteres = await this.getChecklistAuditCriteres(auditId);

    const formattedData: FormattedAuditData = {
      subprojet: audit.subprojet,
      auditeurs: audit.auditeurs,
      date: audit.date,
      synthese: {
        nombreNonConformitesMajeures: audit.synth_nb_nc_majeures,
        domainesCritiques: audit.synth_domaines_critiques || '',
      },
      section1_cadreJuridique: [],
      section2_infraSecurite: {
        stabiliteStructure: [],
        securiteIncendie: [],
        accessibilitePMR: [],
      },
      section3_gestionEnvSociale: {
        gestionDechets: [],
        nuisancesPollution: [],
        santeSecuteTravailleurs: [],
      },
      section4_gestionSociale: {
        relationsCommunautes: [],
        mgp: [],
      },
      section5_risquesERP: {
        securiteSurete: [],
        hygieneEnvironnement: [],
      },
    };

    for (const c of criteres) {
      const critereObj = {
        numero: c.numero,
        critere: c.critere,
        observations: c.observations || '—',
        conformite: c.conformite,
        risque_non_conformite: c.risque_non_conformite || '—',
      };
      this.mapCritereToSection(formattedData, c.section_key, critereObj);
    }

    return formattedData;
  }

  private async buildConducteurDataForExport(conducteurId: string): Promise<FormattedConducteurData | null> {
    const conducteur = await this.getChecklistConducteurById(conducteurId);
    if (!conducteur) return null;

    const questions = await this.getChecklistConducteurQuestions(conducteurId);

    const sectionMapping: Record<string, keyof FormattedConducteurData> = {
      s01: 'section1_infoGenerales',
      s02: 'section2_processusInitialT1',
      s03: 'section3_installationT2',
      s04: 'section4_recrutementT2',
      s05: 'section5_hseT2',
      s06: 'section6_gestionEnvT2',
      s07: 'section7_sensibilisationT2',
      s08: 'section8_mgpT2',
      s09: 'section9_fermetureT2',
      s10: 'section10_exploitationT3',
      s11: 'section11_synthese',
    };

    const formattedData: FormattedConducteurData = {
      subprojet: conducteur.subprojet,
      auditeur: conducteur.auditeur,
      entreprise: conducteur.entreprise,
      personne_rencontree: conducteur.personne_rencontree,
      fonction: conducteur.fonction,
      date: conducteur.date,
      lieu: conducteur.lieu,
      commentaires_libres: conducteur.commentaires_libres,
      section1_infoGenerales: [],
      section2_processusInitialT1: [],
      section3_installationT2: [],
      section4_recrutementT2: [],
      section5_hseT2: [],
      section6_gestionEnvT2: [],
      section7_sensibilisationT2: [],
      section8_mgpT2: [],
      section9_fermetureT2: [],
      section10_exploitationT3: [],
      section11_synthese: [],
    };

    for (const q of questions) {
      const sectionKey = sectionMapping[q.section_key];
      if (sectionKey && formattedData[sectionKey]) {
        (formattedData[sectionKey] as any[]).push({
          numero: q.numero,
          question: q.question,
          reponse_booleenne: q.reponse_booleenne,
          reponse: q.reponse || '—',
          observations: q.observations || '—',
        });
      }
    }

    return formattedData;
  }
}

// =============================================================================
//  EXPORT D'UNE INSTANCE SINGLETON
// =============================================================================

export const rapportGenerator = new RapportGeneratorService();