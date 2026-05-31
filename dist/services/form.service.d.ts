export declare class FormService {
    createForm(formData: {
        projectInfo: {
            projectName: string;
            date: Date | string;
            auditors: string;
            location: string;
            period: string;
        };
        documentReview?: any;
        fieldInspection?: any;
        stakeholderInterview?: any;
        genderAssessment?: any;
        complaintMechanism?: any;
        status?: 'draft' | 'submitted' | 'archived';
    }): Promise<{
        id: string;
        projectId: string;
        status: "draft" | "submitted" | "archived";
    }>;
    getFormById(id: string): Promise<any>;
    getAllForms(filters?: {
        status?: string;
        projectName?: string;
        dateFrom?: Date;
        dateTo?: Date;
    }, page?: number, limit?: number): Promise<{
        forms: any[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    updateForm(id: string, updateData: any): Promise<any>;
    deleteForm(id: string): Promise<boolean>;
    submitForm(id: string): Promise<any>;
    getFormStats(): Promise<{
        total: any;
        byFormType: {
            apes: {
                status: any;
                label: string;
                count: number;
                latest: any;
            }[];
            checklistAudit: {
                status: any;
                label: string;
                count: number;
                latest: any;
            }[];
            checklistConducteur: {
                status: any;
                label: string;
                count: number;
                latest: any;
            }[];
            guideEntretien: {
                status: any;
                label: string;
                count: number;
                latest: any;
            }[];
        };
        details: {
            apes: {
                total: any;
                stats: any[];
            };
            checklistAudit: {
                total: any;
                stats: any[];
            };
            checklistConducteur: {
                total: any;
                stats: any[];
            };
            guideEntretien: {
                total: any;
                stats: any[];
            };
        };
    }>;
    createGuideEntretien(data: any): Promise<any>;
    getGuideEntretienById(id: string): Promise<any>;
    getAllGuideEntretiens(filters?: {
        guideType?: string;
        subprojet?: string;
    }, page?: number, limit?: number): Promise<{
        items: any[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    updateGuideEntretien(id: string, data: any): Promise<any>;
    deleteGuideEntretien(id: string): Promise<boolean>;
    createChecklistAudit(data: any): Promise<any>;
    getChecklistAuditById(id: string): Promise<any>;
    getAllChecklistAudits(filters?: {
        subprojet?: string;
        auditeurs?: string;
    }, page?: number, limit?: number): Promise<{
        items: any[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    updateChecklistAudit(id: string, data: any): Promise<any>;
    deleteChecklistAudit(id: string): Promise<boolean>;
    createChecklistConducteur(data: any): Promise<any>;
    getChecklistConducteurById(id: string): Promise<any>;
    getAllChecklistConducteurs(filters?: {
        subprojet?: string;
        entreprise?: string;
    }, page?: number, limit?: number): Promise<{
        items: any[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    updateChecklistConducteur(id: string, data: any): Promise<any>;
    deleteChecklistConducteur(id: string): Promise<boolean>;
    /** Upsert toutes les sections d'un FormData */
    private _saveSections;
    private _saveGenderAssessment;
    private _saveComplaintMechanism;
    private readonly SECTION_MAP;
    private _insertChecklistCriteres;
    private _insertChecklistDocuments;
    private readonly CONDUCTEUR_SECTIONS;
    private readonly CONDUCTEUR_KEY_MAP;
    private _insertConducteurQuestions;
    private _insertGuideQuestions;
    private _buildGuideResponse;
    private _buildAuditResponse;
    private _buildConducteurResponse;
    private _parseJson;
    private _formatStat;
}
//# sourceMappingURL=form.service.d.ts.map