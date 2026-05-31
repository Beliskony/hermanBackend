// src/controllers/poll.controller.ts
import { Request, Response } from 'express';
import { PollService } from '../services/poll.service';
import { EventService } from '../services/event.service';

/**
 * Contrôleur gérant toutes les opérations liées aux sondages et évaluations
 * Aligné avec la base MySQL:
 * - Tables: events, polls
 * - Vues: v_poll_stats_by_event, v_polls_with_event
 * - Procédures: sp_create_event, sp_create_poll
 */
export class PollController {
  private pollService: PollService;
  private eventService: EventService;

  constructor() {
    this.pollService = new PollService();
    this.eventService = new EventService();
  }

  /**
   * 1. Créer un nouveau sondage (admin)
   * @route POST /api/polls/newEvents
   * @param req.body.eventName - Nom de l'événement à évaluer
   * @returns 201 - Événement créé avec succès
   * @returns 400 - Nom d'événement invalide ou existant
   */
  createNewPollEvent = async (req: Request, res: Response) => {
    try {
      const { eventName } = req.body;

      if (!eventName || typeof eventName !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Le nom d\'événement est requis et doit être une chaîne de caractères'
        });
      }

      const newEvent = await this.pollService.createNewPoll(eventName);

      res.status(201).json({
        success: true,
        message: `🎉 Sondage "${newEvent.eventName}" créé avec succès`,
        data: {
          id: newEvent.id,
          event_name: newEvent.eventName,
          created_at: new Date()
        }
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la création du sondage'
      });
    }
  };

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
  createPoll = async (req: Request, res: Response) => {
    try {
      const { eventId, name, phone, rating, feedback } = req.body;

      // Validation de l'eventId
      let validatedEventId = eventId;
      if (Array.isArray(validatedEventId)) {
        validatedEventId = validatedEventId[0];
      }

      // Validation des champs obligatoires
      if (!validatedEventId || !name || !phone || !rating) {
        return res.status(400).json({
          success: false,
          message: 'Tous les champs (eventId, name, phone, rating) sont requis'
        });
      }

      // Validation du rating (1-10)
      const ratingNum = Number(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10) {
        return res.status(400).json({
          success: false,
          message: 'La note doit être un nombre compris entre 1 et 10'
        });
      }

      const poll = await this.pollService.createVote(validatedEventId, {
        name: String(name).trim(),
        phone: String(phone).trim(),
        rating: ratingNum,
        feedback: feedback ? String(feedback).trim() : ''
      });

      res.status(201).json({
        success: true,
        message: '✅ Merci pour votre évaluation !',
        data: {
          id: poll.id,
          event_id: poll.eventId,
          rating: poll.rating,
          submitted_at: poll.submittedAt
        }
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'enregistrement du vote'
      });
    }
  };

  /**
   * 3. Récupérer toutes les évaluations (admin)
   * @route GET /api/polls/admin/votes
   * @returns 200 - Liste de tous les votes avec nom d'événement
   */
  getPolls = async (req: Request, res: Response) => {
    try {
      const polls = await this.pollService.getAll();

      res.json({
        success: true,
        count: polls.length,
        data: polls
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des votes'
      });
    }
  };

  /**
   * 4. Récupérer les évaluations par ID d'événement (admin)
   * @route GET /api/polls/votes/event/:eventId
   * @param req.params.eventId - ID de l'événement (CHAR(16))
   * @returns 200 - Liste des votes avec statistiques
   */
  getPollsByEvent = async (req: Request, res: Response) => {
    try {
      let { eventId } = req.params;

      // Nettoyage de l'eventId
      if (Array.isArray(eventId)) {
        eventId = eventId[0];
      }
      eventId = decodeURIComponent(eventId);

      // Récupération des votes
      const votes = await this.pollService.getByEventId(eventId);

      // Récupération du nom de l'événement
      const eventName = votes.length > 0 ? votes[0].event_name : eventId;

      // Calcul des statistiques
      const stats = votes.length > 0 ? {
        averageRating: (votes.reduce((sum, v) => sum + v.rating, 0) / votes.length).toFixed(1),
        totalVotes: votes.length,
        positiveCount: votes.filter(v => v.rating >= 7).length,
        neutralCount: votes.filter(v => v.rating >= 4 && v.rating <= 6).length,
        negativeCount: votes.filter(v => v.rating <= 3).length
      } : null;

      res.json({
        success: true,
        event_id: eventId,
        event_name: eventName,
        stats,
        data: votes,
        count: votes.length
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des votes'
      });
    }
  };

  /**
   * 5. Supprimer un vote (admin)
   * @route DELETE /api/polls/admin/votes/:id
   * @param req.params.id - ID du vote à supprimer (CHAR(16))
   * @returns 200 - Vote supprimé avec succès
   */
  deletePoll = async (req: Request, res: Response) => {
    try {
      let id = req.params.id;
      if (Array.isArray(id)) {
        id = id[0];
      }

      await this.pollService.deleteVote(id);

      res.json({
        success: true,
        message: 'Vote supprimé avec succès'
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression du vote'
      });
    }
  };

  /**
   * 6. Lister tous les événements avec statistiques (admin)
   * @route GET /api/polls/admin/events
   * @returns 200 - Liste des événements avec nb_reponses, note_moyenne, etc.
   */
  getAllEvents = async (req: Request, res: Response) => {
    try {
      const events = await this.pollService.getAllEventNames();

      res.json({
        success: true,
        count: events.length,
        data: events
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des événements'
      });
    }
  };

  /**
   * 7. Supprimer un événement et tous ses votes (admin)
   * @route DELETE /api/polls/deleteEvent/:eventId
   * @param req.params.eventId - ID de l'événement à supprimer (CHAR(16))
   * @returns 200 - Événement supprimé avec succès
   */
  deleteEvent = async (req: Request, res: Response) => {
    try {
      let { eventId } = req.params;

      if (Array.isArray(eventId)) {
        eventId = eventId[0];
      }
      eventId = decodeURIComponent(eventId);

      const result = await this.pollService.deleteEventById(eventId);

      if (!result.deletedEvent) {
        return res.status(404).json({
          success: false,
          message: 'Événement non trouvé'
        });
      }

      res.json({
        success: true,
        message: 'Événement supprimé avec succès'
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression de l\'événement'
      });
    }
  };

  /**
   * 8. Récupérer le dernier événement (public)
   * @route GET /api/polls/latestEvent
   * @returns 200 - Dernier événement créé { id, event_name }
   */
  getLatestEvent = async (req: Request, res: Response) => {
    try {
      const event = await this.eventService.getLatestEvent();
      
      res.status(200).json({
        id: event.id,
        data: {
        id: event.id,
        event_name: event.event_name
      }
      });
      
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Aucun événement trouvé'
      });
    }
  };

  /**
   * 9. Modifier un événement (admin)
   * @route PUT /api/polls/updateEvent/:id
   * @param req.params.id - ID de l'événement à modifier (CHAR(16))
   * @param req.body.EventName - Nouveau nom de l'événement
   * @returns 200 - Événement modifié avec succès
   */
  updateEvent = async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { EventName } = req.body;

      if (!EventName || typeof EventName !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'EventName est requis et doit être une chaîne de caractères'
        });
      }

      const updated = await this.eventService.updateEvent(id, EventName);

      res.status(200).json({
        success: true,
        message: 'Événement modifié avec succès',
        data: updated
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la modification de l\'événement'
      });
    }
  };
}