// favhri/backend/backend-aaa26a42e2e9a370ca84fd6781c628f03a411c6b/routes/arsipRoutes.js

const express = require('express');
const router = express.Router();
const { uploadDokumen, getAllDokumen, deleteDokumen, downloadDokumen } = require('../controllers/arsipController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getAllDokumen);

router.route('/upload')
    .post(protect, uploadDokumen); // Dihapus authorize agar semua role bisa upload

router.route('/download/:fileName')
    .get(protect, downloadDokumen);

router.route('/:id')
    .delete(protect, authorize('admin'), deleteDokumen);

module.exports = router;