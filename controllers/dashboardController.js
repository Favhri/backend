// backend/controllers/dashboardController.js

const pool = require('../config/database');

// Statistik untuk Admin
exports.getAdminStats = async (req, res) => {
    try {
        const [totalAgen] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'agen'");
        const [totalLaporanHarian] = await pool.query("SELECT COUNT(*) as count FROM laporan_harian_agen WHERE DATE(created_at) = CURDATE()");
        const [totalLaporanKunjungan] = await pool.query("SELECT COUNT(*) as count FROM laporan_kunjungan_agen WHERE DATE(created_at) = CURDATE()");
        
        // Data untuk Grafik OSL 7 Hari Terakhir
        const [osl7Days] = await pool.query(`
            SELECT 
                DATE(created_at) as tanggal, 
                SUM(gadai_osl + mulia_osl + mikro_osl + lainnya_osl) as total_osl 
            FROM laporan_harian_agen 
            WHERE created_at >= CURDATE() - INTERVAL 7 DAY
            GROUP BY DATE(created_at)
            ORDER BY tanggal ASC;
        `);

        res.json({
            success: true,
            data: {
                totalAgen: totalAgen[0].count,
                totalLaporanHariIni: totalLaporanHarian[0].count + totalLaporanKunjungan[0].count,
                osl7Days: osl7Days,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Statistik untuk Agen
exports.getAgenStats = async (req, res) => {
    const userId = req.user.id;
    try {
        const [totalKunjunganBulanIni] = await pool.query("SELECT COUNT(*) as count FROM laporan_kunjungan_agen WHERE user_id = ? AND MONTH(tanggal) = MONTH(CURDATE()) AND YEAR(tanggal) = YEAR(CURDATE())", [userId]);
        
        const [totalOslBulanIniResult] = await pool.query(`
            SELECT SUM(gadai_osl + mulia_osl + mikro_osl + lainnya_osl) as total 
            FROM laporan_harian_agen 
            WHERE user_id = ? AND MONTH(tanggal) = MONTH(CURDATE()) AND YEAR(tanggal) = YEAR(CURDATE())`, [userId]);

        const [laporanTerakhir] = await pool.query(`
            (SELECT id, 'Harian' as jenis, tanggal FROM laporan_harian_agen WHERE user_id = ? ORDER BY tanggal DESC, created_at DESC LIMIT 3)
            UNION
            (SELECT id, 'Kunjungan' as jenis, tanggal FROM laporan_kunjungan_agen WHERE user_id = ? ORDER BY tanggal DESC, created_at DESC LIMIT 3)
            ORDER BY tanggal DESC LIMIT 5;
        `, [userId, userId]);

        res.json({
            success: true,
            data: {
                totalKunjungan: totalKunjunganBulanIni[0].count,
                totalOsl: totalOslBulanIniResult[0].total || 0,
                laporanTerakhir,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Statistik untuk User/Pegawai (Mirip Agen, tapi bisa dikembangkan)
exports.getUserStats = async (req, res) => {
    // Untuk sekarang kita samakan dengan agen, nanti bisa dikembangkan
    // Misalnya menambahkan data cuti, dll.
    const userId = req.user.id;
    try {
         const [totalKunjunganBulanIni] = await pool.query("SELECT COUNT(*) as count FROM laporan_kunjungan_agen WHERE user_id = ? AND MONTH(tanggal) = MONTH(CURDATE()) AND YEAR(tanggal) = YEAR(CURDATE())", [userId]);
        
        const [totalOslBulanIniResult] = await pool.query(`
            SELECT SUM(gadai_osl + mulia_osl + mikro_osl + lainnya_osl) as total 
            FROM laporan_harian_agen 
            WHERE user_id = ? AND MONTH(tanggal) = MONTH(CURDATE()) AND YEAR(tanggal) = YEAR(CURDATE())`, [userId]);
        
        res.json({
            success: true,
            data: {
                totalKunjungan: totalKunjunganBulanIni[0].count,
                totalOsl: totalOslBulanIniResult[0].total || 0,
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getUserChartData = async (req, res) => {
    try {
        // Query untuk Monev KPI Area (Bar Chart)
        // PENDEKATAN BARU YANG LEBIH AMAN: Menggunakan 'posisi' dari tabel laporan langsung.
        const [kpiData] = await pool.query(`
            SELECT 
                posisi AS area, 
                SUM(gadai_osl + mulia_osl + mikro_osl + lainnya_osl) AS total_osl
            FROM laporan_harian_agen
            WHERE posisi IS NOT NULL AND posisi != ''
            GROUP BY posisi
            ORDER BY total_osl DESC
            LIMIT 5;
        `);

        // Memformat data untuk ChartJS
        const monevKpiAreaData = {
            labels: kpiData.map(item => item.area),
            datasets: [{
                label: 'Total OSL per Posisi/Area (Rp)',
                data: kpiData.map(item => item.total_osl),
                backgroundColor: 'rgba(22, 163, 74, 0.6)',
                borderColor: 'rgba(22, 163, 74, 1)',
                borderWidth: 1
            }]
        };

        // Query untuk Monev OSL Kanwil (Line Chart)
        const [oslData] = await pool.query(`
            SELECT 
                DATE_FORMAT(tanggal, '%M %Y') AS bulan,
                SUM(gadai_osl + mulia_osl + mikro_osl + lainnya_osl) AS total_osl
            FROM laporan_harian_agen
            WHERE tanggal >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY YEAR(tanggal), MONTH(tanggal)
            ORDER BY YEAR(tanggal), MONTH(tanggal);
        `);

        // Memformat data untuk ChartJS
        const monevOslKanwilData = {
            labels: oslData.map(item => item.bulan),
            datasets: [{
                label: 'Total OSL Kanwil (Rp)',
                data: oslData.map(item => item.total_osl),
                fill: true,
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderColor: 'rgba(37, 99, 235, 1)',
                tension: 0.3
            }]
        };

        res.json({
            success: true,
            data: {
                monevKpiAreaData,
                monevOslKanwilData
            }
        });
    } catch (error) {
        console.error("Error fetching user chart data:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getAdminStats = async (req, res) => {
    try {
        // Query 1: Menghitung jumlah pegawai (Ini sudah benar)
        const [totalPegawaiResult] = await pool.query("SELECT COUNT(*) as count FROM pegawai");
        const totalPegawai = totalPegawaiResult[0].count;

        // Query 2: Menghitung semua data cuti (karena tidak ada kolom status)
        const [totalCutiResult] = await pool.query("SELECT COUNT(*) as count FROM cuti");
        const totalCuti = totalCutiResult[0].count;

        // Query 3: Menghitung jumlah user (Ini sudah benar)
        const [totalUserResult] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role IN ('user', 'agen')");
        const totalUser = totalUserResult[0].count;

        // Query 4: Menghitung jumlah dokumen dari tabel 'arsip_dokumen' (Nama tabel diperbaiki)
        const [totalArsipResult] = await pool.query("SELECT COUNT(*) as count FROM arsip_dokumen");
        const totalArsip = totalArsipResult[0].count;

        res.json({
            success: true,
            data: {
                totalPegawai,
                totalCuti,
                totalUser,
                totalArsip
            }
        });
    } catch (error) {
        console.error("Gagal mengambil statistik admin:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
