require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const environmentRoutes = require("./routes/environmentRoutes");

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "EcoSphere Environmental Module API is running" });
});

// Environmental module routes
app.use("/api", environmentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler (catches anything unhandled)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Environmental Module API running on http://localhost:${PORT}`);
  });
});

module.exports = app;
