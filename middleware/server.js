const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const userRoutes = require("./src/routes/userRoutes");
const authRoutes = require("./src/routes/authRoutes");

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true, // penting biar cookie terkirim
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

app.listen(5000, () => console.log("Server jalan di port 5000"));
