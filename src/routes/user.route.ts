import { Router } from "express";
import {
  register,
  login,
  requestPasswordReset,
  resetPassword,
} from "../controllers/user.controller";

const userRouter = Router();

/**
 * Auth
 */
userRouter.post("/register", register);
userRouter.post("/login", login);

/**
 * Password reset
 */
userRouter.post("/password-reset/request", requestPasswordReset);
userRouter.post("/password-reset/confirm", resetPassword);

export default userRouter;
