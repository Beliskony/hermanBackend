import { Request, Response } from 'express';
export declare class FormController {
    getAllProjects(req: Request, res: Response): Promise<void>;
    getProjectById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getFormQuestions(req: Request, res: Response): Promise<void>;
    getFormQuestionsBySection(req: Request, res: Response): Promise<void>;
    getQuestionById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createAPES(req: Request, res: Response): Promise<void>;
    getAPES(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateAPES(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    submitAPES(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createGuideEntretien(req: Request, res: Response): Promise<void>;
    getGuideEntretien(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    submitGuideEntretien(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createDataCollection(req: Request, res: Response): Promise<void>;
    getDataCollection(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateDataCollection(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createChecklistAudit(req: Request, res: Response): Promise<void>;
    getChecklistAudit(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    submitChecklistAudit(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createChecklistConducteur(req: Request, res: Response): Promise<void>;
    getChecklistConducteur(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    submitChecklistConducteur(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getForm(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    submitForm(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllForms(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const formController: FormController;
//# sourceMappingURL=form.controller.d.ts.map