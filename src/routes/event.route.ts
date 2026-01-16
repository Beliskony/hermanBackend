import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import { authMiddleware } from '../middlewares/auth.middleware';

const eventRouter = Router();
const controller = new EventController();

// ---------------- CREATE ----------------
eventRouter.post("/newEvent", authMiddleware, controller.create);

// ---------------- GET ALL ----------------
eventRouter.get("/AllEvents", authMiddleware, controller.getAll);

// ---------------- GET LATEST ----------------
eventRouter.get("/latestEvent", controller.getLatest);

// ---------------- UPDATE ----------------
eventRouter.put("/updateEvent/:id", authMiddleware, controller.update);

// ---------------- DELETE ----------------
eventRouter.delete("/deleteEvent/:id", authMiddleware, controller.delete);

export default eventRouter;
