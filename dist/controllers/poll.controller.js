"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.getAllEvents = exports.deletePoll = exports.getPollsByEvent = exports.getPolls = exports.createPoll = exports.createNewPollEvent = void 0;
const poll_service_1 = require("../services/poll.service");
const pollService = new poll_service_1.PollService();
// 1. Créer un nouveau sondage (pour admin - créer un nom d'événement)
const createNewPollEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventName } = req.body;
        // Validation
        if (!eventName || typeof eventName !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Le nom d\'événement est requis et doit être une chaîne'
            });
        }
        const newEventName = yield pollService.createNewPoll(eventName);
        res.status(201).json({
            success: true,
            message: `🎉 Nouveau sondage créé: "${newEventName}"`,
            data: {
                eventName: newEventName,
                createdAt: new Date()
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});
exports.createNewPollEvent = createNewPollEvent;
// 2. Soumettre un vote (pour utilisateurs lambda)
const createPoll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const poll = yield pollService.createVote(validatedEventName, {
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la création'
        });
    }
});
exports.createPoll = createPoll;
// 3. Récupérer toutes les évaluations (admin)
const getPolls = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const polls = yield pollService.getAll();
        res.json({
            success: true,
            count: polls.length,
            data: polls
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
exports.getPolls = getPolls;
// 4. Récupérer les évaluations par nom d'événement (admin)
const getPollsByEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { eventName } = req.params;
        // Valider eventName
        if (Array.isArray(eventName)) {
            eventName = eventName[0];
        }
        // Décoder l'URL
        eventName = decodeURIComponent(eventName);
        const votes = yield pollService.getByEventName(eventName);
        // Calculer les stats
        const stats = votes.length > 0 ? {
            averageRating: (votes.reduce((sum, v) => sum + v.rating, 0) / votes.length).toFixed(1),
            totalVotes: votes.length,
            positiveCount: votes.filter((v) => v.rating >= 7).length,
            neutralCount: votes.filter((v) => v.rating >= 4 && v.rating <= 6).length,
            negativeCount: votes.filter((v) => v.rating <= 3).length
        } : null;
        res.json({
            success: true,
            eventName,
            stats,
            data: votes,
            count: votes.length
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
exports.getPollsByEvent = getPollsByEvent;
// 5. Supprimer une évaluation (admin)
const deletePoll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let id = req.params.id;
        if (Array.isArray(id)) {
            id = id[0];
        }
        const deletedPoll = yield pollService.deleteVote(id);
        res.json({
            success: true,
            message: 'Vote supprimé avec succès',
            data: deletedPoll
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});
exports.deletePoll = deletePoll;
// 6. Liste tous les événements (admin)
const getAllEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const events = yield pollService.getAllEventNames();
        res.json({
            success: true,
            count: events.length,
            data: events
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
exports.getAllEvents = getAllEvents;
// 7. Supprimer un événement complet (admin)
const deleteEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { eventName } = req.params;
        if (Array.isArray(eventName)) {
            eventName = eventName[0];
        }
        // Décoder l'URL
        eventName = decodeURIComponent(eventName);
        const result = yield pollService.deleteEvent(eventName);
        res.json({
            success: true,
            message: `Événement "${eventName}" supprimé avec ${result.deletedCount} vote(s)`,
            data: result
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});
exports.deleteEvent = deleteEvent;
//# sourceMappingURL=poll.controller.js.map