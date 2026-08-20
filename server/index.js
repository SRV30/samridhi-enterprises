import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import connectDB from "./config/connectDB.js";
import errorMiddleware from "./middleware/error.js";
import requestLogger from "./middleware/requestLogger.js";
import validateEnv from "./utils/validateEnv.js";
import config from "./config/index.js";

validateEnv();

process.on("uncaughtException", (err) => {
  console.error(`Error: ${err.message}`);
  console.error(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
});

cloudinary.config({
  cloud_name: config.cloudinary.name,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

const app = express();
const PORT = config.port;

const getTrustProxyConfig = (value) => {
  if (value === "true") return true;
  if (!Number.isNaN(Number(value))) return Number(value);
  return value;
};

if (config.trustProxy) {
  app.set("trust proxy", getTrustProxyConfig(config.trustProxy));
}

const allowedOrigins = [config.frontendUrl, "http://localhost:5173"];

import securityHeaders from "./middleware/securityHeaders.js";
app.use(securityHeaders);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

import rateLimiter from "./middleware/rateLimiter.js";
import { inputSanitizer } from "./middleware/inputSanitizer.js";
import responseWrapper from "./middleware/responseWrapper.js";

app.use(cookieParser());
app.use(express.json());
app.use(responseWrapper);
app.use(inputSanitizer);
app.use(requestLogger);

import healthRouter from "./route/healthRoutes.js";
app.use("/api/health", healthRouter);
app.use("/api", rateLimiter({ max: 200, windowMs: 15 * 60 * 1000 }));

app.get("/", (req, res) => {
  res.send("Server is running: " + PORT);
});

import userRouter from "./route/userRoute.js";
import brandRouter from "./route/brandRoutes.js";
import bikeModelRouter from "./route/bikeModelRoutes.js";
import partRouter from "./route/partRoutes.js";
import cartRouter from "./route/cartRoutes.js";
import wishlistRouter from "./route/wishlistRoutes.js";
import orderRouter from "./route/orderRoutes.js";
import paymentSettingsRouter from "./route/paymentSettingsRoutes.js";
import couponRouter from "./route/couponRoutes.js";
import supportTicketRouter from "./route/supportTicketRoutes.js";
import addressRouter from "./route/addressRoutes.js";
import garageRouter from "./route/garageroutes.js";

app.use("/api/user", userRouter);
app.use("/api/brand", brandRouter);
app.use("/api/bike-model", bikeModelRouter);
app.use("/api/parts", partRouter);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payment-settings", paymentSettingsRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/support", supportTicketRouter);
app.use("/api/address", addressRouter);
app.use("/api/garage", garageRouter);

app.use(errorMiddleware);

import mongoose from "mongoose";
let server;

connectDB().then(() => {
  server = app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
});

const SHUTDOWN_TIMEOUT_MS = 10_000;

const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  const forceExit = setTimeout(() => {
    console.error("Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();

  if (server) {
    server.close(async () => {
      try {
        await mongoose.connection.close();
      } catch (err) {
        console.error("Error closing MongoDB connection:", err.message);
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (err) => {
  console.error(`Error: ${err.message}`);
  console.error(`Shutting down the server due to Unhandled Promise Rejection`);
  if (server && typeof server.close === "function") server.close(() => process.exit(1));
  else process.exit(1);
});
