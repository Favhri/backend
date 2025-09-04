// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const pool = require('../config/database');

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const [users] = await pool.query('SELECT id, nama_lengkap, NIK, email, role FROM users WHERE id = ?', [decoded.id]);
            
            if (users.length === 0) {
                return res.status(401).json({ message: 'User yang terhubung dengan token ini tidak lagi ditemukan.' });
            }
            
            req.user = users[0];
            next();
        } catch (error) {
            // --- PERBAIKAN DI SINI ---
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Sesi telah berakhir, token kedaluwarsa.' });
            }
            console.error('Token verification failed:', error);
            return res.status(401).json({ message: 'Tidak terotentikasi, token tidak valid.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Tidak terotentikasi, tidak ada token.' });
    }
};

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