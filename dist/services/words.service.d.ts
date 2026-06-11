/**
 * Export un formulaire APES complet (5 annexes)
 */
export declare function exportAPESWord(data: any, projectName: string, projectLocation: string, auditors: string): Promise<Buffer>;
/**
 * Export un guide d'entretien seul
 */
export declare function exportGuideWord(data: any, projectName: string, projectLocation: string, auditors: string): Promise<Buffer>;
/**
 * Export une checklist audit seule
 */
export declare function exportAuditWord(data: any, projectName: string, projectLocation: string, auditors: string): Promise<Buffer>;
/**
 * Export une checklist conducteur seule
 */
export declare function exportConducteurWord(data: any, projectName: string, projectLocation: string, auditors: string): Promise<Buffer>;
/**
 * Export tout-en-un : tous les formulaires d'un projet
 */
export declare function exportAllFormsWord(projectName: string, projectLocation: string, auditors: string, apesData: any | null, guideData: any[] | null, auditData: any[] | null, conducteurData: any[] | null): Promise<Buffer>;
//# sourceMappingURL=words.service.d.ts.map