import { IPoll } from "../interfaces/IPoll";
import { Types } from "mongoose";
export declare class PollService {
    /**
     * Créer une nouvelle évaluation
     */
    create(data: IPoll): Promise<import("mongoose").Document<unknown, {}, IPoll, {}, import("mongoose").DefaultSchemaOptions> & IPoll & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    /**
     * Récupérer toutes les évaluations
     */
    getAll(): Promise<(import("mongoose").Document<unknown, {}, IPoll, {}, import("mongoose").DefaultSchemaOptions> & IPoll & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    /**
     * Récupérer les évaluations par nom d'événement
     */
    getByEventName(eventName: string): Promise<(import("mongoose").Document<unknown, {}, IPoll, {}, import("mongoose").DefaultSchemaOptions> & IPoll & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    /**
     * Supprimer une évaluation par ID
     */
    deleteById(_id: string): Promise<import("mongoose").Document<unknown, {}, IPoll, {}, import("mongoose").DefaultSchemaOptions> & IPoll & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
}
//# sourceMappingURL=poll.service.d.ts.map