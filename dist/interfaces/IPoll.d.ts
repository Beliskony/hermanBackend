interface IPoll {
    eventName: string;
    name: string;
    phone: string;
    rating: number;
    feedback: string;
    submittedAt?: Date;
}
export declare const Poll: import("mongoose").Model<IPoll, {}, {}, {}, import("mongoose").Document<unknown, {}, IPoll, {}, import("mongoose").DefaultSchemaOptions> & IPoll & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, IPoll>;
export type { IPoll };
//# sourceMappingURL=IPoll.d.ts.map