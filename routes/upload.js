const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const dotenv = require('dotenv');

const { S3Client } = require("@aws-sdk/client-s3");

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


const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    // acl: 'public-read',  // // // From console, using a json --> acl is done
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const fileName = Date.now() + '-' + file.originalname; // Timestamp, for preventing overwritings
      cb(null, fileName);
    }
  }),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowed = ['.mp4', '.pdf', '.docx', '.png', '.jpg', '.xlsx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Unsupported file type'));
    }
    cb(null, true);
  }
});

// Upload route
router.post('/', upload.single('file'), (req, res) => {
  console.log('📩 /api/upload endpoint hit');

  if (!req.file) {
    console.log('⚠️  No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  console.log('✅ File uploaded:', req.file.originalname);

  res.json({
    message: 'File uploaded successfully to S3',
    url: req.file.location,  // S3 public URL
    filename: req.file.key,
    originalname: req.file.originalname,
    size_mb: (req.file.size / (1024 * 1024)).toFixed(2)
  });
});

module.exports = router;