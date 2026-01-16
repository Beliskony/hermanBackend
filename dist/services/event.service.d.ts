import { IEvent } from "../interfaces/IEvent";
import { Types } from "mongoose";
export declare class EventService {
    createEvent(data: IEvent): Promise<import("mongoose").Document<unknown, {}, IEvent, {}, import("mongoose").DefaultSchemaOptions> & IEvent & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    getAllEvents(): Promise<(import("mongoose").Document<unknown, {}, IEvent, {}, import("mongoose").DefaultSchemaOptions> & IEvent & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getLatestEvent(): Promise<import("mongoose").Document<unknown, {}, IEvent, {}, import("mongoose").DefaultSchemaOptions> & IEvent & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    updateEvent(eventId: string, data: Partial<IEvent>): Promise<import("mongoose").Document<unknown, {}, IEvent, {}, import("mongoose").DefaultSchemaOptions> & IEvent & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    deleteEvent(eventId: string): Promise<import("mongoose").Document<unknown, {}, IEvent, {}, import("mongoose").DefaultSchemaOptions> & IEvent & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
}
//# sourceMappingURL=event.service.d.ts.map