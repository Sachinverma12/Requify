# Requify Auth System (User / Owner / Admin)

This project includes a simple **Node/Express backend** with **JWT authentication** and **role-based access** plus frontend pages for **Login / Signup / Dashboards**.

## 1) Backend setup
From: `Project Showcase Web Development/`

```bash
npm install
npm run start
```

Backend runs at: **http://localhost:5000**

### APIs
- `POST /api/auth/signup` (name, email, password, role)
- `POST /api/auth/login` (email, password, role)
- `GET /api/auth/me` (requires Authorization: Bearer <token>)
- Protected:
  - `GET /api/protected/user`
  - `GET /api/protected/owner`
  - `GET /api/protected/admin`

### How users are stored (dev)
Users are stored in: `backend/data/users.json` (passwords are hashed with bcrypt).

## 2) Frontend pages
Open in browser:
- `login.html`
- `signup.html`
- `user-dashboard.html`
- `owner-dashboard.html`
- `admin-dashboard.html`

## 3) Test flow (recommended)
1. Open `signup.html`.
2. Pick a role (User/Owner/Admin).
3. Create account.
4. It redirects to the correct dashboard.
5. Logout (top button), then login again to verify role access.

> Note: This is a **development** authentication system. For production security, replace the file-based user storage with a real database and use proper refresh tokens/session management.

