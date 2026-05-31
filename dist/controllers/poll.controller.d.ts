import { Request, Response } from 'express';
/**
 * Contrôleur gérant toutes les opérations liées aux sondages et évaluations
 * Aligné avec la base MySQL:
 * - Tables: events, polls
 * - Vues: v_poll_stats_by_event, v_polls_with_event
 * - Procédures: sp_create_event, sp_create_poll
 */
export declare class PollController {
    private pollService;
    private eventService;
    constructor();
    /**
     * 1. Créer un nouveau sondage (admin)
     * @route POST /api/polls/newEvents
     * @param req.body.eventName - Nom de l'événement à évaluer
     * @returns 201 - Événement créé avec succès
     * @returns 400 - Nom d'événement invalide ou existant
     */
    createNewPollEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * 2. Soumettre un vote (public)
     * @route POST /api/polls/vote
     * @param req.body.eventId - ID de l'événement (CHAR(16))
     * @param req.body.name - Nom du votant
     * @param req.body.phone - Téléphone du votant
     * @param req.body.rating - Note (1-10)
     * @param req.body.feedback - Commentaire optionnel
     * @returns 201 - Vote enregistré avec succès
     * @returns 400 - Champs requis manquants ou rating invalide
     */
    createPoll: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * 3. Récupérer toutes les évaluations (admin)
     * @route GET /api/polls/admin/votes
     * @returns 200 - Liste de tous les votes avec nom d'événement
     */
    getPolls: (req: Request, res: Response) => Promise<void>;
    /**
     * 4. Récupérer les évaluations par ID d'événement (admin)
     * @route GET /api/polls/votes/event/:eventId
     * @param req.params.eventId - ID de l'événement (CHAR(16))
     * @returns 200 - Liste des votes avec statistiques
     */
    getPollsByEvent: (req: Request, res: Response) => Promise<void>;
    /**
     * 5. Supprimer un vote (admin)
     * @route DELETE /api/polls/admin/votes/:id
     * @param req.params.id - ID du vote à supprimer (CHAR(16))
     * @returns 200 - Vote supprimé avec succès
     */
    deletePoll: (req: Request, res: Response) => Promise<void>;
    /**
     * 6. Lister tous les événements avec statistiques (admin)
     * @route GET /api/polls/admin/events
     * @returns 200 - Liste des événements avec nb_reponses, note_moyenne, etc.
     */
    getAllEvents: (req: Request, res: Response) => Promise<void>;
    /**
     * 7. Supprimer un événement et tous ses votes (admin)
     * @route DELETE /api/polls/deleteEvent/:eventId
     * @param req.params.eventId - ID de l'événement à supprimer (CHAR(16))
     * @returns 200 - Événement supprimé avec succès
     */
    deleteEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * 8. Récupérer le dernier événement (public)
     * @route GET /api/polls/latestEvent
     * @returns 200 - Dernier événement créé { id, event_name }
     */
    getLatestEvent: (req: Request, res: Response) => Promise<void>;
    /**
     * 9. Modifier un événement (admin)
     * @route PUT /api/polls/updateEvent/:id
     * @param req.params.id - ID de l'événement à modifier (CHAR(16))
     * @param req.body.EventName - Nouveau nom de l'événement
     * @returns 200 - Événement modifié avec succès
     */
    updateEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=poll.controller.d.ts.map