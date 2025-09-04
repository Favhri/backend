// backend/routes/pegawaiRoutes.js

const express = require('express');
const router = express.Router();
const { 
    getAllPegawai, 
    createPegawai,
    updatePegawai,
    deletePegawai
} = require('../controllers/pegawaiController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Rute untuk GET semua pegawai dan POST pegawai baru
router.route('/')
    .get(protect, authorize('admin'), getAllPegawai)
    .post(protect, authorize('admin'), createPegawai);

// Rute untuk UPDATE dan DELETE pegawai berdasarkan ID
router.route('/:id')
    .put(protect, authorize('admin'), updatePegawai)
    .delete(protect, authorize('admin'), deletePegawai);

module.exports = router;