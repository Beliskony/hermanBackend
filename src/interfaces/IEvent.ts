import { Schema, model } from "mongoose";

interface IEvent {
    EventName: string;
}

const EventSchema = new Schema<IEvent>({
    EventName: { type: String, required: true }
  },
  {
    timestamps: true // ⬅️ indispensable
  }
);

export const Event = model<IEvent>('Event', EventSchema);
export type { IEvent };