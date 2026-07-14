(() => {
  const state = {
    token: null,
    user: null,
  };

  function safeText(str) {
    return String(str ?? '');
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '<')
      .replaceAll('>', '>')
      .replaceAll('"', '"')
      .replaceAll("'", '&#039;');
  }

  function getToken() {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  }

  async function apiGet(url) {
    const token = state.token || getToken();
    const res = await fetch(url, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  }

  function renderCards(properties) {
    // Success render always clears loading/error states handled by caller.

    const grid = document.getElementById('indexPropertiesGrid');
    const empty = document.getElementById('indexPropertiesEmpty');
    const count = document.getElementById('indexPropertiesCount');
    if (!grid || !empty || !count) return;

    const list = properties || [];
    count.textContent = `${list.length} ${list.length === 1 ? 'property' : 'properties'}`;
    empty.style.display = list.length ? 'none' : 'block';
    grid.innerHTML = '';

    list.forEach((p) => {
      const imgUrl = p.imageUrl && p.imageUrl.trim().length
        ? p.imageUrl.trim()
        : 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80';

      const priceBadge = p.price ? `$${escapeHtml(p.price)}` : '';

      const card = document.createElement('div');
      card.className = 'property-card fade-in';
      card.style.cursor = 'pointer';
      card.innerHTML = `
        <div class="property-image" style="background-image:url('${escapeHtml(imgUrl)}');">
          ${priceBadge ? `<div class="property-price">${priceBadge}</div>` : ''}
        </div>
        <div class="property-info">
          <h3 class="property-title">${escapeHtml(p.title)}</h3>
          <div class="property-location"><i class="fas fa-map-marker-alt"></i><span>${escapeHtml(p.location || '')}</span></div>
          <div class="property-features">
            <div class="property-feature"><i class="fas fa-bed"></i><span>${escapeHtml(p.category || 'Property')}</span></div>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        const title = safeText(p.title);
        const location = safeText(p.location);
        const price = p.price ? safeText(p.price) : 'N/A';
        alert(`Property Details:\n\nTitle: ${title}\nPrice: ${price}\nLocation: ${location}\n\n(Connect owner/admin dashboard to manage listings.)`);
      });

      grid.appendChild(card);
    });
  }

  async function loadProperties(search = '') {
    const searchInput = document.getElementById('indexSearchInput');
    const searchBtn = document.getElementById('indexSearchBtn');
    const clearBtn = document.getElementById('indexSearchClear');
    const empty = document.getElementById('indexPropertiesEmpty');
    const errEl = document.getElementById('indexPropertiesError');
    const grid = document.getElementById('indexPropertiesGrid');

    if (searchBtn) searchBtn.disabled = true;
    if (clearBtn) clearBtn.disabled = true;

    if (searchBtn) searchBtn.textContent = 'Searching...';

    if (errEl) errEl.style.display = 'none';
    if (empty) empty.style.display = 'none';
    if (grid) grid.style.opacity = '0.6';

    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const data = await apiGet(`http://localhost:5000/api/properties${query}`);
      renderCards(data.properties || []);


    // Scroll + highlight after every successful request (including empty results)
    const propertiesSection = document.getElementById('properties');
    if (propertiesSection) {
      propertiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // slight delay so user sees the cards first
      setTimeout(() => {
        const g = document.getElementById('indexPropertiesGrid');
        if (g) {
          g.classList.remove('search-highlight');
          // force reflow
          void g.offsetWidth;
          g.classList.add('search-highlight');
          setTimeout(() => g.classList.remove('search-highlight'), 1200);
        }
      }, 200);
    }
  } catch (e) {
    const errEl2 = document.getElementById('indexPropertiesError');
    const message = e && e.message ? e.message : 'Search failed. Please try again.';
    if (errEl2) {
      errEl2.textContent = message;
      errEl2.style.display = 'block';
    }
    const grid2 = document.getElementById('indexPropertiesGrid');
    const empty2 = document.getElementById('indexPropertiesEmpty');
    if (grid2) grid2.innerHTML = '';
    if (empty2) {
      empty2.textContent = 'No properties found.';
      empty2.style.display = 'block';
    }
  } finally {
    const searchBtn2 = document.getElementById('indexSearchBtn');
    const clearBtn2 = document.getElementById('indexSearchClear');
    const grid3 = document.getElementById('indexPropertiesGrid');

    if (searchBtn2) {
      searchBtn2.disabled = false;
      searchBtn2.textContent = 'Search';
    }
    if (clearBtn2) clearBtn2.disabled = false;
    if (grid3) grid3.style.opacity = '1';
  }
  }

  function start() {
    const token = getToken();
    state.token = token;

    const searchInput = document.getElementById('indexSearchInput');
    const searchBtn = document.getElementById('indexSearchBtn');
    const clearBtn = document.getElementById('indexSearchClear');

    if (!searchInput || !searchBtn || !clearBtn) return;

    if (!token) {
      // Logged-out visitor: do not call API.
      const tip = document.getElementById('indexAuthTip');
      if (tip) {
        tip.innerHTML = `Please <a href="./login.html">login</a> to search real listings.`;
      }
      return;
    }

    // Initial load
    loadProperties('');

    let last = '';
    const run = async () => {
      const q = (searchInput.value || '').trim();
      if (q === last) return;
      last = q;
      await loadProperties(q);
    };

    searchBtn.addEventListener('click', async () => {
      await run();
    });

    clearBtn.addEventListener('click', async () => {
      searchInput.value = '';
      last = '';
      await loadProperties('');
    });

    searchInput.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') await run();
    });

    // Nice UX: debounce typing a little
    let t = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => run().catch(() => {}), 400);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

