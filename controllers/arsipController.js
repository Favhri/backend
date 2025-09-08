// favhri/backend/backend-aaa26a42e2e9a370ca84fd6781c628f03a411c6b/controllers/arsipController.js

const pool = require('../config/database');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = 'uploads/';

// Cek dan buat folder 'uploads' jika belum ada
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalName = file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueSuffix + '-' + originalName);
  }
});

const upload = multer({ storage: storage }).single('file');

exports.uploadDokumen = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(500).json({ message: 'Gagal memproses upload file.', error: err });
    }
    if (!req.file) {
        return res.status(400).json({ message: 'File tidak ditemukan dalam request.' });
    }
    const { nama_dokumen, kategori, unit_kerja } = req.body;
    const { filename, path: filePath, size } = req.file;
    const uploader_id = req.user.id;
    if (!nama_dokumen || !kategori || !unit_kerja) {
      return res.status(400).json({ message: 'Nama dokumen, kategori, dan unit kerja wajib diisi.' });
    }
    try {
      await pool.query(
        'INSERT INTO arsip_dokumen (nama_dokumen, kategori, unit_kerja, uploader_id, file_path, file_size, file_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nama_dokumen, kategori, unit_kerja, uploader_id, filePath, size, filename]
      );
      res.status(201).json({ success: true, message: 'Dokumen berhasil diupload.' });
    } catch (error) {
      console.error('Error saat menyimpan data dokumen ke DB:', error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server saat menyimpan data.' });
    }
  });
};

exports.getAllDokumen = async (req, res) => {
  try {
    const { unit_kerja, kategori } = req.query;
    
    // ====> INI BAGIAN YANG DIPERBAIKI <====
    // Pastikan `a.file_name` ikut di-SELECT dalam query.
    let query = `
      SELECT a.id, a.nama_dokumen, a.kategori, a.unit_kerja, a.file_size, a.file_name, a.created_at, u.nama_lengkap as uploader
      FROM arsip_dokumen a
      JOIN users u ON a.uploader_id = u.id
    `;
    const params = [];
    const conditions = [];

    if (unit_kerja && unit_kerja !== 'Semua') {
      conditions.push('a.unit_kerja = ?');
      params.push(unit_kerja);
    }
    if (kategori && kategori !== 'Semua') {
      conditions.push('a.kategori = ?');
      params.push(kategori);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY a.created_at DESC';
    
    const [dokumen] = await pool.query(query, params);
    res.status(200).json({ success: true, data: dokumen });
  } catch (error) {
    console.error('Error saat mengambil data dokumen:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

exports.downloadDokumen = (req, res) => {
    const { fileName } = req.params;
    // Ambil path absolut ke folder 'uploads'
    const filePath = path.resolve(__dirname, '..', 'uploads', fileName);

    if (fs.existsSync(filePath)) {
        // res.download() otomatis set header Content-Disposition
        res.download(filePath);
    } else {
        res.status(404).send("File tidak ditemukan.");
    }
};

exports.deleteDokumen = (req, res) => {
    res.status(200).json({ success: true, message: 'Fitur hapus dalam pengembangan.' });
};