import { Schema, model } from "mongoose";

// interfaces/poll.interface.ts
interface IPoll {
  eventName: string     // Nom de l'événement
  name: string          // Nom complet de l'utilisateur
  phone: string         // Numéro de téléphone
  rating: number        // Note sur 10
  feedback: string      // Commentaire / feedback
  submittedAt?: Date    // Date d'envoi
}


const PollSchema = new Schema<IPoll>({
  eventName: { type: String, required: true },   // Nom de l'événement
  name: { type: String, required: true },
  phone: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 10 },
  feedback: { type: String, required: true, maxlength: 500 },
  submittedAt: { type: Date, default: Date.now },
});

export const Poll = model<IPoll>('Poll', PollSchema);
export type { IPoll };