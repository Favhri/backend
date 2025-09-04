// backend/controllers/cutiController.js

const pool = require('../config/database');

/**
 * @desc    Mengambil semua data cuti
 * @route   GET /api/cuti
 * @access  Protected
 */
exports.getAllCuti = async (req, res) => {
    try {
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
    const { pegawai, NIK, jenis, tanggalMulai, tanggalSelesai, durasi, alasan } = req.body;

    if (!pegawai || !NIK || !jenis || !tanggalMulai || !tanggalSelesai || !durasi || !alasan) {
        return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    try {
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

// --- FUNGSI BARU UNTUK UPDATE ---
/**
 * @desc    Admin mengupdate data cuti
 * @route   PUT /api/cuti/:id
 * @access  Protected
 */
exports.updateCuti = async (req, res) => {
    const { id } = req.params;
    const { pegawai, NIK, jenis, tanggalMulai, tanggalSelesai, durasi, alasan } = req.body;

    if (!pegawai || !NIK || !jenis || !tanggalMulai || !tanggalSelesai || !durasi || !alasan) {
        return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE cuti SET pegawai = ?, NIK = ?, jenis = ?, tanggalMulai = ?, tanggalSelesai = ?, durasi = ?, alasan = ? WHERE id = ?',
            [pegawai, NIK, jenis, tanggalMulai, tanggalSelesai, durasi, alasan, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Data cuti tidak ditemukan.' });
        }

        res.status(200).json({
            success: true,
            message: 'Data cuti berhasil diperbarui.'
        });
    } catch (error) {
        console.error('Error saat update data cuti:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// --- FUNGSI BARU UNTUK DELETE ---
/**
 * @desc    Admin menghapus data cuti
 * @route   DELETE /api/cuti/:id
 * @access  Protected
 */
exports.deleteCuti = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM cuti WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Data cuti tidak ditemukan.' });
        }

        res.status(200).json({
            success: true,
            message: 'Data cuti berhasil dihapus.'
        });
    } catch (error) {
        console.error('Error saat menghapus data cuti:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};