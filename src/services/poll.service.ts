import { Poll, IPoll } from "../interfaces/IPoll";
import { Types } from "mongoose";

export class PollService {
  
  // Admin: Créer un nouveau sondage (juste un nouveau nom)
  async createNewPoll(eventName: string): Promise<string> {
    // Validation simple
    if (!eventName || typeof eventName !== 'string') {
      throw new Error("Le nom doit être une chaîne de caractères");
    }
    
    const trimmedName = eventName.trim();
    
    // Option: Vérifier si le nom existe déjà (si vous voulez éviter les doublons)
    
    const existing = await Poll.findOne({ eventName: trimmedName });
    if (existing) {
      throw new Error(`Un sondage "${trimmedName}" existe déjà`);
    }
    
    // Rien à sauvegarder ! Juste retourner le nom
    console.log(`Nouveau sondage créé: "${trimmedName}"`);
    
    return trimmedName;
  }
  
  // Utilisateur: Soumettre un vote POUR UN ÉVÉNEMENT SPÉCIFIQUE
  async createVote(eventName: string, voteData: Omit<IPoll, 'eventName' | 'submittedAt'>) {
    // Validation
    if (!eventName) {
      throw new Error("Nom d'événement requis");
    }
    
    const poll = new Poll({
      ...voteData,
      eventName, // Le nom d'événement est fourni par l'utilisateur
      submittedAt: new Date(),
    });
    
    await poll.save();
    return poll;
  }
  
  // Récupérer tous les sondages (tous événements)
  async getAll() {
    return Poll.find().sort({ submittedAt: -1 });
  }
  
  // Récupérer les votes d'un événement spécifique
  async getByEventName(eventName: string) {
    return Poll.find({ eventName }).sort({ submittedAt: -1 });
  }
  
  // Liste de tous les événements (noms uniques)
  async getAllEventNames() {
    const events = await Poll.aggregate([
         {
        $lookup: {
          from: "polls",        // nom de la collection Poll dans MongoDB
          localField: "_id",
          foreignField: "eventName",
          as: "votes"
        }
      },
      {
        $project: {
          _id: 1,
          name: "$name",           // map EventName → name pour le frontend
          voteCount: { $size: "$votes" },
          lastVote: { $max: "$votes.submittedAt" } // ou createdAt selon ton Poll
        }
      },
      { $sort: { lastVote: -1 } } // trier par dernier vote
    ]);
    
    return events.map(event => ({
      _id: event._id,
      name: event.name,
      voteCount: event.voteCount,
      lastVote: event.lastVote
    }));
  }
  
  // Supprimer un vote
  async deleteVote(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("ID invalide");
    }
    
    const deleted = await Poll.findByIdAndDelete(id);
    
    if (!deleted) {
      throw new Error("Vote non trouvé");
    }
    
    return deleted;
  }
  
  // Supprimer tous les votes d'un événement
  async deleteEvent(eventName: string) {
    const result = await Poll.deleteMany({ eventName });
    return {
      eventName,
      deletedCount: result.deletedCount
    };
  }
}