import { Request, Response } from "express";
export declare const createPoll: (req: Request, res: Response) => Promise<void>;
export declare const getPolls: (_req: Request, res: Response) => Promise<void>;
export declare const getPollsByEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deletePoll: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=poll.controller.d.ts.map