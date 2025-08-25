const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Middleware untuk memeriksa apakah user sudah login (punya token valid)
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Ambil token dari header (Bentuknya: "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // Verifikasi token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Ambil data user dari DB berdasarkan id di token, dan sisipkan ke object req
            // Kita tidak ambil password
            const [users] = await pool.query('SELECT id, nama_lengkap, email, role FROM users WHERE id = ?', [decoded.id]);
            req.user = users[0];

            next(); // Lanjut ke proses selanjutnya
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Tidak terotentikasi, token gagal' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Tidak terotentikasi, tidak ada token' });
    }
};

// Middleware untuk memeriksa role user
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `User dengan role '${req.user.role}' tidak diizinkan untuk mengakses rute ini` 
            });
        }
        next();
    };
};