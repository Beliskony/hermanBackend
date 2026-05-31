import { RowDataPacket } from 'mysql2';
interface EventRow extends RowDataPacket {
    id: string;
    event_name: string;
    created_at: Date;
    updated_at: Date;
}
interface PollStatsRow extends RowDataPacket {
    event_id: string;
    event_name: string;
    nb_reponses: number;
    note_moyenne: number | null;
    note_min: number | null;
    note_max: number | null;
}
interface PollVoteRow extends RowDataPacket {
    id: string;
    event_id: string;
    event_name: string;
    name: string;
    phone: string;
    rating: number;
    feedback: string;
    submitted_at: Date;
}
export declare class EventService {
    /**
     * Crée un événement via sp_create_event
     * @param eventName - Nom de l'événement
     * @returns { id, eventName }
     */
    createEvent(eventName: string): Promise<{
        id: string;
        eventName: string;
    }>;
    /**
     * Récupère tous les événements avec leurs statistiques (via vue v_poll_stats_by_event)
     * @returns Liste des événements avec stats
     */
    getAllEventsWithStats(): Promise<PollStatsRow[]>;
    /**
     * Récupère le dernier événement créé
     * @returns Dernier événement
     */
    getLatestEvent(): Promise<EventRow>;
    /**
     * Récupère tous les votes avec nom d'événement (via vue v_polls_with_event)
     * @returns Liste des votes
     */
    getAllVotes(): Promise<PollVoteRow[]>;
    /**
     * Récupère les votes d'un événement spécifique
     * @param eventId - ID de l'événement (CHAR(16))
     * @returns Liste des votes pour cet événement
     */
    getVotesByEventId(eventId: string): Promise<PollVoteRow[]>;
    /**
     * Récupère les statistiques d'un événement spécifique
     * @param eventId - ID de l'événement
     * @returns Stats de l'événement
     */
    getEventStats(eventId: string): Promise<PollStatsRow | null>;
    /**
     * Met à jour le nom d'un événement
     * @param eventId - ID de l'événement
     * @param eventName - Nouveau nom
     */
    updateEvent(eventId: string, eventName: string): Promise<{
        id: string;
        eventName: string;
    }>;
    /**
     * Supprime un événement (suppression en cascade des polls)
     * @param eventId - ID de l'événement
     */
    deleteEvent(eventId: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
    /**
     * Supprime un vote spécifique
     * @param pollId - ID du vote (CHAR(16))
     */
    deletePoll(pollId: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
}
export {};
//# sourceMappingURL=event.service.d.ts.map