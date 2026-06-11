// src/interfaces/IProject.ts
export type ProjectStatus = 'active' | 'closed' | 'archived';

export interface IProject {
  id: string;                       // CHAR(16)
  name: string;                     // VARCHAR(255) NOT NULL
  description: string | null;       // TEXT
  location: string | null;          // VARCHAR(255)
  start_date: Date | null;          // DATE
  end_date: Date | null;            // DATE
  status: ProjectStatus;
  created_by: string;               // CHAR(16) FK → users.id
  created_at: Date;
  updated_at: Date;
}

export interface ICreateProject {
  name: string;
  description?: string;
  location?: string;
  start_date?: Date;
  end_date?: Date;
  created_by: string;
}

export interface IUpdateProject {
  name?: string;
  description?: string;
  location?: string;
  start_date?: Date;
  end_date?: Date;
  status?: ProjectStatus;
}