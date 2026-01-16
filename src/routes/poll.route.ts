import { Router } from "express";
import {
  createPoll,
  getPolls,
  getPollsByEvent,
  deletePoll,
} from "../controllers/poll.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/isAdmin.middleware";

const pollRouter = Router();


pollRouter.post("/createPoll", authMiddleware, isAdmin, createPoll);

//Récupérer toutes les évaluations
pollRouter.get("/allPolls", authMiddleware, isAdmin, getPolls);

//Récupérer les évaluations par nom d'événement
pollRouter.get("/event/:eventName", authMiddleware, isAdmin, getPollsByEvent);

//Supprimer une évaluation
pollRouter.delete("/delete/:id", authMiddleware, isAdmin, deletePoll);

export default pollRouter;
