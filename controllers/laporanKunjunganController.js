const pool = require('../config/database');
const ExcelJS = require('exceljs');

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
        await pool.query(query, values);
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

// ===== FUNGSI EXPORT YANG SUDAH DIPERBAIKI TOTAL =====
exports.exportLaporan = async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Laporan Kunjungan Agen');

        let query = `SELECT lka.*, u.nama_lengkap as nama_agen_pelapor FROM laporan_kunjungan_agen lka JOIN users u ON lka.user_id = u.id ORDER BY lka.tanggal DESC, lka.jam_kunjungan DESC`;
        const [rows] = await pool.query(query);

        worksheet.columns = [
            // { header: 'Agen Pelapor', key: 'nama_agen_pelapor', width: 25 },
            { header: 'Tanggal', key: 'tanggal', width: 15, style: { numFmt: 'dd/mm/yyyy' } },
            { header: 'Jam Kunjungan', key: 'jam_kunjungan', width: 15 },
            { header: 'Nama Agen Dikunjungi', key: 'nama_agen_dikunjungi', width: 25 },
            { header: 'Nomor HP', key: 'nomor_hp', width: 20 },
            { header: 'Outlet', key: 'outlet', width: 20 },
            { header: 'Keterangan Kunjungan', key: 'keterangan_kunjungan', width: 40 },
            { header: 'Ukuran Spanduk', key: 'ukuran_spanduk', width: 15 },
            { header: 'Benner', key: 'benner', width: 15 },
            { header: 'Tpt Brosur', key: 'tpt_brosur', width: 15 },
            { header: 'Lainnya', key: 'lainnya', width: 30 }
        ];

        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF008000' } };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        rows.forEach(row => {
            worksheet.addRow({
                ...row,
                tanggal: row.tanggal ? new Date(row.tanggal) : null,
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Laporan_Kunjungan_Agen_${new Date().toISOString().slice(0,10)}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat membuat file export.', error: error.message });
    }
};