// favhri/backend/backend-e3d9d5c539d6de3679e5b9734f42a8acf1ea2583/controllers/laporanController.js

const pool = require('../config/database');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// [fungsi createLaporan dan getAllLaporan tetap sama]

exports.createLaporan = async (req, res) => {
    const { tanggal, unit_kerja, pencairan_gadai, pencairan_non_gadai, pencairan_emas, total_pelunasan, catatan } = req.body;
    const user_id = req.user.id;

    if (!tanggal || !unit_kerja) {
        return res.status(400).json({ message: 'Tanggal dan Unit Kerja wajib diisi.' });
    }

    try {
        const laporanData = {
            tanggal,
            unit_kerja,
            pencairan_gadai: pencairan_gadai || 0,
            pencairan_non_gadai: pencairan_non_gadai || 0,
            pencairan_emas: pencairan_emas || 0,
            total_pelunasan: total_pelunasan || 0,
            catatan: catatan || null,
            user_id
        };
        await pool.query('INSERT INTO laporan_harian SET ?', laporanData);
        res.status(201).json({ success: true, message: 'Laporan harian berhasil disimpan.' });
    } catch (error) {
        console.error('Error saat menyimpan laporan:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

exports.getAllLaporan = async (req, res) => {
    try {
        const { unit_kerja, tanggal_mulai, tanggal_akhir } = req.query;
        let query = `
            SELECT l.*, u.nama_lengkap as penginput
            FROM laporan_harian l
            JOIN users u ON l.user_id = u.id
        `;
        const params = [];
        const conditions = [];
        if (unit_kerja && unit_kerja !== 'Semua') { conditions.push('l.unit_kerja = ?'); params.push(unit_kerja); }
        if (tanggal_mulai) { conditions.push('l.tanggal >= ?'); params.push(tanggal_mulai); }
        if (tanggal_akhir) { conditions.push('l.tanggal <= ?'); params.push(tanggal_akhir); }
        if (conditions.length > 0) { query += ' WHERE ' + conditions.join(' AND '); }
        query += ' ORDER BY l.tanggal DESC, l.unit_kerja ASC';
        const [laporan] = await pool.query(query, params);
        res.status(200).json({ success: true, data: laporan });
    } catch (error) {
        console.error('Error saat mengambil laporan:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};


// @desc    Update laporan harian
exports.updateLaporan = async (req, res) => {
    const { id } = req.params;
    const { tanggal, unit_kerja, pencairan_gadai, pencairan_non_gadai, pencairan_emas, total_pelunasan, catatan } = req.body;

    if (!tanggal || !unit_kerja) {
        return res.status(400).json({ message: 'Tanggal dan Unit Kerja wajib diisi.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE laporan_harian SET tanggal = ?, unit_kerja = ?, pencairan_gadai = ?, pencairan_non_gadai = ?, pencairan_emas = ?, total_pelunasan = ?, catatan = ? WHERE id = ?',
            [tanggal, unit_kerja, pencairan_gadai || 0, pencairan_non_gadai || 0, pencairan_emas || 0, total_pelunasan || 0, catatan || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Laporan tidak ditemukan.' });
        }

        res.status(200).json({ success: true, message: 'Laporan berhasil diperbarui.' });
    } catch (error) {
        console.error('Error saat update laporan:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// @desc    Menghapus laporan harian
exports.deleteLaporan = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM laporan_harian WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Laporan tidak ditemukan.' });
        }
        res.status(200).json({ success: true, message: 'Laporan berhasil dihapus.' });
    } catch (error) {
        console.error('Error saat menghapus laporan:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// [fungsi exportLaporan tetap sama]
exports.exportLaporan = async (req, res) => {
    try {
        const [laporan] = await pool.query(`
            SELECT l.tanggal, l.unit_kerja, l.pencairan_gadai, l.pencairan_non_gadai, l.pencairan_emas, l.total_pelunasan, u.nama_lengkap as penginput
            FROM laporan_harian l
            JOIN users u ON l.user_id = u.id
            ORDER BY l.tanggal DESC, l.unit_kerja ASC
        `);
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Laporan Harian');

        // Definisikan header kolom
        worksheet.columns = [
            { header: 'Tanggal', key: 'tanggal', width: 15 },
            { header: 'Unit Kerja', key: 'unit_kerja', width: 25 },
            { header: 'Pencairan Gadai', key: 'pencairan_gadai', width: 20, style: { numFmt: '"Rp"#,##0' } },
            { header: 'Pencairan Non Gadai', key: 'pencairan_non_gadai', width: 20, style: { numFmt: '"Rp"#,##0' } },
            { header: 'Pencairan Emas', key: 'pencairan_emas', width: 20, style: { numFmt: '"Rp"#,##0' } },
            { header: 'Total Pencairan', key: 'total_pencairan', width: 20, style: { numFmt: '"Rp"#,##0' } },
            { header: 'Total Pelunasan', key: 'total_pelunasan', width: 20, style: { numFmt: '"Rp"#,##0' } },
            { header: 'Delta OSL', key: 'delta_osl', width: 20, style: { numFmt: '"Rp"#,##0' } },
            { header: 'Diinput Oleh', key: 'penginput', width: 25 },
        ];
        
        // Tambahkan data ke baris
        laporan.forEach(item => {
            const total_pencairan = parseFloat(item.pencairan_gadai) + parseFloat(item.pencairan_non_gadai) + parseFloat(item.pencairan_emas);
            const delta_osl = total_pencairan - parseFloat(item.total_pelunasan);
            worksheet.addRow({
                tanggal: new Date(item.tanggal),
                unit_kerja: item.unit_kerja,
                pencairan_gadai: parseFloat(item.pencairan_gadai),
                pencairan_non_gadai: parseFloat(item.pencairan_non_gadai),
                pencairan_emas: parseFloat(item.pencairan_emas),
                total_pencairan: total_pencairan,
                total_pelunasan: parseFloat(item.total_pelunasan),
                delta_osl: delta_osl,
                penginput: item.penginput
            });
        });

        // Styling header
        worksheet.getRow(1).font = { bold: true };
        
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=Laporan_Harian_${Date.now()}.xlsx`
        );

        // Tulis workbook ke response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error saat export laporan:', error);
        res.status(500).json({ message: 'Gagal mengekspor laporan.' });
    }
};