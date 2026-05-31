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
interface EventRow extends RowDataPacket {
    id: string;
    event_name: string;
    created_at: Date;
    updated_at: Date;
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
    getEventStats(eventId: string): Promise<{
        averageRating: string;
        totalVotes: number;
        positiveCount: number;
        neutralCount: number;
        negativeCount: number;
    } | null>;
    deleteVote(id: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
    deleteEventById(eventId: string): Promise<{
        eventId: string;
        deletedEvent: boolean;
    }>;
    updateEvent(eventId: string, eventName: string): Promise<{
        id: string;
        eventName: string;
    }>;
    getLatestEvent(): Promise<EventRow>;
    getAll(): Promise<PollRow[]>;
    getByEventId(eventId: string): Promise<PollRow[]>;
    getAllEventNames(): Promise<{
        id: string;
        name: string;
        voteCount: number;
        noteMoyenne: number | null;
        noteMin: number | null;
        noteMax: number | null;
    }[]>;
}
export {};
//# sourceMappingURL=poll.service.d.ts.map