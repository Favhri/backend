const pool = require('../config/database');

// @desc    Mengambil semua data pegawai dengan paginasi
exports.getAllPegawai = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const [pegawai] = await pool.query(
            'SELECT * FROM pegawai ORDER BY nama_lengkap ASC LIMIT ? OFFSET ?',
            [limit, offset]
        );

        const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM pegawai');
        const totalPegawai = totalResult[0].total;
        const totalPages = Math.ceil(totalPegawai / limit);

        res.status(200).json({
            success: true,
            data: pegawai,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalPegawai: totalPegawai
            }
        });
    } catch (error) {
        console.error('Error saat mengambil data pegawai:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// @desc    Membuat data pegawai baru
exports.createPegawai = async (req, res) => {
    try {
        const { nama_lengkap, NIK, jabatan, unit_kerja } = req.body;
        if (!nama_lengkap || !NIK || !jabatan || !unit_kerja) {
            return res.status(400).json({ message: 'Semua field harus diisi' });
        }
        await pool.query(
            'INSERT INTO pegawai (nama_lengkap, NIK, jabatan, unit_kerja) VALUES (?, ?, ?, ?)',
            [nama_lengkap, NIK, jabatan, unit_kerja]
        );
        res.status(201).json({ success: true, message: 'Data pegawai berhasil ditambahkan' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// @desc    Mengupdate data pegawai
exports.updatePegawai = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_lengkap, NIK, jabatan, unit_kerja } = req.body;
        await pool.query(
            'UPDATE pegawai SET nama_lengkap = ?, NIK = ?, jabatan = ?, unit_kerja = ? WHERE id_pegawai = ?',
            [nama_lengkap, NIK, jabatan, unit_kerja, id] // <-- PERBAIKAN DI SINI
        );
        res.status(200).json({ success: true, message: 'Data pegawai berhasil diupdate' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// @desc    Menghapus data pegawai
exports.deletePegawai = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM pegawai WHERE id_pegawai = ?', [id]);
        res.status(200).json({ success: true, message: 'Data pegawai berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};