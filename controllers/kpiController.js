// favhri/backend/backend-fe66384412b0eefb2f8b3cd7d46eee060a4fa6be/controllers/kpiController.js

const pool = require('../config/database');
const ExcelJS = require('exceljs');

// @desc    Membuat data Monev KPI baru
// @route   POST /api/kpi
// @access  Protected
exports.createKpi = async (req, res) => {
    const {
        tanggal, unit_kerja, nasabah_baru, nasabah_existing, nasabah_akun, nasabah_transaksi,
        pds_umi_corner, g24, antam, mte, deposito_emas, gte_kte, mikro,
        disbursement, agen
    } = req.body;
    const user_id = req.user.id;

    if (!tanggal || !unit_kerja) {
        return res.status(400).json({ message: 'Tanggal dan Unit Kerja wajib diisi.' });
    }

    try {
        const query = `
            INSERT INTO monev_kpi (
                tanggal, unit_kerja, user_id, nasabah_baru, nasabah_existing, nasabah_akun, 
                nasabah_transaksi, pds_umi_corner, g24, antam, mte, deposito_emas, 
                gte_kte, mikro, disbursement, agen
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            tanggal, unit_kerja, user_id,
            nasabah_baru || 0, nasabah_existing || 0, nasabah_akun || 0, nasabah_transaksi || 0,
            pds_umi_corner || 0, g24 || 0, antam || 0, mte || 0, deposito_emas || 0,
            gte_kte || 0, mikro || 0, disbursement || 0, agen || 0
        ];

        await pool.query(query, values);
        res.status(201).json({ success: true, message: 'Data Monev KPI berhasil disimpan.' });
    } catch (error) {
        console.error('Error saat menyimpan Monev KPI:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// @desc    Mengambil semua data Monev KPI
// @route   GET /api/kpi
// @access  Protected
exports.getAllKpi = async (req, res) => {
    try {
        const query = `
            SELECT k.*, u.nama_lengkap as penginput
            FROM monev_kpi k
            JOIN users u ON k.user_id = u.id
            ORDER BY k.tanggal DESC, k.unit_kerja ASC
        `;
        const [kpiList] = await pool.query(query);
        res.status(200).json({ success: true, data: kpiList });
    } catch (error) {
        console.error('Error saat mengambil data Monev KPI:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// @desc    Export data Monev KPI ke Excel
// @route   GET /api/kpi/export
// @access  Protected
exports.exportKpi = async (req, res) => {
    try {
        const query = `
            SELECT k.*, u.nama_lengkap as penginput
            FROM monev_kpi k
            JOIN users u ON k.user_id = u.id
            ORDER BY k.tanggal DESC, k.unit_kerja ASC
        `;
        const [kpiList] = await pool.query(query);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Monev KPI Area');

        // Define columns based on your header image
        worksheet.columns = [
            { header: 'UNIT KERJA', key: 'unit_kerja', width: 15 },
            { header: 'TGL', key: 'tanggal', width: 12 },
            { header: 'NASABAH BARU', key: 'nasabah_baru', width: 15 },
            { header: 'EXISTING', key: 'nasabah_existing', width: 12 },
            { header: 'AKUN', key: 'nasabah_akun', width: 10 },
            { header: 'TRANSAKSI', key: 'nasabah_transaksi', width: 15 },
            { header: 'PDS UMI CORNER (Rp)', key: 'pds_umi_corner', width: 20 },
            { header: 'G24 (gr)', key: 'g24', width: 10 },
            { header: 'ANTAM (gr)', key: 'antam', width: 10 },
            { header: 'MTE (gr)', key: 'mte', width: 10 },
            { header: 'DEPOSITO EMAS (gr)', key: 'deposito_emas', width: 20 },
            { header: 'GTE & KTE (Rp)', key: 'gte_kte', width: 15 },
            { header: 'MIKRO (Rp)', key: 'mikro', width: 15 },
            { header: 'DISBURSEMENT (Rp)', key: 'disbursement', width: 20 },
            { header: 'AGEN (Rp)', key: 'agen', width: 12 },
            { header: 'PENGINPUT', key: 'penginput', width: 20 },
        ];

        // Add rows with data
        kpiList.forEach(kpi => {
            worksheet.addRow({
                unit_kerja: kpi.unit_kerja,
                tanggal: new Date(kpi.tanggal).toLocaleDateString('id-ID'),
                nasabah_baru: kpi.nasabah_baru,
                nasabah_existing: kpi.nasabah_existing,
                nasabah_akun: kpi.nasabah_akun,
                nasabah_transaksi: kpi.nasabah_transaksi,
                pds_umi_corner: parseFloat(kpi.pds_umi_corner),
                g24: parseFloat(kpi.g24),
                antam: parseFloat(kpi.antam),
                mte: parseFloat(kpi.mte),
                deposito_emas: parseFloat(kpi.deposito_emas),
                gte_kte: parseFloat(kpi.gte_kte),
                mikro: parseFloat(kpi.mikro),
                disbursement: parseFloat(kpi.disbursement),
                agen: parseFloat(kpi.agen),
                penginput: kpi.penginput
            });
        });

        // Set header and send file
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=Monev_KPI_Area_${new Date().toISOString().slice(0,10)}.xlsx`
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error saat export Monev KPI:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server saat export.' });
    }
};