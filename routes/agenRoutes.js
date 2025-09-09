// favhri/backend/backend-aaa26a42e2e9a370ca84fd6781c628f03a411c6b/routes/agenRoutes.js

const express = require('express');
const router = express.Router();
const { 
    createAgen,
    getAllAgen,
    updateAgen,
    deleteAgen
} = require('../controllers/agenController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Rute untuk GET semua agen dan POST agen baru
// Endpoint: /api/agen
router.route('/')
    .get(protect, authorize('admin'), getAllAgen)
    .post(protect, authorize('admin'), createAgen);

// Rute untuk UPDATE dan DELETE agen berdasarkan ID
// Endpoint: /api/agen/:id
router.route('/:id')
    .put(protect, authorize('admin'), updateAgen)
    .delete(protect, authorize('admin'), deleteAgen);

module.exports = router;