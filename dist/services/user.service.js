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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const IUser_1 = require("../interfaces/IUser");
const bcryptjs_1 = require("bcryptjs");
const nodemailer_1 = __importDefault(require("nodemailer"));
class UserService {
    constructor() {
        // Exemple simple de stockage OTP en mémoire
        this.otpStore = {};
        // Configurer Nodemailer (ici avec SMTP Gmail par exemple)
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, // true pour 465, false pour les autres ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    register(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingUser = yield IUser_1.User.findOne({
                    $or: [
                        { email: user.email },
                        { phoneNumber: user.phoneNumber },
                        { username: user.username },
                    ],
                });
                if (existingUser) {
                    throw new Error("User with provided email, phone number, or username already exists");
                }
                const hashedPassword = yield (0, bcryptjs_1.hash)(user.password, 12);
                const newUser = new IUser_1.User(Object.assign(Object.assign({}, user), { password: hashedPassword }));
                yield newUser.save();
                return newUser;
            }
            catch (error) {
                console.error(error);
                throw error;
            }
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield IUser_1.User.findOne({ email });
            if (!user) {
                throw new Error("User not found");
            }
            const isPasswordValid = yield (0, bcryptjs_1.compare)(password, user.password);
            if (!isPasswordValid) {
                throw new Error("Invalid password");
            }
            const _a = user.toObject(), { password: _ } = _a, safeUser = __rest(_a, ["password"]);
            return safeUser;
        });
    }
    sendPasswordResetOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield IUser_1.User.findOne({ email });
            if (!user) {
                throw new Error("User not found");
            }
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            yield this.storeOtp(email, otp, Date.now() + 10 * 60 * 1000);
            yield this.sendEmail(email, "Password Reset OTP", `Your OTP code is: ${otp}. It will expire in 10 minutes.`);
        });
    }
    resetPasswordWithOtp(email, otp, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const storedOtp = yield this.getStoredOtp(email);
            if (!storedOtp || storedOtp.code !== otp || storedOtp.expiresAt < Date.now()) {
                throw new Error("Invalid or expired OTP");
            }
            if (newPassword.length < 8) {
                throw new Error("Password must be at least 8 characters");
            }
            const hashedPassword = yield (0, bcryptjs_1.hash)(newPassword, 12);
            yield IUser_1.User.updateOne({ email }, { password: hashedPassword });
            yield this.deleteOtp(email);
        });
    }
    // --------------------- OTP Storage ---------------------
    storeOtp(email, otp, expiresAt) {
        return __awaiter(this, void 0, void 0, function* () {
            this.otpStore[email] = { code: otp, expiresAt };
        });
    }
    getStoredOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.otpStore[email] || null;
        });
    }
    deleteOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            delete this.otpStore[email];
        });
    }
    // --------------------- Nodemailer ---------------------
    sendEmail(to, subject, text) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.transporter)
                throw new Error("Email transporter not initialized");
            yield this.transporter.sendMail({
                from: process.env.SMTP_USER, // ton email expéditeur
                to,
                subject,
                text,
            });
            console.log(`Email sent to ${to}`);
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map