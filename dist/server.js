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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const databaseConnect_1 = require("./config/databaseConnect");
const user_route_1 = __importDefault(require("./routes/user.route"));
const poll_route_1 = __importDefault(require("./routes/poll.route"));
const form_route_1 = __importDefault(require("./routes/form.route"));
const sendmail_route_1 = __importDefault(require("./routes/sendmail.route"));
const words_route_1 = __importDefault(require("./routes/words.route"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// ✅ 1. CORS
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:5173",
        "https://admin.acenviro.pro",
        "https://acenviro.pro",
        "https://api.acenviro.pro"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
// ✅ 2. Body parsers
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
// ✅ 3. Route racine
app.get("/", (_req, res) => {
    res.json({
        status: "ok",
        message: "API acenviro opérationnelle",
        env: process.env.PASSENGER_APP_ENV || "local"
    });
});
// ✅ 4. Route de diagnostic DB (utile pour debug LWS)
app.get("/health", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conn = yield databaseConnect_1.pool.getConnection();
        conn.release();
        res.json({
            status: "ok",
            db: "connected",
            host: process.env.DB_HOST,
            database: process.env.DB_NAME
        });
    }
    catch (err) {
        res.status(500).json({
            status: "error",
            db: "disconnected",
            message: err.message,
            code: err.code
        });
    }
}));
// ✅ 5. Routes métier
app.use(user_route_1.default);
app.use(poll_route_1.default);
app.use(form_route_1.default);
app.use(words_route_1.default);
app.use(sendmail_route_1.default);
// ✅ 6. 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: "Route introuvable",
        method: req.method,
        path: req.path
    });
});
// ✅ 7. Erreur globale handler
app.use((err, _req, res, _next) => {
    console.error("Erreur globale:", err.stack || err.message);
    res.status(500).json({
        error: "Erreur interne du serveur",
        message: process.env.PASSENGER_APP_ENV === "production"
            ? "Une erreur est survenue"
            : err.message
    });
});
// ✅ 8. Process handlers — NE PAS exit en production Passenger
process.on("unhandledRejection", (reason) => {
    console.error("UnhandledRejection:", reason);
});
process.on("uncaughtException", (error) => {
    console.error("UncaughtException:", error.message);
    // Pas de process.exit() ici avec Passenger
});
// ✅ 9. Export pour Passenger (CRITIQUE)
module.exports = app;
exports.default = app; // pour compatibilité ES6
// ✅ 10. Listen uniquement en local
const PORT = process.env.PORT || 3000;
app.listen(Number(PORT), () => {
    console.log(`🚀 Serveur démarré sur port ${PORT}`);
    console.log(`ENV: ${process.env.PASSENGER_APP_ENV || "local"}`);
    (0, databaseConnect_1.testDbConnection)();
});
//# sourceMappingURL=server.js.map