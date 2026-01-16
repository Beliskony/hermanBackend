import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import jwt from 'jsonwebtoken'

const userService = new UserService();

/**
 * POST /users/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    const user = await userService.register(req.body);
    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

/**
 * POST /users/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await userService.login(email, password);

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error: any) {
    res.status(401).json({
      message: error.message,
    });
  }
};


/**
 * POST /users/password-reset/request
 */
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    await userService.sendPasswordResetOtp(email);

    res.json({
      message: "OTP sent to email",
    });
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};

/**
 * POST /users/password-reset/confirm
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP and new password are required",
      });
    }

    await userService.resetPasswordWithOtp(email, otp, newPassword);

    res.json({
      message: "Password reset successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};