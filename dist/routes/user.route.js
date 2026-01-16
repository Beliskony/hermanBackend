"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const userRouter = (0, express_1.Router)();
const controller = new user_controller_1.UserController();
userRouter.post("/register", controller.register);
userRouter.post("/login", controller.login);
userRouter.post("/password/otp", controller.sendPasswordResetOtp);
userRouter.post("/password/reset", controller.resetPasswordWithOtp);
exports.default = userRouter;
//# sourceMappingURL=user.route.js.map