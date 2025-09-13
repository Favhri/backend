// favhri/backend/backend-e3d9d5c539d6de3679e5b9734f42a8acf1ea2583/routes/laporanRoutes.js

const express = require('express');
const router = express.Router();
const { 
    createLaporan,
    getAllLaporan,
    updateLaporan,
    deleteLaporan,
    exportLaporan
} = require('../controllers/laporanController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getAllLaporan)
    .post(protect, createLaporan);

router.route('/:id')
    .put(protect, authorize('admin'), updateLaporan)
    .delete(protect, authorize('admin'), deleteLaporan);

// --- PERBAIKAN DI SINI ---
// Sekarang 'user' juga bisa melakukan export
router.route('/export')
    .get(protect, authorize('admin', 'user'), exportLaporan); 

module.exports = router;