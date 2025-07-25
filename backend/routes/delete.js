const express = require('express');
const connectDB = require('./db');
const dotenv = require('dotenv');
const {
  BlobServiceClient,
  StorageSharedKeyCredential
} = require('@azure/storage-blob');

dotenv.config();

const router = express.Router();

// Azure Blob Credentials
const account = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  sharedKeyCredential
);

// 📤 Delete Route
router.post('/', async (req, res) => {
  console.log('📩 /api/delete endpoint hit');

  const { blob_key, tenant } = req.body;
  console.log(blob_key, tenant);
  
  try {
    const db = await connectDB();
    const uploads = db.collection(tenant);

    const doc = await uploads.findOne({ blob_key: blob_key });
    
    if (!(doc)) {
      return res.status(404).send('No files found with that name\n');
    }

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(doc.blob_key); 
    await blobClient.deleteIfExists();
  
    await uploads.deleteOne({ blob_key: blob_key });

    res.status(200).send(blob_key + ' deleted.\n');
  } catch (err) {
    console.error('❌ Cannot delete blobs:', err.message);
    res.status(500).json({ error: 'Delete problem' });
  }
});

module.exports = router;