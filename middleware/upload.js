import multer from "multer";
import path from "path";
import fs from "fs";

// 📁 Temp folder for processing before Cloudinary upload
const uploadPath = "./uploads";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
  console.log("📁 uploads folder created automatically");
}

// Storage config for temporary files
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Allowed File Types
const fileFilter = (req, file, cb) => {
  const allowed = /png|jpg|jpeg|webp/;
  if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
  else cb(new Error("❌ Only PNG / JPG / JPEG / WEBP images are allowed"));
};

// Export Upload Handler
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB Max
});

export default upload;
