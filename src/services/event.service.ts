// ─────────────────────────────────────────────────────────────────────────────
//  event.service.ts  —  MySQL version
// ─────────────────────────────────────────────────────────────────────────────

import { RowDataPacket, ResultSetHeader } from 'mysql2';  // ← AJOUTER CET IMPORT
import { pool }  from '../config/databaseConnect';
import { newId } from '../utils/id';

// CORRECTION : Étendre RowDataPacket
interface EventRow extends RowDataPacket {
  id:         string;
  event_name: string;
  created_at: Date;
  updated_at: Date;
}

export class EventService {

  // ── CREATE ─────────────────────────────────────────────────────────────────
  async createEvent(eventName: string) {
    const id = newId();

    await pool.query(
      'CALL sp_create_event(?,?)',
      [id, eventName]
    );

    return { id, eventName };
  }

  // ── GET ALL ────────────────────────────────────────────────────────────────
  async getAllEvents() {
    const [rows] = await pool.query<EventRow[]>(
      'SELECT * FROM events ORDER BY created_at DESC'
    );
    return rows;
  }

  // ── GET LATEST ─────────────────────────────────────────────────────────────
  async getLatestEvent() {
    const [rows] = await pool.query<EventRow[]>(
      'SELECT * FROM events ORDER BY created_at DESC LIMIT 1'
    );

    if (rows.length === 0) throw new Error('No event found');
    return rows[0];
  }

  // ── UPDATE ─────────────────────────────────────────────────────────────────
  async updateEvent(eventId: string, eventName: string) {
    // CORRECTION : Utiliser ResultSetHeader au lieu de any
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE events SET event_name = ?, updated_at = NOW() WHERE id = ?',
      [eventName, eventId]
    );

    if (result.affectedRows === 0) throw new Error('Event not found');

    return { id: eventId, eventName };
  }

  // ── DELETE ─────────────────────────────────────────────────────────────────
  async deleteEvent(eventId: string) {
    // CORRECTION : Utiliser ResultSetHeader au lieu de any
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM events WHERE id = ?',
      [eventId]
    );

    if (result.affectedRows === 0) throw new Error('Event not found');

    return { deleted: true, id: eventId };
  }
}