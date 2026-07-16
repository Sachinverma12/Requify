<div align="center">
  <br>
  <h1>🏠 Requify</h1>
  <p><strong>Modern Real Estate Platform</strong></p>
  <p>
    <img src="https://img.shields.io/badge/status-active-success.svg" alt="Status">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
    <img src="https://img.shields.io/badge/node-%3E%3D18-339933" alt="Node">
    <img src="https://img.shields.io/badge/express-5.2-000000" alt="Express">
  </p>
  <br>
</div>

A full-stack real estate web application with **JWT authentication**, **role-based dashboards** (User / Owner / Admin), **property search with structured filters**, and a **modern dark-theme UI** with motion animations.

---

## ✨ Features

### 🎨 Frontend
- **Dark theme UI** — custom color scheme with CSS variables, gradients, and glassmorphism
- **Motion Engine** — custom cursor, scroll progress bar, parallax, card tilt, text reveal, ripple effects, page transitions
- **Hero search** — floating glassmorphism search box with Buy/Rent/Commercial tabs, property type and budget dropdowns
- **Property search** — text search + structured filters (type, location, price range, bedrooms, bathrooms, category)
- **Advanced filter panel** — collapsible filters with location, type, price min/max, BHK, bathrooms, sale/rent
- **Property cards** — modern card design with badges, price tags, favorite toggle, compare button
- **Detail modal** — full-screen property modal with image gallery, features, reviews
- **Compare tool** — side-by-side comparison of up to 3 properties
- **Favorites / Wishlist** — localStorage-based
- **Mortgage calculator** — EMI estimation with interest breakdown
- **Responsive design** — optimized for desktop, tablet (768px), and mobile (480px)
- **SEO optimized** — meta tags, Open Graph, Twitter cards
- **Testimonials** — client reviews with star ratings
- **Dedicated search page** — `search.html` with full filter panel

### 🔐 Backend
- **JWT authentication** — signup/login with bcrypt password hashing (cost 12)
- **Role-based access** — User (search), Owner (CRUD listings), Admin (manage all)
- **Structured search API** — filter by text, type, location, price range, bedrooms, bathrooms, sale/rent
- **Full CRUD** — owners manage their listings, admins manage everything
- **Rate limiting** — 20 requests/15 min on auth, 200/15 min on general API
- **Security headers** — Helmet.js (CSP, XSS protection, HSTS, etc.)
- **Input sanitization** — XSS prevention on all text inputs
- **Password validation** — min 8 chars, uppercase + lowercase + digit required
- **CORS** — configurable via environment variable

### 📁 Data
- 30 sample Mumbai properties across all categories (Apartment, Villa, House, Plot, Commercial, Penthouse)
- Localities: Worli, Bandra, Powai, Juhu, Andheri, Colaba, Lower Parel, etc.
- Price range: ₹1.8L (co-living) to ₹35Cr (heritage bungalow)

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Server | **Express 5** | HTTP server + REST API |
| Auth | **jsonwebtoken + bcryptjs** | JWT signing, password hashing (cost 12) |
| Security | **helmet + express-rate-limit** | HTTP headers, brute-force protection |
| Storage | **JSON files** (dev) | Low-friction data storage |
| Frontend | **Vanilla JS** | No framework — auth helpers, search engine, animations |
| Styling | **Single CSS file** (~3800 lines) | Dark theme, responsive, motion animations |

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm

### Setup
```bash
# 1. Clone & install
git clone https://github.com/Sachinverma12/Requify.git
cd Requify
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set a strong JWT_SECRET:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Start server
npm run start
```

The app runs at **http://localhost:5000**

### Default test accounts
Create accounts via `signup.html` (roles: user, owner) or log in with existing seed accounts.

---

## 📁 Project Structure

