const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rute untuk registrasi
// POST /api/auth/register
router.post('/register', authController.register);

// Rute untuk login
// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;