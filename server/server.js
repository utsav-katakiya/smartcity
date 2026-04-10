require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const complaintRoutes = require("./routes/complaintRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");



// 🔥 FIRST: app initialize
const app = express();

// ================= DATABASE =================
connectDB();

// ================= MIDDLEWARE =================
app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// GLOBAL LOGGER for debugging
app.use((req, res, next) => {
  console.log(`[SERVER_DEBUG] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ================= ROUTES =================
app.use("/api/complaints", complaintRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// ================= TEST ROUTE =================
app.get("/api/health", (req, res) => {
  res.json({ status: "up", timestamp: new Date().toISOString() });
});

// ================= ERROR HANDLING =================
app.use((err, req, res, next) => {
  console.error("[SERVER_ERROR]", err);
  if (err.name === 'MulterError' || err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: `File upload error: ${err.message}` });
  }
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal Server Error" });
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});