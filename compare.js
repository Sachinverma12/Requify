let compareList = [];

function addToCompare(property) {
  if (compareList.length >= 3) {
    if (window.showToast) {
      showToast('You can compare up to 3 properties at a time.', 'warning');
    }
    return false;
  }
  
  if (compareList.find(p => p.id === property.id)) {
    if (window.showToast) {
      showToast('This property is already in comparison list.', 'info');
    }
    return false;
  }
  
  compareList.push(property);
  updateCompareUI();
  
  if (window.showToast) {
    showToast(`Added to comparison (${compareList.length}/3)`, 'success');
  }
  return true;
}

function removeFromCompare(propertyId) {
  compareList = compareList.filter(p => p.id !== propertyId);
  updateCompareUI();
}

function clearCompare() {
  compareList = [];
  updateCompareUI();
}

function updateCompareUI() {
  const compareBar = document.getElementById('compareBar');
  const compareCount = document.getElementById('compareCount');
  const compareItems = document.getElementById('compareItems');
  
  if (!compareBar) return;
  
  if (compareList.length === 0) {
    compareBar.style.display = 'none';
    return;
  }
  
  compareBar.style.display = 'block';
  compareCount.textContent = compareList.length;
  
  if (compareItems) {
    compareItems.innerHTML = compareList.map(p => `
      <div class="compare-item">
        <span>${escapeHtmlCompare(p.title)}</span>
        <button onclick="removeFromCompare('${p.id}')" class="compare-remove">&times;</button>
      </div>
    `).join('');
  }
}

function escapeHtmlCompare(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function showCompareModal() {
  if (compareList.length < 2) {
    if (window.showToast) {
      showToast('Please add at least 2 properties to compare.', 'info');
    }
    return;
  }
  
  const existingModal = document.querySelector('.modal-overlay');
  if (existingModal) existingModal.remove();
  
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  const properties = compareList;
  const maxRows = 6;
  
  const rows = [
    { label: 'Price', key: 'price', format: (v) => v ? (window.formatPrice ? window.formatPrice(v) : `₹${v}`) : 'N/A' },
    { label: 'Location', key: 'location', format: (v) => v || 'N/A' },
    { label: 'Type', key: 'category', format: (v) => v || 'N/A' },
    { label: 'Bedrooms', key: 'bedrooms', format: (v) => v || 'N/A' },
    { label: 'Bathrooms', key: 'bathrooms', format: (v) => v || 'N/A' },
    { label: 'Area', key: 'area', format: (v) => v ? `${v} sq ft` : 'N/A' },
    { label: 'Description', key: 'description', format: (v) => v ? v.slice(0, 100) + (v.length > 100 ? '...' : '') : 'N/A' },
    { label: 'Features', key: 'features', format: (v) => v && v.length ? v.join(', ') : 'N/A' },
  ];
  
  overlay.innerHTML = `
    <div class="modal" style="max-width: 1000px;">
      <div class="modal-header">
        <h2 style="margin:0; color:#333;">Compare Properties (${properties.length})</h2>
        <button class="modal-close" onclick="closeCompareModal()">&times;</button>
      </div>
      <div class="modal-body" style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align:left; padding:12px; background:#f8fafc; border-bottom:2px solid #e9ecef; min-width:120px;">Feature</th>
              ${properties.map(p => `
                <th style="text-align:center; padding:12px; background:#f8fafc; border-bottom:2px solid #e9ecef; min-width:200px;">
                  <div style="font-weight:700; color:#6d28d9;">${escapeHtmlCompare(p.title)}</div>
                  <button onclick="removeFromCompare('${p.id}'); closeCompareModal(); showCompareModal();" 
                          style="margin-top:5px; padding:4px 8px; background:#ef4444; color:white; border:none; border-radius:4px; cursor:pointer; font-size:0.8rem;">
                    Remove
                  </button>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                <td style="padding:12px; border-bottom:1px solid #e9ecef; font-weight:600; color:#333;">${row.label}</td>
                ${properties.map(p => `
                  <td style="padding:12px; border-bottom:1px solid #e9ecef; text-align:center; color:#666;">
                    ${escapeHtmlCompare(row.format(p[row.key]))}
                  </td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-top:1.5rem; display:flex; gap:1rem; justify-content:center;">
          <button onclick="clearCompare(); closeCompareModal();" class="btn btn-ghost">
            <i class="fas fa-trash"></i> Clear All
          </button>
        </div>
      </div>
    </div>
  `;
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeCompareModal();
  });
  
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
}

function closeCompareModal() {
  const modals = document.querySelectorAll('.modal-overlay');
  modals.forEach(m => {
    if (m.querySelector('.modal table')) {
      m.remove();
    }
  });
  if (!document.querySelector('.modal-overlay')) {
    document.body.style.overflow = '';
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCompareModal();
});

window.addToCompare = addToCompare;
window.removeFromCompare = removeFromCompare;
window.clearCompare = clearCompare;
window.showCompareModal = showCompareModal;
window.closeCompareModal = closeCompareModal;
