"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/poll.routes.ts
const express_1 = require("express");
const poll_controller_1 = require("../controllers/poll.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const pollRouter = (0, express_1.Router)();
const controller = new poll_controller_1.PollController();
// ── Events admin ─────────────────────────────────────────────
pollRouter.post('/newEvents', auth_middleware_1.authMiddleware, controller.createNewPollEvent);
pollRouter.get('/admin/events', auth_middleware_1.authMiddleware, controller.getAllEvents);
pollRouter.put('/updateEvent/:id', auth_middleware_1.authMiddleware, controller.updateEvent);
pollRouter.delete('/deleteEvent/:eventId', auth_middleware_1.authMiddleware, controller.deleteEvent);
// ── Events public ─────────────────────────────────────────────
pollRouter.get('/latestEvent', controller.getLatestEvent);
// ── Votes admin ───────────────────────────────────────────────
pollRouter.get('/admin/votes', auth_middleware_1.authMiddleware, controller.getPolls);
pollRouter.get('/votes/event/:eventId', auth_middleware_1.authMiddleware, controller.getPollsByEvent);
pollRouter.delete('/admin/votes/:id', auth_middleware_1.authMiddleware, controller.deletePoll);
// ── Votes public ──────────────────────────────────────────────
pollRouter.post('/vote', controller.createPoll);
exports.default = pollRouter;
//# sourceMappingURL=poll.route.js.map