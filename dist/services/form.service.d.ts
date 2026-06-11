export { parseJson, stringify, BaseRepository, Paginated } from './formulaire/Base_form';
export { ProjectService } from './Projet.service';
export { QuestionService } from './Questions.service';
export { APESFormService } from './formulaire/APES_form';
export { GuideEntretienService } from './formulaire/Guide_entretient';
export { ChecklistAuditService, ChecklistConducteurService } from './formulaire/Checklist.service';
export { DataCollectionService, CritereConformite, DisponibiliteDoc, NiveauCriticite, ConclusionMGP } from './formulaire/data_collection.service';
import { ProjectService } from './Projet.service';
import { QuestionService } from './Questions.service';
import { APESFormService } from './formulaire/APES_form';
import { GuideEntretienService } from './formulaire/Guide_entretient';
import { ChecklistAuditService, ChecklistConducteurService } from './formulaire/Checklist.service';
import { DataCollectionService } from './formulaire/data_collection.service';
export declare class FormService {
    readonly projects: ProjectService;
    readonly questions: QuestionService;
    readonly apes: APESFormService;
    readonly guideEntretien: GuideEntretienService;
    readonly checklistAudit: ChecklistAuditService;
    readonly checklistConducteur: ChecklistConducteurService;
    readonly dataCollection: DataCollectionService;
}
//# sourceMappingURL=form.service.d.ts.map