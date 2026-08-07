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

// Set TRUST_PROXY when deployed behind a trusted reverse proxy/load balancer so
// req.ip reflects the client IP used by the rate limiter.
if (config.trustProxy) {
  app.set("trust proxy", getTrustProxyConfig(config.trustProxy));
}

const allowedOrigins = [
  config.frontendUrl,
  "http://localhost:5173",
];

// Security headers — registered early so every response includes them.
import securityHeaders from "./middleware/securityHeaders.js";
app.use(securityHeaders);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

import rateLimiter from "./middleware/rateLimiter.js";
import { inputSanitizer } from "./middleware/inputSanitizer.js";
import responseWrapper from "./middleware/responseWrapper.js";

import webhookRouter from "./route/webhookRoute.js";

app.use(cookieParser());
// Webhook route must be registered BEFORE express.json() so it can process the raw body
app.use("/api/webhook", webhookRouter);

app.use(express.json());
app.use(responseWrapper);
app.use(inputSanitizer);
app.use(requestLogger);

// Health check routes — registered BEFORE rate limiter so monitoring
// probes (Docker HEALTHCHECK, load balancers) are never rate-limited.
import healthRouter from "./route/healthRoutes.js";
app.use("/api/health", healthRouter);

// Apply rate limiter to all API endpoints
app.use("/api", rateLimiter({ max: 200, windowMs: 15 * 60 * 1000 }));

app.get("/", (req, res) => {
  res.send("Server is running: " + PORT);
});

//routes
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
app.use("/api/parts", partRouter)
app.use("/api/cart", cartRouter)
app.use("/api/wishlist", wishlistRouter)
app.use("/api/orders", orderRouter)
app.use("/api/payment-settings", paymentSettingsRouter)
app.use("/api/coupon", couponRouter)
app.use("/api/support", supportTicketRouter)
app.use("/api/address", addressRouter)
app.use("/api/garage", garageRouter)

// Error middleware should be registered AFTER routes so it can catch downstream errors.
app.use(errorMiddleware);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
});

process.on("unhandledRejection", (err) => {
  console.error(`Error: ${err.message}`);
  console.error(`Shutting down the server due to Unhandled Promise Rejection`);

  if (app && typeof app.close === "function") {
    app.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

