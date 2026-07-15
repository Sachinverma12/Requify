# Requify (Real Estate Web App)

A simple real-estate web application with a **Node/Express backend**, **JWT authentication**, and **role-based access** for **User / Owner / Admin**.

## Features

- **Signup / Login** with JWT tokens
- **Role-based dashboards**
  - User
  - Owner
  - Admin
- **Property search** (requires login)
- **Owner CRUD** for managing their own property listings
- **Admin management** for users and properties

## Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js + Express
- Auth: JWT + bcryptjs
- Storage (dev): JSON files under `backend/data/`

## Quick Start

### 1) Install dependencies
```bash
npm install
```

### 2) Run server
```bash
npm run start
```

Backend runs at:
- `http://localhost:5000`

## Project Structure

- `backend/server.js` - Express server + API routes
- `backend/data/users.json` - Dev user database (hashed passwords)
- `backend/data/properties.json` - Dev property database
- Frontend pages:
  - `index.html` - Landing page + property search UI
  - `login.html`, `signup.html`
  - `user-dashboard.html`, `owner-dashboard.html`, `admin-dashboard.html`
- Styles:
  - `css/style.css`

## API Endpoints

### Authentication
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me` (requires `Authorization: Bearer <token>`)

### Protected routes
- `GET /api/protected/user`
- `GET /api/protected/owner`
- `GET /api/protected/admin`

### Properties
- `GET /api/properties?search=...` (searches title/location/category/description)

### Owner
- `GET /api/owner/properties`
- `POST /api/owner/properties`
- `PUT /api/owner/properties/:id`
- `DELETE /api/owner/properties/:id`

### Admin
- `GET /api/admin/users`
- `GET /api/admin/properties`
- `PUT /api/admin/properties/:id`
- `DELETE /api/admin/properties/:id`

## Notes

- This is a **development** setup: users/properties are stored in JSON files.
- For production, replace file-based storage with a real database and add stronger session/refresh-token handling.

## Setup Users (Dev)

Use `signup.html` to create accounts with roles: **User / Owner / Admin**.

## License

MIT

