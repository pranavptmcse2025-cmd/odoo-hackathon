import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import policyRoutes from "./routes/policyRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import complianceRoutes from "./routes/complianceRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ---------- Core middleware ----------
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ---------- Health check ----------
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "EcoSphere API is running" });
});

// ---------- API routes ----------
app.use("/api/auth", authRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/audits", auditRoutes);
app.use("/api/issues", complianceRoutes);
app.use("/api", dashboardRoutes); // exposes /api/dashboard/*, /api/reports/*, /api/leaderboard, /api/activities

// ---------- Serve React build in production ----------
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(clientBuildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("EcoSphere API — development mode. Frontend runs separately via Vite (npm run dev).");
  });
}

// ---------- Error handling (must be last) ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Start server ----------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`EcoSphere backend running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });
};

startServer();

export default app;
