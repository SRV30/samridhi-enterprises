import mongoose from "mongoose";
import catchAsyncErrors from "./catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import config from "../config/index.js";

// In-memory cache fallback for IP request tracking.
const ipRequestStore = new Map();

const pruneExpiredEntries = (now) => {
  for (const [key, data] of ipRequestStore.entries()) {
    if (now > data.resetTime) {
      ipRequestStore.delete(key);
    }
  }
};

const setRateLimitHeaders = (res, limit, remaining, resetTime) => {
  res.setHeader("X-RateLimit-Limit", limit);
  res.setHeader("X-RateLimit-Remaining", Math.max(0, remaining));
  res.setHeader("X-RateLimit-Reset", Math.ceil(resetTime / 1000));
};

// RateLimit Mongoose Schema for distributed deployments
const rateLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, required: true, default: 0 },
  resetTime: { type: Date, required: true },
});

// TTL index to automatically remove expired entries from MongoDB
rateLimitSchema.index({ resetTime: 1 }, { expireAfterSeconds: 0 });

const RateLimit = mongoose.models.RateLimit || mongoose.model("RateLimit", rateLimitSchema);

/**
 * Distributed rate limiting middleware to prevent API abuse and brute-force.
 * Uses a MongoDB-backed fixed window per client IP.
 * If MongoDB is not connected, falls back to a process-local memory Map.
 */
const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 mins
  const max = options.max || 100;
  const message = options.message || "Too many requests. Please try again later.";

  return catchAsyncErrors(async (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress;
    const now = Date.now();
    const key = `global:${ip}`;

    // Fallback to in-memory if mongoose is not connected
    if (mongoose.connection.readyState !== 1) {
      pruneExpiredEntries(now);
      let clientData = ipRequestStore.get(key);
      if (!clientData) {
        clientData = { count: 0, resetTime: now + windowMs };
        ipRequestStore.set(key, clientData);
      }
      clientData.count += 1;
      setRateLimitHeaders(res, max, max - clientData.count, clientData.resetTime);
      if (clientData.count > max) {
        res.setHeader("Retry-After", Math.ceil((clientData.resetTime - now) / 1000));
        return next(new ErrorHandler(message, 429));
      }
      return next();
    }

    let limitDoc;
    try {
      limitDoc = await RateLimit.findOneAndUpdate(
        { key },
        { $inc: { count: 1 }, $setOnInsert: { resetTime: new Date(now + windowMs) } },
        { upsert: true, new: true }
      );
    } catch (err) {
      // Parallel request upsert conflict safety net
      limitDoc = await RateLimit.findOneAndUpdate(
        { key },
        { $inc: { count: 1 } },
        { new: true }
      );
    }

    if (!limitDoc) {
      limitDoc = { count: 1, resetTime: new Date(now + windowMs) };
    }

    const resetTimeMs = new Date(limitDoc.resetTime).getTime();
    setRateLimitHeaders(res, max, max - limitDoc.count, resetTimeMs);

    if (limitDoc.count > max) {
      res.setHeader("Retry-After", Math.ceil((resetTimeMs - now) / 1000));
      return next(new ErrorHandler(message, 429));
    }

    next();
  });
};

/**
 * Per-endpoint/IP (and optional per-email) throttle using MongoDB for coordination.
 * Used to protect authentication and OTP endpoints.
 */
