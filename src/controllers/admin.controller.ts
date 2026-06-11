import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { pool } from '../config/databaseConnect';

const adminService = new AdminService();

// =============================================================================
//  HELPERS
// =============================================================================

const isValidId = (id: any): id is string =>
  typeof id === 'string' && id.length === 16 && /^[a-f0-9]{16}$/i.test(id);

const paginate = (req: Request) => {
  const page  = parseInt(req.query.page  as string, 10);
  const limit = parseInt(req.query.limit as string, 10);
  return {
    page:  isNaN(page)  || page  < 1 ? 1  : page,
    limit: isNaN(limit) || limit < 1 ? 10 : Math.min(limit, 100),
  };
};

// =============================================================================
//  ADMIN CONTROLLER
// =============================================================================

export class AdminController {

  // ===========================================================================
  // PROJETS
  // ===========================================================================

  async createProject(req: Request, res: Response) {
    try {
      const result = await adminService.projects.create(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      console.error('Erreur createProject:', error);
      res.status(400).json({ success: false, message: error.message || 'Erreur lors de la création du projet' });
    }
  }

  async getAllProjects(req: Request, res: Response) {
    try {
      const { page, limit } = paginate(req);
      const status = req.query.status as any;
      const result = await adminService.projects.getAll(page, limit, status);
      res.json({
        success: true,
        data: result.items,
        pagination: { page: result.page, limit, total: result.total, totalPages: result.totalPages },
      });
    } catch (error: any) {
      console.error('Erreur getAllProjects:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la récupération des projets' });
    }
  }

  async getProjectById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const includeForms = req.query.includeForms === 'true';

      if (!isValidId(id)) {
        return res.status(400).json({ success: false, message: 'ID invalide' });
      }

