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
    const fullUrl = url.startsWith('http') ? url : (window.API_CONFIG?.BASE_URL || '') + url;
    const res = await fetch(fullUrl, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  }

  function renderCards(properties) {
    const grid = document.getElementById('indexPropertiesGrid');
    const empty = document.getElementById('indexPropertiesEmpty');
    const count = document.getElementById('indexPropertiesCount');
    if (!grid || !empty || !count) return;

    const list = properties || [];
    count.textContent = `${list.length} ${list.length === 1 ? 'property' : 'properties'}`;
    empty.style.display = list.length ? 'none' : 'block';
    grid.innerHTML = '';

    // Reset prop-tab to "All" on new search
    document.querySelectorAll('.prop-tab').forEach(t => t.classList.remove('active'));
    const allTab = document.querySelector('.prop-tab[data-type="all"]');
    if (allTab) allTab.classList.add('active');

    if (window.setAllProperties && list.length > 0) {
      window.setAllProperties(list);
    }

    list.forEach((p) => {
      const imgUrl = p.imageUrl && p.imageUrl.trim().length
        ? p.imageUrl.trim()
        : 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80';

      const priceBadge = p.price ? window.formatPrice ? window.formatPrice(p.price) : `$${escapeHtml(p.price)}` : '';
      const isFav = window.isFavorite ? window.isFavorite(p.id) : false;
      const category = (p.category || '').toLowerCase();
      const saleOrRent = category.includes('rent') ? 'rent' : 'sale';

      const card = document.createElement('div');
      card.className = 'property-card-modern fade-in';
      card.style.cursor = 'pointer';
      card.innerHTML = `
        <div class="p-image">
          <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(p.title)}" loading="lazy" />
          <span class="p-badge ${saleOrRent}">${saleOrRent === 'rent' ? 'For Rent' : 'For Sale'}</span>
          ${priceBadge ? `<span class="p-price-tag">${priceBadge}</span>` : ''}
          <div class="p-card-actions">
            <button class="p-fav ${isFav ? 'active' : ''}" data-id="${escapeHtml(p.id)}" title="Add to favorites">
              <i class="fas fa-heart"></i>
            </button>
            <button class="p-compare" data-property='${JSON.stringify(p).replace(/'/g, "&#39;")}' title="Add to compare">
              <i class="fas fa-balance-scale"></i>
            </button>
          </div>
        </div>
        <div class="p-card-body">
          <h3 class="p-card-title">${escapeHtml(p.title)}</h3>
          <div class="p-card-location"><i class="fas fa-map-marker-alt"></i><span>${escapeHtml(p.location || '')}</span></div>
          <div class="p-card-features">
            <div class="p-card-feature"><i class="fas fa-tag"></i><span>${escapeHtml(p.category || 'Property')}</span></div>
            ${p.bedrooms ? `<div class="p-card-feature"><i class="fas fa-bed"></i><span>${escapeHtml(p.bedrooms)} BHK</span></div>` : ''}
            ${p.area ? `<div class="p-card-feature"><i class="fas fa-ruler-combined"></i><span>${escapeHtml(p.area)} sqft</span></div>` : ''}
            ${p.bathrooms ? `<div class="p-card-feature"><i class="fas fa-bath"></i><span>${escapeHtml(p.bathrooms)} Bath</span></div>` : ''}
          </div>
        </div>
      `;

      card.querySelector('.p-fav').addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.toggleFavorite) {
          const added = window.toggleFavorite(p.id);
          e.currentTarget.classList.toggle('active', added);
          if (window.showToast) {
            window.showToast(added ? 'Added to favorites' : 'Removed from favorites', 'success');
          }
        }
      });

      const compareBtn = card.querySelector('.p-compare');
      if (compareBtn) {
        compareBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          try {
            const propertyData = JSON.parse(e.currentTarget.getAttribute('data-property'));
            if (window.addToCompare) {
              window.addToCompare(propertyData);
            }
          } catch (err) {}
        });
      }

      card.addEventListener('click', () => {
        if (window.showPropertyModal) {
          window.showPropertyModal(p);
        } else {
          const title = safeText(p.title);
          const location = safeText(p.location);
          const price = p.price ? safeText(p.price) : 'N/A';
          alert(`Property Details:\n\nTitle: ${title}\nPrice: ${price}\nLocation: ${location}\n\n(Connect owner/admin dashboard to manage listings.)`);
        }
      });

      grid.appendChild(card);
    });
  }

  function collectFilters() {
    const f = {};
    const searchVal = (document.getElementById('indexSearchInput') || document.getElementById('indexSearchInput2') || {}).value;
    if (searchVal && searchVal.trim()) f.search = searchVal.trim();

    const loc = document.getElementById('filterLocation');
    if (loc && loc.value) f.location = loc.value;

    const type = document.getElementById('filterType');
    if (type && type.value) f.type = type.value;

    const cat = document.getElementById('filterCategory');
    if (cat && cat.value) f.category = cat.value;

    const pMin = document.getElementById('filterPriceMin');
    if (pMin && pMin.value) f.priceMin = pMin.value;

    const pMax = document.getElementById('filterPriceMax');
    if (pMax && pMax.value) f.priceMax = pMax.value;

    const bed = document.getElementById('filterBedrooms');
    if (bed && bed.value) f.bedrooms = bed.value;

    const bath = document.getElementById('filterBathrooms');
    if (bath && bath.value) f.bathrooms = bath.value;

    return f;
  }

  function collectHeroFilters() {
    const f = {};
    const searchVal = (document.getElementById('indexSearchInput') || document.getElementById('indexSearchInput2') || {}).value;
    if (searchVal && searchVal.trim()) f.search = searchVal.trim();

    const typeHero = document.getElementById('filterTypeHero');
    if (typeHero && typeHero.value) f.type = typeHero.value;

    const budgetHero = document.getElementById('filterBudgetHero');
    if (budgetHero && budgetHero.value) {
      if (budgetHero.value === '100000000') {
        f.priceMin = budgetHero.value;
      } else {
        f.priceMax = budgetHero.value;
      }
    }

    return f;
  }

  async function loadProperties(filters) {
    const empty = document.getElementById('indexPropertiesEmpty');
    const errEl = document.getElementById('indexPropertiesError');
    const grid = document.getElementById('indexPropertiesGrid');
    const count = document.getElementById('indexPropertiesCount');

    if (errEl) errEl.style.display = 'none';
    if (empty) empty.style.display = 'none';
    
    if (grid) {
      grid.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const sk = document.createElement('div');
        sk.className = 'skeleton-enhanced';
        sk.style.cssText = 'height:380px; border-radius:16px; margin-bottom:0;';
        grid.appendChild(sk);
      }
    }

    try {
      const params = new URLSearchParams();
      if (!filters) filters = {};
      if (filters.search) params.set('search', filters.search);
      if (filters.type && filters.type !== 'all') params.set('type', filters.type);
      if (filters.location) params.set('location', filters.location);
      if (filters.category) params.set('category', filters.category);
      if (filters.priceMin) params.set('priceMin', filters.priceMin);
      if (filters.priceMax) params.set('priceMax', filters.priceMax);
      if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);
      if (filters.bathrooms) params.set('bathrooms', filters.bathrooms);
      const qs = params.toString();
      const query = qs ? `?${qs}` : '';
      const data = await apiGet(`${window.API_CONFIG?.ENDPOINTS?.PROPERTIES?.SEARCH || '/api/properties'}${query}`);
      renderCards(data.properties || []);

      const propertiesSection = document.getElementById('properties');
      if (propertiesSection) {
        propertiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (e) {
      if (errEl) {
        errEl.textContent = e?.message || 'Search failed. Please try again.';
        errEl.style.display = 'block';
      }
      if (grid) grid.innerHTML = '';
      if (empty) {
        empty.textContent = 'No properties found.';
        empty.style.display = 'block';
      }
      if (count) count.textContent = '0 properties';
    }
  }

  function start() {
    const token = getToken();
    state.token = token;

    const searchInput = document.getElementById('indexSearchInput');
    const searchInput2 = document.getElementById('indexSearchInput2');
    const searchBtn = document.getElementById('indexSearchBtn');
    const clearBtn = document.getElementById('indexSearchClear');
    const heroSearchBtn = document.getElementById('heroSearchBtn');
    const authTip = document.getElementById('indexAuthTip');

    if (!token && authTip) {
      authTip.style.display = 'block';
      return;
    }

    if (authTip) authTip.style.display = 'none';

    const activeInput = searchInput || searchInput2;
    if (!activeInput) {
      loadProperties({});
      return;
    }

    loadProperties({});

    function syncInputs(source, target) {
      if (!source || !target) return;
      source.addEventListener('input', () => {
        target.value = source.value;
      });
    }
    syncInputs(searchInput, searchInput2);
    syncInputs(searchInput2, searchInput);

    // Wire hero search button
    if (heroSearchBtn) {
      heroSearchBtn.addEventListener('click', () => {
        loadProperties(collectHeroFilters());
      });
    }

    // Wire advanced filter search button
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        loadProperties(collectFilters());
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        activeInput.value = '';
        if (searchInput2) searchInput2.value = '';
        document.querySelectorAll('.filter-body input, .filter-body select').forEach(el => el.value = '');
        const heroType = document.getElementById('filterTypeHero');
        if (heroType) heroType.value = '';
        const heroBudget = document.getElementById('filterBudgetHero');
        if (heroBudget) heroBudget.value = '';
        loadProperties({});
      });
    }

    // Enter in hero search → hero filters
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          loadProperties(collectHeroFilters());
        }
      });
    }

    // Enter in secondary search → advanced filters
    if (searchInput2) {
      searchInput2.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          loadProperties(collectFilters());
        }
      });
    }

    // Debounced input — text only (ignore hero/advanced dropdowns while typing)
    let t = null;
    activeInput.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const val = activeInput.value.trim();
        loadProperties(val ? { search: val } : {});
      }, 400);
    });

    // Wire search tabs
    document.querySelectorAll('.search-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });

    // Wire property type tabs
    document.querySelectorAll('.prop-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.prop-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const type = tab.dataset.type;
        const allCards = document.querySelectorAll('.property-card-modern');
        allCards.forEach(card => {
          if (type === 'all') {
            card.style.display = '';
          } else {
            const tag = card.querySelector('.p-badge');
            if (tag) {
              card.style.display = tag.textContent.toLowerCase().includes(type) ? '' : 'none';
            }
          }
        });
      });
    });

    // Wire filter toggle
    const filterToggle = document.getElementById('filterToggle');
    const filterBody = document.getElementById('filterBody');
    const filterArrow = document.querySelector('.filter-arrow');
    if (filterToggle && filterBody) {
      filterToggle.addEventListener('click', () => {
        filterBody.classList.toggle('open');
        if (filterArrow) filterArrow.classList.toggle('open');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.renderFilteredProperties = (properties) => {
    renderCards(properties);
  };
})();
