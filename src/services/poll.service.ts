import { Poll, IPoll } from "../interfaces/IPoll";
import { Event } from "../interfaces/IEvent";
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
  // Liste de tous les événements (noms uniques) avec leurs statistiques
async getAllEventNames() {
  try {
    console.log("Début de getAllEventNames...");
    
    // OPTION 1: Aggregation simple et testée
    const events = await Event.aggregate([
      {
        $lookup: {
          from: "polls",           // Collection Poll
          localField: "_id",       // _id de Event
          foreignField: "eventName", // eventName dans Poll
          as: "votes"
        }
      },
      {
        $addFields: {
          voteCount: { $size: "$votes" },
          lastVote: {
            $cond: {
              if: { $gt: [{ $size: "$votes" }, 0] },
              then: { $max: "$votes.submittedAt" },
              else: null
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: "$EventName",      // Important: EventName avec majuscule
          EventName: 1,
          voteCount: 1,
          lastVote: 1,
          createdAt: 1,
          updatedAt: 1
        }
      },
      {
        $sort: { 
          lastVote: -1,
          createdAt: -1 
        }
      }
    ]);

    console.log(`Nombre d'événements trouvés: ${events.length}`);
    console.log("Événements:", JSON.stringify(events, null, 2));

    // Formatage pour le frontend
    const formattedEvents = events.map(event => ({
      _id: event._id.toString(),
      name: event.name || event.EventName || "Sans nom",
      voteCount: event.voteCount || 0,
      lastVote: event.lastVote ? event.lastVote.toISOString() : null,
      createdAt: event.createdAt ? event.createdAt.toISOString() : null,
      updatedAt: event.updatedAt ? event.updatedAt.toISOString() : null
    }));

    console.log("Événements formatés:", formattedEvents);
    return formattedEvents;

  } catch (error) {
    console.error("Erreur dans getAllEventNames:", error);
    throw error;
  }
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