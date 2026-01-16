import { Request, Response } from 'express';
export declare const createNewPollEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createPoll: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPolls: (req: Request, res: Response) => Promise<void>;
export declare const getPollsByEvent: (req: Request, res: Response) => Promise<void>;
export declare const deletePoll: (req: Request, res: Response) => Promise<void>;
export declare const getAllEvents: (req: Request, res: Response) => Promise<void>;
export declare const deleteEvent: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=poll.controller.d.ts.map