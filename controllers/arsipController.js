// backend/controllers/arsipController.js

const pool = require('../config/database');
const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Folder 'uploads' harus ada di root backend
  },
  filename: function (req, file, cb) {
    // Buat nama file unik: timestamp + nama asli
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage }).single('file');

// @desc    Upload dokumen baru
// @route   POST /api/arsip/upload
// @access  Protected
exports.uploadDokumen = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: 'Gagal mengupload file.', error: err });
    }

    const { nama_dokumen, kategori, unit_kerja } = req.body;
    const { filename, path: filePath, size } = req.file;
    const uploader_id = req.user.id; // Ambil ID user yang login dari middleware protect

    if (!nama_dokumen || !kategori || !unit_kerja || !req.file) {
      return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    try {
      const [result] = await pool.query(
        'INSERT INTO arsip_dokumen (nama_dokumen, kategori, unit_kerja, uploader_id, file_path, file_size, file_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nama_dokumen, kategori, unit_kerja, uploader_id, filePath, size, filename]
      );
      res.status(201).json({
        success: true,
        message: 'Dokumen berhasil diupload.',
        data: { id: result.insertId }
      });
    } catch (error) {
      console.error('Error saat menyimpan data dokumen:', error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
  });
};

// @desc    Mengambil semua dokumen dengan filter
// @route   GET /api/arsip
// @access  Protected
exports.getAllDokumen = async (req, res) => {
  try {
    // Ambil query filter dari URL, contoh: /api/arsip?unit_kerja=UPC%20BANDAR%20BUAT
    const { unit_kerja, kategori } = req.query;

    let query = `
      SELECT a.id, a.nama_dokumen, a.kategori, a.unit_kerja, a.file_size, a.created_at, u.nama_lengkap as uploader
      FROM arsip_dokumen a
      JOIN users u ON a.uploader_id = u.id
    `;
    const params = [];

    if (unit_kerja || kategori) {
      query += ' WHERE';
      if (unit_kerja) {
        query += ' a.unit_kerja = ?';
        params.push(unit_kerja);
      }
      if (kategori) {
        if (unit_kerja) query += ' AND';
        query += ' a.kategori = ?';
        params.push(kategori);
      }
    }

    query += ' ORDER BY a.created_at DESC';

    const [dokumen] = await pool.query(query, params);
    res.status(200).json({
        success: true,
        data: dokumen
    });
  } catch (error) {
    console.error('Error saat mengambil data dokumen:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// @desc    Menghapus dokumen
// @route   DELETE /api/arsip/:id
// @access  Protected/Admin
exports.deleteDokumen = async (req, res) => {
    // Implementasi logika hapus file dari server dan database
    // (Bisa dikembangkan lebih lanjut)
    res.status(200).json({ success: true, message: 'Fitur hapus dalam pengembangan.' });
};