import pino from "pino";
import dotenv from "dotenv";

dotenv.config();

const LOG_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === "development" ? "debug" : "info");
const LOG_DIR = process.env.LOG_DIR || "logs";

// Configuration de la rédaction (masquage de données sensibles)
const redact = {
  paths: [
    "password", "mot_de_passe", "authorization", "apikey", "token", "req.headers.authorization", "req.headers.cookie"
  ],
  censor: "[MASQUÉ]"
};

let targets = [];

if (process.env.NODE_ENV === "development") {
  // En développement : affichage coloré dans la console
  targets.push({
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname"
    }
  });
} else {
  // En production : affichage standard JSON dans la console
  targets.push({
    target: "pino/file",
    options: { destination: 1 } // stdout
  });
}

// Destination de fichier (rotation avec pino-roll) activée par défaut
targets.push({
  target: "pino-roll",
  options: {
    file: `${LOG_DIR}/log`, // Générera logs/log.2023-10-25...
    frequency: "daily",
    extension: ".log",
    limit: {
      count: parseInt(process.env.LOG_RETENTION_DAYS || "14", 10)
    },
    mkdir: true
  }
});

const transport = pino.transport({ targets });

const logger = pino({
  level: LOG_LEVEL,
  redact,
  timestamp: pino.stdTimeFunctions.isoTime
}, transport);

export default logger;
