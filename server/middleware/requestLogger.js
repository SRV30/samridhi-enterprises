import config from "../config/index.js";

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const log = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTimeMs: duration,
      contentLength: res.get("content-length") || 0,
      userAgent: req.get("user-agent") || "",
    };

    if (res.statusCode >= 400) {
      log.error = true;
    }

    if (!config.isTest && process.env.NODE_ENV !== "test") {
      console.log(JSON.stringify(log));
    }
  });

  next();
};

export default requestLogger;
