"use strict";
// ─────────────────────────────────────────────────────────────────────────────
//  poll.service.ts  —  MySQL version (aligné avec la DB)
//
//  Tables :
//  • events (id CHAR(16), event_name, created_at, updated_at)
//  • polls (id CHAR(16), event_id, name, phone, rating, feedback, submitted_at)
//
//  Vues disponibles :
//  • v_poll_stats_by_event  → stats par événement
//  • v_polls_with_event     → votes avec nom d'événement
// ─────────────────────────────────────────────────────────────────────────────
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
exports.PollService = void 0;
const databaseConnect_1 = require("../config/databaseConnect");
const id_1 = require("../utils/id");
class PollService {
    createNewPoll(eventName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!eventName || typeof eventName !== 'string') {
                throw new Error('Le nom doit être une chaîne de caractères');
            }
            const trimmedName = eventName.trim();
            // Vérifier si l'événement existe déjà
            const [existing] = yield databaseConnect_1.pool.query('SELECT id FROM events WHERE event_name = ? LIMIT 1', [trimmedName]);
            if (existing.length > 0) {
                throw new Error(`Un sondage "${trimmedName}" existe déjà`);
            }
            // Créer l'événement avec sp_create_event
            const id = (0, id_1.newId)(); // CHAR(16)
            yield databaseConnect_1.pool.query('CALL sp_create_event(?, ?)', [id, trimmedName]);
            return { id, eventName: trimmedName };
        });
    }
    createVote(eventId, voteData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!eventId)
                throw new Error("ID d'événement requis");
            // Validation du rating (1-10)
            if (voteData.rating < 1 || voteData.rating > 10) {
                throw new Error("La note doit être comprise entre 1 et 10");
            }
            const id = (0, id_1.newId)(); // CHAR(16)
            // Appel à sp_create_poll avec les bons paramètres
            yield databaseConnect_1.pool.query('CALL sp_create_poll(?, ?, ?, ?, ?, ?)', [id, eventId, voteData.name, voteData.phone, voteData.rating, voteData.feedback]);
            return Object.assign(Object.assign({ id,
                eventId }, voteData), { submittedAt: new Date() });
        });
    }
    getEventStats(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const [rows] = yield databaseConnect_1.pool.query('SELECT * FROM v_poll_stats_by_event WHERE event_id = ?', [eventId]);
            if (rows.length === 0)
                return null;
            const stats = rows[0];
            return {
                averageRating: ((_a = stats.note_moyenne) === null || _a === void 0 ? void 0 : _a.toFixed(1)) || '0',
                totalVotes: stats.nb_reponses,
                positiveCount: 0, // Sera calculé dans le controller
                neutralCount: 0,
                negativeCount: 0
            };
        });
    }
    deleteVote(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield databaseConnect_1.pool.query('DELETE FROM polls WHERE id = ?', [id]);
            if (result.affectedRows === 0) {
                throw new Error('Vote non trouvé');
            }
            return { deleted: true, id };
        });
    }
    deleteEventById(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield databaseConnect_1.pool.query('DELETE FROM events WHERE id = ?', [eventId]);
            return {
                eventId,
                deletedEvent: result.affectedRows > 0
            };
        });
    }
    updateEvent(eventId, eventName) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield databaseConnect_1.pool.query('UPDATE events SET event_name = ?, updated_at = NOW() WHERE id = ?', [eventName, eventId]);
            if (result.affectedRows === 0) {
                throw new Error('Événement non trouvé');
            }
            return { id: eventId, eventName };
        });
    }
    getLatestEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield databaseConnect_1.pool.query('SELECT * FROM events ORDER BY created_at DESC LIMIT 1');
            if (rows.length === 0) {
                throw new Error('Aucun événement trouvé');
            }
            return rows[0];
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield databaseConnect_1.pool.query('SELECT * FROM v_polls_with_event ORDER BY submitted_at DESC');
            return rows;
        });
    }
    getByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield databaseConnect_1.pool.query('SELECT * FROM v_polls_with_event WHERE event_id = ? ORDER BY submitted_at DESC', [eventId]);
            return rows;
        });
    }
    getAllEventNames() {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield databaseConnect_1.pool.query('SELECT * FROM v_poll_stats_by_event ORDER BY nb_reponses DESC');
            return rows.map(row => ({
                id: row.event_id,
                name: row.event_name,
                voteCount: row.nb_reponses,
                noteMoyenne: row.note_moyenne,
                noteMin: row.note_min,
                noteMax: row.note_max
            }));
        });
    }
}
exports.PollService = PollService;
//# sourceMappingURL=poll.service.js.map