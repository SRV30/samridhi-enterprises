# Codebase Audit Report — Samridhi Enterprises

This report identifies 10 critical bugs, security vulnerabilities, and technical debt items discovered during a manual audit of the repository.

---

## 1. [BUG] Suspended users retain API access via active JWT
**Type:** bug
**Difficulty:** newbie (10 XP)

### Why This Issue Exists
In `server/middleware/auth.js` (Lines 14–17), the authentication middleware verifies the JWT and checks for the user's existence but completely ignores the `status` field defined in the `User` model.

### Business Impact
Allows malicious or banned users to continue interacting with the platform (placing orders, posting reviews) until their 5-day JWT expires, even after an admin has suspended them.

### GitHub Issue Description
**Description**
The `auth` middleware fails to validate the `status` field of the user. Once a user is authenticated via JWT, they are granted full access even if their account status is set to 'Suspended' or 'Warning' in the database.

**Steps to Reproduce**
1. Log in as a standard user and capture the JWT token.
2. Using an Admin account, update the standard user's status to 'Suspended' via `/api/user/admin/:id/status`.
3. Use the captured JWT to make a request to a protected route (e.g., `/api/cart/get`).
4. The request succeeds instead of being blocked.

**Expected Behavior**
The `auth` middleware should check if `req.user.status === 'Active'`. If not, it should return a 403 Forbidden response.

---

## 2. [BUG] Lack of rate limiting on OTP verification endpoints
**Type:** bug
**Difficulty:** adventurer (25 XP)

### Why This Issue Exists
In `server/controllers/userController.js` (Lines 105–107), the OTP verification logic lacks any rate-limiting or attempt-counting mechanism. The OTP is a simple 6-digit number and is valid for 15 minutes.

### Business Impact
High risk of account takeover during the "Forgot Password" flow and "Email Verification" bypass.

### GitHub Issue Description
**Description**
The `verifyEmailOtp` and `verifyOtp` endpoints do not track failed attempts. This allows for automated brute-force attacks against the 6-digit OTP codes.

**Steps to Reproduce**
1. Trigger a forgot password OTP for any user.
2. Send hundreds of requests to `/api/user/verify-otp` with incrementing OTP values.
3. Observe that the server continues to process and respond without throttling or locking the account.

---

## 3. [BUG] Non-atomic stock deduction in createOrder
**Type:** bug
**Difficulty:** veteran (50 XP)

### Why This Issue Exists
In `server/controllers/orderController.js` (Lines 83–85), stock is deducted in a standard `for` loop using `findByIdAndUpdate`. This is not atomic.

### Business Impact
Inventory drift and financial discrepancies. Customers may be charged for orders that failed to record in the system due to a crash mid-loop.

### GitHub Issue Description
**Description**
Order creation and stock deduction are performed as separate, non-transactional operations. A failure during the stock-deduction loop leaves the inventory in a corrupted state without a corresponding order record.

---

## 4. [BUG] Redundant shoppingCart and wishlist fields in User model
**Type:** bug
**Difficulty:** newbie (10 XP)

### Why This Issue Exists
The `User` model defines `shoppingCart` and `shoppingWishlist` arrays which are completely ignored by the current `Cart` controller logic, which uses a separate collection.

### Business Impact
Increases database storage unnecessarily and confuses developers regarding the source of truth for user data.

### GitHub Issue Description
**Description**
The User model contains legacy/redundant fields `shoppingCart` and `shoppingWishlist` that are not synced with the actual `Cart` model used in the application.

---

## 5. [BUG] failedAttempts counter is never updated in loginUser
**Type:** bug
**Difficulty:** newbie (10 XP)

### Why This Issue Exists
The `User` model includes a `failedAttempts` field, but the `loginUser` controller never increments it on failure, rendering account lockout impossible.

### Business Impact
Lack of account lockout mechanisms increases the success rate of automated password guessing attacks.

### GitHub Issue Description
**Description**
The `failedAttempts` field in the User model is never updated during login failures, rendering account lockout features impossible to implement.

---

## 6. [BUG] Sensitive user data (password hashes) leaked in server logs
**Type:** bug
**Difficulty:** newbie (10 XP)

### Why This Issue Exists
In `server/controllers/userController.js` (Line 150), the code logs the entire user object (including the hashed password) to the console during login.

### Business Impact
Sensitive password hashes are exposed in application logs, which could be captured by unauthorized systems.

### GitHub Issue Description
**Description**
The `loginUser` controller logs the full user document, including the hashed password, to the standard output.

---

## 7. [FEATURE] Implement Customer-side Order Cancellation
**Type:** feature
**Difficulty:** adventurer (25 XP)

### Why This Issue Exists
Currently, only Admins can update order statuses. There is no endpoint allowing a customer to cancel their own order before it is processed.

### Business Impact
Increased support ticket volume and manual overhead for simple cancellations.

### GitHub Issue Description
**Description**
Allow customers to cancel their own orders directly from the "My Orders" page if the order is still in 'Pending Verification' or 'Confirmed' status.

---

## 8. [BUG] Inconsistent Cloudinary folder prefixes causing deletion failures
**Type:** bug
**Difficulty:** newbie (10 XP)

### Why This Issue Exists
`updateUserDetails` uses `nj/` for uploads, while `deleteUser` attempts deletion from `ff/`. This means avatars are never actually deleted from storage when a user is removed.

### Business Impact
Cloudinary storage bloat and orphaned assets leading to higher costs.

### GitHub Issue Description
**Description**
Hardcoded folder prefixes and manual URL parsing for Cloudinary deletions are error-prone and inconsistent across controllers.

---

## 9. [FEATURE] Automated Admin notifications for new orders
**Type:** feature
**Difficulty:** adventurer (25 XP)

### Why This Issue Exists
The `createOrder` controller sends an email to the customer but provides no notification to the store owner or admin.

### Business Impact
Delayed fulfillment and slow payment verification as admins are not alerted to new orders requiring attention.

### GitHub Issue Description
**Description**
Automate email notifications to the Admin when a new order is placed, specifically those requiring manual payment verification.

---

## 10. [BUG] Insecure random number generation for OTPs
**Type:** bug
**Difficulty:** newbie (10 XP)

### Why This Issue Exists
The utility `server/utils/generatedOtp.js` uses `Math.random()`, which is not cryptographically secure for sensitive operations like authentication.

### Business Impact
Potential predictability of OTP sequences, compromising the security of the authentication system.

### GitHub Issue Description
**Description**
The application uses `Math.random()` for generating sensitive 6-digit OTPs. This should be replaced with `crypto.randomInt()`.
