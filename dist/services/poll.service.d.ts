import { IPoll } from "../interfaces/IPoll";
import { Types } from "mongoose";
export declare class PollService {
    createNewPoll(eventName: string): Promise<string>;
    createVote(eventName: string, voteData: Omit<IPoll, 'eventName' | 'submittedAt'>): Promise<import("mongoose").Document<unknown, {}, IPoll, {}, import("mongoose").DefaultSchemaOptions> & IPoll & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    getAll(): Promise<(import("mongoose").Document<unknown, {}, IPoll, {}, import("mongoose").DefaultSchemaOptions> & IPoll & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getByEventName(eventName: string): Promise<(import("mongoose").Document<unknown, {}, IPoll, {}, import("mongoose").DefaultSchemaOptions> & IPoll & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getAllEventNames(): Promise<{
        name: any;
        voteCount: any;
        lastVote: any;
    }[]>;
    deleteVote(id: string): Promise<import("mongoose").Document<unknown, {}, IPoll, {}, import("mongoose").DefaultSchemaOptions> & IPoll & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    deleteEvent(eventName: string): Promise<{
        eventName: string;
        deletedCount: number;
    }>;
}
//# sourceMappingURL=poll.service.d.ts.map