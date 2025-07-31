const express = require('express');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const os = require('os');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const ffmpeg = require('fluent-ffmpeg');

const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');
const connectDB = require('./db');

dotenv.config();

const router = express.Router();
const MAX_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB) || 100;

const AZURE_STORAGE_CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME;

const sharedKeyCredential = new StorageSharedKeyCredential(
  process.env.AZURE_STORAGE_ACCOUNT_NAME,
  process.env.AZURE_STORAGE_ACCOUNT_KEY
);

const blobServiceClient = new BlobServiceClient(
  `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  sharedKeyCredential
);

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp4', '.pdf', '.docx', '.png', '.jpg', '.xlsx', '.html'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Unsupported file type'));
    }
    cb(null, true);
  }
});

// 🎞️ Faststart Dönüştürücü
function convertToFastStart(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions('-movflags +faststart')
      .on('start', cmd => console.log('▶️ FFmpeg started:', cmd))
      .on('end', () => {
        console.log('✅ FFmpeg finished');
        resolve(outputPath);
      })
      .on('error', err => {
        console.error('❌ FFmpeg error:', err.message);
        reject(err);
      })
      .save(outputPath);
  });
}
// 📤 Upload Route (Azure Blob)
router.post('/', upload.single('file'), async (req, res) => {
  console.log('📩 /api/upload endpoint hit');
  const { tenant } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const originalName = req.file.originalname;
  const ext = path.extname(originalName).toLowerCase();
  const blobName = `${Date.now()}-${originalName}`;
  const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER_NAME);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  let uploadBuffer = req.file.buffer;

  let tempInputPath, tempOutputPath;

  try {
    if (ext === '.mp4') {
      // Geçici dosya yollxarı
      tempInputPath = path.join(os.tmpdir(), `input-${Date.now()}.mp4`);
      tempOutputPath = path.join(os.tmpdir(), `output-${Date.now()}.mp4`);

      // Bellekteki buffer'ı geçici input dosyasına yaz
      await writeFile(tempInputPath, uploadBuffer);

      // Faststart dönüşümü yap
      await convertToFastStart(tempInputPath, tempOutputPath);

      // Çıktıyı oku ve buffer'a çevir
      uploadBuffer = fs.readFileSync(tempOutputPath);
    }

    // Azure'a yükle
    await blockBlobClient.uploadData(uploadBuffer, {
      blobHTTPHeaders: {
        blobContentType: req.file.mimetype
      }
    });

    if (ext === '.mp4') {
    console.log('📄 Original buffer size:', req.file.buffer.length);
    console.log('📄 After faststart buffer size:', uploadBuffer.length);
  }

    // MongoDB kaydı
    const info = {
      blob_key: blobName,
      original_name: originalName,
      url: blockBlobClient.url,
      size_bytes: uploadBuffer.length,
      uploaded_at: new Date(),
      download_info: [],
      download_number: 0,
      preview: 0,
    };

    const db = await connectDB();
    const uploads = db.collection(tenant);
    const result = await uploads.insertOne(info);

    res.status(200).json({
      _id: result.insertedId,
      ...info
    });
    console.log(originalName + ' uploaded')

  } catch (err) {
    console.error('❌ Upload failed:', err.message);
    res.status(500).json({ error: 'Upload or DB save failed' });
  } finally {
    // Geçici dosyaları sil
    if (tempInputPath) unlink(tempInputPath).catch(() => {});
    if (tempOutputPath) unlink(tempOutputPath).catch(() => {});
  }
});

module.exports = router;