const createAuthOtpLimiter = (options = {}) => {
  const windowMs = options.windowMs;
  const maxByIp = options.maxByIp;
  const maxByEmail = options.maxByEmail;
  const message = options.message || "Too many requests. Please try again later.";
  const enableEmail = Boolean(options.enableEmail);
  const logInDev = Boolean(options.logInDev);

  if (!windowMs || !maxByIp) {
    throw new Error("createAuthOtpLimiter requires windowMs and maxByIp");
  }

  return catchAsyncErrors(async (req, res, next) => {
    const now = Date.now();
    const ip = req.ip || req.socket.remoteAddress;
    const email = req?.body?.email;

    // Fallback to in-memory if mongoose is not connected
    if (mongoose.connection.readyState !== 1) {
      pruneExpiredEntries(now);

      const ipKey = `ip:${ip}`;
      let ipData = ipRequestStore.get(ipKey);
      if (!ipData) {
        ipData = { count: 0, resetTime: now + windowMs };
        ipRequestStore.set(ipKey, ipData);
      }
      ipData.count += 1;
      setRateLimitHeaders(res, maxByIp, maxByIp - ipData.count, ipData.resetTime);

      if (ipData.count > maxByIp) {
        res.setHeader("Retry-After", Math.ceil((ipData.resetTime - now) / 1000));
        return next(new ErrorHandler(message, 429));
      }

      if (enableEmail && typeof email === "string" && email.trim()) {
        const emailKey = `email:${email.trim().toLowerCase()}`;
        const maxEmail = Number(maxByEmail) || maxByIp;

        let emailData = ipRequestStore.get(emailKey);
        if (!emailData) {
          emailData = { count: 0, resetTime: now + windowMs };
          ipRequestStore.set(emailKey, emailData);
        }

        emailData.count += 1;
        if (emailData.count > maxEmail) {
          res.setHeader("Retry-After", Math.ceil((emailData.resetTime - now) / 1000));
          return next(new ErrorHandler(message, 429));
        }
      }

      return next();
    }

    // IP-based limiting
    const ipKey = `ip:${ip}`;
    let ipDoc;
    try {
      ipDoc = await RateLimit.findOneAndUpdate(
        { key: ipKey },
        { $inc: { count: 1 }, $setOnInsert: { resetTime: new Date(now + windowMs) } },
        { upsert: true, new: true }
      );
    } catch (err) {
      ipDoc = await RateLimit.findOneAndUpdate(
        { key: ipKey },
        { $inc: { count: 1 } },
        { new: true }
      );
    }

    if (!ipDoc) {
      ipDoc = { count: 1, resetTime: new Date(now + windowMs) };
    }

    const ipResetTimeMs = new Date(ipDoc.resetTime).getTime();
    setRateLimitHeaders(res, maxByIp, maxByIp - ipDoc.count, ipResetTimeMs);

    if (ipDoc.count > maxByIp) {
      res.setHeader("Retry-After", Math.ceil((ipResetTimeMs - now) / 1000));
      if (logInDev && config.isDevelopment) {
        console.warn("[rate-limit] ip", { endpoint: req.originalUrl, ip });
      }
      return next(new ErrorHandler(message, 429));
    }

    // Optional email-based limiting
    if (enableEmail && typeof email === "string" && email.trim()) {
      const emailKey = `email:${email.trim().toLowerCase()}`;
      const maxEmail = Number(maxByEmail) || maxByIp;

      let emailDoc;
      try {
        emailDoc = await RateLimit.findOneAndUpdate(
          { key: emailKey },
          { $inc: { count: 1 }, $setOnInsert: { resetTime: new Date(now + windowMs) } },
          { upsert: true, new: true }
        );
      } catch (err) {
        emailDoc = await RateLimit.findOneAndUpdate(
          { key: emailKey },
          { $inc: { count: 1 } },
          { new: true }
        );
      }

      if (!emailDoc) {
        emailDoc = { count: 1, resetTime: new Date(now + windowMs) };
      }

      if (emailDoc.count > maxEmail) {
        const emailResetTimeMs = new Date(emailDoc.resetTime).getTime();
        res.setHeader("Retry-After", Math.ceil((emailResetTimeMs - now) / 1000));
        if (logInDev && config.isDevelopment) {
          console.warn("[rate-limit] email", {
            endpoint: req.originalUrl,
            email: email.trim().toLowerCase(),
          });
        }
        return next(new ErrorHandler(message, 429));
      }
    }

    next();
  });
};

export { ipRequestStore };
export { createAuthOtpLimiter };

export default rateLimiter;
