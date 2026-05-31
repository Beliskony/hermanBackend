"use strict";
// ─────────────────────────────────────────────────────────────────────────────
//  poll.service.ts  —  MySQL version
//
//  Différences vs Mongoose :
//  • eventName (string libre) → event_id (CHAR(16) FK vers events)
//    Le frontend passe désormais un eventId, pas un nom en clair.
//  • L'agrégation $lookup → simple JOIN MySQL
//  • Pas de doublon-check par nom : géré côté events (unique event_name)
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
    // ── CRÉER UN ÉVÉNEMENT (ex-createNewPoll) ─────────────────────────────────
    createNewPoll(eventName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!eventName || typeof eventName !== 'string') {
                throw new Error('Le nom doit être une chaîne de caractères');
            }
            const trimmedName = eventName.trim();
            // CORRECTION : Utiliser RowDataPacket[]
            const [existing] = yield databaseConnect_1.pool.query('SELECT id FROM events WHERE event_name = ? LIMIT 1', [trimmedName]);
            if (existing.length > 0) {
                throw new Error(`Un sondage "${trimmedName}" existe déjà`);
            }
            const id = (0, id_1.newId)();
            yield databaseConnect_1.pool.query('CALL sp_create_event(?,?)', [id, trimmedName]);
            return { id, eventName: trimmedName };
        });
    }
    // ── SOUMETTRE UN VOTE ─────────────────────────────────────────────────────
    createVote(eventId, voteData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!eventId)
                throw new Error("ID d'événement requis");
            const id = (0, id_1.newId)();
            yield databaseConnect_1.pool.query('CALL sp_create_poll(?,?,?,?,?,?)', [id, eventId, voteData.name, voteData.phone, voteData.rating, voteData.feedback]);
            return Object.assign(Object.assign({ id, eventId }, voteData), { submittedAt: new Date() });
        });
    }
    // ── TOUS LES VOTES ────────────────────────────────────────────────────────
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield databaseConnect_1.pool.query(`SELECT p.*, e.event_name
       FROM polls p
       JOIN events e ON e.id = p.event_id
       ORDER BY p.submitted_at DESC`);
            return rows;
        });
    }
    // ── VOTES D'UN ÉVÉNEMENT ──────────────────────────────────────────────────
    getByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield databaseConnect_1.pool.query(`SELECT p.*, e.event_name
       FROM polls p
       JOIN events e ON e.id = p.event_id
       WHERE p.event_id = ?
       ORDER BY p.submitted_at DESC`, [eventId]);
            return rows;
        });
    }
    // ── LISTE DES ÉVÉNEMENTS AVEC STATS ───────────────────────────────────────
    // Correspond à l'ancienne getAllEventNames() — utilise la vue v_poll_stats
    getAllEventNames() {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield databaseConnect_1.pool.query('SELECT * v_poll_stats_by_event ORDER BY event_id');
            return rows.map(r => ({
                id: r.event_id,
                name: r.event_name,
                nb_reponses: r.total_responses,
                note_moyenne: r.avg_rating,
                note_min: r.min_rating,
                note_max: r.max_rating
            }));
        });
    }
    // ── SUPPRIMER UN VOTE ─────────────────────────────────────────────────────
    deleteVote(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // CORRECTION : Utiliser ResultSetHeader
            const [result] = yield databaseConnect_1.pool.query('DELETE FROM polls WHERE id = ?', [id]);
            if (result.affectedRows === 0)
                throw new Error('Vote non trouvé');
            return { deleted: true, id };
        });
    }
    // ── SUPPRIMER UN ÉVÉNEMENT ET TOUS SES VOTES (CASCADE) ───────────────────
    // La FK ON DELETE CASCADE s'occupe des polls automatiquement
    deleteEventById(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            // CORRECTION : Utiliser ResultSetHeader
            const [result] = yield databaseConnect_1.pool.query('DELETE FROM events WHERE id = ?', [eventId]);
            return { eventId, deletedEvent: result.affectedRows > 0 };
        });
    }
}
exports.PollService = PollService;
//# sourceMappingURL=poll.service.js.map