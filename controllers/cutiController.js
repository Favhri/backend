// backend/controllers/cutiController.js

const pool = require('../config/database');

/**
 * @desc    Mengambil semua data cuti
 * @route   GET /api/cuti
 * @access  Protected
 */
exports.getAllCuti = async (req, res) => {
    try {
        // Langsung ambil semua data cuti tanpa filter status
        const [cutiList] = await pool.query(
            "SELECT * FROM cuti ORDER BY tanggalMulai DESC"
        );

        res.status(200).json({
            success: true,
            count: cutiList.length,
            data: cutiList,
        });
    } catch (error) {
        console.error('Error saat mengambil data cuti:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

/**
 * @desc    Admin menginput data cuti baru
 * @route   POST /api/cuti
 * @access  Protected
 */
exports.createCuti = async (req, res) => {
    // Tidak ada lagi 'status'
    const { pegawai, NIK, jenis, tanggalMulai, tanggalSelesai, durasi, alasan } = req.body;

    if (!pegawai || !NIK || !jenis || !tanggalMulai || !tanggalSelesai || !durasi || !alasan) {
        return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    try {
        // Query INSERT tanpa kolom 'status'
        const [result] = await pool.query(
            'INSERT INTO cuti (pegawai, NIK, jenis, tanggalMulai, tanggalSelesai, durasi, alasan) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [pegawai, NIK, jenis, tanggalMulai, tanggalSelesai, durasi, alasan]
        );

        res.status(201).json({
            success: true,
            message: 'Data cuti baru berhasil ditambahkan.',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error saat membuat data cuti:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};