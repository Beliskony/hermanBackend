import { Router } from 'express';
import { formController } from '../controllers/form.controller';


const formRouter = Router();

// Projets
formRouter.get('/projects', formController.getAllProjects.bind(formController));
formRouter.get('/projects/:id', formController.getProjectById.bind(formController));

// Questions
formRouter.get('/questions/:projectId/:formType', formController.getFormQuestions.bind(formController));
formRouter.get('/questions/:projectId/:formType/:sectionKey', formController.getFormQuestionsBySection.bind(formController));
formRouter.get('/question/:id', formController.getQuestionById.bind(formController));

// APES
formRouter.post('/apes', formController.createAPES.bind(formController));
formRouter.get('/apes/:id', formController.getAPES.bind(formController));
formRouter.put('/apes/:id', formController.updateAPES.bind(formController));
formRouter.put('/apes/:id/submit', formController.submitAPES.bind(formController));

// Data Collection
formRouter.post('/data-collection', formController.createDataCollection.bind(formController));
formRouter.get('/data-collection/:id', formController.getDataCollection.bind(formController));
formRouter.put('/data-collection/:id', formController.updateDataCollection.bind(formController));


// Guide Entretien
formRouter.post('/guide-entretien', formController.createGuideEntretien.bind(formController));
formRouter.get('/guide-entretien/:id', formController.getGuideEntretien.bind(formController));
formRouter.put('/guide-entretien/:id/submit', formController.submitGuideEntretien.bind(formController));

// Checklist Audit
formRouter.post('/checklist-audit', formController.createChecklistAudit.bind(formController));
formRouter.get('/checklist-audit/:id', formController.getChecklistAudit.bind(formController));
formRouter.put('/checklist-audit/:id/submit', formController.submitChecklistAudit.bind(formController));

// Checklist Conducteur
formRouter.post('/checklist-conducteur', formController.createChecklistConducteur.bind(formController));
formRouter.get('/checklist-conducteur/:id', formController.getChecklistConducteur.bind(formController));
formRouter.put('/checklist-conducteur/:id/submit', formController.submitChecklistConducteur.bind(formController));

// Endpoint unique pour récupérer n'importe quel formulaire
formRouter.get('/form/:id', formController.getForm.bind(formController));
formRouter.get('/forms', formController.getAllForms.bind(formController));
formRouter.put('/form/:id/submit', formController.submitForm.bind(formController));

export default formRouter;