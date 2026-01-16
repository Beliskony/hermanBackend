import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const userRouter = Router();
const controller = new UserController();

userRouter.post("/register", controller.register);
userRouter.post("/login", controller.login);
userRouter.post("/password/otp", controller.sendPasswordResetOtp);
userRouter.post("/password/reset", controller.resetPasswordWithOtp);

export default userRouter;
