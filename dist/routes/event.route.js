"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("../controllers/event.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const eventRouter = (0, express_1.Router)();
const controller = new event_controller_1.EventController();
// ---------------- CREATE ----------------
eventRouter.post("/newEvent", auth_middleware_1.authMiddleware, controller.create);
// ---------------- GET ALL ----------------
eventRouter.get("/AllEvents", auth_middleware_1.authMiddleware, controller.getAll);
// ---------------- GET LATEST ----------------
eventRouter.get("/latestEvent", controller.getLatest);
// ---------------- UPDATE ----------------
eventRouter.put("/updateEvent/:id", auth_middleware_1.authMiddleware, controller.update);
// ---------------- DELETE ----------------
eventRouter.delete("/deleteEvent/:id", auth_middleware_1.authMiddleware, controller.delete);
exports.default = eventRouter;
//# sourceMappingURL=event.route.js.map