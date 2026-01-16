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
// src/index.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const databaseConnect_1 = __importDefault(require("./config/databaseConnect"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const poll_route_1 = __importDefault(require("./routes/poll.route"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "https://ton-domaine.com"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
}));
app.use(express_1.default.json());
// routes
app.use(user_route_1.default);
app.use(poll_route_1.default);
app.get("/api/ping", (_req, res) => {
    res.status(200).json({ message: "Server is alive 🚀" });
});
// fonction de demarrage
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, databaseConnect_1.default)();
        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`Serveur lancé sur le port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Erreur au démarrage du serveur :", error);
    }
});
startServer();
//# sourceMappingURL=server.js.map