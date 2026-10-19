import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server as SocketIOServer } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import facilityRoutes from "./routes/facilityRoutes.js";
import costRoutes from "./routes/costRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { initSocket } from "./socket.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const httpServer = http.createServer(app);

// Middleware: CORS


const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

// Support comma-separated CLIENT_URL (e.g., "https://carelink.vercel.app,https://carelink.netlify.app")
const configuredOrigins = clientUrl
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = Array.from(
  new Set([
    ...configuredOrigins,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175"
  ])
);

app.use(
  cors({
    origin: (origin, callback) => {
      const normalizedOrigin = origin ? origin.replace(/\/+$/, "") : null;
      if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Middleware: Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Health & API Info
app.get("/", (req, res) => {
  res.json({
    success: true,
    service: "CareLink Emergency API Server",
    version: "1.0.0",
    status: "ACTIVE",
    realtime: "Socket.IO Enabled",
    endpoints: {
      health: "/api/auth/health",
      auth: "/api/auth/login",
      hospitals: "/api/hospitals",
      emergencyRequests: "/api/emergency-requests"
    }
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/costs", costRoutes);
app.use("/api/emergency-requests", emergencyRoutes);
app.use("/api/admin", adminRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Socket.IO Setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  }
});

initSocket(io);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 CareLink Emergency API running in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`);
  console.log(`🔗 Allowed CORS origins: ${allowedOrigins.join(", ")}`);
});

export default app;
