import express from "express";
import mongoose from "mongoose";

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Basic health check — returns server status, uptime, and timestamp.
 *          Designed for load balancers, Docker HEALTHCHECK, and monitoring tools.
 * @access  Public (no auth required)
 */
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

/**
 * @route   GET /api/health/db
 * @desc    Database connectivity check — verifies MongoDB connection state
 *          and measures round-trip ping latency.
 * @access  Public (lightweight, returns only status — no sensitive data)
 */
router.get("/db", async (req, res) => {
  const dbStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const state = mongoose.connection.readyState;
  const dbStatus = dbStates[state] || "unknown";

  // Only attempt a ping if the connection is active
  if (state !== 1) {
    return res.status(503).json({
      success: false,
      status: "unhealthy",
      database: {
        status: dbStatus,
        latencyMs: null,
      },
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const start = Date.now();
    await mongoose.connection.db.admin().command({ ping: 1 });
    const latencyMs = Date.now() - start;

    res.status(200).json({
      success: true,
      status: "healthy",
      database: {
        status: dbStatus,
        latencyMs,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: "unhealthy",
      database: {
        status: "error",
        latencyMs: null,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
