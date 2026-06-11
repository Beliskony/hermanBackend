"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const form_controller_1 = require("../controllers/form.controller");
const formRouter = (0, express_1.Router)();
// Projets
formRouter.get('/projects', form_controller_1.formController.getAllProjects.bind(form_controller_1.formController));
formRouter.get('/projects/:id', form_controller_1.formController.getProjectById.bind(form_controller_1.formController));
// Questions
formRouter.get('/questions/:projectId/:formType', form_controller_1.formController.getFormQuestions.bind(form_controller_1.formController));
// APES
formRouter.post('/apes', form_controller_1.formController.createAPES.bind(form_controller_1.formController));
formRouter.get('/apes/:id', form_controller_1.formController.getAPES.bind(form_controller_1.formController));
formRouter.put('/apes/:id', form_controller_1.formController.updateAPES.bind(form_controller_1.formController));
formRouter.put('/apes/:id/submit', form_controller_1.formController.submitAPES.bind(form_controller_1.formController));
// Data Collection
formRouter.post('/data-collection', form_controller_1.formController.createDataCollection.bind(form_controller_1.formController));
formRouter.get('/data-collection/:id', form_controller_1.formController.getDataCollection.bind(form_controller_1.formController));
formRouter.put('/data-collection/:id', form_controller_1.formController.updateDataCollection.bind(form_controller_1.formController));
formRouter.put('/data-collection/:id/submit', form_controller_1.formController.submitDataCollection.bind(form_controller_1.formController));
// Guide Entretien
formRouter.post('/guide-entretien', form_controller_1.formController.createGuideEntretien.bind(form_controller_1.formController));
formRouter.get('/guide-entretien/:id', form_controller_1.formController.getGuideEntretien.bind(form_controller_1.formController));
formRouter.put('/guide-entretien/:id', form_controller_1.formController.updateGuideEntretien.bind(form_controller_1.formController));
formRouter.put('/guide-entretien/:id/submit', form_controller_1.formController.submitGuideEntretien.bind(form_controller_1.formController));
// Checklist Audit
formRouter.post('/checklist-audit', form_controller_1.formController.createChecklistAudit.bind(form_controller_1.formController));
formRouter.get('/checklist-audit/:id', form_controller_1.formController.getChecklistAudit.bind(form_controller_1.formController));
formRouter.put('/checklist-audit/:id', form_controller_1.formController.updateChecklistAudit.bind(form_controller_1.formController));
formRouter.put('/checklist-audit/:id/submit', form_controller_1.formController.submitChecklistAudit.bind(form_controller_1.formController));
// Checklist Conducteur
formRouter.post('/checklist-conducteur', form_controller_1.formController.createChecklistConducteur.bind(form_controller_1.formController));
formRouter.get('/checklist-conducteur/:id', form_controller_1.formController.getChecklistConducteur.bind(form_controller_1.formController));
formRouter.put('/checklist-conducteur/:id', form_controller_1.formController.updateChecklistConducteur.bind(form_controller_1.formController));
formRouter.put('/checklist-conducteur/:id/submit', form_controller_1.formController.submitChecklistConducteur.bind(form_controller_1.formController));
// Endpoint unique pour récupérer n'importe quel formulaire
formRouter.get('/form/:id', form_controller_1.formController.getForm.bind(form_controller_1.formController));
formRouter.put('/form/:id/submit', form_controller_1.formController.submitForm.bind(form_controller_1.formController));
formRouter.get('/forms', form_controller_1.formController.getAllForms.bind(form_controller_1.formController));
exports.default = formRouter;
//# sourceMappingURL=form.route.js.map