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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const DATABASE_URL = process.env.DATABASE_URL;
    const DATABASE_NAME = process.env.DATABASE_NAME;
    try {
        yield mongoose_1.default.connect(DATABASE_URL, {
            dbName: DATABASE_NAME,
            family: 4, // Force IPv4
            serverSelectionTimeoutMS: 10000, // Timeout 10 secondes
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            tls: true, // FORCE SSL/TLS (essentiel!)
            retryWrites: true,
            retryReads: true
        });
        console.log("✅ Connecté avec succès à MongoDB Atlas");
        console.log("📊 Base de données:", (_a = mongoose_1.default.connection.db) === null || _a === void 0 ? void 0 : _a.databaseName);
    }
    catch (error) {
        console.log("❌ Erreur de connexion à MongoDB:", error);
        // Ne pas faire process.exit(1) ici, laissez l'application réessayer
        throw error;
    }
});
exports.default = connectDB;
//# sourceMappingURL=databaseConnect.js.map