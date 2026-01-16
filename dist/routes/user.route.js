"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const userRouter = (0, express_1.Router)();
/**
 * Auth
 */
userRouter.post("/register", user_controller_1.register);
userRouter.post("/login", user_controller_1.login);
/**
 * Password reset
 */
userRouter.post("/password-reset/request", user_controller_1.requestPasswordReset);
userRouter.post("/password-reset/confirm", user_controller_1.resetPassword);
exports.default = userRouter;
//# sourceMappingURL=user.route.js.map