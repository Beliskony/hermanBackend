"use strict";
// ─────────────────────────────────────────────────────────────────────────────
//  event.service.ts  —  MySQL version
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
exports.EventService = void 0;
const databaseConnect_1 = require("../config/databaseConnect");
const id_1 = require("../utils/id");
class EventService {
    // ── CREATE ─────────────────────────────────────────────────────────────────
    createEvent(eventName) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = (0, id_1.newId)();
            yield databaseConnect_1.pool.query('CALL sp_create_event(?,?)', [id, eventName]);
            return { id, eventName };
        });
    }
    // ── GET ALL ────────────────────────────────────────────────────────────────
    getAllEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield databaseConnect_1.pool.query('SELECT * FROM events ORDER BY created_at DESC');
            return rows;
        });
    }
    // ── GET LATEST ─────────────────────────────────────────────────────────────
    getLatestEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield databaseConnect_1.pool.query('SELECT * FROM events ORDER BY created_at DESC LIMIT 1');
            if (rows.length === 0)
                throw new Error('No event found');
            return rows[0];
        });
    }
    // ── UPDATE ─────────────────────────────────────────────────────────────────
    updateEvent(eventId, eventName) {
        return __awaiter(this, void 0, void 0, function* () {
            // CORRECTION : Utiliser ResultSetHeader au lieu de any
            const [result] = yield databaseConnect_1.pool.query('UPDATE events SET event_name = ?, updated_at = NOW() WHERE id = ?', [eventName, eventId]);
            if (result.affectedRows === 0)
                throw new Error('Event not found');
            return { id: eventId, eventName };
        });
    }
    // ── DELETE ─────────────────────────────────────────────────────────────────
    deleteEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            // CORRECTION : Utiliser ResultSetHeader au lieu de any
            const [result] = yield databaseConnect_1.pool.query('DELETE FROM events WHERE id = ?', [eventId]);
            if (result.affectedRows === 0)
                throw new Error('Event not found');
            return { deleted: true, id: eventId };
        });
    }
}
exports.EventService = EventService;
//# sourceMappingURL=event.service.js.map