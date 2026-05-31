// src/interfaces/IEvent.ts
export interface IEvent {
  id: string;              // CHAR(16)
  event_name: string;      // VARCHAR(255) NOT NULL
  created_at: Date;
  updated_at: Date;
}

export interface ICreateEvent {
  event_name: string;
}