// src/routes/poll.routes.ts
import { Router } from 'express';
import {
  createNewPollEvent,
  createPoll,
  getPolls,
  getPollsByEvent,
  deletePoll,
  getAllEvents,
  deleteEvent
} from '../controllers/poll.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const Pollrouter = Router();

// Routes pour l'administration
Pollrouter.post('/admin/events', authMiddleware, createNewPollEvent);           // Créer un nouvel événement/sondage
Pollrouter.get('/admin/events', authMiddleware, getAllEvents);                 // Lister tous les événements
Pollrouter.delete('/admin/events/:eventName', authMiddleware, deleteEvent);    // Supprimer un événement complet
Pollrouter.get('/admin/votes', authMiddleware, getPolls);                      // Récupérer tous les votes
Pollrouter.get('/admin/votes/event/:eventName', authMiddleware, getPollsByEvent); // Récupérer votes par événement
Pollrouter.delete('/admin/votes/:id', authMiddleware, deletePoll);             // Supprimer un vote spécifique

// Routes publiques pour les utilisateurs
Pollrouter.post('/vote', createPoll);                          // Soumettre un vote

export default Pollrouter;