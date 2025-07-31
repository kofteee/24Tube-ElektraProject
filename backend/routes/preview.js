const express = require('express');
const connectDB = require('./db');

const router = express.Router();

// 📤 Info Route
router.post('/', async (req, res) => {
  console.log('📩 /api/preview endpoint hit');
  const { blob_key, tenant } = req.body;

  try {
    const db = await connectDB();
    const uploads = db.collection(tenant);

    await uploads.updateOne({ blob_key }, { $inc: { preview: 1 } });
    const doc = await uploads.findOne({ blob_key });

    if (!doc) {
    return res.status(404).json({ error: 'No file found with that name' });
    }

    return res.status(200).json(doc.url);

  } catch (err) {
    console.error('❌ Cannot fetch data:', err.message);
    res.status(500).json({ error: 'Fetch problem' });
  }
});

module.exports = router;