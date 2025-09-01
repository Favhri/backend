const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rute untuk login
// POST /api/auth/login
router.post('/login', authController.login);

// Rute untuk registrasi
// POST /api/auth/register
router.post('/register', authController.register);

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;