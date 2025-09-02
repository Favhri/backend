// src/controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const pool = require("../config/database");

// src/controllers/authController.js
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Attempting login for email:", email);

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: "Email tidak ditemukan" });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ message: "Password salah" });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      token: accessToken,
      user: {
        id: user.id,
        nama_lengkap: user.nama_lengkap,
        NIK: user.NIK,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("Login error details:", err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  try {
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) return res.sendStatus(403);

      // Get user data to include in new token
      const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [decoded.id]);
      const user = rows[0];
      if (!user) return res.sendStatus(403);

      const newAccessToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ token: newAccessToken });
    });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie("refreshToken", { 
    httpOnly: true, 
    secure: true, 
    sameSite: "strict" 
  });
  res.json({ message: "Logout berhasil" });
};

exports.register = async (req, res) => {
  // 1. Ambil NIK dari body request
  const { nama_lengkap, email, password, role, nik } = req.body;

  try {
    const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ? OR nik = ?", [email, nik]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email atau NIK sudah terdaftar" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Tambahkan NIK ke query INSERT
    const [result] = await pool.query(
      "INSERT INTO users (nama_lengkap, email, password, role, nik) VALUES (?, ?, ?, ?, ?)",
      [nama_lengkap, email, hashedPassword, role || 'user', nik]
    );

    res.status(201).json({
      message: "Registrasi berhasil",
      user: {
        id: result.insertId,
        nama_lengkap,
        email,
        role: role || 'user',
        nik // 3. Kembalikan NIK di response
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};