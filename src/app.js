// ============================================================
//  Configuration de l'application Express
// ============================================================
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import publicRoutes from "./routes/public.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import pinoHttp from "pino-http";
import logger from "./config/logger.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// CORS : autorise le front
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const allowedOrigins = process.env.FRONTEND_URL 
        ? process.env.FRONTEND_URL.split(',').map(u => u.trim())
        : ["http://localhost:5173", "http://localhost:5174"];
      
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy violation"));
      }
    },
    credentials: true,
  })
);

// Corps JSON et formulaires
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logs HTTP Pino
app.use(pinoHttp({
  logger,
  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400 && res.statusCode < 500) return 'warn';
    return 'info';
  },
  autoLogging: true,
}));

// Fichiers statiques : photos uploadées accessibles via /uploads/...
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Santé du serveur
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Myra Skin Care API" });
});

// Routes
app.use("/api", publicRoutes);
app.use("/api/admin", adminRoutes);

// 404 + gestion d'erreurs (toujours en dernier)
app.use(notFound);
app.use(errorHandler);

export default app;
