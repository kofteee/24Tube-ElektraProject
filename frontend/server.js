const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use(express.json()); // POST body parse eder
// Middleware: Form verisini almak için
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index'); // index.ejs 
});

app.get('/tenant', async (req, res) => {
  const tenant = req.query.tenant;

  try {
    const response = await axios.post('http://localhost:8000/api/list', {tenant});
    const data = response.data;


    res.render('tenant', { tenant, data });
  } catch (error) {
    res.status(500).send("Liste alınamadı.");
  }
});

app.post('/tenant/detail', async (req, res) => {
  const { tenant, blob_key } = req.body;
  try {
    const response = await axios.post(`http://localhost:8000/api/info`, { blob_key, tenant });

    res.render('detail', { info: response.data, tenant });
  } catch (error) {
    res.status(500).send("Detay alınamadı.");
  }
});

app.post('/tenant/delete', async (req, res) => {
  const { tenant, blob_key } = req.body;
  console.log(tenant, blob_key)
  try {
    const response = await axios.post(`http://localhost:8000/api/delete`, { blob_key, tenant });

    res.redirect(`/tenant?tenant=${tenant}`);


  } catch (error) {
    res.status(500).send("Detay alınamadı." + error.error);
  }
});

const multer = require('multer');
const upload = multer(); // belleğe al, disk değil

const FormData = require('form-data');

app.post('/tenant/upload', upload.single('file'), async (req, res) => {
  const tenant = req.body.tenant;
  const file = req.file;

  try {
    const formData = new FormData();
    formData.append('tenant', tenant);
    formData.append('file', file.buffer, file.originalname);

    const response = await axios.post('http://localhost:8000/api/upload', formData, {
      headers: formData.getHeaders()
    });
    
    res.redirect(`/tenant?tenant=${tenant}`);



  } catch (err) {
    console.error("❌ Upload hatası:", err.message);
    res.status(500).send("Yükleme başarısız.");
  }
});

app.post('/tenant/preview', async (req, res) => {
  const {blob_key, tenant} = req.body;
  const response = await axios.post(`http://localhost:8000/api/preview`, { blob_key, tenant});

  const url = response.data;

  if (!url) return res.status(400).send("URL eksik");

  

  const ext = path.extname(url).toLowerCase(); // uzantıyı al

  res.render('preview', { url, ext });
});

app.post('/tenant/download/confirm', async (req, res) => {
  const { tenant, blob_key } = req.body;
  try {

    res.render('download_form', {tenant, blob_key }); // yeni sayfa
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Dosya bilgisi alınamadı.");
  }
});

app.post('/tenant/download', async (req, res) => {
  const { tenant, blob_key, reason } = req.body;

  try {
    console.log(`📥 [${tenant}] ${blob_key} için sebep: ${reason}`);

    const apiRes = await axios.post('http://localhost:8000/api/download', { tenant, blob_key, reason });
    const fileUrl = apiRes.data;

    const fileRes = await axios.get(fileUrl, { responseType: 'stream' });

    const contentType = fileRes.headers['content-type'] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${blob_key}"`);

    fileRes.data.pipe(res);

  } catch (error) {
    console.error(error.message);
    res.status(500).send("İndirme başlatılamadı.");
  }
});


app.post('/tenant/download/history', async (req, res) => {
  const { tenant, blob_key } = req.body;
  try {
    const response = await axios.post(`http://localhost:8000/api/info`, { blob_key, tenant });

    res.render('download_history', { info: response.data, tenant });
  } catch (error) {
    res.status(500).send("Detay alınamadı.");
  }
});

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});