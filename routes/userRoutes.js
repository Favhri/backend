const express = require('express');
const router = express.Router();
const { 
    createUser, 
    updateUserRole,
    getAllUsers,    // <-- Tambahan baru
    getUserById,    // <-- Tambahan baru
    updateUser,     // <-- Tambahan baru
    deleteUser      // <-- Tambahan baru
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Rute yang sudah ada
// POST /api/users -> Membuat user baru (hanya admin)
router.post('/', protect, authorize('admin'), createUser);

// PUT /api/users/:id/role -> Mengupdate role user (hanya admin)
router.put('/:id00/role', protect, authorize('admin'), updateUserRole);


// --- RUTE CRUD BARU ---

// GET /api/users -> Mengambil semua data user (hanya admin)
router.get('/', protect, authorize('admin'), getAllUsers);

// GET /api/users/:id -> Mengambil data user tunggal berdasarkan ID (hanya admin)
router.get('/:id', protect, authorize('admin'), getUserById);

// PUT /api/users/:id -> Mengupdate data user (nama, email) (hanya admin)
router.put('/:id', protect, authorize('admin'), updateUser);

// DELETE /api/users/:id -> Menghapus user (hanya admin)
router.delete('/:id', protect, authorize('admin'), deleteUser);




module.exports = router;