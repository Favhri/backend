// backend/controllers/userController.js

const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// @desc    Membuat user baru
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
    // Menggunakan NIK (uppercase) dari body request
    const { nama_lengkap, email, password, role, NIK } = req.body;

    // Memperbarui validasi untuk NIK (uppercase)
    if (!nama_lengkap || !email || !password || !role || !NIK) {
        return res.status(400).json({ message: 'Semua field (nama_lengkap, email, password, role, NIK) wajib diisi' });
    }

    try {
        const [existingUser] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'Email sudah terdaftar.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Menambahkan NIK (uppercase) ke query INSERT
        const [result] = await pool.query(
            'INSERT INTO users (nama_lengkap, email, password, role, NIK) VALUES (?, ?, ?, ?, ?)',
            [nama_lengkap, email, hashedPassword, role, NIK]
        );

        res.status(201).json({
            success: true,
            message: 'User baru berhasil dibuat.',
            data: { id: result.insertId, nama_lengkap, email, role, NIK }
        });

    } catch (error) {
        console.error('Error saat membuat user:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// @desc    Update data user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    // Menggunakan NIK (uppercase) dari body request
    const { nama_lengkap, email, password, role, NIK } = req.body;

    // Memperbarui validasi untuk NIK (uppercase)
    if (!nama_lengkap || !email || !role || !NIK) {
        return res.status(400).json({ message: 'Nama lengkap, email, role, dan NIK wajib diisi' });
    }

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        let hashedPassword = users[0].password;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        // Menambahkan NIK (uppercase) ke query UPDATE
        await pool.query(
            'UPDATE users SET nama_lengkap = ?, email = ?, password = ?, role = ?, NIK = ? WHERE id = ?',
            [nama_lengkap, email, hashedPassword, role, NIK, id]
        );

        res.status(200).json({
            success: true,
            message: `User dengan ID ${id} berhasil diupdate.`
        });
    } catch (error) {
        console.error('Error saat update user:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email atau NIK sudah digunakan oleh user lain.' });
        }
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};


// @desc    Mengupdate role user saja
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
        return res.status(400).json({ message: 'Role wajib diisi.' });
    }

    try {
        const [result] = await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }
        res.status(200).json({ message: `Role user dengan ID ${id} berhasil diupdate.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};


// @desc    Mengambil semua user
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        // Menggunakan NIK (uppercase) di query SELECT
        const [users] = await pool.query('SELECT id, nama_lengkap, NIK, email, role, created_at FROM users ORDER BY created_at DESC');
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
        // Menggunakan NIK (uppercase) di query SELECT
        const [users] = await pool.query('SELECT id, nama_lengkap, NIK, email, role FROM users WHERE id = ?', [id]);
        
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


// @desc    Menghapus user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        res.status(200).json({
            success: true,
            message: `User dengan ID ${id} berhasil dihapus.`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};