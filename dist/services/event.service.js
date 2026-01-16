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
exports.EventService = void 0;
const IEvent_1 = require("../interfaces/IEvent");
const mongoose_1 = require("mongoose");
class EventService {
    // ---------------- CREATE ----------------
    createEvent(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const event = new IEvent_1.Event(data);
                yield event.save();
                return event;
            }
            catch (error) {
                console.error("Create Event Error:", error);
                throw new Error("Unable to create event");
            }
        });
    }
    // ---------------- GET ALL ----------------
    getAllEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield IEvent_1.Event.find().sort({ createdAt: -1 });
            }
            catch (error) {
                console.error("Get All Events Error:", error);
                throw new Error("Unable to fetch events");
            }
        });
    }
    // -------- GET LATEST EVENT --------
    getLatestEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield IEvent_1.Event
                .findOne()
                .sort({ createdAt: -1 }); // ⬅️ le plus récent
            if (!event) {
                throw new Error("No event found");
            }
            return event;
        });
    }
    // ---------------- UPDATE ----------------
    updateEvent(eventId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(eventId)) {
                throw new Error("Invalid event ID");
            }
            const updatedEvent = yield IEvent_1.Event.findByIdAndUpdate(eventId, data, { new: true, runValidators: true });
            if (!updatedEvent) {
                throw new Error("Event not found");
            }
            return updatedEvent;
        });
    }
    // ---------------- DELETE ----------------
    deleteEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(eventId)) {
                throw new Error("Invalid event ID");
            }
            const deletedEvent = yield IEvent_1.Event.findByIdAndDelete(eventId);
            if (!deletedEvent) {
                throw new Error("Event not found");
            }
            return deletedEvent;
        });
    }
}
exports.EventService = EventService;
//# sourceMappingURL=event.service.js.map