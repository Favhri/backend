// backend/routes/cutiRoutes.js

const express = require('express');
const router = express.Router();
// Pastikan nama fungsi di dalam kurung kurawal ini sama persis dengan yang di-export
const { getAllCuti, createCuti } = require('../controllers/cutiController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/cuti -> Mengambil semua data cuti (ini baris ke-9)
router.get('/', protect, getAllCuti);

// POST /api/cuti -> Membuat data cuti baru
router.post('/', protect, createCuti);

module.exports = router;