// src/index.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import connectDB from "./config/databaseConnect";
import userRouter from "./routes/user.route";
import pollRouter from "./routes/poll.route";
import eventRouter from "./routes/event.route";
import formRouter from "./routes/form.route";
import SendContactMailrouter from "./routes/sendmail.route";
import wordsRouter from "./routes/words.route";

dotenv.config();

const app = express();

app.use(cors({
  origin: [ "http://localhost:5173", "https://admin.acenviro.pro", "https://acenviro.pro" ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});



// routes
app.use(userRouter);
app.use(pollRouter);
app.use(eventRouter);
app.use(formRouter);
app.use('/words',wordsRouter);
app.use(SendContactMailrouter);




// fonction de demarrage
const startServer = async () => {

  // Ping toutes les 14 minutes pour éviter le sleep sur Render
const keepAlive = () => {
  const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3004}`;
  setInterval(async () => {
    try {
      await fetch(`${url}/health`);
      console.log(`[keep-alive] ping envoyé à ${new Date().toISOString()}`);
    } catch (err) {
      console.error("[keep-alive] ping échoué :", err);
    }
  }, 5 * 60 * 1000); // 5 minutes
};

  try {
    await connectDB();
    const PORT = process.env.PORT || 3004;
    app.listen(PORT, () => {
      console.log(`Serveur lancé sur le port ${PORT}`);
      keepAlive();
    });
  } catch (error) {
    console.error("Erreur au démarrage du serveur :", error);
  }
};

startServer()