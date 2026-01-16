// src/index.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import connectDB from "./config/databaseConnect";
import userRouter from "./routes/user.route";
import pollRouter from "./routes/poll.route";

dotenv.config();

const app = express();

app.use(cors({
  origin: [ "http://localhost:5173", "https://ton-domaine.com" ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));


app.use(express.json());



// routes
app.use(userRouter);
app.use(pollRouter);

app.get("/api/ping", (_req, res) => {
  res.status(200).json({ message: "Server is alive 🚀" });
});



// fonction de demarrage
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Serveur lancé sur le port ${PORT}`);
    });
  } catch (error) {
    console.error("Erreur au démarrage du serveur :", error);
  }
};

startServer()