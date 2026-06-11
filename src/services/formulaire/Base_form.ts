// ─────────────────────────────────────────────────────────────────────────────
//  base-form.service.ts  —  Helpers et classe de base communs
// ─────────────────────────────────────────────────────────────────────────────

import { pool } from '../../config/databaseConnect';

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export function parseJson<T = any>(val: unknown): T | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val) as T;
    } catch {
      return null;
    }
  }
  return val as T;
}

export function stringify(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  return typeof val === 'string' ? val : JSON.stringify(val);
}

export abstract class BaseRepository {
  protected async countRows(table: string, where = '1=1', params: unknown[] = []): Promise<number> {
    const [rows] = await pool.query<any[]>(
      `SELECT COUNT(*) AS total FROM \`${table}\` WHERE ${where}`,
      params
    );
    return Number(rows[0]?.total) || 0;
  }
}