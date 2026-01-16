import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
export declare const isAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=isAdmin.middleware.d.ts.map