// // utils/multerConfig.js
// import multer from "multer";
// import path from "path";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(process.cwd(), "uploads"));
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
//     cb(null, name);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image/")) cb(null, true);
//   else cb(new Error("Only images are allowed"), false);
// };

// export const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
// });

import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure folder exists
const ensureFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// ------------------------------
// COMMON FILE FILTER (images only)
// ------------------------------
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only images are allowed"), false);
};

// ------------------------------
// PRODUCT / VARIANT IMAGE STORAGE
// ------------------------------
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = path.join(process.cwd(), "uploads");
    ensureFolder(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

export const upload = multer({
  storage: productStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ------------------------------
// USER PROFILE IMAGE STORAGE
// ------------------------------
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = path.join(process.cwd(), "uploads/profile");
    ensureFolder(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${req.user._id}-profile-${Date.now()}${ext}`;
    cb(null, unique);
  },
});

export const uploadProfileImage = multer({
  storage: profileStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB allowed for profile
});
