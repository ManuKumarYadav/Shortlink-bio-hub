# ShortHub 🔗

ShortHub is a full-stack URL shortener and Link-in-Bio platform built with the MERN stack. It allows creators and developers to shorten links with custom vanity slugs, track real-time click telemetry, generate downloadable QR codes, and design personalized link-in-bio landing pages with a live interactive mobile preview.

🌐 **Live Demo:** [client-xi-sepia.vercel.app](https://client-xi-sepia.vercel.app)  
⚡ **Backend API:** [shortlink-bio-hub.onrender.com](https://shortlink-bio-hub.onrender.com)

---

## ✨ Features

- **Branded Short Links**: Generate compact short links with `nanoid` or claim custom vanity slugs (e.g. `/r/my-brand`).
- **Asynchronous Click Telemetry**: High-performance `302 Found` redirects that decouple the visitor redirect from database telemetry logging for zero redirect lag.
- **Analytics Dashboard**: Real-time stats on total clicks, device classification (Desktop, Mobile, Tablet), and HTTP referrers.
- **Link-in-Bio Studio**: Interactive page customizer with live mobile phone simulator, 6 curated themes, custom social icons, and public profile pages (`/bio/:username`).
- **QR Code Generator**: Instant SVG/Canvas QR code generation with 1-click download.
- **Security & Privacy**:
  - Double JWT authentication (short-lived access tokens + rotating refresh tokens in `httpOnly` cookies).
  - Passwords hashed with bcrypt (12 salt rounds).
  - Rate limiting on redirects and sensitive routes.
  - Client IPs hashed with SHA-256 for GDPR-friendly telemetry.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, React Router v7, Axios, Lucide Icons, Vanilla CSS
- **Backend:** Node.js, Express 5, MongoDB, Mongoose
- **Auth & Security:** JSON Web Tokens (JWT), bcryptjs, express-rate-limit, cookie-parser
- **Hosting:** Vercel (Frontend), Render (Backend), MongoDB Atlas (Database)

---

## 📁 Project Structure

```text
shortlink-bio-hub/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── api/         # Axios client with auto-refresh interceptors
│   │   ├── components/  # Navbar, PhoneSimulator, AnalyticsModal, etc.
│   │   ├── context/     # Global AuthContext & state
│   │   ├── pages/       # Dashboard, BioBuilder, Analytics, Auth, PublicBio
│   │   └── index.css    # Modern glassmorphism UI & responsive styles
│   └── vercel.json      # Client-side routing configuration
│
├── server/              # Express REST API
│   ├── src/
│   │   ├── config/      # MongoDB connection
│   │   ├── controllers/ # Auth, Link, Bio, and User controllers
│   │   ├── middleware/  # JWT guard & express-rate-limiters
│   │   ├── models/      # Mongoose schemas (User, Link, Click, Bio)
│   │   ├── routes/      # REST API route handlers
│   │   └── server.js    # Entry point & CORS setup
└── README.md
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB (local instance or MongoDB Atlas URI)

### 1. Clone the repository
```bash
git clone https://github.com/ManuKumarYadav/Shortlink-bio-hub.git
cd shortlink-bio-hub
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_jwt_access_secret_15m
JWT_REFRESH_SECRET=your_jwt_refresh_secret_7d
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
In a new terminal window:
```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register new user account |
| `POST` | `/api/auth/login` | Authenticate user & issue tokens |
| `POST` | `/api/auth/refresh` | Rotate refresh token & issue access token |
| `POST` | `/api/auth/logout` | Revoke session & clear cookies |
| `POST` | `/api/links` | Create short link with custom slug |
| `GET` | `/api/links` | List authenticated user's links |
| `GET` | `/api/links/:id/analytics` | Fetch click stats, devices & referrers |
| `GET` | `/api/bio/:username` | Public bio profile endpoint |
| `GET` | `/r/:shortCode` | Fast 302 redirect to original destination |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
