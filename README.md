# ShortHub 🔗

ShortHub is a full-stack URL shortener and Link-in-Bio platform built with the MERN stack. It lets users create short links, track clicks, generate QR codes, and create customizable bio pages.

🌐 **Live Demo:** https://client-xi-sepia.vercel.app
⚡ **Backend:** https://shortlink-bio-hub.onrender.com

## Features

* Create short links with custom slugs
* Track clicks, devices, and referrers
* Create customizable Link-in-Bio pages
* Generate QR codes for links
* JWT authentication with refresh tokens
* Password hashing with bcrypt
* Rate limiting and hashed IP tracking

## Tech Stack

**Frontend:** React, Vite, React Router, Axios, CSS
**Backend:** Node.js, Express.js, MongoDB, Mongoose
**Authentication:** JWT, bcryptjs
**Deployment:** Vercel, Render, MongoDB Atlas

## Project Structure

Shortlink-bio-hub/
├── client/     # React frontend
├── server/     # Node.js + Express backend
└── README.md

## Run Locally

### Backend
cd server
npm install
npm run dev

Create `server/.env`:
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:5173

### Frontend

cd client
npm install
npm run dev

Create `client/.env`:

VITE_API_URL=http://localhost:5000/api

Open https://client-xi-sepia.vercel.app

## License

MIT License
