import { RowDataPacket } from 'mysql2';
interface PollRow extends RowDataPacket {
    id: string;
    event_id: string;
    name: string;
    phone: string;
    rating: number;
    feedback: string;
    submitted_at: Date;
    event_name?: string;
}
export declare class PollService {
    createNewPoll(eventName: string): Promise<{
        id: string;
        eventName: string;
    }>;
    createVote(eventId: string, voteData: {
        name: string;
        phone: string;
        rating: number;
        feedback: string;
    }): Promise<{
        submittedAt: Date;
        name: string;
        phone: string;
        rating: number;
        feedback: string;
        id: string;
        eventId: string;
    }>;
    getAll(): Promise<PollRow[]>;
    getByEventId(eventId: string): Promise<PollRow[]>;
    getAllEventNames(): Promise<{
        id: string;
        name: string;
        nb_reponses: number;
        note_moyenne: number | null;
        note_min: number | null;
        note_max: number | null;
    }[]>;
    deleteVote(id: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
    deleteEventById(eventId: string): Promise<{
        eventId: string;
        deletedEvent: boolean;
    }>;
}
export {};
//# sourceMappingURL=poll.service.d.ts.map