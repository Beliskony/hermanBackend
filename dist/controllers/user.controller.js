"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
class UserController {
    constructor() {
        // ---------------- REGISTER ----------------
        this.register = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userService.register(req.body);
                res.status(201).json({
                    success: true,
                    message: "User registered successfully",
                    data: user,
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || "Registration failed",
                });
            }
        });
        // ---------------- LOGIN ----------------
        this.login = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return res.status(400).json({
                        success: false,
                        message: "Email and password are required",
                    });
                }
                const result = yield this.userService.login(email, password);
                res.status(200).json({
                    success: true,
                    message: "Login successful",
                    data: result,
                });
            }
            catch (error) {
                res.status(401).json({
                    success: false,
                    message: error.message || "Invalid credentials",
                });
            }
        });
        // ---------------- SEND RESET OTP ----------------
        this.sendPasswordResetOtp = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                if (!email) {
                    return res.status(400).json({
                        success: false,
                        message: "Email is required",
                    });
                }
                yield this.userService.sendPasswordResetOtp(email);
                res.status(200).json({
                    success: true,
                    message: "OTP sent to email",
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || "Failed to send OTP",
                });
            }
        });
        // ---------------- RESET PASSWORD ----------------
        this.resetPasswordWithOtp = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, otp, newPassword } = req.body;
                if (!email || !otp || !newPassword) {
                    return res.status(400).json({
                        success: false,
                        message: "Email, OTP and new password are required",
                    });
                }
                yield this.userService.resetPasswordWithOtp(email, otp, newPassword);
                res.status(200).json({
                    success: true,
                    message: "Password reset successful",
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || "Password reset failed",
                });
            }
        });
        this.userService = new user_service_1.UserService();
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map