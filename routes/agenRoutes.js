const express = require('express');
const router = express.Router();
const { createAgen } = require('../controllers/agenController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/agen
// Rute untuk menambah agen baru.
// Endpoint ini diproteksi, jadi hanya user yang sudah login (punya token) yang bisa akses.
router.post('/', protect, createAgen);

module.exports = router;