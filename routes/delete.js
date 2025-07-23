const express = require('express');
const connectDB = require('./db');

const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

// AWS S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const router = express.Router();


// 📤 List Route
router.post('/', async (req, res) => {
  console.log('📩 /api/delete endpoint hit');

  try {
    const db = await connectDB();
    const uploads = db.collection('uploads');

    const cursor = uploads.find({ original_name: req.body.original_name });

    if (!(await cursor.hasNext())) {
    return res.status(404).send('No files found with that name\n');
    }

    await cursor.forEach(doc => 
        s3.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: doc.s3_key, // 
    })));

    await uploads.deleteMany({ original_name: req.body.original_name });
    
    res.status(200).send(req.body.original_name + " deleted.\n");
    

  } catch (err) {
    console.error('❌ Cannot fetch data:', err.message);
    res.status(500).json({ error: 'Fetch problem' });
  }
});

module.exports = router;