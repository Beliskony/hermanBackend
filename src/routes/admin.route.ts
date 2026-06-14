import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const adminRouter = Router();


// =============================================================================
// PROJETS
// =============================================================================
adminRouter.post  ('/admin/projects', authMiddleware,       adminController.createProject.bind(adminController));
adminRouter.get   ('/admin/projects', authMiddleware,       adminController.getAllProjects.bind(adminController));
adminRouter.get   ('/admin/projects/:id', authMiddleware,  adminController.getProjectById.bind(adminController));
adminRouter.put   ('/admin/projects/:id', authMiddleware,  adminController.updateProject.bind(adminController));
adminRouter.delete('/admin/projects/:id', authMiddleware,  adminController.hardDeleteProject.bind(adminController));
adminRouter.put   ('/admin/projects/:id/archive', authMiddleware, adminController.archiveProject.bind(adminController));
adminRouter.get   ('/admin/projects/:id/synthesis', authMiddleware, adminController.getProjectSynthesis.bind(adminController));

// =============================================================================
// TEMPLATES  (question_templates)
// =============================================================================
adminRouter.post  ('/admin/templates',  authMiddleware,                   adminController.createTemplate.bind(adminController));
adminRouter.get   ('/admin/templates',                     adminController.getAllTemplates.bind(adminController));
adminRouter.get   ('/admin/templates/:id',                 adminController.getTemplateById.bind(adminController));
adminRouter.put   ('/admin/templates/:id', authMiddleware,                adminController.updateTemplate.bind(adminController));
adminRouter.delete('/admin/templates/:id', authMiddleware,                adminController.deleteTemplate.bind(adminController));
adminRouter.delete('/admin/templates/:id/hard', authMiddleware,            adminController.hardDeleteTemplate.bind(adminController));
adminRouter.post  ('/admin/templates/:id/duplicate', authMiddleware,       adminController.duplicateTemplate.bind(adminController));

// =============================================================================
// QUESTIONS PAR PROJET  (project_questions)
// =============================================================================
adminRouter.get   ('/admin/projects/:projectId/questions',                             adminController.getProjectQuestions.bind(adminController));
adminRouter.get   ('/admin/projects/:projectId/questions/export',                      adminController.exportProjectQuestions.bind(adminController));
adminRouter.post  ('/admin/projects/:projectId/questions/import',                      adminController.importProjectQuestions.bind(adminController));
adminRouter.get   ('/admin/projects/:projectId/questions/:formType/:sectionKey',       adminController.getProjectQuestionsBySection.bind(adminController));
adminRouter.put   ('/admin/projects/questions/:questionId',                            adminController.updateProjectQuestion.bind(adminController));
adminRouter.post  ('/admin/projects/:projectId/reset/:formType', authMiddleware,                    adminController.resetProjectQuestions.bind(adminController));
adminRouter.post  ('/admin/projects/:projectId/custom-question',   authMiddleware,                   adminController.addCustomQuestion.bind(adminController));
adminRouter.delete('/admin/projects/:projectId/custom-question/:questionId', authMiddleware,           adminController.deleteCustomQuestion.bind(adminController));
adminRouter.post  ('/admin/projects/:targetProjectId/clone/:sourceProjectId/:formType', authMiddleware, adminController.cloneQuestionsToProject.bind(adminController));

// =============================================================================
// SCORES
// NOTE: les routes spécifiques (/project/...) doivent être AVANT la route
//       générique (/:formInstanceId) pour éviter qu'Express capture "project"
//       comme valeur de :formInstanceId.
// =============================================================================
adminRouter.post  ('/admin/scores/recalculate',                          adminController.recalculateFormScore.bind(adminController));
adminRouter.post  ('/admin/scores/validate/:projectId/:formType',        adminController.validateFormCompleteness.bind(adminController));
adminRouter.get   ('/admin/scores/project/:projectId',                   adminController.getProjectScores.bind(adminController));
adminRouter.get   ('/admin/scores/project/:projectId/synthesis',         adminController.getProjectScoresSynthesis.bind(adminController));
adminRouter.get   ('/admin/scores/:formInstanceId',                      adminController.getFormScore.bind(adminController));

// =============================================================================
// SUPPRESSION DE FORMULAIRES
// =============================================================================
adminRouter.delete('/admin/forms/apes/:id',  authMiddleware,                adminController.deleteAPESForm.bind(adminController));
adminRouter.delete('/admin/forms/guide-entretien/:id', authMiddleware,       adminController.deleteGuideEntretien.bind(adminController));
adminRouter.delete('/admin/forms/checklist-audit/:id', authMiddleware,       adminController.deleteChecklistAudit.bind(adminController));
adminRouter.delete('/admin/forms/checklist-conducteur/:id', authMiddleware,  adminController.deleteChecklistConducteur.bind(adminController));
adminRouter.delete('/admin/forms/document-review/:id', authMiddleware,       adminController.deleteDocumentReview.bind(adminController));
adminRouter.delete('/admin/forms/field-inspection/:id', authMiddleware,      adminController.deleteFieldInspection.bind(adminController));
adminRouter.delete('/admin/forms/stakeholder-interview/:id', authMiddleware, adminController.deleteStakeholderInterview.bind(adminController));
adminRouter.delete('/admin/forms/gender-assessment/:id',     authMiddleware,     adminController.deleteGenderAssessment.bind(adminController));
adminRouter.delete('/admin/forms/complaint-mechanism/:id',   authMiddleware,   adminController.deleteComplaintMechanism.bind(adminController));
adminRouter.delete('/admin/forms/data-collection/:id',     authMiddleware,     adminController.deleteDataCollection.bind(adminController));

// =============================================================================
// DASHBOARD
// =============================================================================
adminRouter.get('/admin/dashboard', adminController.getDashboard.bind(adminController));

export default adminRouter;