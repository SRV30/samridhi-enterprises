# Architecture

Samridhi Enterprises is a **MERN** (MongoDB, Express, React, Node.js) vehicle spare-parts
e-commerce platform split into two deployable units:

- **`client/`** — A React 19 single-page application built with Vite.
- **`server/`** — An Express 5 REST API backed by MongoDB (Mongoose).

External services: **Cloudinary** (image storage) and **Brevo** (transactional email / OTP).
Online payments use the store-managed UPI verification flow; there is no third-party payment gateway.

## High-level System Diagram

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│           CLIENT            │  HTTPS  │            SERVER            │
│  React + Vite SPA           │ ──────► │  Express REST API (/api/*)   │
│                             │  JSON / │                              │
│  • Redux Toolkit (state)    │ multipart                            │
│  • React Router (routing)   │         │  Route → Middleware →        │
│  • Axios (HTTP, Bearer)     │ ◄────── │  Controller → Model          │
│  • Tailwind CSS (styling)   │  JSON   │                              │
└─────────────────────────────┘         └───────────────┬──────────────┘
                                                         │
                          ┌──────────────────────────────┼───────────────────┐
                          ▼                               ▼                   ▼
                 ┌─────────────────┐            ┌──────────────────┐  ┌──────────────┐
                 │  MongoDB Atlas  │            │   Cloudinary     │  │    Brevo     │
                 │   (Mongoose)    │            │ (image storage)  │  │ (email OTP)  │
                 └─────────────────┘            └──────────────────┘  └──────────────┘
```

## Backend Layers

| Layer | Directory | Responsibility |
|-------|-----------|----------------|
| Entry | `server/index.js` | Loads env, configures middleware, mounts routers, connects to DB |
| Config | `server/config/` | Database connection, environment variable parsing |
| Routes | `server/route/` | Endpoint declarations with middleware (auth, admin, multer) |
| Middleware | `server/middleware/` | Auth, RBAC, rate limiting, validation, error handling, input sanitization |
| Controllers | `server/controllers/` | Request handling and business logic |
| Models | `server/models/` | Mongoose schemas and data layer |
| Utils | `server/utils/` | JWT helpers, error handler, email utilities |

## Frontend Architecture

- **State Management** — Redux Toolkit (`@reduxjs/toolkit`)
- **Routing** — React Router DOM v7 with `ProtectedRoute` guards
- **HTTP** — Axios with Bearer token interceptor
- **Styling** — Tailwind CSS v4
- **Animations** — Framer Motion
- **Icons** — Lucide React

## Shared Code

`shared/constants/permissions.js` provides a single source of truth for roles (`ADMIN`,
`MANAGER`, `USER`), granular permissions, role hierarchy, and helper functions — shared
across both the client and server.

---

> **Full Documentation:** For the complete architecture deep-dive, see
> [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md). For endpoint contracts, see
> [`docs/API_REFERENCE.md`](./docs/API_REFERENCE.md). For database schemas, see
> [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md).
