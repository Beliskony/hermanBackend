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
    
    const newEventName = await pollService.createNewPoll(eventName);
    
    res.status(201).json({
      success: true,
      message: `🎉 Nouveau sondage créé: "${newEventName}"`,
      data: {
        eventName: newEventName,
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
    const { eventName, name, phone, rating, feedback } = req.body;
    
    // Valider eventName (peut être string ou string[])
    let validatedEventName = eventName;
    if (Array.isArray(validatedEventName)) {
      validatedEventName = validatedEventName[0];
    }
    
    // Validation
    if (!validatedEventName || !name || !phone || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis'
      });
    }
    
    const poll = await pollService.createVote(validatedEventName as string, {
      name: String(name),
      phone: String(phone),
      rating: Number(rating),
      feedback: feedback ? String(feedback) : ''
    });
    
    res.status(201).json({
      success: true,
      message: `✅ Merci pour votre évaluation de "${validatedEventName}" !`,
      data: {
        id: poll._id,
        eventName: poll.eventName,
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

// 4. Récupérer les évaluations par nom d'événement (admin)
export const getPollsByEvent = async (req: Request, res: Response) => {
  try {
    let { eventName } = req.params;
    
    // Valider eventName
    if (Array.isArray(eventName)) {
      eventName = eventName[0];
    }
    
    // Décoder l'URL
    eventName = decodeURIComponent(eventName as string);
    
    const votes = await pollService.getByEventName(eventName);
    
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
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    let { eventName } = req.params;
    
    if (Array.isArray(eventName)) {
      eventName = eventName[0];
    }
    
    // Décoder l'URL
    eventName = decodeURIComponent(eventName as string);
    
    const result = await pollService.deleteEvent(eventName);
    
    res.json({
      success: true,
      message: `Événement "${eventName}" supprimé avec ${result.deletedCount} vote(s)`,
      data: result
    });
    
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};