const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// quick dev-time crypto helper
const crypto = require('crypto');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
if (!fs.existsSync(PROPERTIES_FILE)) fs.writeFileSync(PROPERTIES_FILE, JSON.stringify({ properties: [] }, null, 2));

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


const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

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

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, role } = req.body || {};

  const normalizedEmail = (email || '').toLowerCase().trim();
  const normalizedRole = (role || '').toLowerCase().trim();

  if (!name || name.trim().length < 2) return res.status(400).json({ message: 'Invalid name' });
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Invalid email' });
  }
  if (!password || String(password).length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });

  const allowedRoles = ['user', 'owner', 'admin'];
  if (!allowedRoles.includes(normalizedRole)) return res.status(400).json({ message: 'Invalid role' });

  const usersDb = readUsers();
  const existing = (usersDb.users || []).find((u) => u.email === normalizedEmail);
  if (existing) return res.status(409).json({ message: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const id = cryptoRandomId();

  const newUser = {
    id,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: normalizedRole,
    createdAt: new Date().toISOString(),
  };

  usersDb.users.push(newUser);
  writeUsers(usersDb);

  const token = signToken(newUser);
  return res.status(201).json({ token, user: { id, name: newUser.name, email: newUser.email, role: newUser.role } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body || {};
  const normalizedEmail = (email || '').toLowerCase().trim();
  const normalizedRole = (role || '').toLowerCase().trim();

  if (!normalizedEmail || !password) return res.status(400).json({ message: 'Missing credentials' });

  const usersDb = readUsers();
  const user = (usersDb.users || []).find((u) => u.email === normalizedEmail);
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  if (normalizedRole && user.role !== normalizedRole) {
    return res.status(403).json({ message: 'Role does not match this account' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

  const token = signToken(user);
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const usersDb = readUsers();
  const user = (usersDb.users || []).find((u) => u.id === req.user.sub);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
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

// =========================
// Properties: User search
// =========================
app.get('/api/properties', requireAuth, requireRole('user', 'owner', 'admin'), (req, res) => {
  const { search } = req.query || {};
  const searchNorm = normalizeSearch(search);

  const db = readProperties();
  const properties = (db.properties || []).filter((p) => matchesPropertySearch(p, searchNorm));

  return res.json({ properties });
});

// =========================
// Properties: Owner CRUD
// =========================
app.get('/api/owner/properties', requireAuth, requireRole('owner'), (req, res) => {
  const db = readProperties();
  const properties = (db.properties || []).filter((p) => p.ownerId === req.user.sub);
  return res.json({ properties });
});

app.post('/api/owner/properties', requireAuth, requireRole('owner'), (req, res) => {
  const { title, location, price, category, description, imageUrl } = req.body || {};

  if (!title || String(title).trim().length < 2) return res.status(400).json({ message: 'Invalid title' });
  if (!location || String(location).trim().length < 2) return res.status(400).json({ message: 'Invalid location' });

  const db = readProperties();
  const properties = db.properties || [];

  const newProperty = {
    id: cryptoRandomId(),
    ownerId: req.user.sub,
    title: String(title).trim(),
    location: String(location).trim(),
    price: price === undefined || price === null || price === '' ? null : String(price),
    category: category ? String(category).trim() : '',
    description: description ? String(description).trim() : '',
    imageUrl: imageUrl ? String(imageUrl).trim() : '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  properties.push(newProperty);
  writeProperties({ properties });

  return res.status(201).json({ property: newProperty });
});

app.put('/api/owner/properties/:id', requireAuth, requireRole('owner'), (req, res) => {
  const { id } = req.params;
  const db = readProperties();
  const properties = db.properties || [];

  const idx = properties.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Property not found' });

  if (properties[idx].ownerId !== req.user.sub) return res.status(403).json({ message: 'Forbidden' });

  const { title, location, price, category, description, imageUrl } = req.body || {};

  if (title !== undefined && String(title).trim().length < 2) return res.status(400).json({ message: 'Invalid title' });
  if (location !== undefined && String(location).trim().length < 2) return res.status(400).json({ message: 'Invalid location' });

  const updated = {
    ...properties[idx],
    title: title !== undefined ? String(title).trim() : properties[idx].title,
    location: location !== undefined ? String(location).trim() : properties[idx].location,
    price: price !== undefined ? (price === null || price === '' ? null : String(price)) : properties[idx].price,
    category: category !== undefined ? String(category).trim() : properties[idx].category,
    description: description !== undefined ? String(description).trim() : properties[idx].description,
    imageUrl: imageUrl !== undefined ? String(imageUrl).trim() : properties[idx].imageUrl,
    updatedAt: new Date().toISOString(),
  };

  properties[idx] = updated;
  writeProperties({ properties });

  return res.json({ property: updated });
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

// =========================
// Properties: Admin manage
// =========================
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

app.put('/api/admin/properties/:id', requireAuth, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const db = readProperties();
  const properties = db.properties || [];

  const idx = properties.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Property not found' });

  const { title, location, price, category, description, imageUrl } = req.body || {};

  if (title !== undefined && String(title).trim().length < 2) return res.status(400).json({ message: 'Invalid title' });
  if (location !== undefined && String(location).trim().length < 2) return res.status(400).json({ message: 'Invalid location' });

  const updated = {
    ...properties[idx],
    title: title !== undefined ? String(title).trim() : properties[idx].title,
    location: location !== undefined ? String(location).trim() : properties[idx].location,
    price: price !== undefined ? (price === null || price === '' ? null : String(price)) : properties[idx].price,
    category: category !== undefined ? String(category).trim() : properties[idx].category,
    description: description !== undefined ? String(description).trim() : properties[idx].description,
    imageUrl: imageUrl !== undefined ? String(imageUrl).trim() : properties[idx].imageUrl,
    updatedAt: new Date().toISOString(),
  };

  properties[idx] = updated;
  writeProperties({ properties });

  return res.json({ property: updated });
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




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Auth backend running on http://localhost:${PORT}`);
});

