// src/services/event.service.ts
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/databaseConnect';
import { newId } from '../utils/id'; // Génère CHAR(16) - ex: nanoid(16)

// Interface pour un événement (table events)
interface EventRow extends RowDataPacket {
  id: string;           // CHAR(16)
  event_name: string;   // VARCHAR(255)
  created_at: Date;
  updated_at: Date;
}

// Interface pour les stats (vue v_poll_stats_by_event)
interface PollStatsRow extends RowDataPacket {
  event_id: string;
  event_name: string;
  nb_reponses: number;
  note_moyenne: number | null;
  note_min: number | null;
  note_max: number | null;
}

// Interface pour un vote (vue v_polls_with_event)
interface PollVoteRow extends RowDataPacket {
  id: string;
  event_id: string;
  event_name: string;
  name: string;
  phone: string;
  rating: number;
  feedback: string;
  submitted_at: Date;
}

export class EventService {

  /**
   * Crée un événement via sp_create_event
   * @param eventName - Nom de l'événement
   * @returns { id, eventName }
   */
  async createEvent(eventName: string): Promise<{ id: string; eventName: string }> {
    const id = newId(); // CHAR(16)
    
    await pool.query('CALL sp_create_event(?, ?)', [id, eventName]);
    
    return { id, eventName };
  }

  /**
   * Récupère tous les événements avec leurs statistiques (via vue v_poll_stats_by_event)
   * @returns Liste des événements avec stats
   */
  async getAllEventsWithStats(): Promise<PollStatsRow[]> {
    const [rows] = await pool.query<PollStatsRow[]>(
      'SELECT * FROM v_poll_stats_by_event ORDER BY nb_reponses DESC'
    );
    return rows;
  }

  /**
   * Récupère le dernier événement créé
   * @returns Dernier événement
   */
  async getLatestEvent(): Promise<EventRow> {
    const [rows] = await pool.query<EventRow[]>(
      'SELECT * FROM events ORDER BY created_at DESC LIMIT 1'
    );
    
    if (rows.length === 0) {
      throw new Error('Aucun événement trouvé');
    }
    return rows[0];
  }

  /**
   * Récupère tous les votes avec nom d'événement (via vue v_polls_with_event)
   * @returns Liste des votes
   */
  async getAllVotes(): Promise<PollVoteRow[]> {
    const [rows] = await pool.query<PollVoteRow[]>(
      'SELECT * FROM v_polls_with_event ORDER BY submitted_at DESC'
    );
    return rows;
  }

  /**
   * Récupère les votes d'un événement spécifique
   * @param eventId - ID de l'événement (CHAR(16))
   * @returns Liste des votes pour cet événement
   */
  async getVotesByEventId(eventId: string): Promise<PollVoteRow[]> {
    const [rows] = await pool.query<PollVoteRow[]>(
      'SELECT * FROM v_polls_with_event WHERE event_id = ? ORDER BY submitted_at DESC',
      [eventId]
    );
    return rows;
  }

  /**
   * Récupère les statistiques d'un événement spécifique
   * @param eventId - ID de l'événement
   * @returns Stats de l'événement
   */
  async getEventStats(eventId: string): Promise<PollStatsRow | null> {
    const [rows] = await pool.query<PollStatsRow[]>(
      'SELECT * FROM v_poll_stats_by_event WHERE event_id = ?',
      [eventId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Met à jour le nom d'un événement
   * @param eventId - ID de l'événement
   * @param eventName - Nouveau nom
   */
  async updateEvent(eventId: string, eventName: string): Promise<{ id: string; eventName: string }> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE events SET event_name = ?, updated_at = NOW() WHERE id = ?',
      [eventName, eventId]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Événement non trouvé');
    }
    
    return { id: eventId, eventName };
  }

  /**
   * Supprime un événement (suppression en cascade des polls)
   * @param eventId - ID de l'événement
   */
  async deleteEvent(eventId: string): Promise<{ deleted: boolean; id: string }> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM events WHERE id = ?',
      [eventId]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Événement non trouvé');
    }
    
    return { deleted: true, id: eventId };
  }

  /**
   * Supprime un vote spécifique
   * @param pollId - ID du vote (CHAR(16))
   */
  async deletePoll(pollId: string): Promise<{ deleted: boolean; id: string }> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM polls WHERE id = ?',
      [pollId]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Vote non trouvé');
    }
    
    return { deleted: true, id: pollId };
  }
}