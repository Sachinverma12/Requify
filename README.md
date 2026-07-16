# Requify (Real Estate Web App)

A modern real-estate web application with a **Node/Express backend**, **JWT authentication**, and **role-based access** for **User / Owner / Admin**.

## Features

- **Signup / Login** with JWT tokens and form validation
- **Role-based dashboards**
  - User - Search and view properties
  - Owner - Manage property listings
  - Admin - Manage users and all properties
- **Property search** with advanced filters (location, type, price range)
- **Property detail modal** with full information
- **Favorite/Wishlist** functionality
- **Mortgage Calculator** for EMI estimation
- **Toast notifications** for better UX
- **Responsive design** with mobile support
- **SEO optimized** with meta tags and Open Graph

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
- `config.js` - API configuration
- `modal.js` - Property detail modal
- Frontend pages:
  - `index.html` - Landing page + property search UI
  - `login.html`, `signup.html` - Authentication pages
  - `user-dashboard.html` - User dashboard
  - `owner-dashboard.html` - Owner property management
  - `admin-dashboard.html` - Admin panel
- Styles:
  - `css/style.css` - Main stylesheet

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

