const express = require('express');
const connectDB = require('./db');

const router = express.Router();

// 📤 List Route
router.post('/', async (req, res) => {
  console.log('📩 /api/info endpoint hit');

  try {
    const db = await connectDB();
    const uploads = db.collection('uploads');

    let result = [];

    const cursor = uploads.find({ original_name: req.body.original_name });
    await cursor.forEach(doc => result.push({
        'File Name': doc.original_name,
        'Download Number': doc.download_number,
        'Download Info' : doc.download_info,
    }));    

    if (result.length === 0) {
        return res.status(404).send('No files found with that name\n' );
    }
    return res.status(200).json(result);

  } catch (err) {
    console.error('❌ Cannot fetch data:', err.message);
    res.status(500).json({ error: 'Fetch problem' });
  }
});

module.exports = router;