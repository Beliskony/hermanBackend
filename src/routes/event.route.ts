import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import { isAdmin } from '../middlewares/isAdmin.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

const eventRouter = Router();
const controller = new EventController();

// ---------------- CREATE ----------------
eventRouter.post("/newEvent", authMiddleware, controller.create);

// ---------------- GET ALL ----------------
eventRouter.get("/AllEvents", isAdmin, authMiddleware, controller.getAll);

// ---------------- GET LATEST ----------------
eventRouter.get("/latestEvent", controller.getLatest);

// ---------------- UPDATE ----------------
eventRouter.put("/updateEvent/:id", isAdmin, authMiddleware, controller.update);

// ---------------- DELETE ----------------
eventRouter.delete("/deleteEvent/:id", isAdmin, authMiddleware, controller.delete);

export default eventRouter;
