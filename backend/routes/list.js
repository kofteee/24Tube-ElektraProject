const express = require('express');
const connectDB = require('./db');

const router = express.Router();

// 📤 List Route
router.post('/', async (req, res) => {
  console.log('📩 /api/list endpoint hit');
  const collection = req.body.tenant;

  try {
    const db = await connectDB();
    const uploads = db.collection(collection);

    let arr = [];

    await uploads.find({}).forEach(doc => {
        arr.push(
          {
            original_name: doc.original_name, 
            blob_key: doc.blob_key
          }
        );
    });
    res.status(200).json(arr);

  } catch (err) {
    console.error('❌ Cannot fetch data:', err.message);
    res.status(500).json({ error: 'Fetch problem' });
  }
});

module.exports = router;