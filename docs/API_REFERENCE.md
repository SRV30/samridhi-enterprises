# API Reference

Complete REST API reference for the Samridhi Enterprises backend.

All endpoints are mounted under the `/api` prefix by the Express server
(`server/index.js`). In local development the base URL is:

```
http://localhost:5000/api
```

In production it is the deployed server origin followed by `/api`.

---

## Authentication

The API uses **stateless JWT authentication**.

1. A user registers (`POST /api/user/register`) and verifies their email with a
   one-time password (`POST /api/user/verify-email`).
2. On a successful login (`POST /api/user/login`) the API returns a JWT in the
   JSON body (it is also set as an `httpOnly` cookie):

   ```json
   { "success": true, "user": { ... }, "token": "<JWT>", "verifyEmail": true }
   ```

3. For every protected request the client sends that token in the
   `Authorization` header:

   ```
   Authorization: Bearer <JWT>
   ```

The token payload is `{ id, role }` and is signed with `JWT_SECRET`, expiring
after `JWT_EXPIRE`. The `auth` middleware (`server/middleware/auth.js`) reads
the token from the `Authorization` header only — not from the cookie — so the
header must be set on protected requests.

### Access levels

| Symbol | Meaning | Middleware |
|--------|---------|------------|
| 🔓 | Public — no token required | none |
| 🔒 | Authenticated — any logged-in user | `auth` |
| 🛡️ | Admin/Manager only (`role` is `ADMIN` or `MANAGER`) | `auth` + `admin` |

A 🔒 request with a missing/invalid token returns `401`
`{ "success": false, "message": "Please login again" }` (or
`"Token expired, please login again"` for an expired/invalid JWT). A 🛡️ request
from a non-admin returns `401`
`{ "success": false, "message": "Not Authorized Login Again" }`.

File-upload endpoints accept `multipart/form-data` (handled by `multer`); all
other request bodies are JSON.

---

## Users — `/api/user`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/register` | 🔓 | Register a new user. Body: `{ name, email, password }`. Sends an email OTP. |
| POST | `/verify-email` | 🔓 | Verify the email OTP. Body: `{ email, otp }`. |
| POST | `/resend-otp` | 🔓 | Resend the email OTP. Body: `{ email }`. |
| POST | `/login` | 🔓 | Log in. Body: `{ email, password }`. Returns a JWT. Account `status` must be `Active`. |
| GET | `/logout` | 🔓 | Clear the auth cookie. |
| GET | `/me` | 🔒 | Get the current user's profile. |
| PUT | `/update-user` | 🔒 | Update own profile. `multipart/form-data` with optional `avatar` file; fields: `{ name, email, mobile, password }`. |
| PUT | `/upload-avatar` | 🔒 | Upload/replace the avatar. `multipart/form-data` with an `avatar` file. |
| PUT | `/update/password` | 🔒 | Change password. Body: `{ oldPassword, newPassword, confirmPassword }`. |
| PUT | `/forgot-password` | 🔓 | Start password reset. Body: `{ email }`. Sends a reset OTP. |
| PUT | `/verify-otp` | 🔓 | Verify the reset OTP. Body: `{ email, otp }`. |
| PUT | `/reset-password` | 🔓 | Set a new password. Body: `{ email, newPassword, confirmPassword }`. |
| GET | `/admin/get` | 🛡️ | List all users. |
| GET | `/admin/get/:id` | 🛡️ | Get a single user by id. |
| PUT | `/admin/update` | 🛡️ | Update a user's role. |
| PATCH | `/admin/:id/status` | 🛡️ | Update a user's account status (`Active` / `Warning` / `Suspended`). |
| DELETE | `/admin/delete/:id` | 🛡️ | Delete a user. |

---

## Brands — `/api/brand`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/get` | 🔓 | List all brands. |
| POST | `/add` | 🛡️ | Create a brand. `multipart/form-data` with an `image` file; field: `{ name }`. |
| PUT | `/update/:id` | 🛡️ | Update a brand. `multipart/form-data` with optional `image`; field: `{ name }`. |
| DELETE | `/delete/:id` | 🛡️ | Delete a brand. |

