"use strict";
// ─────────────────────────────────────────────────────────────────────────────
//  form.service.ts  —  SERVICE PRINCIPAL (point d'entrée unique)
//  
//  Ce fichier réexporte tous les services et helpers
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormService = exports.DataCollectionService = exports.ChecklistConducteurService = exports.ChecklistAuditService = exports.GuideEntretienService = exports.APESFormService = exports.QuestionService = exports.ProjectService = exports.BaseRepository = exports.stringify = exports.parseJson = void 0;
// Helpers communs
var Base_form_1 = require("./formulaire/Base_form");
Object.defineProperty(exports, "parseJson", { enumerable: true, get: function () { return Base_form_1.parseJson; } });
Object.defineProperty(exports, "stringify", { enumerable: true, get: function () { return Base_form_1.stringify; } });
Object.defineProperty(exports, "BaseRepository", { enumerable: true, get: function () { return Base_form_1.BaseRepository; } });
// Services
var Projet_service_1 = require("./Projet.service");
Object.defineProperty(exports, "ProjectService", { enumerable: true, get: function () { return Projet_service_1.ProjectService; } });
var Questions_service_1 = require("./Questions.service");
Object.defineProperty(exports, "QuestionService", { enumerable: true, get: function () { return Questions_service_1.QuestionService; } });
var APES_form_1 = require("./formulaire/APES_form");
Object.defineProperty(exports, "APESFormService", { enumerable: true, get: function () { return APES_form_1.APESFormService; } });
var Guide_entretient_1 = require("./formulaire/Guide_entretient");
Object.defineProperty(exports, "GuideEntretienService", { enumerable: true, get: function () { return Guide_entretient_1.GuideEntretienService; } });
var Checklist_service_1 = require("./formulaire/Checklist.service");
Object.defineProperty(exports, "ChecklistAuditService", { enumerable: true, get: function () { return Checklist_service_1.ChecklistAuditService; } });
Object.defineProperty(exports, "ChecklistConducteurService", { enumerable: true, get: function () { return Checklist_service_1.ChecklistConducteurService; } });
var data_collection_service_1 = require("./formulaire/data_collection.service");
Object.defineProperty(exports, "DataCollectionService", { enumerable: true, get: function () { return data_collection_service_1.DataCollectionService; } });
// Service principal qui regroupe tout
const Projet_service_2 = require("./Projet.service");
const Questions_service_2 = require("./Questions.service");
const APES_form_2 = require("./formulaire/APES_form");
const Guide_entretient_2 = require("./formulaire/Guide_entretient");
const Checklist_service_2 = require("./formulaire/Checklist.service");
const data_collection_service_2 = require("./formulaire/data_collection.service");
class FormService {
    constructor() {
        this.projects = new Projet_service_2.ProjectService();
        this.questions = new Questions_service_2.QuestionService();
        this.apes = new APES_form_2.APESFormService();
        this.guideEntretien = new Guide_entretient_2.GuideEntretienService();
        this.checklistAudit = new Checklist_service_2.ChecklistAuditService();
        this.checklistConducteur = new Checklist_service_2.ChecklistConducteurService();
        this.dataCollection = new data_collection_service_2.DataCollectionService();
    }
}
exports.FormService = FormService;
//# sourceMappingURL=form.service.js.map