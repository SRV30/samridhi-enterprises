import assert from "assert";
import config from "../config/index.js";

function testConfigModule() {
  console.log("Running Configuration Module Verification Tests...");

  assert.ok(config, "Config module should export an object");
  assert.strictEqual(typeof config.port, "number", "config.port should be a number");
  assert.strictEqual(typeof config.env, "string", "config.env should be a string");
  assert.strictEqual(typeof config.isProduction, "boolean", "config.isProduction should be boolean");
  assert.strictEqual(typeof config.isTest, "boolean", "config.isTest should be boolean");
  assert.strictEqual(typeof config.isDevelopment, "boolean", "config.isDevelopment should be boolean");

  // Check sub-configs
  assert.ok(config.jwt, "config.jwt should exist");
  assert.strictEqual(typeof config.jwt.expire, "string", "config.jwt.expire should be string");
  assert.strictEqual(typeof config.jwt.cookieExpire, "number", "config.jwt.cookieExpire should be number");

  assert.ok(config.cloudinary, "config.cloudinary should exist");
  assert.ok(config.brevo, "config.brevo should exist");
  assert.ok(config.security, "config.security should exist");

  assert.strictEqual(typeof config.security.loginMaxAttempts, "number");
  assert.strictEqual(typeof config.security.loginLockMinutes, "number");

  console.log("✅ All Configuration Module tests passed successfully!");
}

testConfigModule();
