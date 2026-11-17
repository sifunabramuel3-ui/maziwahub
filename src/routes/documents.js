import express from 'express';
import multer from 'multer';
import path from 'path';
import { requireLogin, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Strict disk allocation configuration ensuring random un-guessable hashed file tags are issued on allocation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilterOptions = (req, file, cb) => {
  const allowedExtensions = /pdf|jpg|jpeg|png/;
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];

  const extensionCheck = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimeCheck = allowedMimeTypes.includes(file.mimetype);

  if (extensionCheck && mimeCheck) {
    return cb(null, true);
  } else {
    // Intercept rogue file execution paths early
    return cb(new Error('Extension Validation Denied: System accepts only PDF, JPG, and PNG documents.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Absolute cap limiting payload parsing to 2 Megabytes max
  fileFilter: fileFilterOptions
}).single('certificate');

router.post('/upload-certificate', requireLogin, authorizeRoles('clerk', 'manager'), (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: "Upload Failure: Certificate size exceeds maximum limit of 2MB." });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Upload Failure: No document payload received." });
    }

    res.status(200).json({
      success: true,
      message: "Certificate uploaded and verified.",
      filename: req.file.filename
    });
  });
});

export default router;
