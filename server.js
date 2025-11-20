require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Load passport config (MUST come after dotenv)
require("./config/passport");

const app = express();
const PORT = process.env.PORT || 4000;

// =======================================================
// 🧠 ENVIRONMENT VALIDATION
// =======================================================
if (!process.env.DATABASE_URL || !process.env.SECRET_KEY) {
  console.error("❌ FATAL ERROR: DATABASE_URL or SECRET_KEY missing in .env. Shutting down.");
  process.exit(1);
}

// =======================================================
// ☁️ DATABASE CONNECTION
// =======================================================
mongoose.connect(process.env.DATABASE_URL, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

const DB = mongoose.connection;
DB.on("error", (err) => console.error("❌ Database connection error:", err));
DB.once("open", () => console.log("✅ Connected to MongoDB Cloud Database"));

// =======================================================
// 🧩 MIDDLEWARE
// =======================================================

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true, 
}));

app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ROUTES
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");

app.use("/auth", authRoutes);
app.use("/api/jobs", jobRoutes);

// =======================================================
// 🚀 START SERVER
// =======================================================
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
