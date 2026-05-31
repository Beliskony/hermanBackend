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
exports.EventService = void 0;
const databaseConnect_1 = require("../config/databaseConnect");
const id_1 = require("../utils/id"); // Génère CHAR(16) - ex: nanoid(16)
class EventService {
    /**
     * Crée un événement via sp_create_event
     * @param eventName - Nom de l'événement
     * @returns { id, eventName }
     */
    createEvent(eventName) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = (0, id_1.newId)(); // CHAR(16)
            yield databaseConnect_1.pool.query('CALL sp_create_event(?, ?)', [id, eventName]);
            return { id, eventName };
        });
    }
    /**
     * Récupère tous les événements avec leurs statistiques (via vue v_poll_stats_by_event)
     * @returns Liste des événements avec stats
     */
    getAllEventsWithStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield databaseConnect_1.pool.query('SELECT * FROM v_poll_stats_by_event ORDER BY nb_reponses DESC');
            return rows;
        });
    }
    /**
     * Récupère le dernier événement créé
     * @returns Dernier événement
     */
    getLatestEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield databaseConnect_1.pool.query('SELECT * FROM events ORDER BY created_at DESC LIMIT 1');
            if (rows.length === 0) {
                throw new Error('Aucun événement trouvé');
            }
            return rows[0];
        });
    }
    /**
     * Récupère tous les votes avec nom d'événement (via vue v_polls_with_event)
     * @returns Liste des votes
     */
    getAllVotes() {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield databaseConnect_1.pool.query('SELECT * FROM v_polls_with_event ORDER BY submitted_at DESC');
            return rows;
        });
    }
    /**
     * Récupère les votes d'un événement spécifique
     * @param eventId - ID de l'événement (CHAR(16))
     * @returns Liste des votes pour cet événement
     */
    getVotesByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield databaseConnect_1.pool.query('SELECT * FROM v_polls_with_event WHERE event_id = ? ORDER BY submitted_at DESC', [eventId]);
            return rows;
        });
    }
    /**
     * Récupère les statistiques d'un événement spécifique
     * @param eventId - ID de l'événement
     * @returns Stats de l'événement
     */
    getEventStats(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield databaseConnect_1.pool.query('SELECT * FROM v_poll_stats_by_event WHERE event_id = ?', [eventId]);
            return rows.length > 0 ? rows[0] : null;
        });
    }
    /**
     * Met à jour le nom d'un événement
     * @param eventId - ID de l'événement
     * @param eventName - Nouveau nom
     */
    updateEvent(eventId, eventName) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield databaseConnect_1.pool.query('UPDATE events SET event_name = ?, updated_at = NOW() WHERE id = ?', [eventName, eventId]);
            if (result.affectedRows === 0) {
                throw new Error('Événement non trouvé');
            }
            return { id: eventId, eventName };
        });
    }
    /**
     * Supprime un événement (suppression en cascade des polls)
     * @param eventId - ID de l'événement
     */
    deleteEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield databaseConnect_1.pool.query('DELETE FROM events WHERE id = ?', [eventId]);
            if (result.affectedRows === 0) {
                throw new Error('Événement non trouvé');
            }
            return { deleted: true, id: eventId };
        });
    }
    /**
     * Supprime un vote spécifique
     * @param pollId - ID du vote (CHAR(16))
     */
    deletePoll(pollId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield databaseConnect_1.pool.query('DELETE FROM polls WHERE id = ?', [pollId]);
            if (result.affectedRows === 0) {
                throw new Error('Vote non trouvé');
            }
            return { deleted: true, id: pollId };
        });
    }
}
exports.EventService = EventService;
//# sourceMappingURL=event.service.js.map