```
Requify/
├── backend/
│   ├── server.js              # Express API server (all routes, middleware, auth)
│   └── data/
│       ├── users.json          # [gitignored] Dev user database (hashed passwords)
│       ├── properties.json     # [gitignored] Dev property listings
│       ├── users.example.json  # Schema template
│       ├── properties.example.json  # Schema template
│       └── .gitkeep
├── css/
│   └── style.css               # Complete stylesheet (~3800 lines)
├── index.html                  # Landing page with hero search + property grid
├── search.html                 # Dedicated search page with full filters
├── login.html                  # Login page
├── signup.html                 # Registration page
├── admin-dashboard.html        # Admin panel (users + properties)
├── owner-dashboard.html        # Owner dashboard (property CRUD)
├── user-dashboard.html         # User dashboard (search)
├── profile.html                # User profile (role-adaptive)
├── about.html                  # Company info page
├── privacy.html                # Privacy policy
├── terms.html                  # Terms of service
├── auth.js                     # Shared auth helpers (API calls, session, toasts, favorites)
├── index-search.js             # Search/filter engine (hero + advanced filters)
├── script.js                   # Core interactivity (scroll, animations, calculators)
├── motion.js                   # Motion Engine (cursor, parallax, tilt, ripples)
├── modal.js                    # Property detail modal
├── compare.js                  # Property comparison tool
├── reviews.js                  # User reviews/ratings system
├── config.js                   # Frontend API configuration
├── .env.example                # Environment variable template
├── .gitignore                  # Git exclusion rules
└── package.json                # Node.js manifest
```

---

## 📡 API Reference

### Authentication
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | — | Register (name, email, password, role) |
| POST | `/api/auth/login` | — | Login (email, password) |
| GET | `/api/auth/me` | ✓ | Get current user profile |

### Properties (authenticated users)
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/properties` | any | Search with filters (`search`, `type`, `location`, `priceMin`, `priceMax`, `bedrooms`, `bathrooms`, `category`) |

### Owner endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/owner/properties` | List own listings |
| POST | `/api/owner/properties` | Create listing |
| PUT | `/api/owner/properties/:id` | Update own listing |
| DELETE | `/api/owner/properties/:id` | Delete own listing |

### Admin endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/properties` | List all properties |
| PUT | `/api/admin/properties/:id` | Edit any property |
| DELETE | `/api/admin/properties/:id` | Delete any property |

---

## 🔒 Security

| Measure | Detail |
|---------|--------|
| Helmet | 15+ security HTTP headers |
| Rate limiting | Auth: 20 req/15min, API: 200 req/15min |
| bcrypt | Password hashing with cost factor 12 |
| Password strength | Min 8 chars, uppercase + lowercase + digit |
| Input sanitization | XSS prevention on all text inputs |
| JWT guard | Server refuses to start with default secret in production |
| Error handling | No stack traces leaked in production mode |
| CORS | Configurable via `CORS_ORIGIN` env variable |
| Data isolation | Owners can only access their own listings |
| Signup roles | Public registration restricted to user/owner only |

---

## 🌐 Deployment

### Option 1: Traditional VPS
```bash
# Generate a strong JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Edit .env with production values
NODE_ENV=production
JWT_SECRET=<your-generated-secret>
CORS_ORIGIN=https://yourdomain.com
PORT=5000

# Use PM2 for process management
npm install -g pm2
pm2 start backend/server.js --name requify
```

### Option 2: Render.com (free tier)
1. Push this repo to GitHub
2. Create a new **Web Service** on Render
3. Connect your repo
4. Set: Build Command = `npm install`, Start Command = `node backend/server.js`
5. Add environment variables in Render dashboard
6. Deploy — free tier includes HTTPS and auto-deploy

---

## 📸 Screenshots

<!-- Add screenshots here -->
| Page | Preview |
|------|---------|
| Homepage Hero | — |
| Property Search | — |
| Property Modal | — |
| Dashboard | — |

---

## 📄 License

MIT

---

<div align="center">
  <sub>Built with ❤️ by Sachin Verma</sub>
  <br>
  <a href="https://github.com/Sachinverma12/Requify">GitHub</a>
</div>
