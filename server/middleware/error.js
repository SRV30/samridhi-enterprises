import ErrorHandler from "../utils/errorHandler.js";
const sanitizeError = (err) => {
  // Create a copy to avoid mutating the original error object
  const cleanErr = { ...err };
  // List of sensitive keys to remove
  const sensitiveKeys = ['password', 'token', 'refreshToken', 'secret', 'authorization'];
  
  sensitiveKeys.forEach(key => delete cleanErr[key]);
  return cleanErr;
};

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  console.error(`[${req.method} ${req.originalUrl}]`, sanitizeError(err.stack || err));
  // Wrong Mongodb Id error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    err = new ErrorHandler(message, 400);
  }

  // Wrong JWT error
  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is invalid, Try again `;
    err = new ErrorHandler(message, 400);
  }

  // JWT EXPIRE error
  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is Expired, Try again `;
    err = new ErrorHandler(message, 400);
  }

  if (err.name === 'MongoServerError' && err.code === 112) {
    err.message = 'Concurrent write transaction conflict, please try again.';
    err.statusCode = 409;
  }
  if (typeof res.sendError === "function") {
    return res.sendError(err.message, err.statusCode);
  }
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default errorMiddleware;
