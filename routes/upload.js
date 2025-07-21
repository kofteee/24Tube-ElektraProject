const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const MAX_SIZE_MB = 100;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname; // Timestamp + fileName -- prevent overwritings
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const allowed = ['.mp4', '.pdf', '.docx', '.png', '.jpg'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowed.includes(ext)) {
            return cb(new Error('Unsupported file type'));
        }
        cb(null, true);
    }
});

// 🔽 ROUTE
router.post('/', upload.single('file'), (req, res) => {
    console.log('📩 /api/upload endpoint hit');

    if (!req.file) {
        console.log('⚠️  No file uploaded');
        return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('✅ File uploaded:', req.file.originalname);

    res.json({
        message: 'File uploaded successfully',
        filename: req.file.filename,
        originalname: req.file.originalname,
        size_mb: (req.file.size / (1024 * 1024)).toFixed(2)
    });
});

module.exports = router;