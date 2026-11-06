// SameSite=None cookies are required when the frontend and API use different
// sites. Validate browser Origin on unsafe cookie-authenticated requests so
// cross-site forms and fetches cannot perform state-changing actions.
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const csrfProtection = (allowedOrigins = []) => (req, res, next) => {
  if (SAFE_METHODS.has(req.method) || !req.cookies?.token) return next();

  const origin = req.get("origin");
  if (!origin || !allowedOrigins.includes(origin)) {
    return res.status(403).json({
      success: false,
      message: "Request origin is not allowed.",
    });
  }

  return next();
};

export default csrfProtection;
