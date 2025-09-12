// favhri/backend/backend-fe66384412b0eefb2f8b3cd7d46eee060a4fa6be/routes/kpiRoutes.js

const express = require('express');
const router = express.Router();
const { 
    createKpi,
    getAllKpi,
    exportKpi
} = require('../controllers/kpiController');
const { protect } = require('../middleware/authMiddleware'); // authorize dihapus dari import

router.route('/')
    .get(protect, getAllKpi) // authorize('admin') dihapus
    .post(protect, createKpi); // authorize('admin') dihapus

router.get('/export', protect, exportKpi);

module.exports = router;