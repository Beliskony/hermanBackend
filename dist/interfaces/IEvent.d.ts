interface IEvent {
    EventName: string;
}
export declare const Event: import("mongoose").Model<IEvent, {}, {}, {}, import("mongoose").Document<unknown, {}, IEvent, {}, import("mongoose").DefaultSchemaOptions> & IEvent & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, IEvent>;
export type { IEvent };
//# sourceMappingURL=IEvent.d.ts.map