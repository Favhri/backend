const pool = require('../config/database');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Konfigurasi Multer untuk penyimpanan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.floor(Math.random() * 1000000000)}-${file.originalname}`);
  },
});

const upload = multer({ storage }).single('file');

exports.uploadDokumen = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: 'Gagal memproses upload file.', error: err });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'File tidak ditemukan.' });
    }

    // Ambil sub_kategori dari body
    const { nama_dokumen, kategori, sub_kategori, unit_kerja } = req.body;
    const { filename, path: filePath, size } = req.file;
    const uploader_id = req.user.id;

    if (!nama_dokumen || !kategori || !unit_kerja) {
      fs.unlinkSync(filePath); // Hapus file jika validasi gagal
      return res.status(400).json({ message: 'Nama dokumen, kategori, dan unit kerja wajib diisi.' });
    }
    
    // Validasi tambahan: jika kategori 'Bisnis', sub_kategori wajib diisi
    if (kategori === 'Bisnis' && (!sub_kategori || sub_kategori.trim() === '')) {
        fs.unlinkSync(filePath); // Hapus file jika validasi gagal
        return res.status(400).json({ message: 'Sub-kategori wajib diisi untuk kategori Bisnis.' });
    }

    try {
      // Simpan sub_kategori (atau null jika tidak ada) ke database
      await pool.query(
        'INSERT INTO arsip_dokumen (nama_dokumen, kategori, sub_kategori, unit_kerja, uploader_id, file_path, file_size, file_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [nama_dokumen, kategori, kategori === 'Bisnis' ? sub_kategori : null, unit_kerja, uploader_id, filePath, size, filename]
      );
      res.status(201).json({ success: true, message: 'Dokumen berhasil diupload.' });
    } catch (error) {
      console.error('Error DB saat upload:', error);
      fs.unlinkSync(filePath); // Hapus file jika ada error database
      res.status(500).json({ message: 'Gagal menyimpan data ke database.' });
    }
  });
};

exports.getAllDokumen = async (req, res) => {
  try {
    // Ambil sub_kategori dari query
    const { unit_kerja, kategori, sub_kategori } = req.query;
    
    let query = `
      SELECT a.id, a.nama_dokumen, a.kategori, a.sub_kategori, a.unit_kerja, a.file_size, a.file_name, a.created_at, u.nama_lengkap as uploader
      FROM arsip_dokumen a JOIN users u ON a.uploader_id = u.id
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
    
    // Tambahkan filter untuk sub_kategori
    if (kategori === 'Bisnis' && sub_kategori && sub_kategori !== 'Semua') {
        conditions.push('a.sub_kategori = ?');
        params.push(sub_kategori);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY a.created_at DESC';

    const [dokumen] = await pool.query(query, params);
    res.status(200).json({ success: true, data: dokumen });
  } catch (error) {
    console.error('Error saat get all dokumen:', error);
    res.status(500).json({ message: 'Gagal mengambil data dari server.' });
  }
};

exports.downloadDokumen = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT file_path, nama_dokumen FROM arsip_dokumen WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Dokumen tidak ditemukan di database.' });
    }

    const doc = rows[0];
    // Membuat path absolut dari root proyek ke file
    const filePath = path.resolve(doc.file_path);

    if (fs.existsSync(filePath)) {
      const fileExtension = path.extname(doc.nama_dokumen) || path.extname(filePath);
      const originalFilename = doc.nama_dokumen.endsWith(fileExtension)
        ? doc.nama_dokumen
        : `${doc.nama_dokumen}${fileExtension}`;
      
      // Menggunakan res.download dengan path absolut
      res.download(filePath, originalFilename, (err) => {
        if (err) {
          console.error('Error saat mengirim file:', err);
          res.status(500).send('Tidak dapat mengunduh file.');
        }
      });
    } else {
      res.status(404).send('File tidak ditemukan di server.');
    }
  } catch (error) {
    console.error('Error pada controller download dokumen:', error);
    res.status(500).json({ message: 'Gagal mengunduh dokumen.' });
  }
};

exports.deleteDokumen = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT file_path FROM arsip_dokumen WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Dokumen tidak ditemukan.' });
    }
    const filePath = rows[0].file_path;
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pool.query('DELETE FROM arsip_dokumen WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Dokumen berhasil dihapus.' });
  } catch (error) {
    console.error('Error saat hapus dokumen:', error);
    res.status(500).json({ message: 'Gagal menghapus dokumen.' });
  }
};