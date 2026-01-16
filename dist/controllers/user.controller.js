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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.requestPasswordReset = exports.login = exports.register = void 0;
const user_service_1 = require("../services/user.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userService = new user_service_1.UserService();
/**
 * POST /users/register
 */
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userService.register(req.body);
        res.status(201).json({
            message: "User registered successfully",
            user,
        });
    }
    catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
});
exports.register = register;
/**
 * POST /users/login
 */
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = yield userService.login(email, password);
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            role: user.role,
            email: user.email,
        }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        res.json({
            message: "Login successful",
            token,
            user,
        });
    }
    catch (error) {
        res.status(401).json({
            message: error.message,
        });
    }
});
exports.login = login;
/**
 * POST /users/password-reset/request
 */
const requestPasswordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        yield userService.sendPasswordResetOtp(email);
        res.json({
            message: "OTP sent to email",
        });
    }
    catch (error) {
        res.status(404).json({
            message: error.message,
        });
    }
});
exports.requestPasswordReset = requestPasswordReset;
/**
 * POST /users/password-reset/confirm
 */
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                message: "Email, OTP and new password are required",
            });
        }
        yield userService.resetPasswordWithOtp(email, otp, newPassword);
        res.json({
            message: "Password reset successfully",
        });
    }
    catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
});
exports.resetPassword = resetPassword;
//# sourceMappingURL=user.controller.js.map