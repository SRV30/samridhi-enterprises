import assert from "node:assert/strict";
import mongoose from "mongoose";
import connectDB from "../config/connectDB.js";
import { registerUser, resetPassword, updatePassword, verifyOtp, verifyEmailOtp, resendOtp, updateUserDetails, getAllUsers, getSingleUser, deleteUser, updateUserStatus } from "../controllers/userController.js";
import userRouter from "../route/userRoute.js";
import UserModel from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";

import responseWrapper from "../middleware/responseWrapper.js";

// Helper to call controller and return a promise that resolves when next or res.json is called
const callController = (controller, req) => {
  return new Promise((resolve) => {
    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        resolve({ res: this, err: null });
        return this;
      },
    };
    responseWrapper(req, res, () => {});
    const next = (err) => {
      resolve({ res, err });
    };
    controller(req, res, next);
  });
};

const runTests = async () => {
  process.env.BREVO_API_KEY = "dummy";
  console.log("Connecting to in-memory database...");
  await connectDB();

  try {
    // ----------------------------------------------------
    // Test 1: registerUser with invalid password
    // ----------------------------------------------------
    console.log("Running Test 1: registerUser with invalid password...");
    const req1 = {
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "weak", // fails length constraint
      },
    };
    const { err: error1 } = await callController(registerUser, req1);
    assert.ok(error1 instanceof ErrorHandler, "Should return ErrorHandler error");
    assert.equal(error1.statusCode, 400, "Should return 400 Bad Request");
    assert.ok(error1.message.includes("Password must be between"), "Should have correct length validation message");

    // ----------------------------------------------------
    // Test 2: registerUser with password missing special char
    // ----------------------------------------------------
    console.log("Running Test 2: registerUser with password missing special character...");
    const req2 = {
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "NoSpecialChar123", // missing special char
      },
    };
    const { err: error2 } = await callController(registerUser, req2);
    assert.ok(error2 instanceof ErrorHandler, "Should return ErrorHandler error");
    assert.equal(error2.statusCode, 400, "Should return 400 Bad Request");
    assert.equal(error2.message, "Password must contain at least one special character.", "Should have correct complexity validation message");
    // Note: our validatePassword checks uppercase first, then lowercase, then digit, then special char.
    // "NoSpecialChar123" has uppercase (N), lowercase (o...), digit (123), but missing special char.
    // Wait, let's verify if "NoSpecialChar123" has uppercase. Yes.
    // Wait, the message for missing special character is "Password must contain at least one special character."
    // Let's make sure our assert matches whatever is returned. Let's see what is returned:
    // If we pass "NoSpecialChar123", it has uppercase, lowercase, digit, but no special. So it should return "Password must contain at least one special character."
    // Wait, in Test 2's assertion, why did it pass before? Because error2.message was indeed "Password must contain at least one special character."
    // Let's assert on the exact message:
    assert.equal(error2.message, "Password must contain at least one special character.");

    // ----------------------------------------------------
    // Test 3: resetPassword with invalid password
    // ----------------------------------------------------
    console.log("Running Test 3: resetPassword with invalid password...");
    const req3 = {
      body: {
        email: "test@example.com",
        otp: "123456",
        newPassword: "weak",
        confirmPassword: "weak",
      },
    };
    const { err: error3 } = await callController(resetPassword, req3);
    assert.ok(error3 instanceof ErrorHandler, "Should return ErrorHandler error");
    assert.equal(error3.statusCode, 400, "Should return 400 Bad Request");
    assert.ok(error3.message.includes("Password must be between"), "Should validate password before processing OTP");

    // ----------------------------------------------------
    // Test 4: resetPassword with mismatched passwords
    // ----------------------------------------------------
    console.log("Running Test 4: resetPassword with mismatched passwords...");
    const req4 = {
      body: {
        email: "test@example.com",
        otp: "123456",
        newPassword: "ValidPassword123!",
        confirmPassword: "DifferentPassword123!",
      },
    };
    const { err: error4 } = await callController(resetPassword, req4);
    assert.ok(error4 instanceof ErrorHandler, "Should return ErrorHandler error");
    assert.equal(error4.statusCode, 400, "Should return 400 Bad Request");
    assert.equal(error4.message, "New password and confirm password must be the same.", "Should return mismatch error");

    // ----------------------------------------------------
    // Test 5: updatePassword with invalid password
    // ----------------------------------------------------
    console.log("Running Test 5: updatePassword with invalid password...");
    const dummyUser = await UserModel.create({
      name: "Dummy User",
      email: "dummy@example.com",
      password: "OldPassword123!",
      verifyEmail: true,
    });

    const req5 = {
      user: { id: dummyUser._id },
      body: {
        oldPassword: "OldPassword123!",
        newPassword: "weak",
        confirmPassword: "weak",
      },
    };
    const { err: error5 } = await callController(updatePassword, req5);
    assert.ok(error5 instanceof ErrorHandler, "Should return ErrorHandler error");
    assert.equal(error5.statusCode, 400, "Should return 400 Bad Request");
    assert.ok(error5.message.includes("Password must be between"), "Should validate new password structure");

    // ----------------------------------------------------
    // Test 6: verifyOtp success flow
    // ----------------------------------------------------
    console.log("Running Test 6: verifyOtp success flow...");
    const bcryptjs = (await import("bcryptjs")).default;
    const otpVal = "987654";
    const otpHashed = await bcryptjs.hash(otpVal, 12);
    const otpUser = await UserModel.create({
      name: "OTP User",
      email: "otp@example.com",
      password: "ValidPassword123!",
      verifyEmail: true,
      forgot_password_otp: otpHashed,
      forgot_password_expiry: new Date(Date.now() + 10 * 60 * 1000),
      forgot_password_failedAttempts: 2,
      forgot_password_lockUntil: null,
    });

    const req6 = {
      body: {
        email: "otp@example.com",
        otp: otpVal,
      },
    };

    const { res: res6, err: error6 } = await callController(verifyOtp, req6);
    assert.equal(error6, null, "Should not return an error");
    assert.equal(res6.body.success, true, "Should return success: true");
    assert.equal(res6.body.message, "OTP verified successfully.", "Should verify OTP");

    const updatedOtpUser = await UserModel.findById(otpUser._id);
    assert.equal(updatedOtpUser.forgot_password_failedAttempts, 0, "Should reset failed attempts");
    assert.equal(updatedOtpUser.forgot_password_lockUntil, null, "Should reset lockUntil");

    // ----------------------------------------------------
    // Test 7: verifyOtp invalid OTP flow
    // ----------------------------------------------------
    console.log("Running Test 7: verifyOtp invalid OTP flow...");
    // Update user to have some OTP and reset failed attempts
    await UserModel.findByIdAndUpdate(otpUser._id, {
      forgot_password_otp: otpHashed,
      forgot_password_expiry: new Date(Date.now() + 10 * 60 * 1000),
      forgot_password_failedAttempts: 0,
      forgot_password_lockUntil: null,
    });

    const req7 = {
      body: {
        email: "otp@example.com",
        otp: "wrong_otp",
      },
    };
    const { err: error7 } = await callController(verifyOtp, req7);
    assert.ok(error7 instanceof ErrorHandler, "Should return ErrorHandler error");
    assert.equal(error7.statusCode, 400, "Should return 400 Bad Request");
    assert.equal(error7.message, "Invalid or expired OTP. Please request a new one.");

    // ----------------------------------------------------
    // Test 8: verifyOtp lockout flow
    // ----------------------------------------------------
    console.log("Running Test 8: verifyOtp lockout flow...");
    // Let's perform remaining attempts (max is 5, we did 1 in Test 7, user's failed attempts is now 1)
    // We will do 3 more failures to reach 4 failed attempts
    const req8 = {
      body: {
        email: "otp@example.com",
        otp: "wrong_otp",
      },
    };
    for (let i = 0; i < 3; i++) {
      await callController(verifyOtp, req8);
    }

    // The 5th failure should trigger lockout and return 429
    const { err: error8 } = await callController(verifyOtp, req8);
    assert.ok(error8 instanceof ErrorHandler, "Should return ErrorHandler error");
    assert.equal(error8.statusCode, 429, "Should return 429 Too Many Requests");
    assert.equal(error8.message, "Too many OTP attempts. Please try again later.");

    // ----------------------------------------------------
    // Test 9: verifyEmailOtp success flow
    // ----------------------------------------------------
    console.log("Running Test 9: verifyEmailOtp success flow...");
    const emailOtpVal = "112233";
    const emailOtpHashed = await bcryptjs.hash(emailOtpVal, 12);
    const emailUser = await UserModel.create({
      name: "Email User",
      email: "emailuser@example.com",
      password: "ValidPassword123!",
      verifyEmail: false,
      login_otp: emailOtpHashed,
      login_expiry: new Date(Date.now() + 10 * 60 * 1000),
    });

    const req9 = {
      body: {
        email: "emailuser@example.com",
        otp: emailOtpVal,
      },
    };

    const { res: res9, err: error9 } = await callController(verifyEmailOtp, req9);
    assert.equal(error9, null, "Should not return error on success");
    assert.equal(res9.body.success, true);
    assert.equal(res9.body.message, "Email verified successfully.");

    const updatedEmailUser = await UserModel.findById(emailUser._id);
    assert.equal(updatedEmailUser.verifyEmail, true, "Should verify user email");
    assert.equal(updatedEmailUser.login_otp, null, "Should clear login_otp");
    assert.equal(updatedEmailUser.login_expiry, null, "Should clear login_expiry");

    // ----------------------------------------------------
    // Test 10: verifyEmailOtp invalid OTP flow
    // ----------------------------------------------------
    console.log("Running Test 10: verifyEmailOtp invalid OTP flow...");
    const emailUser2 = await UserModel.create({
      name: "Email User 2",
      email: "emailuser2@example.com",
      password: "ValidPassword123!",
      verifyEmail: false,
      login_otp: emailOtpHashed,
      login_expiry: new Date(Date.now() + 10 * 60 * 1000),
    });

    const req10 = {
      body: {
        email: "emailuser2@example.com",
        otp: "wrong_otp",
      },
    };

    const { err: error10 } = await callController(verifyEmailOtp, req10);
    assert.ok(error10 instanceof ErrorHandler);
    assert.equal(error10.statusCode, 401);
    assert.equal(error10.message, "Invalid OTP");

    // ----------------------------------------------------
    // Test 11: verifyEmailOtp expired OTP flow
    // ----------------------------------------------------
    console.log("Running Test 11: verifyEmailOtp expired OTP flow...");
    const expiredUser = await UserModel.create({
      name: "Expired User",
      email: "expired@example.com",
      password: "ValidPassword123!",
      verifyEmail: false,
      login_otp: emailOtpHashed,
      login_expiry: new Date(Date.now() - 5000), // expired 5 seconds ago
    });

    const req11 = {
      body: {
        email: "expired@example.com",
        otp: emailOtpVal,
      },
    };

    const { err: error11 } = await callController(verifyEmailOtp, req11);
    assert.ok(error11 instanceof ErrorHandler);
    assert.equal(error11.statusCode, 410);
    assert.ok(error11.message.includes("OTP expired. A new OTP has been sent"));

    const updatedExpiredUser = await UserModel.findById(expiredUser._id);
    assert.notEqual(updatedExpiredUser.login_otp, emailOtpHashed, "Should hash the newly generated OTP");
    assert.notEqual(updatedExpiredUser.login_otp, null);
    assert.ok(updatedExpiredUser.login_expiry > new Date());

    // ----------------------------------------------------
    // Test 12: resendOtp hashes the new OTP
    // ----------------------------------------------------
    console.log("Running Test 12: resendOtp hashes the new OTP...");
    const req12 = {
      body: {
        email: "emailuser2@example.com",
      },
    };
    const { res: res12, err: error12 } = await callController(resendOtp, req12);
    assert.equal(error12, null);
    assert.equal(res12.body.success, true);

    const updatedResendUser = await UserModel.findById(emailUser2._id);
    assert.notEqual(updatedResendUser.login_otp, emailOtpHashed, "Should set a new hashed OTP");
    assert.ok(updatedResendUser.login_otp.startsWith("$2a$") || updatedResendUser.login_otp.startsWith("$2b$"), "Should be a bcrypt hash");

    // ----------------------------------------------------
    // Test 13: updateUserDetails response schema consistency
    // ----------------------------------------------------
    console.log("Running Test 13: updateUserDetails response schema consistency...");
    const req13 = {
      user: { _id: emailUser._id },
      body: {
        mobile: "9988776655",
      },
    };
    const { res: res13, err: error13 } = await callController(updateUserDetails, req13);
    assert.equal(error13, null, "Should update user details successfully");
    assert.equal(res13.body.success, true);
    assert.equal(res13.body.message, "User details updated successfully");
    assert.ok(res13.body.user, "Should contain the user key");
    assert.equal(res13.body.data, undefined, "Should NOT contain the duplicate data key");

    // ----------------------------------------------------
    // Test 14: MANAGER role soft-delete visibility check
    // ----------------------------------------------------
    console.log("Running Test 14: MANAGER role soft-delete visibility check...");
    const softDeletedUser = await UserModel.create({
      name: "Soft Deleted",
      email: "softdeleted@example.com",
      password: "ValidPassword123!",
      verifyEmail: true,
      isDeleted: true,
      deletedAt: new Date(),
    });

    const req14List = {
      user: { role: "MANAGER", _id: dummyUser._id },
      query: { page: 1, limit: 10, search: "" },
    };

    const { res: res14List, err: error14List } = await callController(getAllUsers, req14List);
    assert.equal(error14List, null);
    const hasSoftDeleted = res14List.body.data.some((u) => u.email === "softdeleted@example.com");
    assert.equal(hasSoftDeleted, false, "MANAGER should not see soft-deleted users in listing");

    const req14Get = {
      user: { role: "MANAGER", _id: dummyUser._id },
      params: { id: softDeletedUser._id },
    };
    const { err: error14Get } = await callController(getSingleUser, req14Get);
    assert.ok(error14Get instanceof ErrorHandler);
    assert.equal(error14Get.statusCode, 404, "MANAGER should get 404 for soft-deleted user");
    assert.equal(error14Get.message, "User not found");

    // ----------------------------------------------------
    // Test 15: MANAGER role cannot update status or delete soft-deleted user
    // ----------------------------------------------------
    console.log("Running Test 15: MANAGER role cannot manage soft-deleted users...");
    const req15Delete = {
      user: { role: "MANAGER", _id: dummyUser._id },
      params: { id: softDeletedUser._id },
    };
    const { err: error15Delete } = await callController(deleteUser, req15Delete);
    assert.ok(error15Delete instanceof ErrorHandler);
    assert.equal(error15Delete.statusCode, 404, "MANAGER should get 404 on deleting soft-deleted user");

    const req15Status = {
      user: { role: "MANAGER", _id: dummyUser._id },
      params: { id: softDeletedUser._id },
      body: { status: "Suspended" },
    };
    const { err: error15Status } = await callController(updateUserStatus, req15Status);
    assert.ok(error15Status instanceof ErrorHandler);
    assert.equal(error15Status.statusCode, 404, "MANAGER should get 404 on updating status of soft-deleted user");

    // ----------------------------------------------------
    // Test 16: ADMIN role can see and manage soft-deleted users
    // ----------------------------------------------------
    console.log("Running Test 16: ADMIN role can see and manage soft-deleted users...");
    const req16List = {
      user: { role: "ADMIN", _id: dummyUser._id },
      query: { page: 1, limit: 10, search: "" },
    };
    const { res: res16List, err: error16List } = await callController(getAllUsers, req16List);
    assert.equal(error16List, null);
    const hasSoftDeletedAdmin = res16List.body.data.some((u) => u.email === "softdeleted@example.com");
    assert.equal(hasSoftDeletedAdmin, true, "ADMIN should see soft-deleted users in listing");

    const req16Get = {
      user: { role: "ADMIN", _id: dummyUser._id },
      params: { id: softDeletedUser._id },
    };
    const { res: res16Get, err: error16Get } = await callController(getSingleUser, req16Get);
    assert.equal(error16Get, null);
    assert.equal(res16Get.body.data.email, "softdeleted@example.com", "ADMIN should fetch soft-deleted user");

    const req16Status = {
      user: { role: "ADMIN", _id: dummyUser._id },
      params: { id: softDeletedUser._id },
      body: { status: "Suspended" },
    };
    const { res: res16Status, err: error16Status } = await callController(updateUserStatus, req16Status);
    assert.equal(error16Status, null);
    assert.equal(res16Status.body.user.status, "Suspended", "ADMIN should successfully update status of soft-deleted user");

    // ----------------------------------------------------
    // Test 17: Route middleware order for /upload-avatar
    // ----------------------------------------------------
    console.log("Running Test 17: verify auth middleware precedes upload on /upload-avatar route...");
    const avatarRouteLayer = userRouter.stack.find(
      (layer) => layer.route && layer.route.path === "/upload-avatar"
    );
    assert.ok(avatarRouteLayer, "/upload-avatar route layer should exist");
    const middlewareNames = avatarRouteLayer.route.stack.map((s) => s.name);
    assert.equal(middlewareNames[0], "auth", "auth middleware must execute BEFORE multer file processing");

    console.log("All password reset/validation/OTP/Email verification/User details/Admin visibility tests passed successfully.");
  } finally {
    console.log("Disconnecting from database...");
    await mongoose.disconnect();
  }
};

runTests().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
