# ShortHub — Branded Short-Link & Bio-Link Hub

> **Full-Stack Technical Assessment — MERN Implementation**  
> A high-performance URL shortening engine with custom vanity slugs, asynchronous click telemetry, and a customizable Link-in-Bio creator hub with live phone preview.

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=flat&logo=github)](https://github.com/ManuKumarYadav/Shortlink-bio-hub.git)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat&logo=nodedotjs)](https://nodejs.org)
[![React Version](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-47A248?style=flat&logo=mongodb)](https://www.mongodb.com)

---

## Table of Contents

1. [Project Name](#1-project-name)
2. [Project Description](#2-project-description)
3. [Technology Stack Used](#3-technology-stack-used)
4. [How to Install Dependencies](#4-how-to-install-dependencies)
5. [How to Configure Environment Variables](#5-how-to-configure-environment-variables)
6. [How to Run the Project Locally](#6-how-to-run-the-project-locally)
7. [Database Setup](#7-database-setup)
8. [Any Assumptions or Limitations](#8-any-assumptions-or-limitations)
9. [Architecture & Technical Decisions](#9-architecture--technical-decisions)
10. [API Documentation](#10-api-documentation)
11. [Security & Abuse Prevention](#11-security--abuse-prevention)

---

## 1. Project Name

**ShortHub — Branded Short-Link & Bio-Link Hub**  
Repository: [https://github.com/ManuKumarYadav/Shortlink-bio-hub.git](https://github.com/ManuKumarYadav/Shortlink-bio-hub.git)

---

## 2. Project Description

**ShortHub** is an all-in-one platform combining URL shortening with creator bio pages:

- **Branded Short-Link Engine**: Create compact short links using automated 6-character nanoids or custom vanity slugs (e.g., `/r/my-brand`).
- **Asynchronous Click Telemetry**: High-performance HTTP 302 redirection that decouples the user redirect from telemetry recording via background asynchronous tasks.
- **Analytics Dashboard**: Real-time aggregation of click metrics, clicks over time, device classification (*Desktop, Mobile, Tablet*), and HTTP referrer distribution.
- **Link-in-Bio Studio**: Interactive visual customizer with live interactive mobile simulator, multi-theme selector (6 curated palettes), social link management, reorderable buttons, and public shareable profiles (`/bio/:username`).
- **QR Code Generator**: Generates SVG/Canvas QR codes for any created link with 1-click download.

---

## 3. Technology Stack Used

### Frontend (`client/`)
- **React 18** (`Vite`): Ultra-fast build and reactive state rendering.
- **React Router DOM v6**: Client-side routing with protected route guards.
- **Axios**: HTTP client with request/response interceptors for silent token refresh.
- **Lucide React**: Vector icons.
- **Vanilla CSS**: Bespoke design system with dark mode glassmorphism, responsive grid layouts, and mobile simulator styling.

### Backend (`server/`)
- **Node.js & Express.js**: RESTful API server.
- **MongoDB & Mongoose**: Document database for user profiles, links, bio pages, and telemetry data.
- **JSON Web Tokens (JWT)**: Double-token authentication strategy (short-lived access tokens + long-lived refresh tokens).
- **bcryptjs**: Salted password hashing (12 rounds) and secure hashed refresh token storage.
- **express-rate-limit**: Defense against brute-force and scraping attacks.
- **nanoid**: Collision-resistant unique ID generation for short codes.
- **cookie-parser**: Secure cookie handling.

---

## 4. How to Install Dependencies

### Clone the Repository
```bash
git clone https://github.com/ManuKumarYadav/Shortlink-bio-hub.git
cd shortlink-bio-hub
```

### Install Backend Dependencies
```bash
cd server
npm install
```

### Install Frontend Dependencies
```bash
cd ../client
npm install
```

---

## 5. How to Configure Environment Variables

Create `.env` files in both `server/` and `client/` directories based on the provided templates.

> **Security Note**: Never commit actual credentials to Git. `.env` files are ignored by `.gitignore`.

### 1. Server Configuration (`server/.env`)
Create `server/.env` using `server/.env.example`:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

# MongoDB Connection String (Atlas or Local)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/shortlink?retryWrites=true&w=majority

# JWT Secrets (generate strong random 64-byte hex strings)
JWT_ACCESS_SECRET=your_super_secret_access_key_15m
JWT_REFRESH_SECRET=your_super_secret_refresh_key_7d
```

### 2. Client Configuration (`client/.env`)
Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 6. How to Run the Project Locally

### Start Backend Server
From the `server` directory:
```bash
npm run dev
```
The server will start on `http://localhost:5000`.  
You can test the health endpoint at `http://localhost:5000/api/health`.

### Start Frontend Client
From the `client` directory (in a separate terminal):
```bash
npm run dev
```
The Vite development server will start on `http://localhost:5173`.

### Access the Application
- **Main App / Dashboard**: `http://localhost:5173`
- **Short-Link Redirection**: `http://localhost:5000/r/:shortCode`
- **Public Bio Pages**: `http://localhost:5173/bio/:username`

---

## 7. Database Setup

ShortHub uses **MongoDB** as its primary datastore:

1. **Option A: MongoDB Atlas (Cloud — Recommended)**
   - Create a free MongoDB Atlas cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
   - Create a database user with read/write privileges.
   - Whitelist your current IP address (or `0.0.0.0/0` for development).
   - Paste the connection URI into `server/.env` under `MONGO_URI`.

2. **Option B: Local MongoDB**
   - Ensure MongoDB is installed and running locally on port 27017.
   - Set `MONGO_URI=mongodb://localhost:27017/shortlink` in `server/.env`.

Mongoose automatically initializes all collections (`users`, `links`, `clicks`, `bios`) and builds indexes on startup.

---

## 8. Any Assumptions or Limitations

1. **Simulated Email Verification**: To avoid requiring external third-party email services (such as SendGrid or AWS SES) during local evaluation, signup and password resets generate a verification token returned directly in the API response and printed to the server console. A one-click verification link is provided for evaluation.
2. **Profile Avatar via URL / Data URI**: Avatar images are handled directly through URLs or base64 data URIs stored in MongoDB, removing dependencies on external image hosting services.
3. **Cookie Attributes across Domains**: In local development, cookies are set with `SameSite=Lax` and `secure=false` (unless `NODE_ENV=production`). When deploying frontend and backend to different domains, ensure CORS and `SameSite=None; Secure` are configured with HTTPS.
4. **Geolocation via Privacy Hash**: Client IP addresses are stored as SHA-256 hashes rather than raw IP addresses to adhere to privacy standards.

---

## 9. Architecture & Technical Decisions

### Why MERN?
- **Unified Language**: End-to-end JavaScript/TypeScript enables seamless data models, shared types, and consistent validation rules.
- **Fast Prototyping & Rich Ecosystem**: React 18 component model allows isolated state management (such as the interactive Phone Simulator), while Express and Mongoose provide lightweight, scalable REST architecture.

### Database Design & Schemas

```
┌──────────────┐          1:N          ┌──────────────┐          1:N          ┌──────────────┐
│     User     │──────────────────────>│     Link     │──────────────────────>│    Click     │
│  (_id, email,│                       │  (_id, userId│                       │ (_id, linkId,│
│   password)  │                       │   shortCode) │                       │  device, IP) │
└──────────────┘                       └──────────────┘                       └──────────────┘
       │
       │ 1:1
       v
┌──────────────┐
│     Bio      │
│  (_id, user, │
│  links, bio) │
└──────────────┘
```

1. **`User`**: Manages credentials, verification status, and hashed refresh tokens.
2. **`Link`**: Indexed by `shortCode` and `userId` for $O(1)$ lookups during redirection.
3. **`Click`**: Time-series telemetry logs referencing `linkId`, storing referrer, timestamp, device classification, and hashed IP.
4. **`Bio`**: Embedded subdocuments for `socialLinks` and `links` to allow atomic updates without cross-collection joins.

### High-Performance Redirection Engine
When a user visits `/r/:shortCode`:
1. The server performs an indexed query on `Link.findOne({ shortCode })`.
2. The HTTP response immediately redirects via **`302 Found`**.
3. Telemetry tracking is scheduled via `setImmediate` non-blocking execution, avoiding latency penalties for the end visitor.

---

## 10. API Documentation

Base URL: `http://localhost:5000/api`

### Auth Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | Public | Register new user account. |
| `POST` | `/auth/login` | Public | Authenticate user & set `httpOnly` cookies. |
| `POST` | `/auth/refresh` | Public (Cookie) | Rotate refresh token and issue new access token. |
| `POST` | `/auth/logout` | Public | Clear authentication cookies and revoke session. |
| `POST` | `/auth/forgot-password`| Public | Generate password reset token. |
| `POST` | `/auth/reset-password` | Public | Reset password using token. |
| `GET` | `/auth/verify-email/:token` | Public | Verify creator email address. |

### Link Endpoints (`/api/links`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/links` | Authenticated | Create short link with optional vanity slug. |
| `GET` | `/links` | Authenticated | Get paginated links with search filter (`?page=1&limit=10&search=xyz`). |
| `GET` | `/links/:id` | Authenticated | Get details of a single link. |
| `DELETE`| `/links/:id` | Authenticated | Delete link and all associated click records. |
| `GET` | `/links/:id/analytics` | Authenticated | Fetch aggregated analytics (clicks over time, referrers, devices). |

### Bio Endpoints (`/api/bio`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/bio` | Authenticated | Create initial link-in-bio profile. |
| `PUT` | `/bio` | Authenticated | Update bio profile (theme, social links, custom buttons). |
| `GET` | `/bio/me` | Authenticated | Fetch logged-in user's bio profile. |
| `GET` | `/bio/:username` | Public | Public bio page data. |

### Public Redirects
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/r/:shortCode` | Public (Rate Limited) | Fast 302 redirect to original destination. |

---

## 11. Security & Abuse Prevention

- **Token Security**: JWT access tokens expire in 15 minutes; refresh tokens expire in 7 days and are rotated upon every refresh.
- **Defense in Depth**: Passwords hashed with 12 bcrypt salt rounds; refresh tokens hashed in the database to mitigate database leak risks.
- **Rate Limiting**: Link creation limited to 30 requests / 15 minutes; redirects limited to 100 requests / minute.
- **Reserved Slugs Protection**: Restricts sensitive keywords (`admin`, `api`, `login`, `bio`, `dashboard`, `r`, etc.) from being claimed as custom slugs or usernames.
- **Privacy-First**: Client IPs are hashed with SHA-256 before saving to analytics.

---

## License
MIT License. Developed for Technical Assessment.
