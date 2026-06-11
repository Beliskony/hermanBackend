// ─────────────────────────────────────────────────────────────────────────────
//  form.service.ts  —  SERVICE PRINCIPAL (point d'entrée unique)
//  
//  Ce fichier réexporte tous les services et helpers
// ─────────────────────────────────────────────────────────────────────────────

// Helpers communs
export { parseJson, stringify, BaseRepository, Paginated } from './formulaire/Base_form';

// Services
export { ProjectService } from './Projet.service';
export { QuestionService } from './Questions.service';
export { APESFormService } from './formulaire/APES_form';
export { GuideEntretienService } from './formulaire/Guide_entretient';
export { ChecklistAuditService, ChecklistConducteurService } from './formulaire/Checklist.service';
export { DataCollectionService, CritereConformite, DisponibiliteDoc, NiveauCriticite, ConclusionMGP } from './formulaire/data_collection.service';


// Service principal qui regroupe tout
import { ProjectService } from './Projet.service';
import { QuestionService } from './Questions.service';
import { APESFormService } from './formulaire/APES_form';
import { GuideEntretienService } from './formulaire/Guide_entretient';
import { ChecklistAuditService, ChecklistConducteurService } from './formulaire/Checklist.service';
import { DataCollectionService } from './formulaire/data_collection.service';

export class FormService {
  public readonly projects = new ProjectService();
  public readonly questions = new QuestionService();
  public readonly apes = new APESFormService();
  public readonly guideEntretien = new GuideEntretienService();
  public readonly checklistAudit = new ChecklistAuditService();
  public readonly checklistConducteur = new ChecklistConducteurService();
  public readonly dataCollection = new DataCollectionService();
}