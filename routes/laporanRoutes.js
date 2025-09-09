// favhri/backend/backend-aaa26a42e2e9a370ca84fd6781c628f03a411c6b/routes/laporanRoutes.js

const express = require('express');
const router = express.Router();
const { 
    createLaporan,
    getAllLaporan,
    exportLaporan
} = require('../controllers/laporanController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getAllLaporan)
    .post(protect, createLaporan);

router.route('/export')
    .get(protect, exportLaporan);

module.exports = router;