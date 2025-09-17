// controllers/laporanKunjunganController.js
const pool = require('../config/database');

exports.createLaporan = async (req, res) => {
    const user_id = req.user.id;
    const { tanggal, jamKunjungan, namaAgen, nomorHp, outlet, keteranganKunjungan, ukuranSpanduk, benner, tptBrosur, lainnya } = req.body;
    if (!tanggal || !jamKunjungan || !namaAgen) {
        return res.status(400).json({ message: 'Tanggal, Jam Kunjungan, dan Nama Agen wajib diisi.' });
    }
    try {
        const query = `
            INSERT INTO laporan_kunjungan_agen (user_id, tanggal, jam_kunjungan, nama_agen_dikunjungi, nomor_hp, outlet, keterangan_kunjungan, ukuran_spanduk, benner, tpt_brosur, lainnya) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [user_id, tanggal, jamKunjungan, namaAgen, nomorHp, outlet, keteranganKunjungan, ukuranSpanduk, benner, tptBrosur, lainnya];
        const [result] = await pool.query(query, values);
        res.status(201).json({ success: true, message: 'Laporan kunjungan berhasil disimpan.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

exports.getAllLaporan = async (req, res) => {
    try {
        let query = `SELECT lka.*, u.nama_lengkap as nama_agen_pelapor FROM laporan_kunjungan_agen lka JOIN users u ON lka.user_id = u.id`;
        const params = [];
        if (req.user.role !== 'admin') {
            query += ' WHERE lka.user_id = ?';
            params.push(req.user.id);
        }
        query += ' ORDER BY lka.tanggal DESC, lka.jam_kunjungan DESC';
        const [laporanList] = await pool.query(query, params);
        res.status(200).json({ success: true, data: laporanList });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

exports.updateLaporan = async (req, res) => {
    const { id } = req.params;
    const { tanggal, jamKunjungan, namaAgen, nomorHp, outlet, keteranganKunjungan, ukuranSpanduk, benner, tptBrosur, lainnya } = req.body;
    try {
        const query = `
            UPDATE laporan_kunjungan_agen SET tanggal = ?, jam_kunjungan = ?, nama_agen_dikunjungi = ?, nomor_hp = ?, outlet = ?, keterangan_kunjungan = ?, ukuran_spanduk = ?, benner = ?, tpt_brosur = ?, lainnya = ?
            WHERE id = ?`;
        const values = [tanggal, jamKunjungan, namaAgen, nomorHp, outlet, keteranganKunjungan, ukuranSpanduk, benner, tptBrosur, lainnya, id];
        const [result] = await pool.query(query, values);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Laporan tidak ditemukan.' });
        res.status(200).json({ success: true, message: 'Laporan berhasil diperbarui.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

exports.deleteLaporan = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM laporan_kunjungan_agen WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Laporan tidak ditemukan.' });
        res.status(200).json({ success: true, message: 'Laporan berhasil dihapus.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// @desc    Export Laporan Kunjungan ke Excel
// @route   GET /api/laporan-kunjungan/export
exports.exportLaporan = async (req, res) => {
    try {
        let query = `SELECT lka.*, u.nama_lengkap as nama_agen_pelapor
                     FROM laporan_kunjungan_agen lka
                     JOIN users u ON lka.user_id = u.id`;
        const params = [];

        if (req.user.role !== 'admin') {
            query += ' WHERE lka.user_id = ?';
            params.push(req.user.id);
        }
        query += ' ORDER BY lka.tanggal DESC, lka.jam_kunjungan DESC';
        
        const [laporanList] = await pool.query(query, params);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Laporan Kunjungan');

        // --- PERBAIKAN UTAMA DI SINI ---

        // Atur lebar kolom
        worksheet.columns = [
            { width: 12 }, { width: 15 }, { width: 25 }, { width: 18 }, { width: 20 },
            { width: 30 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 30 }
        ];
        
        // Header Baris 1
        worksheet.getCell('G1').value = 'CATATAN BRANDING';
        worksheet.mergeCells('G1:J1');

        // Header Baris 2
        const headerRow2 = ['TGL', 'JAM KUNJUNGAN', 'NAMA AGEN', 'NOMOR HP', 'OUTLET', 'KETERANGAN KUNJUNGAN', 'UKURAN SPANDUK', 'BENNER', 'TPT BROSUR', 'LAINNYA'];
        worksheet.addRow(headerRow2);
        
        // Styling header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(2).font = { bold: true };
        worksheet.getRow(2).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };


        // Menambahkan data
        laporanList.forEach(laporan => {
            worksheet.addRow([
                new Date(laporan.tanggal),
                laporan.jam_kunjungan,
                laporan.nama_agen_dikunjungi,
                laporan.nomor_hp,
                laporan.outlet,
                laporan.keterangan_kunjungan,
                laporan.ukuran_spanduk,
                laporan.benner,
                laporan.tpt_brosur,
                laporan.lainnya,
            ]);
        });
        
        // Format kolom
        worksheet.getColumn('A').numFmt = 'dd-mmm-yyyy';

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Laporan_Kunjungan_Agen_${Date.now()}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error saat export laporan kunjungan:', error);
        res.status(500).json({ message: 'Gagal mengekspor data.' });
    }
};