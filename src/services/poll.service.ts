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

import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/databaseConnect';
import { newId } from '../utils/id';

// Interface pour un vote (alignée avec la table polls)
interface PollRow extends RowDataPacket {
  id: string;           // CHAR(16)
  event_id: string;     // CHAR(16) FK
  name: string;         // VARCHAR(255)
  phone: string;        // VARCHAR(30)
  rating: number;       // TINYINT (1-10)
  feedback: string;     // VARCHAR(500)
  submitted_at: Date;
  event_name?: string;  // Optionnel (vient du JOIN)
}

// Interface pour un événement avec stats (vue v_poll_stats_by_event)
interface EventWithStats extends RowDataPacket {
  event_id: string;      // CHAR(16)
  event_name: string;    // VARCHAR(255)
  nb_reponses: number;   // COUNT des votes
  note_moyenne: number | null;  // MOYENNE des ratings
  note_min: number | null;      // MIN rating
  note_max: number | null;      // MAX rating
}

// Interface pour un événement simple
interface EventRow extends RowDataPacket {
  id: string;
  event_name: string;
  created_at: Date;
  updated_at: Date;
}

export class PollService {


  async createNewPoll(eventName: string): Promise<{ id: string; eventName: string }> {
    if (!eventName || typeof eventName !== 'string') {
      throw new Error('Le nom doit être une chaîne de caractères');
    }

    const trimmedName = eventName.trim();

    // Vérifier si l'événement existe déjà
    const [existing] = await pool.query<EventRow[]>(
      'SELECT id FROM events WHERE event_name = ? LIMIT 1',
      [trimmedName]
    );
    
    if (existing.length > 0) {
      throw new Error(`Un sondage "${trimmedName}" existe déjà`);
    }

    // Créer l'événement avec sp_create_event
    const id = newId(); // CHAR(16)
    await pool.query('CALL sp_create_event(?, ?)', [id, trimmedName]);

    return { id, eventName: trimmedName };
  }


  async createVote(eventId: string, voteData: {
    name: string;
    phone: string;
    rating: number;
    feedback: string;
  }) {
    if (!eventId) throw new Error("ID d'événement requis");

    // Validation du rating (1-10)
    if (voteData.rating < 1 || voteData.rating > 10) {
      throw new Error("La note doit être comprise entre 1 et 10");
    }

    const id = newId(); // CHAR(16)
    
    // Appel à sp_create_poll avec les bons paramètres
    await pool.query(
      'CALL sp_create_poll(?, ?, ?, ?, ?, ?)',
      [id, eventId, voteData.name, voteData.phone, voteData.rating, voteData.feedback]
    );

    return { 
      id, 
      eventId, 
      ...voteData, 
      submittedAt: new Date() 
    };
  }

  async getEventStats(eventId: string) {
    const [rows] = await pool.query<EventWithStats[]>(
      'SELECT * FROM v_poll_stats_by_event WHERE event_id = ?',
      [eventId]
    );
    
    if (rows.length === 0) return null;
    
    const stats = rows[0];
    return {
      averageRating: stats.note_moyenne?.toFixed(1) || '0',
      totalVotes: stats.nb_reponses,
      positiveCount: 0, // Sera calculé dans le controller
      neutralCount: 0,
      negativeCount: 0
    };
  }


  async deleteVote(id: string) {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM polls WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Vote non trouvé');
    }
    
    return { deleted: true, id };
  }


  async deleteEventById(eventId: string) {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM events WHERE id = ?',
      [eventId]
    );

    return { 
      eventId, 
      deletedEvent: result.affectedRows > 0 
    };
  }

  async updateEvent(eventId: string, eventName: string) {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE events SET event_name = ?, updated_at = NOW() WHERE id = ?',
      [eventName, eventId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Événement non trouvé');
    }

    return { id: eventId, eventName };
  }

 
  async getLatestEvent() {
    const [rows] = await pool.query<EventRow[]>(
      'SELECT * FROM events ORDER BY created_at DESC LIMIT 1'
    );

    if (rows.length === 0) {
      throw new Error('Aucun événement trouvé');
    }

    return rows[0];
  }


async getAll() {
  const [rows] = await pool.query<PollRow[]>(
    'SELECT * FROM v_polls_with_event ORDER BY submitted_at DESC'
  );
  return rows;
}


async getByEventId(eventId: string) {
  const [rows] = await pool.query<PollRow[]>(
    'SELECT * FROM v_polls_with_event WHERE event_id = ? ORDER BY submitted_at DESC',
    [eventId]
  );
  return rows;
}


async getAllEventNames() {
  const [rows] = await pool.query<EventWithStats[]>(
    'SELECT * FROM v_poll_stats_by_event ORDER BY nb_reponses DESC'
  );
  
  return rows.map(row => ({
    id: row.event_id,
    name: row.event_name,
    voteCount: row.nb_reponses,
    noteMoyenne: row.note_moyenne,
    noteMin: row.note_min,
    noteMax: row.note_max
  }));
}
}