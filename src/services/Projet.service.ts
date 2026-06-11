// ─────────────────────────────────────────────────────────────────────────────
//  project.service.ts  —  Service des projets (CRUD complet)
// ─────────────────────────────────────────────────────────────────────────────

import { pool } from '../config/databaseConnect';
import { newId } from '../utils/id';
import { BaseRepository, Paginated } from '../services/formulaire/Base_form';
import type { IProject } from '../interfaces/IProject';

export class ProjectService extends BaseRepository {
  async getAll(page = 1, limit = 10): Promise<Paginated<IProject>> {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM projects 
       WHERE status = 'active' 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const total = await this.countRows('projects', "status = 'active'");
    return {
      items: rows.map(r => this._mapProject(r)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string): Promise<IProject | null> {
    const [rows] = await pool.query<any[]>(
      'SELECT * FROM projects WHERE id = ? AND status = ?',
      [id, 'active']
    );
    return rows[0] ? this._mapProject(rows[0]) : null;
  }

  async getSummary(projectId: string): Promise<{
    project: IProject;
    nbApes: number;
    nbGuides: number;
    nbAudits: number;
    nbConducteurs: number;
  } | null> {
    const [rows] = await pool.query<any[]>(
      `
      SELECT
        p.*,
        COUNT(DISTINCT fd.id) AS nb_apes,
        COUNT(DISTINCT ge.id) AS nb_guides,
        COUNT(DISTINCT ca.id) AS nb_audits,
        COUNT(DISTINCT cc.id) AS nb_conducteurs
      FROM projects p
      LEFT JOIN form_data fd ON fd.project_id = p.id
      LEFT JOIN guide_entretien ge ON ge.project_id = p.id
      LEFT JOIN checklist_audit ca ON ca.project_id = p.id
      LEFT JOIN checklist_conducteur cc ON cc.project_id = p.id
      WHERE p.id = ? AND p.status = 'active'
      GROUP BY p.id
      `,
      [projectId]
    );
    if (!rows.length) return null;
    const r = rows[0];
    return {
      project: this._mapProject(r),
      nbApes: Number(r.nb_apes),
      nbGuides: Number(r.nb_guides),
      nbAudits: Number(r.nb_audits),
      nbConducteurs: Number(r.nb_conducteurs),
    };
  }

  async create(data: {
    name: string;
    description?: string;
    location?: string;
    start_date?: Date;
    end_date?: Date;
    created_by: string;
  }): Promise<IProject> {
    const id = newId();
    const now = new Date();
    await pool.query(
      `INSERT INTO projects (id, name, description, location, start_date, end_date, status, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`,
      [id, data.name, data.description ?? null, data.location ?? null,
       data.start_date ?? null, data.end_date ?? null, data.created_by, now, now]
    );
    return (await this.getById(id))!;
  }

  async update(id: string, data: Partial<{
    name: string;
    description: string;
    location: string;
    start_date: Date;
    end_date: Date;
    status: string;
  }>): Promise<IProject | null> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Projet introuvable');
    const fields: string[] = [];
    const values: unknown[] = [];
    const updatableFields = ['name', 'description', 'location', 'start_date', 'end_date', 'status'] as const;
    for (const field of updatableFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field] ?? null);
      }
    }
    if (fields.length) {
      await pool.query(
        `UPDATE projects SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        [...values, id]
      );
    }
    return this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      `UPDATE projects SET status = 'archived', updated_at = NOW() WHERE id = ? AND status = 'active'`,
      [id]
    );
    return (result as any)[0]?.affectedRows > 0;
  }

  private _mapProject(r: any): IProject {
    return {
      id: r.id,
      name: r.name,
      description: r.description ?? null,
      location: r.location ?? null,
      start_date: r.start_date ? new Date(r.start_date) : null,
      end_date: r.end_date ? new Date(r.end_date) : null,
      status: r.status,
      created_by: r.created_by,
      created_at: new Date(r.created_at),
      updated_at: new Date(r.updated_at),
    };
  }
}