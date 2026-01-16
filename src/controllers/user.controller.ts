import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // ---------------- REGISTER ----------------
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.register(req.body);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Registration failed",
      });
    }
  };

  // ---------------- LOGIN ----------------
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      const result = await this.userService.login(email, password);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || "Invalid credentials",
      });
    }
  };

  // ---------------- SEND RESET OTP ----------------
  sendPasswordResetOtp = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      await this.userService.sendPasswordResetOtp(email);

      res.status(200).json({
        success: true,
        message: "OTP sent to email",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to send OTP",
      });
    }
  };

  // ---------------- RESET PASSWORD ----------------
  resetPasswordWithOtp = async (req: Request, res: Response) => {
    try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Email, OTP and new password are required",
        });
      }

      await this.userService.resetPasswordWithOtp(email, otp, newPassword);

      res.status(200).json({
        success: true,
        message: "Password reset successful",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Password reset failed",
      });
    }
  };
}
