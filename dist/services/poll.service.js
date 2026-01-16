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
    /**
     * Créer une nouvelle évaluation
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const poll = new IPoll_1.Poll(Object.assign(Object.assign({}, data), { submittedAt: new Date() }));
            yield poll.save();
            return poll;
        });
    }
    /**
     * Récupérer toutes les évaluations
     */
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return IPoll_1.Poll.find().sort({ submittedAt: -1 });
        });
    }
    /**
     * Récupérer les évaluations par nom d'événement
     */
    getByEventName(eventName) {
        return __awaiter(this, void 0, void 0, function* () {
            return IPoll_1.Poll.find({ eventName }).sort({ submittedAt: -1 });
        });
    }
    /**
     * Supprimer une évaluation par ID
     */
    deleteById(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(_id)) {
                throw new Error("Invalid poll id");
            }
            const deletedPoll = yield IPoll_1.Poll.findByIdAndDelete(_id);
            if (!deletedPoll) {
                throw new Error("Poll not found");
            }
            return deletedPoll;
        });
    }
}
exports.PollService = PollService;
//# sourceMappingURL=poll.service.js.map