      const project = await adminService.projects.getById(id);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Projet non trouvé' });
      }

      if (!includeForms) {
        return res.json({ success: true, data: { project } });
      }

      // Charge les formulaires liés avec compteurs d'annexes
      const [apesForms, guideForms, auditForms, conducteurForms] = await Promise.all([
        pool.query<any[]>(
          `SELECT fd.*,
             pi.project_name, pi.date AS project_date, pi.auditors, pi.location, pi.period,
             (SELECT COUNT(*) FROM document_review      WHERE form_id = fd.id) AS has_doc_review,
             (SELECT COUNT(*) FROM field_inspection      WHERE form_id = fd.id) AS has_field_inspection,
             (SELECT COUNT(*) FROM stakeholder_interview WHERE form_id = fd.id) AS has_stakeholder,
             (SELECT COUNT(*) FROM gender_assessment     WHERE form_id = fd.id) AS has_gender,
             (SELECT COUNT(*) FROM complaint_mechanism   WHERE form_id = fd.id) AS has_complaint
           FROM form_data fd
           JOIN project_info pi ON pi.id = fd.project_info_id
           WHERE fd.project_id = ?
           ORDER BY fd.created_at DESC`,
          [id]
        ),
        pool.query<any[]>(
          'SELECT * FROM guide_entretien WHERE project_id = ? ORDER BY gi_date DESC', [id]
        ),
        pool.query<any[]>(
          `SELECT ca.*,
             (SELECT COUNT(*) FROM checklist_audit_criteres  WHERE checklist_audit_id = ca.id) AS nb_criteres,
             (SELECT COUNT(*) FROM checklist_audit_documents WHERE checklist_audit_id = ca.id) AS nb_documents
           FROM checklist_audit ca WHERE ca.project_id = ? ORDER BY ca.date DESC`,
          [id]
        ),
        pool.query<any[]>(
          `SELECT cc.*,
             (SELECT COUNT(*) FROM checklist_conducteur_questions WHERE checklist_conducteur_id = cc.id) AS nb_questions
           FROM checklist_conducteur cc WHERE cc.project_id = ? ORDER BY cc.date DESC`,
          [id]
        ),
      ]);

      res.json({
        success: true,
        data: {
          project,
          summary: {
            total_apes:        apesForms[0]?.length       || 0,
            total_guides:      guideForms[0]?.length      || 0,
            total_audits:      auditForms[0]?.length      || 0,
            total_conducteurs: conducteurForms[0]?.length || 0,
          },
          forms: {
            apes:        apesForms[0]       || [],
            guides:      guideForms[0]      || [],
            audits:      auditForms[0]      || [],
            conducteurs: conducteurForms[0] || [],
          },
        },
      });
    } catch (error: any) {
      console.error('Erreur getProjectById:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la récupération du projet' });
    }
  }

  async updateProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) {
        return res.status(400).json({ success: false, message: 'ID invalide' });
      }

      const result = await adminService.projects.update(id, req.body);
      if (!result) return res.status(404).json({ success: false, message: 'Projet non trouvé' });

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Erreur updateProject:', error);
      res.status(400).json({ success: false, message: error.message || 'Erreur lors de la mise à jour du projet' });
    }
  }

  async hardDeleteProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const deleted = await adminService.projects.hardDelete(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Projet non trouvé' });

      res.json({ success: true, message: 'Projet supprimé définitivement' });
    } catch (error: any) {
      console.error('Erreur hardDeleteProject:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la suppression du projet' });
    }
  }

  async archiveProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const archived = await adminService.projects.softDelete(id);
      if (!archived) return res.status(404).json({ success: false, message: 'Projet non trouvé' });

      res.json({ success: true, message: 'Projet archivé avec succès' });
    } catch (error: any) {
      console.error('Erreur archiveProject:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de l\'archivage du projet' });
    }
  }

  async getProjectSynthesis(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const synthesis = await adminService.projects.getSynthesis(id);
      if (!synthesis) return res.status(404).json({ success: false, message: 'Projet non trouvé' });

      res.json({ success: true, data: synthesis });
    } catch (error: any) {
      console.error('Erreur getProjectSynthesis:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la récupération de la synthèse' });
    }
  }

  // ===========================================================================
  // TEMPLATES  (default_form_questions)
  // ===========================================================================

  async createTemplate(req: Request, res: Response) {
    try {
      const result = await adminService.templates.createTemplate(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      console.error('Erreur createTemplate:', error);
      res.status(400).json({ success: false, message: error.message || 'Erreur lors de la création du template' });
    }
  }

  async getAllTemplates(req: Request, res: Response) {
    try {
      const { page, limit } = paginate(req);
      const formType   = req.query.formType   as string | undefined;
      const active     = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;
      const sectionKey = req.query.sectionKey as string | undefined;
      const search     = req.query.search     as string | undefined;

      const result = await adminService.templates.getAllTemplates(page, limit, {
        form_type:   formType as any,
        active,
        section_key: sectionKey,
        search,
      });
      res.json({
        success: true,
        data: result.items,
        pagination: { page: result.page, limit, total: result.total, totalPages: result.totalPages },
      });
    } catch (error: any) {
      console.error('Erreur getAllTemplates:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la récupération des templates' });
    }
  }

  async getTemplateById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const template = await adminService.templates.getTemplateById(id);
      if (!template) return res.status(404).json({ success: false, message: 'Template non trouvé' });

      res.json({ success: true, data: template });
    } catch (error: any) {
      console.error('Erreur getTemplateById:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la récupération du template' });
    }
  }

  async updateTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const result = await adminService.templates.updateTemplate(id, req.body);
      if (!result) return res.status(404).json({ success: false, message: 'Template non trouvé' });

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Erreur updateTemplate:', error);
      res.status(400).json({ success: false, message: error.message || 'Erreur lors de la mise à jour du template' });
    }
  }

  async deleteTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const deleted = await adminService.templates.deleteTemplate(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Template non trouvé' });

      res.json({ success: true, message: 'Template désactivé avec succès' });
    } catch (error: any) {
      console.error('Erreur deleteTemplate:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la désactivation du template' });
    }
  }

  async hardDeleteTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const deleted = await adminService.templates.hardDeleteTemplate(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Template non trouvé' });

      res.json({ success: true, message: 'Template supprimé définitivement' });
    } catch (error: any) {
      console.error('Erreur hardDeleteTemplate:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la suppression du template' });
    }
  }

  async duplicateTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const result = await adminService.templates.duplicateTemplate(id);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      console.error('Erreur duplicateTemplate:', error);
      res.status(400).json({ success: false, message: error.message || 'Erreur lors de la duplication du template' });
    }
  }

  // ===========================================================================
  // QUESTIONS PAR PROJET  (project_questions)
  // ===========================================================================

  async getProjectQuestions(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const formType = req.query.formType as string | undefined;

      if (!isValidId(projectId)) {
        return res.status(400).json({ success: false, message: 'ID de projet invalide' });
      }

      const questions = await adminService.projectQuestions.getProjectQuestionsWithStats(
        projectId, formType as any
      );
      res.json({ success: true, data: questions });
    } catch (error: any) {
      console.error('Erreur getProjectQuestions:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la récupération des questions' });
    }
  }

  async getProjectQuestionsBySection(req: Request, res: Response) {
    try {
      const { projectId, formType, sectionKey } = req.params;

      if (!isValidId(projectId)) {
        return res.status(400).json({ success: false, message: 'ID de projet invalide' });
      }

      const questions = await adminService.projectQuestions.getProjectQuestionsBySection(
        projectId, formType as any, sectionKey as string
      );
      res.json({ success: true, data: questions });
    } catch (error: any) {
      console.error('Erreur getProjectQuestionsBySection:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la récupération des questions' });
    }
  }

  async updateProjectQuestion(req: Request, res: Response) {
    try {
      const { questionId } = req.params;
      if (!isValidId(questionId)) {
        return res.status(400).json({ success: false, message: 'ID invalide' });
      }

      const result = await adminService.projectQuestions.updateProjectQuestion(questionId, req.body);
      if (!result) return res.status(404).json({ success: false, message: 'Question non trouvée' });

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Erreur updateProjectQuestion:', error);
      res.status(400).json({ success: false, message: error.message || 'Erreur lors de la mise à jour de la question' });
    }
  }

  async resetProjectQuestions(req: Request, res: Response) {
    try {
      const { projectId, formType } = req.params;

      if (!isValidId(projectId)) {
        return res.status(400).json({ success: false, message: 'ID de projet invalide' });
      }

      const result = await adminService.projectQuestions.resetProjectQuestions(
        projectId, formType as any
      );
      res.json({
        success: true,
        message: `Questions du formulaire ${formType} réinitialisées avec succès`,
        data: result,
      });
    } catch (error: any) {
      console.error('Erreur resetProjectQuestions:', error);
      res.status(400).json({ success: false, message: error.message || 'Erreur lors de la réinitialisation des questions' });
    }
  }

  async addCustomQuestion(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      if (!isValidId(projectId)) {
        return res.status(400).json({ success: false, message: 'ID de projet invalide' });
      }

      const result = await adminService.projectQuestions.addCustomQuestion(projectId, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      console.error('Erreur addCustomQuestion:', error);
      res.status(400).json({ success: false, message: error.message || 'Erreur lors de l\'ajout de la question personnalisée' });
    }
  }

  async deleteCustomQuestion(req: Request, res: Response) {
    try {
      const { projectId, questionId } = req.params;

      if (!isValidId(projectId) || !isValidId(questionId)) {
        return res.status(400).json({ success: false, message: 'ID invalide' });
      }

      const deleted = await adminService.projectQuestions.deleteCustomQuestion(projectId, questionId);
      if (!deleted) return res.status(404).json({ success: false, message: 'Question non trouvée' });

      res.json({ success: true, message: 'Question personnalisée supprimée' });
    } catch (error: any) {
      console.error('Erreur deleteCustomQuestion:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la suppression de la question' });
    }
  }

  async cloneQuestionsToProject(req: Request, res: Response) {
    try {
      const { targetProjectId, sourceProjectId, formType } = req.params;

      if (!isValidId(targetProjectId) || !isValidId(sourceProjectId)) {
        return res.status(400).json({ success: false, message: 'ID de projet invalide' });
      }

      const result = await adminService.projectQuestions.cloneQuestionsToProject(
        sourceProjectId, targetProjectId, formType as any
      );
      res.json({ success: true, message: 'Questions clonées avec succès', data: result });
    } catch (error: any) {
      console.error('Erreur cloneQuestionsToProject:', error);
      res.status(400).json({ success: false, message: error.message || 'Erreur lors du clonage des questions' });
    }
  }

  async exportProjectQuestions(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      if (!isValidId(projectId)) {
        return res.status(400).json({ success: false, message: 'ID de projet invalide' });
      }

      const exportData = await adminService.projectQuestions.exportProjectQuestions(projectId);
      res.json({ success: true, data: exportData });
    } catch (error: any) {
      console.error('Erreur exportProjectQuestions:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de l\'export des questions' });
    }
  }

  async importProjectQuestions(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const { questions, strategy } = req.body;

      if (!isValidId(projectId)) {
        return res.status(400).json({ success: false, message: 'ID de projet invalide' });
      }
      if (!questions || !Array.isArray(questions)) {
        return res.status(400).json({ success: false, message: 'Format d\'import invalide' });
      }

      const result = await adminService.projectQuestions.importProjectQuestions(
        projectId, questions, strategy || 'merge'
      );
      res.json({
        success: true,
        message: `Import ${strategy === 'replace' ? 'remplacement' : 'fusion'} terminé`,
        data: result,
      });
    } catch (error: any) {
      console.error('Erreur importProjectQuestions:', error);
      res.status(400).json({ success: false, message: error.message || 'Erreur lors de l\'import des questions' });
    }
  }

  // ===========================================================================
  // SCORES
  // ===========================================================================

  async recalculateFormScore(req: Request, res: Response) {
    try {
      const { projectId, formType, formInstanceId, answers } = req.body;

      if (!projectId || !formType || !formInstanceId || !answers) {
        return res.status(400).json({
          success: false,
          message: 'Paramètres manquants: projectId, formType, formInstanceId, answers',
        });
      }

      const result = await adminService.scores.recalculateFormScore(
        projectId, formType, formInstanceId, answers
      );
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Erreur recalculateFormScore:', error);
      res.status(400).json({ success: false, message: error.message || 'Erreur lors du calcul du score' });
    }
  }

  async getFormScore(req: Request, res: Response) {
    try {
      const { formInstanceId } = req.params;
      const formType = req.query.formType as string | undefined;

      if (!isValidId(formInstanceId)) {
        return res.status(400).json({ success: false, message: 'ID invalide' });
      }

      const score = await adminService.scores.getFormScore(formInstanceId, formType as any);
      if (!score) return res.status(404).json({ success: false, message: 'Score non trouvé' });

      res.json({ success: true, data: score });
    } catch (error: any) {
      console.error('Erreur getFormScore:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la récupération du score' });
    }
  }

  async getProjectScores(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      if (!isValidId(projectId)) {
        return res.status(400).json({ success: false, message: 'ID de projet invalide' });
      }

      const scores = await adminService.scores.getProjectScores(projectId);
      res.json({ success: true, data: scores });
    } catch (error: any) {
      console.error('Erreur getProjectScores:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la récupération des scores' });
    }
  }

  async getProjectScoresSynthesis(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      if (!isValidId(projectId)) {
        return res.status(400).json({ success: false, message: 'ID de projet invalide' });
      }

      const synthesis = await adminService.scores.getProjectSynthesis(projectId);
      res.json({ success: true, data: synthesis });
    } catch (error: any) {
      console.error('Erreur getProjectScoresSynthesis:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la récupération de la synthèse' });
    }
  }

  async validateFormCompleteness(req: Request, res: Response) {
    try {
      const { projectId, formType } = req.params;
      const { answers } = req.body;

      if (!answers) {
        return res.status(400).json({ success: false, message: 'Paramètre answers manquant' });
      }

      const result = await adminService.scores.validateFormCompleteness(
        projectId as string, formType as any, answers
      );
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Erreur validateFormCompleteness:', error);
      res.status(400).json({ success: false, message: error.message || 'Erreur lors de la validation' });
    }
  }

  // ===========================================================================
  // SUPPRESSION DE FORMULAIRES
  // ===========================================================================

  async deleteAPESForm(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const deleted = await adminService.delete.deleteAPESForm(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Formulaire non trouvé' });

      res.json({ success: true, message: 'Formulaire APES supprimé avec succès' });
    } catch (error: any) {
      console.error('Erreur deleteAPESForm:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la suppression' });
    }
  }

  async deleteGuideEntretien(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const deleted = await adminService.delete.deleteGuideEntretien(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Guide non trouvé' });

      res.json({ success: true, message: 'Guide entretien supprimé avec succès' });
    } catch (error: any) {
      console.error('Erreur deleteGuideEntretien:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la suppression' });
    }
  }

  async deleteChecklistAudit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const deleted = await adminService.delete.deleteChecklistAudit(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Audit non trouvé' });

      res.json({ success: true, message: 'Checklist audit supprimée avec succès' });
    } catch (error: any) {
      console.error('Erreur deleteChecklistAudit:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la suppression' });
    }
  }

  async deleteChecklistConducteur(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const deleted = await adminService.delete.deleteChecklistConducteur(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Checklist non trouvée' });

      res.json({ success: true, message: 'Checklist conducteur supprimée avec succès' });
    } catch (error: any) {
      console.error('Erreur deleteChecklistConducteur:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la suppression' });
    }
  }

  async deleteDocumentReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const deleted = await adminService.delete.deleteDocumentReview(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Revue documentaire non trouvée' });

      res.json({ success: true, message: 'Revue documentaire supprimée avec succès' });
    } catch (error: any) {
      console.error('Erreur deleteDocumentReview:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la suppression' });
    }
  }

  async deleteFieldInspection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const deleted = await adminService.delete.deleteFieldInspection(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Inspection terrain non trouvée' });

      res.json({ success: true, message: 'Inspection terrain supprimée avec succès' });
    } catch (error: any) {
      console.error('Erreur deleteFieldInspection:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la suppression' });
    }
  }

  async deleteStakeholderInterview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const deleted = await adminService.delete.deleteStakeholderInterview(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Entretien non trouvé' });

      res.json({ success: true, message: 'Entretien partie prenante supprimé avec succès' });
    } catch (error: any) {
      console.error('Erreur deleteStakeholderInterview:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la suppression' });
    }
  }

  async deleteGenderAssessment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const deleted = await adminService.delete.deleteGenderAssessment(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Évaluation genre non trouvée' });

      res.json({ success: true, message: 'Évaluation genre supprimée avec succès' });
    } catch (error: any) {
      console.error('Erreur deleteGenderAssessment:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la suppression' });
    }
  }

  async deleteComplaintMechanism(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const deleted = await adminService.delete.deleteComplaintMechanism(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Mécanisme de plainte non trouvé' });

      res.json({ success: true, message: 'Mécanisme de plainte supprimé avec succès' });
    } catch (error: any) {
      console.error('Erreur deleteComplaintMechanism:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la suppression' });
    }
  }

  async deleteDataCollection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const deleted = await adminService.delete.deleteDataCollection(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Collection de données non trouvée' });

      res.json({ success: true, message: 'Collection de données supprimée avec succès' });
    } catch (error: any) {
      console.error('Erreur deleteDataCollection:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la suppression' });
    }
  }

  // ===========================================================================
  // DASHBOARD
  // ===========================================================================

  async getDashboard(req: Request, res: Response) {
    try {
      const dashboard = await adminService.dashboard.getDashboard();
      res.json({ success: true, data: dashboard });
    } catch (error: any) {
      console.error('Erreur getDashboard:', error);
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la récupération du tableau de bord' });
    }
  }
}

export const adminController = new AdminController();