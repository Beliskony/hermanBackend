// src/interfaces/IPoll.ts
export interface IPoll {
  id: string;              // CHAR(16)
  event_id: string;        // CHAR(16) - FK vers events.id
  name: string;            // VARCHAR(255) NOT NULL
  phone: string;           // VARCHAR(30) NOT NULL
  rating: number;          // TINYINT (1-10)
  feedback: string;        // VARCHAR(500) NOT NULL
  submitted_at: Date;      // DATETIME
}

export interface ICreatePoll {
  event_id: string;
  name: string;
  phone: string;
  rating: number;
  feedback: string;
}