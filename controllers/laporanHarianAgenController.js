const pool = require('../config/database');
const ExcelJS = require('exceljs');

exports.createLaporan = async (req, res) => {
    const user_id = req.user.id;
    const { tanggal, hari, posisi, kegiatan, pendaftaranAgenBaru, kunjunganAgen, gadaiPot, gadaiOsl, muliaPot, muliaOsl, mikroPot, mikroOsl, lainnyaNamaProduk, lainnyaPot, lainnyaOsl } = req.body;
    if (!tanggal || !hari || !posisi) {
        return res.status(400).json({ message: 'Tanggal, Hari, dan Posisi wajib diisi.' });
    }
    try {
        const query = `
            INSERT INTO laporan_harian_agen (user_id, tanggal, hari, posisi, kegiatan, pendaftaran_agen_baru, kunjungan_agen, gadai_pot, gadai_osl, mulia_pot, mulia_osl, mikro_pot, mikro_osl, lainnya_nama_produk, lainnya_pot, lainnya_osl) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [user_id, tanggal, hari, posisi, kegiatan, pendaftaranAgenBaru || 0, kunjunganAgen || 0, gadaiPot || 0, gadaiOsl || 0, muliaPot || 0, muliaOsl || 0, mikroPot || 0, mikroOsl || 0, lainnyaNamaProduk, lainnyaPot || 0, lainnyaOsl || 0];
        await pool.query(query, values);
        res.status(201).json({ success: true, message: 'Laporan harian berhasil disimpan.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

exports.getAllLaporan = async (req, res) => {
    try {
        let query = `SELECT lha.*, u.nama_lengkap as nama_agen_pelapor FROM laporan_harian_agen lha JOIN users u ON lha.user_id = u.id`;
        const params = [];
        if (req.user.role !== 'admin') {
            query += ' WHERE lha.user_id = ?';
            params.push(req.user.id);
        }
        query += ' ORDER BY lha.tanggal DESC';
        const [laporanList] = await pool.query(query, params);
        res.status(200).json({ success: true, data: laporanList });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

exports.updateLaporan = async (req, res) => {
    const { id } = req.params;
    const { tanggal, hari, posisi, kegiatan, pendaftaranAgenBaru, kunjunganAgen, gadaiPot, gadaiOsl, muliaPot, muliaOsl, mikroPot, mikroOsl, lainnyaNamaProduk, lainnyaPot, lainnyaOsl } = req.body;
    try {
        const query = `
            UPDATE laporan_harian_agen SET tanggal = ?, hari = ?, posisi = ?, kegiatan = ?, pendaftaran_agen_baru = ?, kunjungan_agen = ?, gadai_pot = ?, gadai_osl = ?, mulia_pot = ?, mulia_osl = ?, mikro_pot = ?, mikro_osl = ?, lainnya_nama_produk = ?, lainnya_pot = ?, lainnya_osl = ?
            WHERE id = ?`;
        const values = [tanggal, hari, posisi, kegiatan, pendaftaranAgenBaru, kunjunganAgen, gadaiPot, gadaiOsl, muliaPot, muliaOsl, mikroPot, mikroOsl, lainnyaNamaProduk, lainnyaPot, lainnyaOsl, id];
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
        const [result] = await pool.query('DELETE FROM laporan_harian_agen WHERE id = ?', [id]);
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
        const worksheet = workbook.addWorksheet('Laporan Harian Agen');

        let query = `SELECT lha.*, u.nama_lengkap as nama_agen_pelapor FROM laporan_harian_agen lha JOIN users u ON lha.user_id = u.id ORDER BY lha.tanggal DESC`;
        const [rows] = await pool.query(query);

        worksheet.columns = [
            // { header: 'Agen Pelapor', key: 'nama_agen_pelapor', width: 25 },
            { header: 'Tanggal', key: 'tanggal', width: 15, style: { numFmt: 'dd/mm/yyyy' } },
            { header: 'Hari', key: 'hari', width: 15 },
            { header: 'Posisi', key: 'posisi', width: 20 },
            { header: 'Kegiatan', key: 'kegiatan', width: 40 },
            { header: 'Agen Baru', key: 'pendaftaran_agen_baru', width: 15 },
            { header: 'Kunjungan', key: 'kunjungan_agen', width: 15 },
            { header: 'Gadai POT', key: 'gadai_pot', width: 10 },
            { header: 'Gadai OSL', key: 'gadai_osl', width: 20, style: { numFmt: '"Rp"#,##0' } },
            { header: 'Mulia POT', key: 'mulia_pot', width: 10 },
            { header: 'Mulia OSL', key: 'mulia_osl', width: 20, style: { numFmt: '"Rp"#,##0' } },
            { header: 'Mikro POT', key: 'mikro_pot', width: 10 },
            { header: 'Mikro OSL', key: 'mikro_osl', width: 20, style: { numFmt: '"Rp"#,##0' } },
            { header: 'Lainnya Produk', key: 'lainnya_nama_produk', width: 25 },
            { header: 'Lainnya POT', key: 'lainnya_pot', width: 10 },
            { header: 'Lainnya OSL', key: 'lainnya_osl', width: 20, style: { numFmt: '"Rp"#,##0' } },
            { header: 'Total POT', key: 'total_pot', width: 15, style: { font: { bold: true } } },
            { header: 'Total OSL', key: 'total_osl', width: 20, style: { numFmt: '"Rp"#,##0', font: { bold: true } } },
        ];
        
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF008000' } };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        rows.forEach(row => {
            const totalPot = (parseFloat(row.gadai_pot) || 0) + (parseFloat(row.mulia_pot) || 0) + (parseFloat(row.mikro_pot) || 0) + (parseFloat(row.lainnya_pot) || 0);
            const totalOsl = (parseFloat(row.gadai_osl) || 0) + (parseFloat(row.mulia_osl) || 0) + (parseFloat(row.mikro_osl) || 0) + (parseFloat(row.lainnya_osl) || 0);
            
            worksheet.addRow({
                ...row,
                tanggal: row.tanggal ? new Date(row.tanggal) : null,
                pendaftaran_agen_baru: parseFloat(row.pendaftaran_agen_baru) || 0,
                kunjungan_agen: parseFloat(row.kunjungan_agen) || 0,
                gadai_pot: parseFloat(row.gadai_pot) || 0,
                gadai_osl: parseFloat(row.gadai_osl) || 0,
                mulia_pot: parseFloat(row.mulia_pot) || 0,
                mulia_osl: parseFloat(row.mulia_osl) || 0,
                mikro_pot: parseFloat(row.mikro_pot) || 0,
                mikro_osl: parseFloat(row.mikro_osl) || 0,
                lainnya_pot: parseFloat(row.lainnya_pot) || 0,
                lainnya_osl: parseFloat(row.lainnya_osl) || 0,
                total_pot: totalPot,
                total_osl: totalOsl
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Laporan_Harian_Agen_${new Date().toISOString().slice(0,10)}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat membuat file export.', error: error.message });
    }
};