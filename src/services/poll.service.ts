// ─────────────────────────────────────────────────────────────────────────────
//  poll.service.ts  —  MySQL version
//
//  Différences vs Mongoose :
//  • eventName (string libre) → event_id (CHAR(16) FK vers events)
//    Le frontend passe désormais un eventId, pas un nom en clair.
//  • L'agrégation $lookup → simple JOIN MySQL
//  • Pas de doublon-check par nom : géré côté events (unique event_name)
// ─────────────────────────────────────────────────────────────────────────────

import { RowDataPacket, ResultSetHeader } from 'mysql2';  // ← AJOUTER CET IMPORT
import { pool }  from '../config/databaseConnect';
import { newId } from '../utils/id';

// CORRECTION : Étendre RowDataPacket
interface PollRow extends RowDataPacket {
  id:           string;
  event_id:     string;
  name:         string;
  phone:        string;
  rating:       number;
  feedback:     string;
  submitted_at: Date;
  event_name?:  string;  // Optionnel car vient du JOIN
}

// CORRECTION : Étendre RowDataPacket
interface EventWithStats extends RowDataPacket {
  event_id:     string;
  event_name:   string;
  total_responses: number;   // ← pas nb_reponses
  avg_rating:    number | null;  // ← pas note_moyenne
  min_rating:    number | null;  // ← pas note_min
  max_rating:    number | null; 
}

export class PollService {

  // ── CRÉER UN ÉVÉNEMENT (ex-createNewPoll) ─────────────────────────────────
  async createNewPoll(eventName: string): Promise<{ id: string; eventName: string }> {
    if (!eventName || typeof eventName !== 'string') {
      throw new Error('Le nom doit être une chaîne de caractères');
    }

    const trimmedName = eventName.trim();

    // CORRECTION : Utiliser RowDataPacket[]
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM events WHERE event_name = ? LIMIT 1',
      [trimmedName]
    );
    if (existing.length > 0) {
      throw new Error(`Un sondage "${trimmedName}" existe déjà`);
    }

    const id = newId();
    await pool.query('CALL sp_create_event(?,?)', [id, trimmedName]);

    return { id, eventName: trimmedName };
  }

  // ── SOUMETTRE UN VOTE ─────────────────────────────────────────────────────
  async createVote(eventId: string, voteData: {
    name:     string;
    phone:    string;
    rating:   number;
    feedback: string;
  }) {
    if (!eventId) throw new Error("ID d'événement requis");

    const id = newId();
    await pool.query(
      'CALL sp_create_poll(?,?,?,?,?,?)',
      [id, eventId, voteData.name, voteData.phone, voteData.rating, voteData.feedback]
    );

    return { id, eventId, ...voteData, submittedAt: new Date() };
  }

  // ── TOUS LES VOTES ────────────────────────────────────────────────────────
  async getAll() {
    const [rows] = await pool.query<PollRow[]>(
      `SELECT p.*, e.event_name
       FROM polls p
       JOIN events e ON e.id = p.event_id
       ORDER BY p.submitted_at DESC`
    );
    return rows;
  }

  // ── VOTES D'UN ÉVÉNEMENT ──────────────────────────────────────────────────
  async getByEventId(eventId: string) {
    const [rows] = await pool.query<PollRow[]>(
      `SELECT p.*, e.event_name
       FROM polls p
       JOIN events e ON e.id = p.event_id
       WHERE p.event_id = ?
       ORDER BY p.submitted_at DESC`,
      [eventId]
    );
    return rows;
  }

  // ── LISTE DES ÉVÉNEMENTS AVEC STATS ───────────────────────────────────────
  // Correspond à l'ancienne getAllEventNames() — utilise la vue v_poll_stats
  async getAllEventNames() {
    const [rows] = await pool.query<EventWithStats[]>(
      'SELECT * v_poll_stats_by_event ORDER BY event_id'
    );

    return rows.map(r => ({
      id:          r.event_id,
      name:        r.event_name,
      nb_reponses: r.total_responses,
      note_moyenne: r.avg_rating,
      note_min:     r.min_rating,
      note_max:     r.max_rating
    }));
  }

  // ── SUPPRIMER UN VOTE ─────────────────────────────────────────────────────
  async deleteVote(id: string) {
    // CORRECTION : Utiliser ResultSetHeader
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM polls WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) throw new Error('Vote non trouvé');
    return { deleted: true, id };
  }

  // ── SUPPRIMER UN ÉVÉNEMENT ET TOUS SES VOTES (CASCADE) ───────────────────
  // La FK ON DELETE CASCADE s'occupe des polls automatiquement
  async deleteEventById(eventId: string) {
    // CORRECTION : Utiliser ResultSetHeader
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM events WHERE id = ?',
      [eventId]
    );

    return { eventId, deletedEvent: result.affectedRows > 0 };
  }
}