---

## Bike Models — `/api/bike-model`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/get` | 🔓 | List all bike models. |
| POST | `/add` | 🛡️ | Create a bike model. `multipart/form-data` with an `image`; fields: `{ name, brand, engineType, yearStart, yearEnd }`. |
| PUT | `/update/:id` | 🛡️ | Update a bike model. `multipart/form-data` with optional `image`; same fields as add. |
| DELETE | `/delete/:id` | 🛡️ | Delete a bike model. |

`yearStart` / `yearEnd` / `engineType` are optional; an empty value means the
model matches any year / engine type (treated as universally compatible).

---

## Parts (Products) — `/api/parts`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/get` | 🔓 | List parts (supports catalogue browsing, filtering and pagination). |
| GET | `/get/:id` | 🔓 | Get a single part by id. |
| GET | `/get/:id/similar` | 🔓 | Get parts similar to the given part. |
| POST | `/add` | 🛡️ | Create a part. `multipart/form-data` with up to 5 `images`; fields: `{ product_id, name, description, price, stock, vehicleCompatibility, category, bestseller }`. |
| PUT | `/update/:id` | 🛡️ | Update a part. `multipart/form-data` with up to 5 `images`; same fields as add. |
| DELETE | `/delete/:id` | 🛡️ | Delete a part. |
| POST | `/review/:id` | 🔒 | Create or update the caller's review for a part. Body: `{ rating, comment }`. |
| DELETE | `/review/:id` | 🔒 | Delete the caller's review for a part. |

