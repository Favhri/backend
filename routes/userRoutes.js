const express = require('express');
const router = express.Router();
const { createUser, updateUserRole } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// POST /api/users
// Rute untuk membuat user baru, hanya bisa diakses oleh admin yang sudah login.
router.post('/', protect, authorize('admin'), createUser);

router.put('/:id/role', protect, authorize('admin'), updateUserRole);

module.exports = router;