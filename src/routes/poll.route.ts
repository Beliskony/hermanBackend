// src/routes/poll.routes.ts
import { Router } from 'express';
import { PollController } from '../controllers/poll.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const pollRouter = Router();
const controller = new PollController();

// ── Events admin ─────────────────────────────────────────────
pollRouter.post('/newEvents', authMiddleware, controller.createNewPollEvent);
pollRouter.get('/admin/events', authMiddleware, controller.getAllEvents);
pollRouter.put('/updateEvent/:id', authMiddleware, controller.updateEvent);
pollRouter.delete('/deleteEvent/:eventId', authMiddleware, controller.deleteEvent);

// ── Events public ─────────────────────────────────────────────
pollRouter.get('/latestEvent', controller.getLatestEvent);

// ── Votes admin ───────────────────────────────────────────────
pollRouter.get('/admin/votes', authMiddleware, controller.getPolls);
pollRouter.get('/votes/event/:eventId', authMiddleware, controller.getPollsByEvent);
pollRouter.delete('/admin/votes/:id', authMiddleware, controller.deletePoll);

// ── Votes public ──────────────────────────────────────────────
pollRouter.post('/vote', controller.createPoll);

export default pollRouter;