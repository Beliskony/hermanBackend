"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/poll.routes.ts
const express_1 = require("express");
const poll_controller_1 = require("../controllers/poll.controller");
const isAdmin_middleware_1 = require("../middlewares/isAdmin.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const Pollrouter = (0, express_1.Router)();
// Routes pour l'administration
Pollrouter.post('/admin/events', auth_middleware_1.authMiddleware, isAdmin_middleware_1.isAdmin, poll_controller_1.createNewPollEvent); // Créer un nouvel événement/sondage
Pollrouter.get('/admin/events', auth_middleware_1.authMiddleware, isAdmin_middleware_1.isAdmin, poll_controller_1.getAllEvents); // Lister tous les événements
Pollrouter.delete('/admin/events/:eventName', auth_middleware_1.authMiddleware, isAdmin_middleware_1.isAdmin, poll_controller_1.deleteEvent); // Supprimer un événement complet
Pollrouter.get('/admin/votes', auth_middleware_1.authMiddleware, isAdmin_middleware_1.isAdmin, poll_controller_1.getPolls); // Récupérer tous les votes
Pollrouter.get('/admin/votes/event/:eventName', auth_middleware_1.authMiddleware, isAdmin_middleware_1.isAdmin, poll_controller_1.getPollsByEvent); // Récupérer votes par événement
Pollrouter.delete('/admin/votes/:id', auth_middleware_1.authMiddleware, isAdmin_middleware_1.isAdmin, poll_controller_1.deletePoll); // Supprimer un vote spécifique
// Routes publiques pour les utilisateurs
Pollrouter.post('/vote', poll_controller_1.createPoll); // Soumettre un vote
exports.default = Pollrouter;
//# sourceMappingURL=poll.route.js.map