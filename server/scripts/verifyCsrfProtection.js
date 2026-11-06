import assert from "node:assert/strict";
import csrfProtection from "../middleware/csrfProtection.js";

const allowedOrigins = ["https://samridhienterprises.com", "https://www.samridhienterprises.com"];

const run = (method, { cookie = false, origin } = {}) => {
  const req = {
    method,
    cookies: cookie ? { token: "session-token" } : {},
    get: (name) => name.toLowerCase() === "origin" ? origin : undefined,
  };
  const res = {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  let nextCalled = false;
  csrfProtection(allowedOrigins)(req, res, () => { nextCalled = true; });
  return { res, nextCalled };
};

assert.equal(run("GET", { cookie: true }).nextCalled, true, "Safe reads should not require an Origin header");
assert.equal(run("POST").nextCalled, true, "Bearer-authenticated or unauthenticated requests are not cookie-CSRF targets");
assert.equal(run("POST", { cookie: true, origin: allowedOrigins[0] }).nextCalled, true, "Configured frontend origin should pass");
const missingOrigin = run("POST", { cookie: true });
assert.equal(missingOrigin.nextCalled, false, "Cookie-authenticated mutations must reject missing Origin");
assert.equal(missingOrigin.res.statusCode, 403);
const hostileOrigin = run("DELETE", { cookie: true, origin: "https://attacker.example" });
assert.equal(hostileOrigin.nextCalled, false, "Cookie-authenticated mutations must reject untrusted Origin");
assert.equal(hostileOrigin.res.statusCode, 403);

console.log("CSRF origin protection tests passed.");