`category` must be one of the catalogue's predefined categories (see
[Database Schema → Part](./DATABASE_SCHEMA.md#part)). `vehicleCompatibility` is a
list of Bike Model ids.

---

## Cart — `/api/cart`

All cart routes are 🔒 (scoped to the logged-in user).

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | 🔒 | Get the current user's cart. |
| POST | `/` | 🔒 | Add an item to the cart. Body: `{ partId, quantity }`. |
| PUT | `/:partId` | 🔒 | Update the quantity of a cart line. Body: `{ quantity }`. |
| DELETE | `/:partId` | 🔒 | Remove a line from the cart. |
| DELETE | `/clear` | 🔒 | Empty the cart. |

Quantities are validated and clamped to the part's available stock server-side.

---

## Addresses — `/api/address`

All address routes are 🔒 (scoped to the logged-in user).

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/my` | 🔒 | List the user's saved addresses. |
| POST | `/add` | 🔒 | Add an address. Body: `{ fullName, phone, addressLine, city, state, pincode, label, isDefault }`. |
| PUT | `/update/:id` | 🔒 | Update an address. |
| DELETE | `/delete/:id` | 🔒 | Delete an address. |
| PUT | `/default/:id` | 🔒 | Mark an address as the default (clears the flag on the user's other addresses). |

---

## Orders — `/api/orders`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/new` | 🔒 | Place an order. `multipart/form-data` with an optional `paymentScreenshot` (UPI proof for Online payments); body includes the shipping address fields, `paymentMethod` (`COD` / `Online`), and optional `couponCode`. |
| GET | `/my-orders` | 🔒 | List the caller's orders. |
| GET | `/:id` | 🔒 | Get a single order by id (must belong to the caller). Keep last so it does not shadow the specific routes above. |
| GET | `/admin/all` | 🛡️ | List all orders. |
| PUT | `/admin/verify/:id` | 🛡️ | Approve or reject an Online payment. Body: `{ action, rejectionReason }`. |
| PUT | `/admin/status/:id` | 🛡️ | Advance the order status. Body: `{ orderStatus }`. |
| GET | `/admin/analytics` | 🛡️ | Dashboard analytics (revenue, counts, etc.) computed from live data. |
| GET | `/admin/inventory` | 🛡️ | Inventory overview (stock health, low-stock). |
| GET | `/admin/sales-analytics` | 🛡️ | Chart-oriented sales analytics: monthly trends, top products, customer growth, recent orders. |

See [Admin Workflows → Order processing](./ADMIN_WORKFLOWS.md#order-processing--payment-verification)
for the full lifecycle, and [Database Schema → Order](./DATABASE_SCHEMA.md#order)
for the `paymentStatus` / `orderStatus` enums.

---

## Coupons — `/api/coupon`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/validate` | 🔒 | Validate/apply a coupon against the caller's cart. Body: `{ code }`. |
| POST | `/admin/create` | 🛡️ | Create a coupon. Body: `{ code, description, discountType, discountValue, minOrderAmount, maxDiscount, expiresAt, usageLimit, isActive }`. |
| GET | `/admin/get` | 🛡️ | List all coupons. |
| PUT | `/admin/update/:id` | 🛡️ | Update a coupon. |
| DELETE | `/admin/delete/:id` | 🛡️ | Delete a coupon. |

`discountType` is `PERCENTAGE` or `FIXED`. For `PERCENTAGE`, `maxDiscount` caps
the rupee discount (`0` = no cap). `usageLimit` `0` = unlimited.

---

## Payment Settings — `/api/payment-settings`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | 🔒 | Get the store's UPI id and QR image (used at checkout for Online payments). |
| PUT | `/admin/update` | 🛡️ | Update payment settings. `multipart/form-data` with an optional `qrImage`; field: `{ upiId }`. |

---

## Support Tickets — `/api/support`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/create` | 🔒 | Open a support ticket. Body: `{ subject, category, priority, message }`. |
| GET | `/my` | 🔒 | List the caller's tickets. |
| GET | `/my/:id` | 🔒 | Get one of the caller's tickets (with its message thread). |
| POST | `/my/:id/message` | 🔒 | Add a message to the caller's ticket. Body: `{ body }`. |
| GET | `/admin/get` | 🛡️ | List all tickets. |
| GET | `/admin/:id` | 🛡️ | Get any ticket by id. |
| PUT | `/admin/:id/status` | 🛡️ | Update a ticket's status (`Open` / `In Progress` / `Resolved` / `Closed`). Body: `{ status }`. |
| POST | `/admin/:id/reply` | 🛡️ | Post an admin reply on a ticket. Body: `{ body }`. |

`category` is one of `Order` / `Payment` / `Product` / `Shipping` / `Account` /
`Other`; `priority` is `Low` / `Medium` / `High`.

---

## Administrative Extensions — `/api/parts` & `/api/cart`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| PUT | `/api/parts/admin/bulk-stock` | 🛡️ | Bulk update inventory stock quantities. Body: `{ items: [{ partId, stock }] }`. |
| DELETE | `/api/cart/admin/cleanup` | 🛡️ | Clean up stale abandoned carts inactive for > 30 days. |

---

### Garage (`/api/garage`)

Manage the user's personal vehicle garage for compatibility lookups.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | 🔐 | Add a vehicle to garage. Body: `{ bikeModel, year, variant?, features?, isDefault? }`. |
| GET | `/` | 🔐 | List all vehicles for the logged-in user. Default vehicle first. |
| PUT | `/:id` | 🔐 | Update a vehicle. Body fields same as POST. |
| DELETE | `/:id` | 🔐 | Remove a vehicle. Promotes next-oldest to default if deleted was default. |
| PATCH | `/:id/default` | 🔐 | Set a vehicle as the default. |

Vehicles are scoped per user (max 10). The `bikeModel` field references a `BikeModel` document by ObjectId.

---

## Conventions & error shape

- Successful responses are JSON and typically include `success: true` plus the
  relevant resource(s).
- Errors are JSON with `success: false` and a `message`. Common status codes:
  `400` (validation), `401` (auth/role), `404` (not found), `500` (server).
- Money values are in INR (₹) and integers/decimals as stored.
- Image fields are Cloudinary objects of the form
  `{ public_id, url }` (see the schema docs).

> This reference is generated from the route definitions in `server/route/` and
> the controllers in `server/controllers/`. When you add or change a route,
> update the matching table here in the same PR.
