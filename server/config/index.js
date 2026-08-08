import dotenv from "dotenv";

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
  isDevelopment: process.env.NODE_ENV === "development" || !process.env.NODE_ENV,

  port: Number(process.env.PORT) || 5000,
  trustProxy: process.env.TRUST_PROXY || null,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  mongodbUrl: process.env.MONGODB_URL || "",

  jwt: {
    secret: process.env.JWT_SECRET || "",
    expire: process.env.JWT_EXPIRE || "7d",
    cookieExpire: Number(process.env.COOKIE_EXPIRE) || 7,
  },

  cloudinary: {
    name: process.env.CLOUDINARY_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },

  brevo: {
    apiKey: process.env.BREVO_API_KEY || "",
    senderEmail: process.env.BREVO_SENDER_EMAIL || "noreply@samridhienterprises.com",
    senderName: process.env.BREVO_SENDER_NAME || "Samridhi Enterprises",
  },

  security: {
    loginMaxAttempts: Number(process.env.LOGIN_MAX_ATTEMPTS) || 5,
    loginLockMinutes: Number(process.env.LOGIN_LOCK_MINUTES) || 15,
    forgotPasswordMaxAttempts: Number(process.env.FORGOT_PASSWORD_MAX_ATTEMPTS) || 5,
    forgotPasswordLockMinutes: Number(process.env.FORGOT_PASSWORD_LOCK_MINUTES) || 15,
    otpMode: process.env.OTP_MODE || "prod",
  },
};

export default config;
