// backend/routes/cutiRoutes.js

const express = require('express');
const router = express.Router();
// Pastikan semua fungsi di-import
const { 
    getAllCuti, 
    createCuti, 
    updateCuti, 
    deleteCuti 
} = require('../controllers/cutiController');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /api/cuti -> Mengambil semua data cuti
router.get('/', protect, getAllCuti);

// POST /api/cuti -> Membuat data cuti baru (hanya admin)
router.post('/', protect, authorize('admin'), createCuti);

// --- RUTE BARU UNTUK UPDATE DAN DELETE ---

// PUT /api/cuti/:id -> Mengupdate data cuti (hanya admin)
router.put('/:id', protect, authorize('admin'), updateCuti);

// DELETE /api/cuti/:id -> Menghapus data cuti (hanya admin)
router.delete('/:id', protect, authorize('admin'), deleteCuti);


module.exports = router;