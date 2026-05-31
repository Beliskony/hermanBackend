import { RowDataPacket } from 'mysql2';
interface EventRow extends RowDataPacket {
    id: string;
    event_name: string;
    created_at: Date;
    updated_at: Date;
}
export declare class EventService {
    createEvent(eventName: string): Promise<{
        id: string;
        eventName: string;
    }>;
    getAllEvents(): Promise<EventRow[]>;
    getLatestEvent(): Promise<EventRow>;
    updateEvent(eventId: string, eventName: string): Promise<{
        id: string;
        eventName: string;
    }>;
    deleteEvent(eventId: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
}
export {};
//# sourceMappingURL=event.service.d.ts.map