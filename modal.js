function showPropertyModal(property) {
  const existingModal = document.querySelector('.modal-overlay');
  if (existingModal) existingModal.remove();

  const allImages = [];
  if (property.imageUrl && property.imageUrl.trim().length) {
    allImages.push(property.imageUrl.trim());
  }
  if (property.images && Array.isArray(property.images)) {
    property.images.forEach(img => {
      if (img && img.trim().length && !allImages.includes(img.trim())) {
        allImages.push(img.trim());
      }
    });
  }
  if (allImages.length === 0) {
    allImages.push('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80');
  }

  const priceDisplay = property.price ? window.formatPrice ? window.formatPrice(property.price) : `₹${property.price}` : 'Price on request';
  const isFav = window.isFavorite ? window.isFavorite(property.id) : false;

  const galleryHtml = allImages.length === 1 
    ? `<img src="${escapeHtmlModal(allImages[0])}" alt="${escapeHtmlModal(property.title)}" class="gallery-main" />`
    : `
      <img src="${escapeHtmlModal(allImages[0])}" alt="${escapeHtmlModal(property.title)}" class="gallery-main" id="galleryMain" />
      <div class="gallery-thumbnails">
        ${allImages.map((img, i) => `
          <img src="${escapeHtmlModal(img)}" alt="Thumbnail ${i+1}" class="gallery-thumb ${i === 0 ? 'active' : ''}" 
               onclick="changeGalleryImage('${escapeHtmlModal(img)}', this)" />
        `).join('')}
      </div>
    `;

  const featuresHtml = property.features && property.features.length > 0
    ? `<div class="property-tags" style="margin-top:1rem;">
        ${property.features.map(f => `<span class="property-tag"><i class="fas fa-check"></i> ${escapeHtmlModal(f)}</span>`).join('')}
       </div>`
    : '';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2 style="margin:0; color:#333;">${escapeHtmlModal(property.title)}</h2>
        <button class="modal-close" onclick="closePropertyModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="modal-gallery">
          ${galleryHtml}
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div>
            <h3 style="font-size:1.8rem; color:#6d28d9; margin:0;">${priceDisplay}</h3>
            <div style="display:flex; align-items:center; gap:8px; color:#666; margin-top:5px;">
              <i class="fas fa-map-marker-alt"></i>
              <span>${escapeHtmlModal(property.location || 'Location not specified')}</span>
            </div>
          </div>
          <button class="favorite-btn ${isFav ? 'active' : ''}" onclick="toggleFavoriteModal('${property.id}', this)">
            <i class="fas fa-heart"></i>
          </button>
        </div>

        <div class="modal-details">
          <div class="modal-detail-item">
            <div class="label">Property Type</div>
            <div class="value">${escapeHtmlModal(property.category || 'N/A')}</div>
          </div>
          ${property.bedrooms ? `
          <div class="modal-detail-item">
            <div class="label">Bedrooms</div>
            <div class="value"><i class="fas fa-bed"></i> ${escapeHtmlModal(property.bedrooms)}</div>
          </div>
          ` : ''}
          ${property.bathrooms ? `
          <div class="modal-detail-item">
            <div class="label">Bathrooms</div>
            <div class="value"><i class="fas fa-bath"></i> ${escapeHtmlModal(property.bathrooms)}</div>
          </div>
          ` : ''}
          ${property.area ? `
          <div class="modal-detail-item">
            <div class="label">Area</div>
            <div class="value"><i class="fas fa-ruler-combined"></i> ${escapeHtmlModal(property.area)}</div>
          </div>
          ` : ''}
          <div class="modal-detail-item">
            <div class="label">Status</div>
            <div class="value">Available</div>
          </div>
          <div class="modal-detail-item">
            <div class="label">Listed</div>
            <div class="value">${new Date(property.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>

        ${property.description ? `
          <div style="margin-top:1.5rem;">
            <h4 style="color:#333; margin-bottom:0.75rem;">Description</h4>
            <p style="color:#666; line-height:1.8;">${escapeHtmlModal(property.description)}</p>
          </div>
        ` : ''}

        <div class="property-tags">
          ${property.category ? `<span class="property-tag">${escapeHtmlModal(property.category)}</span>` : ''}
          <span class="property-tag">Verified</span>
          <span class="property-tag">RERA Registered</span>
        </div>

        ${featuresHtml}

        <div class="modal-actions">
          <button class="btn btn-primary" onclick="contactOwner('${property.id}')">
            <i class="fas fa-phone"></i> Contact Owner
          </button>
          <button class="btn btn-outline" onclick="scheduleVisit('${property.id}')">
            <i class="fas fa-calendar"></i> Schedule Visit
          </button>
        </div>

        <div style="margin-top:1.5rem; padding:1rem; background:#f8fafc; border-radius:10px;">
          <h4 style="color:#333; margin-bottom:0.5rem;">Similar Properties</h4>
          <p style="color:#666; font-size:0.9rem;">Contact us to get recommendations based on your preferences.</p>
        </div>

        <div data-reviews="${property.id}">
          ${window.renderReviewsSection ? window.renderReviewsSection(property.id) : ''}
        </div>
      </div>
    </div>
  `;

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePropertyModal();
  });

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
}

function changeGalleryImage(src, thumb) {
  const mainImg = document.getElementById('galleryMain');
  if (mainImg) {
    mainImg.style.opacity = '0';
    setTimeout(() => {
      mainImg.src = src;
      mainImg.style.opacity = '1';
    }, 200);
  }
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}

function closePropertyModal() {
  const modal = document.querySelector('.modal-overlay');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
}

function escapeHtmlModal(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function toggleFavoriteModal(propertyId, btn) {
  if (window.toggleFavorite) {
    const added = window.toggleFavorite(propertyId);
    btn.classList.toggle('active', added);
    window.showToast(added ? 'Added to favorites' : 'Removed from favorites', 'success');
    
    document.querySelectorAll(`.favorite-btn[data-id="${propertyId}"]`).forEach(b => {
      b.classList.toggle('active', added);
    });
  }
}

function contactOwner(propertyId) {
  showToast('Opening contact form... (Feature coming soon)', 'info');
}

function scheduleVisit(propertyId) {
  showToast('Scheduling feature coming soon!', 'info');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePropertyModal();
});

window.showPropertyModal = showPropertyModal;
window.closePropertyModal = closePropertyModal;
