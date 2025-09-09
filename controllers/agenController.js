// favhri/backend/backend-aaa26a42e2e9a370ca84fd6781c628f03a411c6b/controllers/agenController.js

const pool = require('../config/database');

const nullIfEmpty = value => (value === '' || value === undefined) ? null : value;

// @desc    Membuat data agen baru
exports.createAgen = async (req, res) => {
    const { id_agen, nama_agen, nik, tanggal } = req.body;
    if (!id_agen || !nama_agen || !nik || !tanggal) {
        return res.status(400).json({ message: 'ID Agen, Nama Agen, NIK, dan Tanggal wajib diisi.' });
    }
    try {
        const query = `
            INSERT INTO agen (
                tanggal, outlet, id_agen, cif, nama_agen, 
                tgl_pengajuan, tgl_activate, nama_usaha, tipe_agen, 
                referral_agen, nik, nama_mitra_agen
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            req.body.tanggal,
            nullIfEmpty(req.body.outlet),
            req.body.id_agen,
            nullIfEmpty(req.body.cif),
            req.body.nama_agen,
            nullIfEmpty(req.body.tgl_pengajuan),
            nullIfEmpty(req.body.tgl_activate),
            nullIfEmpty(req.body.nama_usaha),
            nullIfEmpty(req.body.tipe_agen),
            nullIfEmpty(req.body.referral_agen),
            req.body.nik,
            nullIfEmpty(req.body.nama_mitra_agen)
        ];
        const [result] = await pool.query(query, values);
        res.status(201).json({ success: true, message: 'Data agen baru berhasil ditambahkan.', data: { id: result.insertId } });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') { return res.status(409).json({ message: 'ID Agen atau NIK sudah terdaftar.' }); }
        console.error('Error saat membuat agen:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// @desc    Mengambil semua data agen
exports.getAllAgen = async (req, res) => {
    try {
        const [agenList] = await pool.query('SELECT * FROM agen ORDER BY tanggal DESC');
        res.status(200).json({ success: true, data: agenList });
    } catch (error) {
        console.error('Error saat mengambil data agen:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// @desc    Mengupdate data agen
exports.updateAgen = async (req, res) => {
    const { id } = req.params;
    const { id_agen, nama_agen, nik, tanggal } = req.body;
    if (!id_agen || !nama_agen || !nik || !tanggal) {
        return res.status(400).json({ message: 'ID Agen, Nama Agen, NIK, dan Tanggal wajib diisi.' });
    }
    try {
        const query = `
            UPDATE agen SET 
                tanggal = ?, outlet = ?, id_agen = ?, cif = ?, nama_agen = ?, 
                tgl_pengajuan = ?, tgl_activate = ?, nama_usaha = ?, tipe_agen = ?, 
                referral_agen = ?, nik = ?, nama_mitra_agen = ?
            WHERE id = ?
        `;
        const values = [
            req.body.tanggal,
            nullIfEmpty(req.body.outlet),
            req.body.id_agen,
            nullIfEmpty(req.body.cif),
            req.body.nama_agen,
            nullIfEmpty(req.body.tgl_pengajuan),
            nullIfEmpty(req.body.tgl_activate),
            nullIfEmpty(req.body.nama_usaha),
            nullIfEmpty(req.body.tipe_agen),
            nullIfEmpty(req.body.referral_agen),
            req.body.nik,
            nullIfEmpty(req.body.nama_mitra_agen),
            id
        ];
        const [result] = await pool.query(query, values);
        if (result.affectedRows === 0) { return res.status(404).json({ message: 'Data agen tidak ditemukan.' }); }
        res.status(200).json({ success: true, message: 'Data agen berhasil diperbarui.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') { return res.status(409).json({ message: 'ID Agen atau NIK sudah digunakan.' }); }
        console.error('Error saat update agen:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// @desc    Menghapus data agen
exports.deleteAgen = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM agen WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Data agen tidak ditemukan.' });
        }
        res.status(200).json({ success: true, message: 'Data agen berhasil dihapus.' });
    } catch (error) {
        console.error('Error saat menghapus agen:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};