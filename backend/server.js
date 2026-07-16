const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// ── Security middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

const CORS_ORIGIN = process.env.CORS_ORIGIN || true;
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));

// Rate limiting — protect auth endpoints from brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', generalLimiter);

// ── Data directory setup ────────────────────────────────────────────
const ROOT_DIR = path.join(__dirname, '..');
app.use(express.static(ROOT_DIR));

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
if (!fs.existsSync(PROPERTIES_FILE)) fs.writeFileSync(PROPERTIES_FILE, JSON.stringify({ properties: [] }, null, 2));

// ── Helpers ─────────────────────────────────────────────────────────
function readUsers() {
  const raw = fs.readFileSync(USERS_FILE, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    return { users: [] };
  }
}

function writeUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

function readProperties() {
  const raw = fs.readFileSync(PROPERTIES_FILE, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    return { properties: [] };
  }
}

function writeProperties(data) {
  fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(data, null, 2));
}

// ── JWT ─────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (JWT_SECRET === 'dev_secret_change_me' && process.env.NODE_ENV === 'production') {
  console.error('FATAL: JWT_SECRET must be changed in production!');
  process.exit(1);
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// ── Auth middleware ─────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid/expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

// ── Input sanitizer ─────────────────────────────────────────────────
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>"'&]/g, '').trim();
}

function sanitizeEmail(email) {
  return (email || '').toLowerCase().trim();
}

