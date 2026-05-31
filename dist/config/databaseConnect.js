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
exports.pool = void 0;
exports.testDbConnection = testDbConnection;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.pool = promise_1.default.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 5, // ⬇ réduit pour LWS (ressources limitées)
    queueLimit: 0,
    connectTimeout: 30000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    ssl: undefined,
});
// ✅ Test non-bloquant — ne crashe jamais le process
function testDbConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield exports.pool.getConnection();
            console.log('✅ MySQL connecté avec succès');
            connection.release();
            return true;
        }
        catch (error) {
            // ⚠️ Log détaillé pour debug LWS
            console.error('❌ Erreur MySQL:', {
                message: error.message,
                code: error.code, // ex: ECONNREFUSED, ER_ACCESS_DENIED
                errno: error.errno,
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                database: process.env.DB_NAME,
                port: process.env.DB_PORT,
            });
            return false;
        }
    });
}
//# sourceMappingURL=databaseConnect.js.map