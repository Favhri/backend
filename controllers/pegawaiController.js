// backend/controllers/pegawaiController.js

const pool = require('../config/database');

// @desc    Mengambil semua data pegawai
exports.getAllPegawai = async (req, res) => {
    try {
        const [pegawai] = await pool.query('SELECT * FROM pegawai ORDER BY nama_lengkap ASC');
        res.status(200).json({
            success: true,
            data: pegawai
        });
    } catch (error) {
        console.error('Error saat mengambil data pegawai:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// @desc    Membuat data pegawai baru
exports.createPegawai = async (req, res) => {
    const { nama_lengkap, NIK, jabatan, unit_kerja } = req.body;
    if (!nama_lengkap || !NIK) {
        return res.status(400).json({ message: 'Nama lengkap dan NIK wajib diisi.' });
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO pegawai (nama_lengkap, NIK, jabatan, unit_kerja) VALUES (?, ?, ?, ?)',
            [nama_lengkap, NIK, jabatan, unit_kerja]
        );
        res.status(201).json({
            success: true,
            message: 'Data pegawai baru berhasil ditambahkan.',
            data: { id: result.insertId }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'NIK sudah terdaftar.' });
        }
        console.error('Error saat membuat data pegawai:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// --- FUNGSI BARU: UPDATE PEGAWAI ---
// @desc    Mengupdate data pegawai
// @route   PUT /api/pegawai/:id
// @access  Protected/Admin
exports.updatePegawai = async (req, res) => {
    const { id } = req.params;
    const { nama_lengkap, NIK, jabatan, unit_kerja } = req.body;

    if (!nama_lengkap || !NIK) {
        return res.status(400).json({ message: 'Nama lengkap dan NIK wajib diisi.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE pegawai SET nama_lengkap = ?, NIK = ?, jabatan = ?, unit_kerja = ? WHERE id = ?',
            [nama_lengkap, NIK, jabatan, unit_kerja, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pegawai tidak ditemukan.' });
        }

        res.status(200).json({
            success: true,
            message: 'Data pegawai berhasil diperbarui.'
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'NIK sudah digunakan oleh pegawai lain.' });
        }
        console.error('Error saat update pegawai:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// --- FUNGSI BARU: DELETE PEGAWAI ---
// @desc    Menghapus data pegawai
// @route   DELETE /api/pegawai/:id
// @access  Protected/Admin
exports.deletePegawai = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM pegawai WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pegawai tidak ditemukan.' });
        }

        res.status(200).json({
            success: true,
            message: 'Data pegawai berhasil dihapus.'
        });
    } catch (error) {
        console.error('Error saat menghapus pegawai:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};