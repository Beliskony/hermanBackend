import { Request, Response } from 'express';
/**
 * POST /forms
 * Crée n'importe quel type de formulaire automatiquement
 */
export declare const createAnyForm: (req: Request, res: Response) => Promise<void>;
/**
 * GET /forms/:id
 * Récupère n'importe quel formulaire par son ID
 */
export declare const getAnyFormById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * PUT /forms/:id
 * Met à jour n'importe quel formulaire
 */
export declare const updateAnyForm: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * DELETE /forms/:id
 * Supprime n'importe quel formulaire
 */
export declare const deleteAnyForm: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /forms
 * Liste tous les formulaires (tous types confondus)
 */
export declare const getAllFormsUnified: (req: Request, res: Response) => Promise<void>;
export declare const getStats: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=form.controller.d.ts.map