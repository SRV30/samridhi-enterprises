import assert from "assert";
import validateSchema from "../middleware/validateSchema.js";
import { registerSchema, loginSchema } from "../validators/authSchemas.js";
import { addAddressSchema } from "../validators/addressSchemas.js";
import ErrorHandler from "../utils/errorHandler.js";

// Helper to run middleware
function runMiddleware(middleware, req) {
  return new Promise((resolve) => {
    const res = {};
    const next = (err) => {
      resolve({ err, req });
    };
    middleware(req, res, next);
  });
}

async function testRequestValidation() {
  console.log("Running Request Payload Validation Tests...");

  // Test 1: Valid registration payload
  const validRegisterReq = {
    body: {
      name: "Test User",
      email: "test@example.com",
      password: "StrongPassword123!",
    },
  };
  const { err: err1 } = await runMiddleware(validateSchema(registerSchema), validRegisterReq);
  assert.strictEqual(err1, undefined, "Valid registration should pass without error");

  // Test 2: Invalid registration payload (missing special char)
  const invalidRegisterReq = {
    body: {
      name: "Test User",
      email: "test@example.com",
      password: "NoSpecialChar123",
    },
  };
  const { err: err2 } = await runMiddleware(validateSchema(registerSchema), invalidRegisterReq);
  assert.ok(err2 instanceof ErrorHandler, "Invalid registration should trigger ErrorHandler");
  assert.strictEqual(err2.statusCode, 400, "Should return HTTP 400");
  assert.ok(err2.message.includes("special character"), "Should contain validation error details");

  // Test 3: Invalid login payload (invalid email format)
  const invalidLoginReq = {
    body: {
      email: "not-an-email",
      password: "somepassword",
    },
  };
  const { err: err3 } = await runMiddleware(validateSchema(loginSchema), invalidLoginReq);
  assert.ok(err3 instanceof ErrorHandler, "Invalid login should trigger ErrorHandler");
  assert.strictEqual(err3.statusCode, 400);

  // Test 4: Valid address payload
  const validAddressReq = {
    body: {
      fullName: "Jane Doe",
      phone: "9876543210",
      addressLine: "123 Main St",
      city: "Mumbai",
      pincode: "400001",
    },
  };
  const { err: err4 } = await runMiddleware(validateSchema(addAddressSchema), validAddressReq);
  assert.strictEqual(err4, undefined, "Valid address payload should pass without error");

  console.log("✅ All Request Payload Validation tests passed successfully!");
}

testRequestValidation().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