// ── Password strength ───────────────────────────────────────────────
const MIN_PASSWORD_LENGTH = 8;
function isPasswordStrong(password) {
  if (!password || String(password).length < MIN_PASSWORD_LENGTH) {
    return { ok: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` };
  }
  if (!/[A-Z]/.test(password)) {
    return { ok: false, message: 'Password must contain an uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { ok: false, message: 'Password must contain a lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { ok: false, message: 'Password must contain a number' };
  }
  return { ok: true };
}

// ── Helper functions ────────────────────────────────────────────────
function cryptoRandomId() {
  return crypto.randomBytes(16).toString('hex');
}

function normalizeSearch(s) {
  return String(s || '').toLowerCase().trim();
}

function matchesPropertySearch(property, search) {
  if (!search) return true;
  const haystack = [
    property.title,
    property.location,
    property.category,
    property.description,
    property.price,
    property.imageUrl,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(search);
}

// ── Routes ──────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/auth/signup', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body || {};

    const normalizedEmail = sanitizeEmail(email);
    const normalizedRole = (role || '').toLowerCase().trim();

    if (!name || sanitize(name).length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const pwCheck = isPasswordStrong(password);
    if (!pwCheck.ok) return res.status(400).json({ message: pwCheck.message });

    const allowedRoles = ['user', 'owner'];
    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({ message: 'Role must be user or owner' });
    }

    const usersDb = readUsers();
    const existing = (usersDb.users || []).find((u) => u.email === normalizedEmail);
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const id = cryptoRandomId();

    const newUser = {
      id,
      name: sanitize(name),
      email: normalizedEmail,
      passwordHash,
      role: normalizedRole,
      createdAt: new Date().toISOString(),
    };

    usersDb.users.push(newUser);
    writeUsers(usersDb);

    const token = signToken(newUser);
    return res.status(201).json({
      token,
      user: { id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = sanitizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const usersDb = readUsers();
    const user = (usersDb.users || []).find((u) => u.email === normalizedEmail);
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const usersDb = readUsers();
  const user = (usersDb.users || []).find((u) => u.id === req.user.sub);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

app.get('/api/protected/user', requireAuth, requireRole('user', 'owner', 'admin'), (req, res) => {
  res.json({ message: 'User-access area' });
});

app.get('/api/protected/owner', requireAuth, requireRole('owner'), (req, res) => {
  res.json({ message: 'Owner-access area' });
});

app.get('/api/protected/admin', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ message: 'Admin-access area' });
});

// ── Properties: User search ─────────────────────────────────────────
app.get('/api/properties', requireAuth, requireRole('user', 'owner', 'admin'), (req, res) => {
  const db = readProperties();
  const list = db.properties || [];

  const {
    search: rawSearch,
    type,
    category,
    location,
    priceMin,
    priceMax,
    bedrooms,
    bathrooms,
  } = req.query || {};

  const searchNorm = normalizeSearch(rawSearch);

  const results = list.filter((p) => {
    if (searchNorm && !matchesPropertySearch(p, searchNorm)) return false;

    if (type && type !== 'all') {
      const pType = (p.category || '').toLowerCase();
      if (!pType.includes(type.toLowerCase())) return false;
    }

    if (category) {
      const cat = category.toLowerCase();
      const pCat = (p.category || '').toLowerCase();
      const pTitle = (p.title || '').toLowerCase();
      if (cat === 'sale') {
        if (pCat.includes('rent') || pTitle.includes('for rent') || pTitle.includes('rental')) return false;
      } else if (cat === 'rent') {
        if (!pCat.includes('rent') && !pTitle.includes('for rent') && !pTitle.includes('rental') && !pTitle.includes('co-living') && !pTitle.includes('pg')) return false;
      }
    }

    if (location) {
      const loc = (p.location || '').toLowerCase();
      if (!loc.includes(location.toLowerCase())) return false;
    }

    const pPrice = parseFloat(p.price);
    if (priceMin && (isNaN(pPrice) || pPrice < parseFloat(priceMin))) return false;
    if (priceMax && (isNaN(pPrice) || pPrice > parseFloat(priceMax))) return false;

    if (bedrooms) {
      const pBed = parseInt(p.bedrooms, 10);
      const reqBed = parseInt(bedrooms, 10);
      if (isNaN(pBed) || isNaN(reqBed)) return false;
      if (reqBed >= 4) { if (pBed < 4) return false; }
      else if (pBed !== reqBed) return false;
    }

    if (bathrooms) {
      const pBath = parseInt(p.bathrooms, 10);
      const reqBath = parseInt(bathrooms, 10);
      if (isNaN(pBath) || isNaN(reqBath)) return false;
      if (pBath < reqBath) return false;
    }

    return true;
  });

  return res.json({ properties: results });
});

// ── Properties: Owner CRUD ──────────────────────────────────────────
app.get('/api/owner/properties', requireAuth, requireRole('owner'), (req, res) => {
  const db = readProperties();
  const properties = (db.properties || []).filter((p) => p.ownerId === req.user.sub);
  return res.json({ properties });
});

app.post('/api/owner/properties', requireAuth, requireRole('owner'), (req, res, next) => {
  try {
    const { title, location, price, category, description, imageUrl, images, bedrooms, bathrooms, area, features } = req.body || {};

    if (!title || sanitize(title).length < 2) return res.status(400).json({ message: 'Title must be at least 2 characters' });
    if (!location || sanitize(location).length < 2) return res.status(400).json({ message: 'Location must be at least 2 characters' });

    const db = readProperties();
    const properties = db.properties || [];

    const newProperty = {
      id: cryptoRandomId(),
      ownerId: req.user.sub,
      title: sanitize(title),
      location: sanitize(location),
      price: price === undefined || price === null || price === '' ? null : String(price).replace(/[^0-9.]/g, ''),
      category: category ? sanitize(category) : '',
      description: description ? sanitize(description) : '',
      imageUrl: imageUrl ? imageUrl.trim() : '',
      images: Array.isArray(images) ? images.map(i => String(i).trim()).filter(i => i) : [],
      bedrooms: bedrooms ? String(bedrooms).trim() : '',
      bathrooms: bathrooms ? String(bathrooms).trim() : '',
      area: area ? String(area).trim() : '',
      features: Array.isArray(features) ? features.map(f => sanitize(f)).filter(f => f) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    properties.push(newProperty);
    writeProperties({ properties });

    return res.status(201).json({ property: newProperty });
  } catch (err) {
    next(err);
  }
});

app.put('/api/owner/properties/:id', requireAuth, requireRole('owner'), (req, res, next) => {
  try {
    const { id } = req.params;
    const db = readProperties();
    const properties = db.properties || [];

    const idx = properties.findIndex((p) => p.id === id);
    if (idx === -1) return res.status(404).json({ message: 'Property not found' });
    if (properties[idx].ownerId !== req.user.sub) return res.status(403).json({ message: 'Forbidden' });

    const { title, location, price, category, description, imageUrl, images, bedrooms, bathrooms, area, features } = req.body || {};

    if (title !== undefined && sanitize(title).length < 2) return res.status(400).json({ message: 'Invalid title' });
    if (location !== undefined && sanitize(location).length < 2) return res.status(400).json({ message: 'Invalid location' });

    const updated = {
      ...properties[idx],
      title: title !== undefined ? sanitize(title) : properties[idx].title,
      location: location !== undefined ? sanitize(location) : properties[idx].location,
      price: price !== undefined ? (price === null || price === '' ? null : String(price).replace(/[^0-9.]/g, '')) : properties[idx].price,
      category: category !== undefined ? sanitize(category) : properties[idx].category,
      description: description !== undefined ? sanitize(description) : properties[idx].description,
      imageUrl: imageUrl !== undefined ? String(imageUrl).trim() : properties[idx].imageUrl,
      images: images !== undefined ? (Array.isArray(images) ? images.map(i => String(i).trim()).filter(i => i) : []) : properties[idx].images || [],
      bedrooms: bedrooms !== undefined ? String(bedrooms).trim() : properties[idx].bedrooms || '',
      bathrooms: bathrooms !== undefined ? String(bathrooms).trim() : properties[idx].bathrooms || '',
      area: area !== undefined ? String(area).trim() : properties[idx].area || '',
      features: features !== undefined ? (Array.isArray(features) ? features.map(f => sanitize(f)).filter(f => f) : []) : properties[idx].features || [],
      updatedAt: new Date().toISOString(),
    };

    properties[idx] = updated;
    writeProperties({ properties });

    return res.json({ property: updated });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/owner/properties/:id', requireAuth, requireRole('owner'), (req, res) => {
  const { id } = req.params;
  const db = readProperties();
  const properties = db.properties || [];

  const idx = properties.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Property not found' });
  if (properties[idx].ownerId !== req.user.sub) return res.status(403).json({ message: 'Forbidden' });

  const [deleted] = properties.splice(idx, 1);
  writeProperties({ properties });

  return res.json({ deletedId: deleted.id });
});

// ── Properties: Admin manage ─────────────────────────────────────────
app.get('/api/admin/users', requireAuth, requireRole('admin'), (req, res) => {
  const usersDb = readUsers();
  const users = (usersDb.users || []).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
  }));
  return res.json({ users });
});

app.get('/api/admin/properties', requireAuth, requireRole('admin'), (req, res) => {
  const db = readProperties();
  return res.json({ properties: db.properties || [] });
});

app.put('/api/admin/properties/:id', requireAuth, requireRole('admin'), (req, res, next) => {
  try {
    const { id } = req.params;
    const db = readProperties();
    const properties = db.properties || [];

    const idx = properties.findIndex((p) => p.id === id);
    if (idx === -1) return res.status(404).json({ message: 'Property not found' });

    const { title, location, price, category, description, imageUrl } = req.body || {};

    if (title !== undefined && sanitize(title).length < 2) return res.status(400).json({ message: 'Invalid title' });
    if (location !== undefined && sanitize(location).length < 2) return res.status(400).json({ message: 'Invalid location' });

    const updated = {
      ...properties[idx],
      title: title !== undefined ? sanitize(title) : properties[idx].title,
      location: location !== undefined ? sanitize(location) : properties[idx].location,
      price: price !== undefined ? (price === null || price === '' ? null : String(price).replace(/[^0-9.]/g, '')) : properties[idx].price,
      category: category !== undefined ? sanitize(category) : properties[idx].category,
      description: description !== undefined ? sanitize(description) : properties[idx].description,
      imageUrl: imageUrl !== undefined ? String(imageUrl).trim() : properties[idx].imageUrl,
      updatedAt: new Date().toISOString(),
    };

    properties[idx] = updated;
    writeProperties({ properties });

    return res.json({ property: updated });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/admin/properties/:id', requireAuth, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const db = readProperties();
  const properties = db.properties || [];

  const idx = properties.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Property not found' });

  const [deleted] = properties.splice(idx, 1);
  writeProperties({ properties });

  return res.json({ deletedId: deleted.id });
});

// ── Global error handler (no stack leaks!) ──────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error',
  });
});

// ── Start ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Auth backend running on http://localhost:${PORT}`);
});