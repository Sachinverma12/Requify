async function apiPost(url, body) {
  const fullUrl = url.startsWith('http') ? url : (window.API_CONFIG?.BASE_URL || '') + url;
  const res = await fetch(fullUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function apiGet(url, token) {
  const fullUrl = url.startsWith('http') ? url : (window.API_CONFIG?.BASE_URL || '') + url;
  const res = await fetch(fullUrl, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function apiPut(url, body, token) {
  const fullUrl = url.startsWith('http') ? url : (window.API_CONFIG?.BASE_URL || '') + url;
  const res = await fetch(fullUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function apiDelete(url, token) {
  const fullUrl = url.startsWith('http') ? url : (window.API_CONFIG?.BASE_URL || '') + url;
  const res = await fetch(fullUrl, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function setSession(token, user) {
  localStorage.setItem('token', token);
  if (user) localStorage.setItem('user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('favorites');
}

function getSessionToken() {
  return localStorage.getItem('token');
}

function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

function getRoleFromSessionPayload(payload) {
  return payload?.role;
}

function showToast(message, type = 'info', duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle',
    warning: 'fas fa-exclamation-triangle'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="${icons[type] || icons.info} toast-icon"></i>
    <span class="toast-message">${message}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function renderToast(msg, isError = false) {
  showToast(msg, isError ? 'error' : 'success');
}

function showLoading(container) {
  container.innerHTML = `
    <div class="skeleton skeleton-card"></div>
    <div class="skeleton skeleton-card"></div>
    <div class="skeleton skeleton-card"></div>
  `;
}

function formatPrice(price) {
  if (!price) return 'Price N/A';
  const num = parseInt(price.toString().replace(/[^0-9]/g, ''));
  if (isNaN(num)) return price;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
  return `₹${num.toLocaleString('en-IN')}`;
}

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('favorites')) || [];
  } catch {
    return [];
  }
}

function toggleFavorite(propertyId) {
  const favorites = getFavorites();
  const index = favorites.indexOf(propertyId);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(propertyId);
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  return index === -1;
}

function isFavorite(propertyId) {
  return getFavorites().includes(propertyId);
}

