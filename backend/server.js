require('dotenv').config();
const express = require('express');
const cors = require('cors');


const uploadRoutes = require('./routes/upload');
const listRoutes = require('./routes/list');
const infoRoutes = require('./routes/info');
const downloadRoutes = require('./routes/download');
const deleteRoutes = require('./routes/delete');
const previewRoutes = require('./routes/preview');

const app = express();
app.use(cors());

app.use(express.json());

app.use('/api/upload', uploadRoutes);
app.use('/api/list', listRoutes);
app.use('/api/info', infoRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/delete', deleteRoutes);
app.use('/api/preview', previewRoutes);

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});