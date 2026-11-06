# 🚗 Samridhi Enterprises — Vehicle Spare Parts E-Commerce

**Samridhi Enterprises** is a professional full-stack MERN e-commerce platform designed for managing and selling vehicle spare parts. The project provides a seamless experience for buyers to find parts and for admins and sellers to manage inventory.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Folder Structure](#-folder-structure)
- [Documentation](#-documentation)
- [Local Development Setup](#️-local-development-setup)
- [Environment Variables](#-environment-variables)
- [MongoDB Atlas Setup](#-mongodb-atlas-setup)
- [Cloudinary Setup](#-cloudinary-setup)
- [Brevo Email Setup](#-brevo-email-setup)
- [Deployment Guide](#-deployment-guide)
- [Screenshots](#-screenshots)
- [Future Roadmap](#-future-roadmap)
- [ELUSOC 2026 Contribution Guide](#-elusoc-2026-contribution-guide)
- [Developer Info](#️-developer-info)

---

## 🚀 Features

### 👤 User Features
- **Authentication:** Secure login and registration using JWT.
- **Product Browsing:** Search and filter vehicle parts by brand and model.
- **Cart Management:** Add/remove items and manage quantities.
- **Reviews & Ratings:** Share feedback on purchased products.
- **Profile Management:** Update personal information and view order history.

### 🏪 Seller Features
- **Inventory Management:** Add and update stock levels for parts.
- **Product Listings:** Manage detailed listings including images and specifications.

### 🛡️ Admin Features
- **Dashboard:** Comprehensive overview of site activity and sales.
- **User Management:** Manage user roles and permissions.
- **Product Moderation:** Review and approve product listings.
- **Brand/Model Management:** Manage the database of vehicle brands and models.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite, Redux Toolkit, Tailwind CSS, Framer Motion, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Image Storage | Cloudinary |
| Email Service | Brevo (formerly Sendinblue) |
| Deployment | Vercel (Frontend + Backend) |

---

## 📂 Folder Structure

```text
samridhi-enterprises/
├── client/                  # Frontend React application
│   ├── public/              # Static assets
│   └── src/
│       ├── api/             # Axios instance and API calls
│       ├── components/      # Reusable UI components
│       ├── pages/           # Page-level components
│       └── store/           # Redux state management
└── server/                  # Backend Node.js application
    ├── config/              # Database and service configurations
    ├── controllers/         # API request handlers
    ├── middleware/          # Custom Express middleware
    ├── models/              # Mongoose schemas
    ├── route/               # API route definitions
    └── template/            # Email templates
```

---

## 📚 Documentation

In-depth technical documentation lives in the [`docs/`](./docs) directory:

- **[Architecture Overview](./docs/ARCHITECTURE.md)** — system design, backend layers, request lifecycle, and the authentication & authorization flow.
- **[API Reference](./docs/API_REFERENCE.md)** — every REST endpoint across all 10 routers, with method, path, access level, and request fields.
- **[Database Schema](./docs/DATABASE_SCHEMA.md)** — all 10 Mongoose models with fields, types, enums, and relationships.
- **[Admin Workflows](./docs/ADMIN_WORKFLOWS.md)** — admin/manager operations: users, catalogue, order & payment verification, coupons, support, and analytics.
- **[Workflow Guide](./docs/WORKFLOWS.md)** — in-depth breakdown of order processing, concurrency, atomic inventory reservation, stock restoration, payment verification, and status transition guards.
- **[Environment Variables](./docs/ENVIRONMENT.md)** — a developer reference for every backend/frontend variable and where it is used.

New contributors can start with [`docs/README.md`](./docs/README.md) for an index.

---

## ⚙️ Local Development Setup

### Prerequisites

Make sure the following are installed before you begin:

| Tool | Version | Download |
|---|---|---|
| Node.js | v20 or higher (CI uses v20) | https://nodejs.org |
| Git | Any recent version | https://git-scm.com |
| MongoDB | Local or Atlas | https://mongodb.com |

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/SRV30/samridhi-enterprises.git
cd samridhi-enterprises
```

---

### Step 2 — Set up the backend (server)

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Copy the environment variables template
cp .env.example .env
```

Open `server/.env` and fill in all required values.
See [Environment Variables](#-environment-variables) below for what each variable means and where to get it.

The backend uses MongoDB transactions for order inventory and address/garage consistency. Use MongoDB Atlas or another replica-set deployment in production; a standalone MongoDB server does not support these transactions. If `MONGODB_URL` is omitted in local development, the backend starts an in-memory MongoDB replica set (data is temporary).

```bash
# Start the backend development server (runs on http://localhost:5000)
npm run dev
```

---

### Step 3 — Set up the frontend (client)

Open a new terminal window, then:

```bash
# Navigate to the client directory (from the repo root)
cd client

# Install dependencies
npm install

# Copy the environment variables template
cp .env.example .env
```

Open `client/.env` and set `VITE_BACKEND_URL` to your running backend URL:

```env
VITE_BACKEND_URL="http://localhost:5000"
```

```bash
# Start the frontend development server (runs on http://localhost:5173)
npm run dev
```

The application will be available at **http://localhost:5173**.

---

## 🔐 Environment Variables

### Frontend — `client/.env`

| Variable | Description | Example |
|---|---|---|
| `VITE_BACKEND_URL` | Full URL of the running backend server | `http://localhost:5000` |

---

### Backend — `server/.env`

| Variable | Description | Where to get it |
|---|---|---|
| `PORT` | Port the Express server listens on | Any free port, default `5000` |
| `MONGODB_URL` | MongoDB connection string | MongoDB Atlas → Connect → Drivers |
| `FRONTEND_URL` | Production URL of your frontend | Your Vercel frontend URL |
| `FRONTEND_WWW_URL` | `www.` variant of the frontend URL (for CORS) | Same as above with `www.` prefix |
| `JWT_SECRET` | Secret key used to sign JWT tokens | Any long random string (min 32 chars) |
| `JWT_EXPIRE` | JWT token expiry duration | `5d` (5 days) |
| `COOKIE_EXPIRE` | Cookie expiry in days | `7` |
| `BREVO_API_KEY` | API key for Brevo email service | Brevo dashboard → API Keys |
| `CLOUDINARY_NAME` | Your Cloudinary cloud name | Cloudinary dashboard → Settings |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Cloudinary dashboard → API Keys |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Cloudinary dashboard → API Keys |

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`. Only commit `.env.example` with placeholder values.

---

## 🍃 MongoDB Atlas Setup

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign in or create a free account.
2. Click **New Project**, give it a name (e.g. `samridhi`), and click **Create Project**.
3. Click **Build a Database** → choose **M0 Free Tier** → select your nearest region → click **Create**.
4. Set a **database username** and **password** — save these, you will need them in the connection string.
5. Under **Network Access**, click **Add IP Address** → choose **Allow Access from Anywhere** (`0.0.0.0/0`) for development, or add your specific IP for production.
6. Once the cluster is created, click **Connect** → **Connect your application** → choose **Driver: Node.js** and copy the connection string.
7. Replace `<password>` in the string with your database password and add your database name before `?`:

```env
MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/samridhi?retryWrites=true&w=majority
```

8. Paste the full string into `server/.env` as `MONGODB_URL`.

---

## 🌥️ Cloudinary Setup

Cloudinary stores product images uploaded through the admin panel.

1. Go to [https://cloudinary.com](https://cloudinary.com) and sign in or create a free account.
2. From your **Dashboard**, copy your **Cloud Name**, **API Key**, and **API Secret**.
3. Add them to `server/.env`:

```env
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> The free tier provides 25 GB storage and 25 GB bandwidth per month — more than enough for development.

---

## 📧 Brevo Email Setup

Brevo (formerly Sendinblue) handles transactional emails such as order confirmations and password resets.

1. Go to [https://app.brevo.com](https://app.brevo.com) and sign in or create a free account.
2. In the top-right menu, click your name → **SMTP & API**.
3. Click the **API Keys** tab → **Generate a new API key** → give it a name and click **Generate**.
4. Copy the generated key and add it to `server/.env`:

```env
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

5. Under **Senders & Domains**, verify the email address you want to send from. Brevo requires sender verification before emails are delivered.

> The free tier allows up to 300 emails per day.

---

## 🌐 Deployment Guide

### Backend Deployment (Vercel)

The server already includes a `vercel.json` configuration file. No additional setup is needed for routing.

1. Push your code to GitHub.
2. Go to [https://vercel.com](https://vercel.com) → **New Project** → import your repository.
3. Set the **Root Directory** to `server`.
4. Under **Environment Variables**, add all variables from `server/.env`.
5. Click **Deploy**.
6. Copy the deployed backend URL (e.g. `https://se-xxx.vercel.app`) — you will need it for the frontend.

---

### Frontend Deployment (Vercel)

1. Go to [https://vercel.com](https://vercel.com) → **New Project** → import the same repository.
2. Set the **Root Directory** to `client`.
3. Under **Environment Variables**, add:

```
VITE_BACKEND_URL = https://your-backend-url.vercel.app
```

4. Click **Deploy**.
5. Copy the frontend URL, then go back to your **backend** Vercel project → **Settings → Environment Variables** → update `FRONTEND_URL` and `FRONTEND_WWW_URL` with the new frontend URL, then **Redeploy** the backend.

> ⚠️ **Important:** After deploying the frontend, always redeploy the backend with the updated `FRONTEND_URL` and `FRONTEND_WWW_URL` values. These are used for CORS — requests will be blocked without them.

---

## 📸 Screenshots

> 📷 Screenshots are being captured and will render here automatically once the image files are added to [`docs/screenshots/`](docs/screenshots/). Contributors: see the [capture guide](docs/screenshots/README.md) for the exact pages, filenames, and viewport sizes to grab.

### 👤 User Interface

<table>
  <tr>
    <td align="center" width="50%">
      <img src="docs/screenshots/home-page.png" alt="Home page with hero banner and featured products" width="100%" /><br/>
      <sub><b>Home Page</b></sub>
    </td>
    <td align="center" width="50%">
      <img src="docs/screenshots/product-listing.png" alt="Product listing with brand and model filters" width="100%" /><br/>
      <sub><b>Product Listing</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="docs/screenshots/product-details.png" alt="Single product details page" width="100%" /><br/>
      <sub><b>Product Details</b></sub>
    </td>
    <td align="center" width="50%">
      <img src="docs/screenshots/cart.png" alt="Shopping cart with items" width="100%" /><br/>
      <sub><b>Cart</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center" colspan="2">
      <img src="docs/screenshots/checkout.png" alt="Checkout and address step" width="50%" /><br/>
      <sub><b>Checkout Flow</b></sub>
    </td>
  </tr>
</table>

### 🛡️ Admin Interface

<table>
  <tr>
    <td align="center" width="50%">
      <img src="docs/screenshots/admin-dashboard.png" alt="Admin dashboard overview" width="100%" /><br/>
      <sub><b>Admin Dashboard</b></sub>
    </td>
    <td align="center" width="50%">
      <img src="docs/screenshots/admin-analytics.png" alt="Sales analytics charts" width="100%" /><br/>
      <sub><b>Sales Analytics</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="docs/screenshots/admin-products.png" alt="Product management table" width="100%" /><br/>
      <sub><b>Product Management</b></sub>
    </td>
    <td align="center" width="50%">
      <img src="docs/screenshots/admin-orders.png" alt="Order management table" width="100%" /><br/>
      <sub><b>Order Management</b></sub>
    </td>
  </tr>
</table>

### 📱 Mobile Experience

<p align="center">
  <img src="docs/screenshots/mobile-home.png" alt="Mobile home" width="200" />
  &nbsp;
  <img src="docs/screenshots/mobile-products.png" alt="Mobile product listing" width="200" />
  &nbsp;
  <img src="docs/screenshots/mobile-cart.png" alt="Mobile cart" width="200" />
  &nbsp;
  <img src="docs/screenshots/mobile-checkout.png" alt="Mobile checkout" width="200" />
</p>

---

## 🔮 Future Roadmap

- [ ] Integration of Razorpay/Stripe for payments.
- [ ] Advanced inventory tracking and compatibility matching.
- [ ] Real-time order tracking.
- [ ] Multi-language support.

---

## 🏆 ELUSOC 2026 Contribution Guide

**Target Branch:** `elusoc`

### Workflow

1. **Find an issue:** Browse open issues or create a new one.
2. **Get assigned:** Comment on the issue and wait for a Project Admin to assign it.
3. **Branch:** Create a new branch from `elusoc` (e.g. `feature/your-feature-name`).
4. **Develop:** Make your changes and commit them.
5. **PR:** Submit a Pull Request targeting the `elusoc` branch.
6. **Review:** Address any review comments.
7. **Merge:** PR merged into `elusoc`.

### Rules

- No work without assignment.
- No duplicate issues — check existing ones first.
- All PRs must target `elusoc`, not `main`.
- Resolve merge conflicts before submitting PRs.

---

## 🧑‍💻 Developer Info

**SRV30** — Full-Stack Developer
GitHub: [@SRV30](https://github.com/SRV30)
