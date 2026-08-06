import assert from "assert";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

async function testAsyncControllers() {
  console.log("Running Async Controllers Error Handling Verification Tests...");

  // Test 1: Successful async handler resolves without calling next with error
  let nextErr1 = null;
  const successHandler = catchAsyncErrors(async (req, res, next) => {
    return "OK";
  });

  await successHandler({}, {}, (err) => {
    nextErr1 = err;
  });
  assert.strictEqual(nextErr1, null, "Successful async handler should not invoke next with error");

  // Test 2: Thrown error in async handler is caught by catchAsyncErrors and passed to next
  let nextErr2 = null;
  const failingHandler = catchAsyncErrors(async (req, res, next) => {
    throw new ErrorHandler("Async execution failure", 400);
  });

  await failingHandler({}, {}, (err) => {
    nextErr2 = err;
  });

  assert.ok(nextErr2 instanceof ErrorHandler, "Thrown error should be forwarded to next(err)");
  assert.strictEqual(nextErr2.statusCode, 400);
  assert.strictEqual(nextErr2.message, "Async execution failure");

  console.log("✅ All Async Controllers verification tests passed successfully!");
}

testAsyncControllers();
