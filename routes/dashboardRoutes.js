// backend/routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();

// ===== PASTIKAN getUserChartData ADA DI SINI =====
const { 
    getAdminStats, 
    getAgenStats, 
    getUserStats, 
    getUserChartData // <--- INI YANG KEMARIN LUPA
} = require('../controllers/dashboardController'); 

const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/admin', protect, authorize('admin'), getAdminStats);
router.get('/agen', protect, authorize('agen'), getAgenStats);
router.get('/user', protect, authorize('user'), getUserStats);

// Route baru untuk data chart user
router.get('/user-charts', protect, authorize('user'), getUserChartData);

module.exports = router;