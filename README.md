# ShortHub 🔗

A modern, full-stack URL shortener and Link-in-Bio builder built with the MERN stack. Create branded short links, track real-time click telemetry, and customize a personal creator bio page with a live interactive mobile preview.

🌐 **Live Demo:** [client-xi-sepia.vercel.app](https://client-xi-sepia.vercel.app)  
⚡ **API Server:** [shortlink-bio-hub.onrender.com](https://shortlink-bio-hub.onrender.com)

---

## ✨ Features

- **Branded Short Links**: Generate instant short codes with `nanoid` or claim custom vanity slugs (e.g. `/r/my-brand`).
- **Instant Redirection**: Fast `302 Found` redirects with asynchronous background click tracking (no lag for visitors).
- **Click Analytics**: Monitor real-time performance with breakdowns by device type (Desktop, Mobile, Tablet), referrers, and clicks over time.
- **Link-in-Bio Studio**: Visual page builder featuring:
  - Live interactive phone mockup preview.
  - 6 curated color themes.
  - Custom buttons and social media icons.
  - Public shareable profiles at `/bio/:username`.
- **QR Code Generator**: 1-click downloadable QR codes for any created link.
- **Security & Privacy**:
  - Double-token auth (short-lived access tokens + rotating refresh tokens).
  - Passwords hashed with bcrypt (12 rounds).
  - Rate limiting on redirects and sensitive routes.
  - Hashed client IP addresses for visitor privacy.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, React Router v7, Axios, Lucide Icons, Vanilla CSS
- **Backend**: Node.js, Express 5, MongoDB, Mongoose
- **Auth & Security**: JSON Web Tokens (JWT), bcryptjs, express-rate-limit, cookie-parser
- **Hosting**: Vercel (Frontend), Render (Backend), MongoDB Atlas (Database)

---

## 📁 Project Structure

```text
shortlink-bio-hub/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api/            # Axios API client & interceptors
│   │   ├── components/     # UI components (Navbar, Simulator, Modal, etc.)
│   │   ├── context/        # Auth & state management
│   │   ├── pages/          # Pages (Dashboard, BioBuilder, Analytics, Auth)
│   │   └── index.css       # Design system & responsive styles
│   └── vercel.json         # Vercel deployment & routing config
│
├── server/                 # Express REST API
│   ├── src/
│   │   ├── config/         # Database connection
│   │   ├── controllers/    # Route controllers (auth, bio, link, user)
│   │   ├── middleware/     # Rate limiter & JWT auth guard
│   │   ├── models/         # Mongoose schemas (User, Link, Click, Bio)
│   │   ├── routes/         # Express API routes
│   │   └── server.js       # App entry point & CORS configuration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas cluster)

### 1. Clone the Repository
```bash
git clone https://github.com/ManuKumarYadav/Shortlink-bio-hub.git
cd shortlink-bio-hub
```

### 2. Set Up the Backend
```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

# MongoDB Connection String
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/shortlink?retryWrites=true&w=majority

# JWT Secrets (generate any random strings)
JWT_ACCESS_SECRET=your_jwt_access_secret_15m
JWT_REFRESH_SECRET=your_jwt_refresh_secret_7d
```

Start the backend:
```bash
npm run dev
```
The server will run at `http://localhost:5000`.

### 3. Set Up the Frontend
Open a new terminal window:
```bash
cd client
npm install
```

Create a `.env` file inside the `client/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the client:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Create a new user account |
| `POST` | `/api/auth/login` | Authenticate user & receive tokens |
| `POST` | `/api/auth/refresh` | Refresh expired access token |
| `POST` | `/api/auth/logout` | Revoke session & clear auth cookies |

### Links (`/api/links`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/links` | Create a shortened link with optional vanity slug |
| `GET` | `/api/links` | List user's links (with pagination & search) |
| `GET` | `/api/links/:id` | Get details for a specific link |
| `DELETE` | `/api/links/:id` | Delete a link and its analytics |
| `GET` | `/api/links/:id/analytics` | Fetch analytics (clicks, devices, referrers) |

### Link-in-Bio (`/api/bio`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/bio` | Create initial bio profile |
| `PUT` | `/api/bio` | Update bio page layout, theme, and links |
| `GET` | `/api/bio/me` | Get current user's bio data |
| `GET` | `/api/bio/:username` | Public endpoint for visitor bio pages |

### Redirection
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/r/:shortCode` | Fast 302 redirect to original destination URL |

---

## 🚢 Deployment

- **Frontend (Vercel)**:
  - Root directory: `client`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment variable: `VITE_API_URL=https://shortlink-bio-hub.onrender.com/api`

- **Backend (Render)**:
  - Root directory: `server`
  - Build command: `npm install`
  - Start command: `npm start`
  - Environment variables: `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL=https://client-xi-sepia.vercel.app`, `NODE_ENV=production`

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
