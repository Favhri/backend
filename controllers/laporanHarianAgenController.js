// controllers/laporanHarianAgenController.js
const pool = require('../config/database');

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
        const [result] = await pool.query(query, values);
        res.status(201).json({ success: true, message: 'Laporan harian berhasil disimpan.', data: { id: result.insertId } });
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

// @desc    Export Laporan Harian Agen ke Excel
// @route   GET /api/laporan-harian-agen/export
exports.exportLaporan = async (req, res) => {
    try {
        let query = `SELECT lha.*, u.nama_lengkap as nama_agen_pelapor 
                     FROM laporan_harian_agen lha 
                     JOIN users u ON lha.user_id = u.id`;
        const params = [];
        if (req.user.role !== 'admin') {
            query += ' WHERE lha.user_id = ?';
            params.push(req.user.id);
        }
        query += ' ORDER BY lha.tanggal DESC';
        const [laporanList] = await pool.query(query, params);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Laporan Harian Agen');

        // --- PERBAIKAN TOTAL DI SINI ---
        
        // Atur lebar kolom
        worksheet.columns = [
            { width: 12 }, { width: 15 }, { width: 20 }, { width: 30 }, { width: 15 }, 
            { width: 15 }, { width: 10 }, { width: 18 }, { width: 10 }, { width: 18 },
            { width: 10 }, { width: 18 }, { width: 20 }, { width: 10 }, { width: 18 },
            { width: 10 }, { width: 18 }
        ];

        // Header Baris 1
        worksheet.getCell('A1').value = 'TAHUN 2025';
        worksheet.mergeCells('A1:C1');
        worksheet.getCell('D1').value = 'CATAT JUMLAH';
        worksheet.mergeCells('D1:F1');
        worksheet.getCell('G1').value = 'CATATAN CLOSINGAN PRODUK';
        worksheet.mergeCells('G1:Q1');

        // Header Baris 2
        worksheet.getCell('G2').value = 'GADAI';
        worksheet.mergeCells('G2:H2');
        worksheet.getCell('I2').value = 'MULIA';
        worksheet.mergeCells('I2:J2');
        worksheet.getCell('K2').value = 'MIKRO';
        worksheet.mergeCells('K2:L2');
        worksheet.getCell('M2').value = 'LAINNYA';
        worksheet.mergeCells('M2:O2');
        worksheet.getCell('P2').value = 'JUMLAH CLOSINGAN';
        worksheet.mergeCells('P2:Q2');
        
        // Header Baris 3
        const headerRow3 = ['TGL', 'HARI', 'POSISI', 'KEGIATAN', 'PENDAFTARAN AGEN BARU', 'KUNJUNGAN AGEN', 'POT', 'OSL', 'POT', 'OSL', 'POT', 'OSL', 'NAMA PRODUK', 'POT', 'OSL', 'POT', 'OSL'];
        worksheet.addRow(headerRow3);

        // Styling dan merge untuk header vertikal
        worksheet.mergeCells('A2:A3'); worksheet.getCell('A2').value = 'TGL';
        worksheet.mergeCells('B2:B3'); worksheet.getCell('B2').value = 'HARI';
        worksheet.mergeCells('C2:C3'); worksheet.getCell('C2').value = 'POSISI';
        worksheet.mergeCells('D2:D3'); worksheet.getCell('D2').value = 'KEGIATAN';
        worksheet.mergeCells('E2:E3'); worksheet.getCell('E2').value = 'PENDAFTARAN AGEN BARU';
        worksheet.mergeCells('F2:F3'); worksheet.getCell('F2').value = 'KUNJUNGAN AGEN';
        
        // Style semua header
        for(let i=1; i<=3; i++) {
            worksheet.getRow(i).font = { bold: true };
            worksheet.getRow(i).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        }

        // Tambahkan data
        laporanList.forEach(laporan => {
            const totalPot = Number(laporan.gadai_pot || 0) + Number(laporan.mulia_pot || 0) + Number(laporan.mikro_pot || 0) + Number(laporan.lainnya_pot || 0);
            const totalOsl = Number(laporan.gadai_osl || 0) + Number(laporan.mulia_osl || 0) + Number(laporan.mikro_osl || 0) + Number(laporan.lainnya_osl || 0);
            worksheet.addRow([
                new Date(laporan.tanggal),
                laporan.hari,
                laporan.posisi,
                laporan.kegiatan,
                laporan.pendaftaran_agen_baru,
                laporan.kunjungan_agen,
                laporan.gadai_pot,
                Number(laporan.gadai_osl),
                laporan.mulia_pot,
                Number(laporan.mulia_osl),
                laporan.mikro_pot,
                Number(laporan.mikro_osl),
                laporan.lainnya_nama_produk,
                laporan.lainnya_pot,
                Number(laporan.lainnya_osl),
                totalPot,
                totalOsl,
            ]);
        });
        
        // Format kolom
        worksheet.getColumn('A').numFmt = 'dd-mmm-yyyy';
        ['H', 'J', 'L', 'O', 'Q'].forEach(col => { worksheet.getColumn(col).numFmt = '"Rp"#,##0'; });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Laporan_Harian_Agen_${Date.now()}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error saat export laporan harian agen:', error);
        res.status(500).json({ message: 'Gagal mengekspor data.' });
    }
};