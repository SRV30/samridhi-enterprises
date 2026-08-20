import config from "../config/index.js";

const MANDATORY = [
  "MONGODB_URL",
  "JWT_SECRET",
  "JWT_EXPIRE",
  "COOKIE_EXPIRE",
  "CLOUDINARY_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const OPTIONAL = [
  "PORT",
  "FRONTEND_URL",
  "FRONTEND_WWW_URL",
  "BREVO_API_KEY",
  "BREVO_SENDER_EMAIL",
  "BREVO_SENDER_NAME",
  "OTP_MODE",
  "NODE_ENV",
];

const isOtpDevMode = () => config.security.otpMode === "dev" || process.env.OTP_MODE === "dev";

const validateEnv = () => {
  const missing = MANDATORY.filter((key) => !process.env[key]);
  const isProduction = config.isProduction;

  if (missing.length > 0) {
    console.error("\n\x1b[31m[ENV] Missing required environment variables:\x1b[0m");
    missing.forEach((key) => console.error(`  \x1b[31m✗\x1b[0m ${key}`));
    console.error("\nServer cannot start without these. Check your .env file.\n");
    process.exit(1);
  }

  if (isOtpDevMode()) {
    console.warn("\n\x1b[33m[ENV] OTP_MODE=dev — OTPs will be logged to console instead of sent via email.\x1b[0m");
  }

  if (isProduction) {
    // Sender identity has safe defaults in config/index.js. It should not make
    // the entire API unavailable when Brevo is not configured.
    if (!process.env.BREVO_API_KEY) {
      console.warn(
        "\n\x1b[33m[ENV] BREVO_API_KEY is not configured — transactional email is disabled until it is set.\x1b[0m\n"
      );
    }
  } else {
    const unset = OPTIONAL.filter((key) => !process.env[key]);
    if (unset.length > 0) {
      console.warn("\n\x1b[33m[ENV] Optional variables not set (defaults will be used):\x1b[0m");
      unset.forEach((key) => console.warn(`  \x1b[33m⚠\x1b[0m ${key}`));
      console.warn("");
    }
  }

  console.log("\x1b[32m[ENV] All required variables present ✓\x1b[0m");
};

export { isOtpDevMode };

export default validateEnv;
