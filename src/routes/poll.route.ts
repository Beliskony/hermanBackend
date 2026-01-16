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
import { isAdmin } from '../middlewares/isAdmin.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

const Pollrouter = Router();

// Routes pour l'administration
Pollrouter.post('/admin/events', authMiddleware, isAdmin, createNewPollEvent);           // Créer un nouvel événement/sondage
Pollrouter.get('/admin/events', authMiddleware, isAdmin, getAllEvents);                 // Lister tous les événements
Pollrouter.delete('/admin/events/:eventName', authMiddleware, isAdmin, deleteEvent);    // Supprimer un événement complet
Pollrouter.get('/admin/votes', authMiddleware, isAdmin, getPolls);                      // Récupérer tous les votes
Pollrouter.get('/admin/votes/event/:eventName', authMiddleware, isAdmin, getPollsByEvent); // Récupérer votes par événement
Pollrouter.delete('/admin/votes/:id', authMiddleware, isAdmin, deletePoll);             // Supprimer un vote spécifique

// Routes publiques pour les utilisateurs
Pollrouter.post('/vote', createPoll);                          // Soumettre un vote

export default Pollrouter;