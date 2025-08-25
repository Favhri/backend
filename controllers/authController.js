const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fungsi untuk Registrasi User Baru (TIDAK ADA PERUBAHAN DI SINI)
exports.register = async (req, res) => {
    const { nama_lengkap, email, password } = req.body;

    if (!nama_lengkap || !email || !password) {
        return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            return res.status(409).json({ message: 'Email sudah terdaftar' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Query INSERT tidak perlu diubah karena role sudah di-handle oleh database (DEFAULT 'user')
        await pool.query(
            'INSERT INTO users (nama_lengkap, email, password) VALUES (?, ?, ?)',
            [nama_lengkap, email, hashedPassword]
        );

        res.status(201).json({ message: 'Registrasi berhasil!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// Fungsi untuk Login User (ADA PERUBAHAN DI SINI)
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        // --- PERUBAHAN DIMULAI DI SINI ---
        // 4. Buat JWT Payload, sekarang kita sertakan role
        const payload = {
            id: user.id,
            nama: user.nama_lengkap,
            email: user.email,
            role: user.role // <-- TAMBAHKAN INI
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
        // --- PERUBAHAN SELESAI DI SINI ---

        res.status(200).json({
            message: 'Login berhasil!',
            token: token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};