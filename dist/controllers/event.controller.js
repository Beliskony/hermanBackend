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
exports.EventController = void 0;
const event_service_1 = require("../services/event.service");
const eventService = new event_service_1.EventService();
class EventController {
    // ---------------- CREATE ----------------
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { EventName } = req.body;
                if (!EventName) {
                    return res.status(400).json({
                        success: false,
                        message: "EventName is required"
                    });
                }
                const event = yield eventService.createEvent({ EventName });
                return res.status(201).json({
                    success: true,
                    message: "Event created successfully",
                    data: event
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message || "Server error"
                });
            }
        });
    }
    // ---------------- GET ALL ----------------
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const events = yield eventService.getAllEvents();
                return res.status(200).json({
                    success: true,
                    data: events
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message || "Server error"
                });
            }
        });
    }
    // ---------------- GET LATEST ----------------
    getLatest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const event = yield eventService.getLatestEvent();
                return res.status(200).json({
                    success: true,
                    data: event
                });
            }
            catch (error) {
                return res.status(404).json({
                    success: false,
                    message: error.message || "Event not found"
                });
            }
        });
    }
    // ---------------- UPDATE ----------------
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let id = req.params.id;
                if (Array.isArray(id)) {
                    id = id[0];
                }
                const { EventName } = req.body;
                if (!EventName) {
                    return res.status(400).json({
                        success: false,
                        message: "EventName is required"
                    });
                }
                const updatedEvent = yield eventService.updateEvent(id, { EventName });
                return res.status(200).json({
                    success: true,
                    message: "Event updated successfully",
                    data: updatedEvent
                });
            }
            catch (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message || "Unable to update event"
                });
            }
        });
    }
    // ---------------- DELETE ----------------
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let id = req.params.id;
                if (Array.isArray(id)) {
                    id = id[0];
                }
                yield eventService.deleteEvent(id);
                return res.status(200).json({
                    success: true,
                    message: "Event deleted successfully"
                });
            }
            catch (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message || "Unable to delete event"
                });
            }
        });
    }
}
exports.EventController = EventController;
//# sourceMappingURL=event.controller.js.map