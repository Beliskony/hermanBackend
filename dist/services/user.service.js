"use strict";
// ─────────────────────────────────────────────────────────────────────────────
//  user.service.ts  —  MySQL version (mysql2 + procédures stockées)
//  Aucun changement sur la logique métier (JWT, OTP, bcrypt) :
//  seuls les appels Mongoose → pool.query()
// ─────────────────────────────────────────────────────────────────────────────
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
exports.UserService = void 0;
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const databaseConnect_1 = require("../config/databaseConnect"); // mysql2 pool
const id_1 = require("../utils/id"); // crypto.randomBytes(8).toString('hex')
const sendmail_service_1 = __importDefault(require("./sendmail.service"));
class UserService {
    constructor() {
        // OTP en mémoire (inchangé — pas lié à la DB)
        this.otpStore = {};
        this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
    }
    // ── REGISTER ───────────────────────────────────────────────────────────────
    register(user) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            // Vérification unicité (email | phone_number | username)
            // CORRECTION : Utiliser RowDataPacket[] au lieu de any[]
            const [rows] = yield databaseConnect_1.pool.query(`SELECT id FROM users
       WHERE email = ? OR phone_number = ? OR username = ?
       LIMIT 1`, [user.email, user.phone_number, user.username]);
            if (rows.length > 0) {
                throw new Error('User with provided email, phone number, or username already exists');
            }
            const id = (0, id_1.newId)();
            const hashedPassword = yield (0, bcryptjs_1.hash)(user.password, 12);
            yield databaseConnect_1.pool.query('CALL sp_create_user(?,?,?,?,?,?)', [id, user.username, user.email, user.phone_number, hashedPassword, (_a = user.role) !== null && _a !== void 0 ? _a : 'user']);
            return { id, username: user.username, email: user.email, role: (_b = user.role) !== null && _b !== void 0 ? _b : 'user' };
        });
    }
    // ── LOGIN ──────────────────────────────────────────────────────────────────
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            // CORRECTION : Utiliser UserRow[] (qui étend RowDataPacket)
            const [rows] = yield databaseConnect_1.pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
            if (rows.length === 0)
                throw new Error('User not found');
            const user = rows[0];
            const isPasswordValid = yield (0, bcryptjs_1.compare)(password, user.password);
            if (!isPasswordValid)
                throw new Error('Invalid password');
            const signOptions = {
                expiresIn: this.JWT_EXPIRES_IN,
            };
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                email: user.email,
                username: user.username,
                phone_number: user.phone_number,
                role: user.role,
            }, this.JWT_SECRET, signOptions);
            // Extraction correcte des champs
            const safeUser = {
                id: user.id,
                username: user.username,
                email: user.email,
                phone_number: user.phone_number,
                role: user.role,
                created_at: user.created_at,
                updated_at: user.updated_at
            };
            return { user: safeUser, token };
        });
    }
    // ── SEND PASSWORD RESET OTP ────────────────────────────────────────────────
    sendPasswordResetOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield databaseConnect_1.pool.query('SELECT id, username FROM users WHERE email = ? LIMIT 1', [email]);
            if (rows.length === 0)
                throw new Error('User not found');
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            yield this.storeOtp(email, otp, Date.now() + 10 * 60 * 1000);
            yield sendmail_service_1.default.sendPasswordResetOTP({
                to: email,
                userName: rows[0].username || 'Utilisateur',
                otpCode: otp,
                expiresIn: '10 minutes',
            });
        });
    }
    // ── RESET PASSWORD WITH OTP ────────────────────────────────────────────────
    resetPasswordWithOtp(email, otp, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const storedOtp = yield this.getStoredOtp(email);
            if (!storedOtp || storedOtp.code !== otp || storedOtp.expiresAt < Date.now()) {
                throw new Error('Invalid or expired OTP');
            }
            if (newPassword.length < 8) {
                throw new Error('Password must be at least 8 characters');
            }
            const hashedPassword = yield (0, bcryptjs_1.hash)(newPassword, 12);
            // CORRECTION : Pour UPDATE, on peut utiliser ResultSetHeader optionnellement
            yield databaseConnect_1.pool.query('UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?', [hashedPassword, email]);
            yield this.deleteOtp(email);
        });
    }
    // ── OTP STORE (mémoire — inchangé) ────────────────────────────────────────
    storeOtp(email, otp, expiresAt) {
        return __awaiter(this, void 0, void 0, function* () {
            this.otpStore[email] = { code: otp, expiresAt };
        });
    }
    getStoredOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return (_a = this.otpStore[email]) !== null && _a !== void 0 ? _a : null;
        });
    }
    deleteOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            delete this.otpStore[email];
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map