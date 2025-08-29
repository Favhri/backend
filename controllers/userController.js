// (Ini adalah kode yang sudah ada di file lu)
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => { /* ... (kode tidak berubah) ... */ };
exports.updateUserRole = async (req, res) => { /* ... (kode tidak berubah) ... */ };


// --- KODE BARU DIMULAI DI SINI ---

// @desc    Mengambil semua user
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, nama_lengkap, email, role FROM users ORDER BY created_at DESC');
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// @desc    Mengambil satu user berdasarkan ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const [users] = await pool.query('SELECT id, nama_lengkap, email, role FROM users WHERE id = ?', [id]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        res.status(200).json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// @desc    Update data user (nama_lengkap, email)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { nama_lengkap, email } = req.body;

    if (!nama_lengkap || !email) {
        return res.status(400).json({ message: 'Nama lengkap dan email wajib diisi' });
    }

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        await pool.query(
            'UPDATE users SET nama_lengkap = ?, email = ? WHERE id = ?',
            [nama_lengkap, email, id]
        );

        res.status(200).json({
            success: true,
            message: `User dengan ID ${id} berhasil diupdate.`
        });
    } catch (error) {
        console.error(error);
        // Tangani jika email baru ternyata duplikat
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email sudah digunakan oleh user lain.' });
        }
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// @desc    Menghapus user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        await pool.query('DELETE FROM users WHERE id = ?', [id]);

        res.status(200).json({
            success: true,
            message: `User dengan ID ${id} berhasil dihapus.`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};