async function apiPost(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function apiGet(url, token) {
  const res = await fetch(url, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function setSession(token) {
  localStorage.setItem('token', token);
}

function clearSession() {
  localStorage.removeItem('token');
}

function getSessionToken() {
  return localStorage.getItem('token');
}

function getRoleFromSessionPayload(payload) {
  return payload?.role;
}

function renderToast(msg, isError = false) {
  const el = document.getElementById('authMessage');
  if (!el) return alert(msg);
  el.textContent = msg;
  el.style.color = isError ? '#b00020' : '#0b6b2f';
}

