// backend/index.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require("dotenv").config();

// Import semua file rute
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const agenRoutes = require('./routes/agenRoutes');
const cutiRoutes = require('./routes/cutiRoutes');
const pegawaiRoutes = require('./routes/pegawaiRoutes');
const arsipRoutes = require('./routes/arsipRoutes'); 

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Daftarkan semua rute
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/agen', agenRoutes);
app.use('/api/cuti', cutiRoutes);
app.use('/api/pegawai', pegawaiRoutes);
app.use('/api/arsip', arsipRoutes); 

// Jalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});