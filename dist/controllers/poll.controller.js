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
exports.deletePoll = exports.getPollsByEvent = exports.getPolls = exports.createPoll = void 0;
const poll_service_1 = require("../services/poll.service");
const pollService = new poll_service_1.PollService();
const createPoll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const poll = yield pollService.create(req.body);
        res.status(201).json(poll);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.createPoll = createPoll;
const getPolls = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const polls = yield pollService.getAll();
    res.json(polls);
});
exports.getPolls = getPolls;
const getPollsByEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventName = req.params.eventName;
        if (typeof eventName !== "string") {
            return res.status(400).json({ message: "Invalid event name" });
        }
        const polls = yield pollService.getByEventName(eventName);
        res.json(polls);
    }
    catch (error) {
    }
});
exports.getPollsByEvent = getPollsByEvent;
const deletePoll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        if (typeof id !== "string") {
            return res.status(400).json({ message: "Invalid poll id" });
        }
        yield pollService.deleteById(id);
        res.status(204).send();
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
});
exports.deletePoll = deletePoll;
//# sourceMappingURL=poll.controller.js.map