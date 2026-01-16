import { Request, Response } from "express";
/**
 * POST /users/register
 */
export declare const register: (req: Request, res: Response) => Promise<void>;
/**
 * POST /users/login
 */
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /users/password-reset/request
 */
export declare const requestPasswordReset: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /users/password-reset/confirm
 */
export declare const resetPassword: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=user.controller.d.ts.map