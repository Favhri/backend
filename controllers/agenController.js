const pool = require('../config/database');

exports.createAgen = async (req, res) => {
    // 1. Ambil semua data dari body request
    const {
        tanggal,
        cabang,
        outlet,
        id_agen,
        cif,
        nama_agen,
        tgl_pengajuan,
        tgl_activate,
        nama_usaha,
        tipe_agen,
        referral_agen,
        nik,
        nama_mitra_agen,
        status
    } = req.body;

    // 2. Validasi input dasar (yang wajib diisi)
    if (!tanggal || !id_agen || !nama_agen || !nik) {
        return res.status(400).json({ message: 'Field tanggal, ID Agen, Nama Agen, dan NIK wajib diisi.' });
    }

    try {
        // 3. Query untuk memasukkan data ke tabel 'agen'
        const query = `
            INSERT INTO agen (
                tanggal, cabang, outlet, id_agen, cif, nama_agen, 
                tgl_pengajuan, tgl_activate, nama_usaha, tipe_agen, 
                referral_agen, nik, nama_mitra_agen, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            tanggal, cabang, outlet, id_agen, cif, nama_agen, 
            tgl_pengajuan, tgl_activate, nama_usaha, tipe_agen, 
            referral_agen, nik, nama_mitra_agen, status
        ];

        const [result] = await pool.query(query, values);

        // 4. Kirim respons sukses
        res.status(201).json({
            message: 'Agen baru berhasil ditambahkan!',
            agenId: result.insertId
        });

    } catch (error) {
        // 5. Tangani error (misalnya: id_agen atau nik duplikat)
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Gagal menambahkan agen. ID Agen atau NIK sudah terdaftar.' });
        }
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};