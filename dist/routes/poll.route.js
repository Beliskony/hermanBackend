"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const poll_controller_1 = require("../controllers/poll.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const isAdmin_middleware_1 = require("../middlewares/isAdmin.middleware");
const pollRouter = (0, express_1.Router)();
pollRouter.post("/createPoll", auth_middleware_1.authMiddleware, isAdmin_middleware_1.isAdmin, poll_controller_1.createPoll);
//Récupérer toutes les évaluations
pollRouter.get("/allPolls", auth_middleware_1.authMiddleware, isAdmin_middleware_1.isAdmin, poll_controller_1.getPolls);
//Récupérer les évaluations par nom d'événement
pollRouter.get("/event/:eventName", auth_middleware_1.authMiddleware, isAdmin_middleware_1.isAdmin, poll_controller_1.getPollsByEvent);
//Supprimer une évaluation
pollRouter.delete("/delete/:id", auth_middleware_1.authMiddleware, isAdmin_middleware_1.isAdmin, poll_controller_1.deletePoll);
exports.default = pollRouter;
//# sourceMappingURL=poll.route.js.map