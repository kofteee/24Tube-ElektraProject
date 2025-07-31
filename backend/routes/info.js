const express = require('express');
const connectDB = require('./db');

const router = express.Router();

// 📤 Info Route
router.post('/', async (req, res) => {
  console.log('📩 /api/info endpoint hit');
  const { blob_key, tenant } = req.body;

  try {
    const db = await connectDB();
    const uploads = db.collection(tenant);

    const doc = await uploads.findOne({ blob_key: blob_key });

    if (!doc) {
      return res.status(404).json({ error: 'No file found with that name' });
    }

    const result = {
      blob_key: doc.blob_key,
      original_name: doc.original_name,
      download_number: doc.download_number,
      download_info: doc.download_info,
      uploaded_at: doc.uploaded_at,
      url: doc.url,
      size_bytes: doc.size_bytes,
      preview: doc.preview,
    };

    return res.status(200).json(result);

  } catch (err) {
    console.error('❌ Cannot fetch data:', err.message);
    res.status(500).json({ error: 'Fetch problem' });
  }
});

module.exports = router;