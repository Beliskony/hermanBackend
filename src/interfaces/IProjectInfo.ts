// src/interfaces/IProjectInfo.ts
export interface IProjectInfo {
  id: string;              // CHAR(16)
  project_name: string;    // VARCHAR(255) NOT NULL
  date: Date;              // DATE NOT NULL
  auditors: string;        // VARCHAR(500) NOT NULL
  location: string;        // VARCHAR(255) NOT NULL
  period: string;          // VARCHAR(100) NOT NULL
}

export interface ICreateProjectInfo {
  project_name: string;
  date: Date;
  auditors: string;
  location: string;
  period: string;
}