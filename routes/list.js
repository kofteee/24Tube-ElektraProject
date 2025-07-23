const express = require('express');
const connectDB = require('./db');

const router = express.Router();

// 📤 List Route
router.get('/', async (req, res) => {
  console.log('📩 /api/list endpoint hit');

  try {
    const db = await connectDB();
    const uploads = db.collection('uploads');

    let arr = [];

    await uploads.find().forEach(doc => {
        arr.push(doc.original_name);
    });
    res.status(200).json(arr);

  } catch (err) {
    console.error('❌ Cannot fetch data:', err.message);
    res.status(500).json({ error: 'Fetch problem' });
  }
});

module.exports = router;