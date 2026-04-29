import { IGuideEntretien } from '../interfaces/GuideEntretien.model';
import { IChecklistConducteurTravaux, IChecklistAudit } from '../interfaces/ChecklistAudit.model';
import { IFormData } from '../interfaces/FormData.model';
export declare class FormService {
    /**
      * Créer un nouveau formulaire
      */
    createForm(formData: Partial<IFormData>): Promise<IFormData>;
    /**
     * Récupérer un formulaire par ID
     */
    getFormById(id: string): Promise<IFormData | null>;
    /**
     * Récupérer tous les formulaires
     */
    getAllForms(filters?: {
        status?: string;
        projectName?: string;
        dateFrom?: Date;
        dateTo?: Date;
    }, page?: number, limit?: number): Promise<{
        forms: IFormData[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * Mettre à jour un formulaire
     */
    updateForm(id: string, updateData: Partial<IFormData>): Promise<IFormData | null>;
    /**
     * Supprimer un formulaire
     */
    deleteForm(id: string): Promise<boolean>;
    /**
     * Soumettre un formulaire (changer le statut à submitted)
     */
    submitForm(id: string): Promise<IFormData | null>;
    /**
     * Statistiques des formulaires
     */
    getFormStats(): Promise<any>;
    createGuideEntretien(data: Partial<IGuideEntretien>): Promise<IGuideEntretien>;
    getGuideEntretienById(id: string): Promise<IGuideEntretien | null>;
    getAllGuideEntretiens(filters?: {
        guideType?: string;
        subprojet?: string;
    }, page?: number, limit?: number): Promise<{
        items: (import("mongoose").Document<unknown, {}, IGuideEntretien, {}, import("mongoose").DefaultSchemaOptions> & IGuideEntretien & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    updateGuideEntretien(id: string, data: Partial<IGuideEntretien>): Promise<IGuideEntretien | null>;
    deleteGuideEntretien(id: string): Promise<boolean>;
    createChecklistAudit(data: Partial<IChecklistAudit>): Promise<IChecklistAudit>;
    getChecklistAuditById(id: string): Promise<IChecklistAudit | null>;
    getAllChecklistAudits(filters?: {
        subprojet?: string;
        auditeurs?: string;
    }, page?: number, limit?: number): Promise<{
        items: (import("mongoose").Document<unknown, {}, IChecklistAudit, {}, import("mongoose").DefaultSchemaOptions> & IChecklistAudit & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    updateChecklistAudit(id: string, data: Partial<IChecklistAudit>): Promise<IChecklistAudit | null>;
    deleteChecklistAudit(id: string): Promise<boolean>;
    createChecklistConducteur(data: Partial<IChecklistConducteurTravaux>): Promise<IChecklistConducteurTravaux>;
    getChecklistConducteurById(id: string): Promise<IChecklistConducteurTravaux | null>;
    getAllChecklistConducteurs(filters?: {
        subprojet?: string;
        entreprise?: string;
    }, page?: number, limit?: number): Promise<{
        items: (import("mongoose").Document<unknown, {}, IChecklistConducteurTravaux, {}, import("mongoose").DefaultSchemaOptions> & IChecklistConducteurTravaux & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    updateChecklistConducteur(id: string, data: Partial<IChecklistConducteurTravaux>): Promise<IChecklistConducteurTravaux | null>;
    deleteChecklistConducteur(id: string): Promise<boolean>;
}
//# sourceMappingURL=form.service.d.ts.map