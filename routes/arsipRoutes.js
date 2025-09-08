// backend/routes/arsipRoutes.js

const express = require('express');
const router = express.Router();
const { uploadDokumen, getAllDokumen, deleteDokumen } = require('../controllers/arsipController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Rute untuk upload, dapat diakses oleh admin dan user
router.post('/upload', protect, uploadDokumen);

// Rute untuk mengambil semua dokumen, dapat diakses oleh admin dan user
router.get('/', protect, getAllDokumen);

// Rute untuk menghapus dokumen, hanya bisa oleh admin
router.delete('/:id', protect, authorize('admin'), deleteDokumen);

module.exports = router;