import { Poll, IPoll } from "../interfaces/IPoll";
import { Types } from "mongoose";

export class PollService {

  /**
   * Créer une nouvelle évaluation
   */
  async create(data: IPoll) {
    const poll = new Poll({
      ...data,
      submittedAt: new Date(),
    });

    await poll.save();
    return poll;
  }

  /**
   * Récupérer toutes les évaluations
   */
  async getAll() {
    return Poll.find().sort({ submittedAt: -1 });
  }

  /**
   * Récupérer les évaluations par nom d'événement
   */
  async getByEventName(eventName: string) {
    return Poll.find({ eventName }).sort({ submittedAt: -1 });
  }

  /**
   * Supprimer une évaluation par ID
   */
  async deleteById(_id: string) {
    if (!Types.ObjectId.isValid(_id)) {
      throw new Error("Invalid poll id");
    }

    const deletedPoll = await Poll.findByIdAndDelete(_id);

    if (!deletedPoll) {
      throw new Error("Poll not found");
    }

    return deletedPoll;
  }
}
