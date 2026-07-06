// ============================================================
//  Middleware d'upload (Multer)
//  Reçoit les photos produits, les stocke dans src/uploads,
//  avec un nom de fichier unique. Limite la taille et les types.
// ============================================================
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

// S'assurer que le dossier existe
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()
      .slice(0, 40);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${base}-${unique}${ext}`);
  },
});

// Filtre : images uniquement
function fileFilter(req, file, cb) {
  const autorises = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (autorises.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Format d'image non supporté (jpeg, png, webp, gif)."));
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
});

export default upload;
