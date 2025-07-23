const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const dotenv = require('dotenv');
const { S3Client } = require("@aws-sdk/client-s3");

const connectDB = require('./db');

dotenv.config();

const router = express.Router();
const MAX_SIZE_MB = 100;

// AWS S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer + S3 config
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    }
  }),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp4', '.pdf', '.docx', '.png', '.jpg', '.xlsx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Unsupported file type'));
    }
    cb(null, true);
  }
});

// 📤 Upload Route
router.post('/', upload.single('file'), async (req, res) => {
  console.log('📩 /api/upload endpoint hit');

  if (!req.file) {
    console.log('⚠️  No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  console.log('✅ File uploaded:', req.file.originalname);

  const info = {
    s3_key: req.file.key,
    original_name: req.file.originalname,
    url: req.file.location,
    size_bytes: req.file.size,
    uploaded_at: new Date(),
    download_info: [],
    download_number: 0
  };

  try {
    const db = await connectDB();
    const uploads = db.collection('uploads');
    const result = await uploads.insertOne(info);

    res.status(200).json({
      _id: result.insertedId,
      ...info
    });
  } catch (err) {
    console.error('❌ Upload save failed:', err.message);
    res.status(500).json({ error: 'Database save failed' });
  }
});

module.exports = router;