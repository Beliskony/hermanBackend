import { Request, Response, NextFunction } from "express";
export declare class UserController {
    private userService;
    constructor();
    register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    login: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    sendPasswordResetOtp: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    resetPasswordWithOtp: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=user.controller.d.ts.map