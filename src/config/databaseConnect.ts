import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    const DATABASE_URL = process.env.DATABASE_URL as string;
    const DATABASE_NAME = process.env.DATABASE_NAME as string;
    
    try {
        await mongoose.connect(DATABASE_URL, { 
            dbName: DATABASE_NAME,
            family: 4,                    // Force IPv4
            serverSelectionTimeoutMS: 10000,  // Timeout 10 secondes
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            tls: true,                    // FORCE SSL/TLS (essentiel!)
            retryWrites: true,
            retryReads: true
        });
        
        
    } catch (error) {
        console.log("❌ Erreur de connexion à MongoDB:", error);
        // Ne pas faire process.exit(1) ici, laissez l'application réessayer
        throw error;
    }
}

export default connectDB;