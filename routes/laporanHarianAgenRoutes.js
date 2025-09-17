// routes/laporanHarianAgenRoutes.js
const express = require('express');
const router = express.Router();
const { createLaporan, getAllLaporan, updateLaporan, deleteLaporan, exportLaporan } = require('../controllers/laporanHarianAgenController');
const { protect, authorize } = require('../middleware/authMiddleware');

const allowedRoles = authorize('admin', 'agen');

router.route('/').get(protect, allowedRoles, getAllLaporan).post(protect, allowedRoles, createLaporan);
router.route('/:id').put(protect, allowedRoles, updateLaporan).delete(protect, authorize('admin'), deleteLaporan);
router.route('/export').get(protect, allowedRoles, exportLaporan); // <-- TAMBAHKAN INI

module.exports = router;