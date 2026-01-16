"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PollService = void 0;
const IPoll_1 = require("../interfaces/IPoll");
const mongoose_1 = require("mongoose");
class PollService {
    // Admin: Créer un nouveau sondage (juste un nouveau nom)
    createNewPoll(eventName) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validation simple
            if (!eventName || typeof eventName !== 'string') {
                throw new Error("Le nom doit être une chaîne de caractères");
            }
            const trimmedName = eventName.trim();
            // Option: Vérifier si le nom existe déjà (si vous voulez éviter les doublons)
            const existing = yield IPoll_1.Poll.findOne({ eventName: trimmedName });
            if (existing) {
                throw new Error(`Un sondage "${trimmedName}" existe déjà`);
            }
            // Rien à sauvegarder ! Juste retourner le nom
            console.log(`Nouveau sondage créé: "${trimmedName}"`);
            return trimmedName;
        });
    }
    // Utilisateur: Soumettre un vote POUR UN ÉVÉNEMENT SPÉCIFIQUE
    createVote(eventName, voteData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validation
            if (!eventName) {
                throw new Error("Nom d'événement requis");
            }
            const poll = new IPoll_1.Poll(Object.assign(Object.assign({}, voteData), { eventName, submittedAt: new Date() }));
            yield poll.save();
            return poll;
        });
    }
    // Récupérer tous les sondages (tous événements)
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return IPoll_1.Poll.find().sort({ submittedAt: -1 });
        });
    }
    // Récupérer les votes d'un événement spécifique
    getByEventName(eventName) {
        return __awaiter(this, void 0, void 0, function* () {
            return IPoll_1.Poll.find({ eventName }).sort({ submittedAt: -1 });
        });
    }
    // Liste de tous les événements (noms uniques)
    getAllEventNames() {
        return __awaiter(this, void 0, void 0, function* () {
            const events = yield IPoll_1.Poll.aggregate([
                {
                    $group: {
                        _id: "$eventName",
                        voteCount: { $sum: 1 },
                        lastVote: { $max: "$submittedAt" }
                    }
                },
                { $sort: { lastVote: -1 } }
            ]);
            return events.map(event => ({
                name: event._id,
                voteCount: event.voteCount,
                lastVote: event.lastVote
            }));
        });
    }
    // Supprimer un vote
    deleteVote(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new Error("ID invalide");
            }
            const deleted = yield IPoll_1.Poll.findByIdAndDelete(id);
            if (!deleted) {
                throw new Error("Vote non trouvé");
            }
            return deleted;
        });
    }
    // Supprimer tous les votes d'un événement
    deleteEvent(eventName) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield IPoll_1.Poll.deleteMany({ eventName });
            return {
                eventName,
                deletedCount: result.deletedCount
            };
        });
    }
}
exports.PollService = PollService;
//# sourceMappingURL=poll.service.js.map