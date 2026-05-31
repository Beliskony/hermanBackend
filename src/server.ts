import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { pool, testDbConnection } from "./config/databaseConnect";
import userRouter from "./routes/user.route";
import pollRouter from "./routes/poll.route";
import eventRouter from "./routes/event.route";
import formRouter from "./routes/form.route";
import SendContactMailrouter from "./routes/sendmail.route";
import wordsRouter from "./routes/words.route";

dotenv.config();

const app = express();

// ✅ 1. CORS
app.use(cors({
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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ 3. Route racine
app.get("/", (_req, res) => {
  res.json({ 
    status: "ok", 
    message: "API acenviro opérationnelle",
    env: process.env.PASSENGER_APP_ENV || "local"
  });
});

// ✅ 4. Route de diagnostic DB (utile pour debug LWS)
app.get("/health", async (_req, res) => {
  try {
    const conn = await pool.getConnection();
    conn.release();
    res.json({ 
      status: "ok", 
      db: "connected",
      host: process.env.DB_HOST,
      database: process.env.DB_NAME
    });
  } catch (err: any) {
    res.status(500).json({ 
      status: "error", 
      db: "disconnected",
      message: err.message,
      code: err.code
    });
  }
});

// ✅ 5. Routes métier
app.use(userRouter);
app.use(pollRouter);
app.use(eventRouter);
app.use(formRouter);
app.use("/words", wordsRouter);
app.use(SendContactMailrouter);

// ✅ 6. 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "Route introuvable",
    method: req.method,
    path: req.path
  });
});

// ✅ 7. Erreur globale handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
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
export default app; // pour compatibilité ES6

// ✅ 10. Listen uniquement en local
const PORT = process.env.PORT || 3000;
app.listen(Number(PORT), () => {
  console.log(`🚀 Serveur démarré sur port ${PORT}`);
  console.log(`ENV: ${process.env.PASSENGER_APP_ENV || "local"}`);
  testDbConnection();
});