// src/controllers/poll.controller.ts
import { Request, Response } from 'express';
import { PollService } from '../services/poll.service';

const pollService = new PollService();

// 1. Créer un nouveau sondage (pour admin - créer un nom d'événement)
export const createNewPollEvent = async (req: Request, res: Response) => {
  try {
    const { eventName } = req.body;
    
    // Validation
    if (!eventName || typeof eventName !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Le nom d\'événement est requis et doit être une chaîne'
      });
    }
    
    const newEvent = await pollService.createNewPoll(eventName);
    
    res.status(201).json({
      success: true,
      message: `🎉 Nouveau sondage créé: "${newEvent.eventName}"`,
      data: {
        id: newEvent.id,
        eventName: newEvent.eventName,
        createdAt: new Date()
      }
    });
    
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 2. Soumettre un vote (pour utilisateurs lambda)
export const createPoll = async (req: Request, res: Response) => {
  try {
    const { eventId, name, phone, rating, feedback } = req.body;
    
    // CORRECTION: Utiliser eventId au lieu de eventName
    let validatedEventId = eventId;
    if (Array.isArray(validatedEventId)) {
      validatedEventId = validatedEventId[0];
    }
    
    // Validation
    if (!validatedEventId || !name || !phone || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs (eventId, name, phone, rating) sont requis'
      });
    }
    
    const poll = await pollService.createVote(validatedEventId as string, {
      name: String(name),
      phone: String(phone),
      rating: Number(rating),
      feedback: feedback ? String(feedback) : ''
    });
    
    // CORRECTION: Récupérer l'eventName pour l'affichage
    const event = await pollService.getByEventId(validatedEventId as string);
    const eventName = event.length > 0 ? event[0].event_name : validatedEventId;
    
    res.status(201).json({
      success: true,
      message: `✅ Merci pour votre évaluation !`,
      data: {
        id: poll.id,
        eventId: poll.eventId,
        rating: poll.rating,
        submittedAt: poll.submittedAt
      }
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création'
    });
  }
};

// 3. Récupérer toutes les évaluations (admin)
export const getPolls = async (req: Request, res: Response) => {
  try {
    const polls = await pollService.getAll();
    
    res.json({
      success: true,
      count: polls.length,
      data: polls
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 4. Récupérer les évaluations par ID d'événement (admin)
// CORRECTION: Changer de eventName à eventId
export const getPollsByEvent = async (req: Request, res: Response) => {
  try {
    let { eventId } = req.params;
    
    // Valider eventId
    if (Array.isArray(eventId)) {
      eventId = eventId[0];
    }
    
    // Décoder l'URL
    eventId = decodeURIComponent(eventId as string);
    
    // CORRECTION: Utiliser getByEventId au lieu de getByEventName
    const votes = await pollService.getByEventId(eventId);
    
    // Récupérer le nom de l'événement
    const eventName = votes.length > 0 ? votes[0].event_name : eventId;
    
    // Calculer les stats
    const stats = votes.length > 0 ? {
      averageRating: (votes.reduce((sum: number, v: any) => sum + v.rating, 0) / votes.length).toFixed(1),
      totalVotes: votes.length,
      positiveCount: votes.filter((v: any) => v.rating >= 7).length,
      neutralCount: votes.filter((v: any) => v.rating >= 4 && v.rating <= 6).length,
      negativeCount: votes.filter((v: any) => v.rating <= 3).length
    } : null;
    
    res.json({
      success: true,
      eventId,
      eventName,
      stats,
      data: votes,
      count: votes.length
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 5. Supprimer une évaluation (admin)
export const deletePoll = async (req: Request, res: Response) => {
  try {
    let id = req.params.id;
    
    if (Array.isArray(id)) {
      id = id[0];
    }
    
    const deletedPoll = await pollService.deleteVote(id);
    
    res.json({
      success: true,
      message: 'Vote supprimé avec succès',
      data: deletedPoll
    });
    
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 6. Liste tous les événements (admin)
export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await pollService.getAllEventNames();
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 7. Supprimer un événement complet (admin)
// CORRECTION: Changer le paramètre de eventName à eventId
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    let { eventId } = req.params;
    
    if (Array.isArray(eventId)) {
      eventId = eventId[0];
    }
    
    // Décoder l'URL
    eventId = decodeURIComponent(eventId as string);
    
    // CORRECTION: Utiliser deleteEventById au lieu de deleteEvent
    const result = await pollService.deleteEventById(eventId);
    
    res.json({
      success: true,
      message: result.deletedEvent ? `Événement supprimé avec succès` : `Événement non trouvé`,
      data: result
    });
    
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};