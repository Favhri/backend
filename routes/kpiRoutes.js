// favhri/backend/backend-e3d9d5c539d6de3679e5b9734f42a8acf1ea2583/routes/kpiRoutes.js

const express = require('express');
const router = express.Router();
const { 
    createKpi,
    getAllKpi,
    updateKpi,
    deleteKpi,
    exportKpi
} = require('../controllers/kpiController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getAllKpi)
    .post(protect, createKpi);

router.route('/:id')
    .put(protect, authorize('admin'), updateKpi)
    .delete(protect, authorize('admin'), deleteKpi);

// --- PERBAIKAN DI SINI ---
// Sekarang 'user' juga bisa melakukan export
router.get('/export', protect, authorize('admin', 'user'), exportKpi);

module.exports = router;