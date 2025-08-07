const express = require('express');
const connectDB = require('./db');


const router = express.Router();

// 📤 List Route
router.post('/', async (req, res) => {
  console.log('📩 /api/download endpoint hit');

    const { tenant, blob_key, reason } = req.body;

      console.log(blob_key, tenant, reason);
  try {
    const db = await connectDB();
    const uploads = db.collection(tenant);


    await uploads.updateOne(
    { blob_key },
    {
      $inc: { download_number: 1 },
      $push: {
        download_info: {
          user: 'demo',
          reason: reason,
          date: new Date()
        }
      }
    }
);
    const doc = await uploads.findOne({ blob_key });

    res.status(200).json(doc.url);

  } catch (err) {
    console.error('❌ Cannot fetch data:', err.message);
    res.status(500).json({ error: 'Fetch problem' });
  }
});

module.exports = router;