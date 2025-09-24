// favhri/backend/backend-aaa26a42e2e9a370ca84fd6781c628f03a411c6b/index.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
require("dotenv").config();

// Import semua file rute
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const agenRoutes = require('./routes/agenRoutes');
const cutiRoutes = require('./routes/cutiRoutes');
const pegawaiRoutes = require('./routes/pegawaiRoutes');
const arsipRoutes = require('./routes/arsipRoutes');
const laporanRoutes = require('./routes/laporanRoutes'); 
const kpiRoutes = require('./routes/kpiRoutes');
const laporanHarianAgenRoutes = require('./routes/laporanHarianAgenRoutes');
const laporanKunjunganRoutes = require('./routes/laporanKunjunganRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:4173', 
  'https://elangterbang.site'
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true, // penting biar cookie terkirim
}));
app.use(express.json());
app.use(cookieParser());

// Middleware untuk menyajikan file statis dari folder 'uploads'
// Menjadikan folder 'uploads' sebagai folder statis
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Daftarkan semua rute API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/agen', agenRoutes);
app.use('/api/cuti', cutiRoutes);
app.use('/api/pegawai', pegawaiRoutes);
app.use('/api/arsip', arsipRoutes);
app.use('/api/laporan', laporanRoutes); 
app.use('/api/kpi', kpiRoutes);
app.use('/api/laporan-harian-agen', laporanHarianAgenRoutes);
app.use('/api/laporan-kunjungan', laporanKunjunganRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/hello', (req, res) => {
    res.send('Hello World!');
});

// Jalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});