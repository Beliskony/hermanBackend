export interface IPoll {
    id: string;
    event_id: string;
    name: string;
    phone: string;
    rating: number;
    feedback: string;
    submitted_at: Date;
}
export interface ICreatePoll {
    event_id: string;
    name: string;
    phone: string;
    rating: number;
    feedback: string;
}
//# sourceMappingURL=IPoll.d.ts.map