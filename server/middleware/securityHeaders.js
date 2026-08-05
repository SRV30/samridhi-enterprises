/**
 * Security Headers Middleware
 *
 * Sets HTTP security headers recommended by OWASP to mitigate common
 * web vulnerabilities such as clickjacking, MIME-type sniffing, and
 * information leakage.
 *
 * No external dependencies required — this is a lightweight alternative
 * to the `helmet` package, tailored for the Samridhi Enterprises API.
 *
 * References:
 *   - OWASP Secure Headers Project:
 *     https://owasp.org/www-project-secure-headers/
 *   - MDN HTTP Headers:
 *     https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
 */

const securityHeaders = (req, res, next) => {
  // ── Clickjacking Protection ────────────────────────────────────────
  // Prevents the page from being loaded inside an iframe on another site.
  res.setHeader("X-Frame-Options", "DENY");

  // ── MIME-Type Sniffing Prevention ──────────────────────────────────
  // Stops browsers from interpreting files as a different MIME type than
  // what the server declares. Mitigates drive-by download attacks.
  res.setHeader("X-Content-Type-Options", "nosniff");

  // ── XSS Filter ─────────────────────────────────────────────────────
  // Disables the legacy browser XSS filter (which can itself be exploited).
  // Modern CSP policies are the preferred protection mechanism.
  res.setHeader("X-XSS-Protection", "0");

  // ── Referrer Policy ────────────────────────────────────────────────
  // Controls how much referrer information is sent with requests.
  // "strict-origin-when-cross-origin" sends the origin only for cross-site
  // requests and the full URL for same-origin requests.
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // ── Content-Type for API ───────────────────────────────────────────
  // Ensure API responses declare they are JSON (prevents browsers from
  // trying to render the response as HTML).
  // Note: Only set on API routes; skip for static file serving.
  if (req.path.startsWith("/api")) {
    res.setHeader("X-Content-Type-Options", "nosniff");
  }

  // ── Permissions Policy ─────────────────────────────────────────────
  // Restricts which browser features the page can use. Since this is an
  // API server, we disable all browser features by default.
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(self)"
  );

  // ── HSTS (HTTP Strict Transport Security) ──────────────────────────
  // Only set in production to avoid issues with local HTTP development.
  // Tells browsers to always use HTTPS for future connections.
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  // ── Remove Server Identity ─────────────────────────────────────────
  // Remove the X-Powered-By header that Express sets by default.
  // This prevents attackers from identifying the server framework.
  res.removeHeader("X-Powered-By");

  next();
};

export default securityHeaders;
