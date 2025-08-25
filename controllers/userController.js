const pool = require('../config/database');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
    // Ambil role dari body, jika tidak ada, default ke 'pegawai'
    const { nama_lengkap, email, password, role = 'pegawai' } = req.body;

    // Validasi input
    if (!nama_lengkap || !email || !password) {
        return res.status(400).json({ message: 'Nama lengkap, email, dan password wajib diisi' });
    }

    // Validasi apakah role yang diinput valid
    const allowedRoles = ['admin', 'pimpinan', 'pegawai'];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: `Role tidak valid. Pilih dari: ${allowedRoles.join(', ')}` });
    }

    try {
        // Cek duplikasi email
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            return res.status(409).json({ message: 'Email sudah terdaftar' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Simpan user baru dengan role yang sudah ditentukan
        const [result] = await pool.query(
            'INSERT INTO users (nama_lengkap, email, password, role) VALUES (?, ?, ?, ?)',
            [nama_lengkap, email, hashedPassword, role]
        );

        res.status(201).json({ 
            message: 'User berhasil dibuat oleh admin',
            userId: result.insertId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

exports.updateUserRole = async (req, res) => {
    const { id } = req.params; // Ambil ID user dari parameter URL
    const { role } = req.body;   // Ambil role baru dari body request

    // 1. Validasi apakah role yang diinput valid
    const allowedRoles = ['admin', 'pimpinan', 'pegawai'];
    if (!role || !allowedRoles.includes(role)) {
        return res.status(400).json({ message: `Role tidak valid. Pilih dari: ${allowedRoles.join(', ')}` });
    }

    try {
        // 2. Cek dulu apakah user dengan ID tersebut ada
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        // 3. Lakukan UPDATE ke database
        await pool.query(
            'UPDATE users SET role = ? WHERE id = ?',
            [role, id]
        );

        res.status(200).json({
            message: `Role untuk user ID ${id} berhasil diupdate menjadi '${role}'`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};