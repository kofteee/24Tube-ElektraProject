const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.use(express.json()); // POST body parse eder
// Middleware: Form verisini almak için
app.use(express.urlencoded({ extended: true }));

// Public klasöründeki HTML'leri sun
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index'); // index.ejs gerekir
});

app.get('/tenant', async (req, res) => {
  const tenant = req.query.tenant;
  try {
    const response = await axios.get(`http://localhost:8000/api/list?tenant=${tenant}`);
    const data = response.data;
    res.render('tenant', { tenant, data });
  } catch (error) {
    res.status(500).send("Liste alınamadı.");
  }
});

app.get('/tenant/detail', async (req, res) => {
  const { tenant, blob_key } = req.query;
  try {
    const response = await axios.post(`http://localhost:8000/api/info`, { blob_key, tenant });
    res.render('detail', { info: response.data, tenant });
  } catch (error) {
    res.status(500).send("Detay alınamadı.");
  }
});

app.get('/tenant/delete', async (req, res) => {
  const { tenant, blob_key } = req.query;
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

app.get('/tenant/preview', async (req, res) => {
  const url = req.query.url;

  if (!url) return res.status(400).send("URL eksik");

  const ext = path.extname(url).toLowerCase(); // uzantıyı al

  res.render('preview', { url, ext });
});

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});