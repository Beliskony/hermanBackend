import { IFormData } from '../interfaces/FormData.model';
import { IGuideEntretien } from '../interfaces/GuideEntretien.model';
import { IChecklistAudit, IChecklistConducteurTravaux } from '../interfaces/ChecklistAudit.model';
export declare function generateFormDataWordDocument(data: IFormData): Promise<Buffer>;
export declare function exportChecklistAuditWord(data: IChecklistAudit): Promise<Buffer>;
export declare function exportChecklistConducteurWord(data: IChecklistConducteurTravaux): Promise<Buffer>;
export declare function exportGuideEntretienWord(data: IGuideEntretien): Promise<Buffer>;
//# sourceMappingURL=words.service.d.ts.map