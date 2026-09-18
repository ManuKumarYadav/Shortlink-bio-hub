# ShortHub — Branded Short-Link & Bio-Link Hub
> **MERN Stack Evaluation • Project Brief 04**  
> *Bitly + Linktree Hybrid with Universal Security & Click Telemetry*

---

## 🌟 Overview & Architecture

**ShortHub** is a high-performance URL shortening engine featuring vanity aliases, dynamic QR code generation, and asynchronous click telemetry aggregation, alongside a customizable **Link-in-Bio** creator hub with a live iPhone 16 Pro simulator and 6 luxury themes.

### Key Highlights
- **Pair Token Auth Architecture**: Short-lived Access Token (`15m`) + Long-lived Refresh Token (`7d`) stored in `httpOnly` secure cookies with token rotation upon refresh.
- **Asynchronous 302 Redirection**: URL redirection (`GET /r/:shortCode`) responds immediately with HTTP `302 Found` while logging telemetry metadata non-blockingly via background worker events.
- **Click Telemetry Schema**: Captures timestamps, HTTP referrers, device classification (*Mobile, Desktop, Tablet*), and SHA-256 IP hashes for privacy-first analytics.
- **Link-in-Bio Studio**: Interactive visual customizer with 6 themes (*Dark Slate, Aurora Sunset, Minimal Light, Cyberpunk Neon, Velvet Crimson, Emerald Tech*), brand-accurate social icons, reorderable buttons, and public route (`/bio/:username`).
- **Abuse Protection**: Rate limiting enabled on link creation (`30 req / 15m`) and redirection (`100 req / 1m`) via `express-rate-limit`.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0+
- **MongoDB**: Local MongoDB or MongoDB Atlas URI

### 1. Clone & Setup Environment
```bash
git clone https://github.com/yourusername/shortlink-bio-hub.git
cd shortlink-bio-hub
```

Copy the environment configuration:
```bash
cp .env.example server/.env
```

### 2. Configure Environment Variables (`server/.env`)
```env
PORT=5000
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/shortlink
JWT_ACCESS_SECRET=your_jwt_access_secret_here_15m
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here_7d
NODE_ENV=development
```

### 3. Install & Start Backend
```bash
cd server
npm install
npm run dev
```
*Server runs on `http://localhost:5000`*

### 4. Install & Start Frontend
```bash
cd ../client
npm install
npm run dev
```
*Client runs on `http://localhost:5173`*

---

## 📖 REST API Documentation

Base URL: `http://localhost:5000/api`

### 1. Authentication & Security Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | Public | Register new creator. Generates simulated email verification token. |
| `POST` | `/auth/login` | Public | Authenticates credentials, issues pair tokens in `httpOnly` cookies. |
| `POST` | `/auth/refresh` | Public (Cookie) | Rotates refresh token and issues new access token. |
| `POST` | `/auth/logout` | Public (Cookie) | Clears auth cookies and invalidates refresh token in DB. |
| `POST` | `/auth/forgot-password` | Public | Initiates password reset flow (returns simulation token). |
| `POST` | `/auth/reset-password` | Public | Resets user password using 64-character reset token. |
| `GET` | `/auth/verify-email/:token`| Public | Simulates email verification completion. |

#### Example: Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Alex Rivera",
  "email": "alex@creator.com",
  "password": "secretpassword123"
}
```

---

### 2. High-Speed Link Redirection & Engine (`/api/links` & `/r/:shortCode`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/r/:shortCode` | Public (Rate Limited) | **302 Redirect** to destination URL. Logs click telemetry asynchronously. |
| `POST` | `/api/links` | Private (Rate Limited)| Create shortlink. Accepts `destinationUrl` & optional `customSlug`. |
| `GET` | `/api/links` | Private | Search and paginated list of creator's links (`?page=1&limit=10&search=term`). |
| `GET` | `/api/links/:id` | Private | Get single link details. |
| `DELETE` | `/api/links/:id` | Private | Delete short link and all associated click telemetry records. |
| `GET` | `/api/links/:id/analytics` | Private | Telemetry metrics: total clicks, clicks over time, device breakdown, top referrers. |

#### Example: Create Shortlink with Custom Vanity Alias
```http
POST /api/links
Content-Type: application/json

{
  "destinationUrl": "https://mybrand.com/spring-launch",
  "customSlug": "spring-launch"
}
```

---

### 3. Link-in-Bio Creator Hub (`/api/bio` & `/bio/:username`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/bio/:username` | Public | Public creator profile page. |
| `GET` | `/api/bio/me` | Private | Fetch authenticated user's bio profile. |
| `POST` | `/api/bio` | Private | Create initial bio hub profile. |
| `PUT` | `/api/bio` | Private | Update bio profile (theme, avatar, social icons, custom links). |

#### Example: Update Bio Profile
```http
PUT /api/bio
Content-Type: application/json

{
  "username": "alexrivera",
  "displayName": "Alex Rivera",
  "bio": "Building next-gen developer tools & open-source software.",
  "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
  "theme": "dark-slate",
  "socialLinks": [
    { "platform": "twitter", "url": "https://x.com/alexrivera" },
    { "platform": "github", "url": "https://github.com/alexrivera" }
  ],
  "links": [
    { "title": "My Portfolio", "url": "https://alexrivera.dev", "isActive": true, "order": 1 }
  ]
}
```

---

## 🗄️ Database Schemas & Data Model

### `User`
- `name` (String, required)
- `email` (String, required, unique, indexed)
- `password` (String, hashed with bcrypt 12 rounds)
- `isEmailVerified` (Boolean, default: false)
- `verificationToken` (String, hashed)
- `refreshToken` (String, hashed with bcrypt 10 rounds)
- `resetPasswordToken` (String, hashed SHA-256)
- `resetPasswordExpires` (Date)

### `Link`
- `userId` (ObjectId, ref: `User`, indexed)
- `destinationUrl` (String, validated URL)
- `shortCode` (String, unique, indexed, length: 3–30)
- `isCustom` (Boolean, default: false)

### `Click` (Telemetry)
- `linkId` (ObjectId, ref: `Link`, indexed)
- `timestamp` (Date, default: Date.now, indexed)
- `referrer` (String, default: "Direct")
- `deviceType` (Enum: `Mobile`, `Desktop`, `Tablet`, `Unknown`)
- `ipHash` (String, SHA-256 hash of client IP)

### `Bio`
- `userId` (ObjectId, ref: `User`, unique, indexed)
- `username` (String, unique, lowercase, indexed)
- `displayName` (String)
- `bio` (String, max: 300)
- `avatarUrl` (String)
- `theme` (Enum: `dark-slate`, `gradient`, `minimal-light`, `cyberpunk`, `velvet-crimson`, `emerald-matrix`)
- `socialLinks` (Array of `{ platform, url }`)
- `links` (Array of `{ title, url, isActive, order }`)
- `isPublic` (Boolean, default: true)

---

## 🛡️ Universal Security Checklist

- [x] **Pair Token Auth**: 15-minute JWT Access Token + 7-day Refresh Token in `httpOnly`, `SameSite=Lax` cookies.
- [x] **Token Rotation**: Old refresh tokens invalidated on refresh; refresh tokens stored as salted bcrypt hashes in MongoDB.
- [x] **Rate Limiting**: `express-rate-limit` prevents brute-force link generation and redirection floods.
- [x] **Reserved Slugs Protection**: Prevents collisions with system routes (`api`, `admin`, `r`, `bio`, `login`, `signup`, etc.).
- [x] **Privacy-Preserving Telemetry**: Raw IP addresses are never saved; only salted SHA-256 hashes are recorded.
- [x] **XSS & Injection Protection**: Strict URL protocol validation (`http:`, `https:`) and disabled `X-Powered-By` headers.
