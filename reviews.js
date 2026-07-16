function getReviews(propertyId) {
  const allReviews = JSON.parse(localStorage.getItem('reviews') || '{}');
  return allReviews[propertyId] || [];
}

function addReview(propertyId, review) {
  const allReviews = JSON.parse(localStorage.getItem('reviews') || '{}');
  if (!allReviews[propertyId]) {
    allReviews[propertyId] = [];
  }
  
  const newReview = {
    id: Date.now().toString(),
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    userName: review.userName || 'Anonymous',
    createdAt: new Date().toISOString()
  };
  
  allReviews[propertyId].push(newReview);
  localStorage.setItem('reviews', JSON.stringify(allReviews));
  
  return newReview;
}

function getAverageRating(propertyId) {
  const reviews = getReviews(propertyId);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return (sum / reviews.length).toFixed(1);
}

function renderStars(rating, size = '1rem') {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  let stars = '';
  for (let i = 0; i < fullStars; i++) {
    stars += `<i class="fas fa-star" style="color:#fbbf24; font-size:${size};"></i>`;
  }
  if (hasHalfStar) {
    stars += `<i class="fas fa-star-half-alt" style="color:#fbbf24; font-size:${size};"></i>`;
  }
  for (let i = 0; i < emptyStars; i++) {
    stars += `<i class="far fa-star" style="color:#fbbf24; font-size:${size};"></i>`;
  }
  return stars;
}

function renderReviewsSection(propertyId) {
  const reviews = getReviews(propertyId);
  const avgRating = getAverageRating(propertyId);
  
  const reviewsHtml = reviews.length === 0 
    ? `<p style="color:#666; text-align:center; padding:2rem;">No reviews yet. Be the first to review!</p>`
    : reviews.map(r => `
      <div style="padding:1rem; background:#f8fafc; border-radius:10px; margin-bottom:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:0.5rem;">
          <div>
            <strong style="color:#333;">${escapeHtmlReview(r.userName)}</strong>
            <div style="margin-top:0.25rem;">${renderStars(r.rating, '0.9rem')}</div>
          </div>
          <span style="color:#999; font-size:0.85rem;">${new Date(r.createdAt).toLocaleDateString()}</span>
        </div>
        ${r.title ? `<div style="font-weight:600; color:#333; margin-bottom:0.25rem;">${escapeHtmlReview(r.title)}</div>` : ''}
        <p style="color:#666; margin:0;">${escapeHtmlReview(r.comment)}</p>
      </div>
    `).join('');
  
  return `
    <div style="margin-top:1.5rem; padding-top:1.5rem; border-top:1px solid #e9ecef;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h4 style="color:#333; margin:0;">Reviews & Ratings</h4>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          ${renderStars(parseFloat(avgRating))}
          <span style="color:#666; font-size:0.9rem;">(${reviews.length} reviews)</span>
        </div>
      </div>
      
      <div id="reviewsList">
        ${reviewsHtml}
      </div>
      
      <button onclick="showReviewForm('${propertyId}')" style="width:100%; padding:0.75rem; background:#6d28d9; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600; margin-top:1rem;">
        <i class="fas fa-pen"></i> Write a Review
      </button>
    </div>
  `;
}

function showReviewForm(propertyId) {
  const formHtml = `
    <div id="reviewForm" style="margin-top:1rem; padding:1rem; background:#f8fafc; border-radius:10px;">
      <h5 style="color:#333; margin-bottom:1rem;">Your Review</h5>
      
      <div style="margin-bottom:1rem;">
        <label style="display:block; margin-bottom:0.5rem; font-weight:600; color:#333;">Rating</label>
        <div id="ratingStars" style="display:flex; gap:5px; cursor:pointer;">
          ${[1,2,3,4,5].map(i => `
            <i class="far fa-star" data-rating="${i}" style="font-size:1.5rem; color:#fbbf24; transition:transform 0.2s;" 
               onmouseover="previewRating(${i})" onmouseout="resetRatingPreview()" onclick="setRating(${i})"></i>
          `).join('')}
        </div>
        <input type="hidden" id="selectedRating" value="0">
      </div>
      
      <div style="margin-bottom:1rem;">
        <label style="display:block; margin-bottom:0.5rem; font-weight:600; color:#333;">Your Name</label>
        <input type="text" id="reviewName" placeholder="Your name" style="width:100%; padding:0.75rem; border:2px solid #e9ecef; border-radius:8px;" />
      </div>
      
      <div style="margin-bottom:1rem;">
        <label style="display:block; margin-bottom:0.5rem; font-weight:600; color:#333;">Review Title</label>
        <input type="text" id="reviewTitle" placeholder="Summarize your experience" style="width:100%; padding:0.75rem; border:2px solid #e9ecef; border-radius:8px;" />
      </div>
      
      <div style="margin-bottom:1rem;">
        <label style="display:block; margin-bottom:0.5rem; font-weight:600; color:#333;">Your Review</label>
        <textarea id="reviewComment" rows="3" placeholder="Share your experience..." style="width:100%; padding:0.75rem; border:2px solid #e9ecef; border-radius:8px; resize:vertical;"></textarea>
      </div>
      
      <div style="display:flex; gap:0.5rem;">
        <button onclick="submitReview('${propertyId}')" style="flex:1; padding:0.75rem; background:#6d28d9; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">
          Submit Review
        </button>
        <button onclick="cancelReview()" style="padding:0.75rem 1rem; background:white; color:#666; border:2px solid #e9ecef; border-radius:8px; cursor:pointer;">
          Cancel
        </button>
      </div>
    </div>
  `;
  
  const reviewsList = document.getElementById('reviewsList');
  if (reviewsList) {
    reviewsList.insertAdjacentHTML('afterend', formHtml);
  }
}

let currentRating = 0;

function previewRating(rating) {
  const stars = document.querySelectorAll('#ratingStars i');
  stars.forEach((star, index) => {
    if (index < rating) {
      star.className = 'fas fa-star';
    } else {
      star.className = 'far fa-star';
    }
  });
}

function resetRatingPreview() {
  const selected = document.getElementById('selectedRating')?.value || 0;
  const stars = document.querySelectorAll('#ratingStars i');
  stars.forEach((star, index) => {
    if (index < parseInt(selected)) {
      star.className = 'fas fa-star';
    } else {
      star.className = 'far fa-star';
    }
  });
}

function setRating(rating) {
  currentRating = rating;
  const input = document.getElementById('selectedRating');
  if (input) input.value = rating;
  previewRating(rating);
}

function submitReview(propertyId) {
  const rating = parseInt(document.getElementById('selectedRating')?.value || 0);
  const name = document.getElementById('reviewName')?.value?.trim();
  const title = document.getElementById('reviewTitle')?.value?.trim();
  const comment = document.getElementById('reviewComment')?.value?.trim();
  
  if (!rating || rating === 0) {
    if (window.showToast) {
      showToast('Please select a rating.', 'error');
    }
    return;
  }
  
  if (!comment) {
    if (window.showToast) {
      showToast('Please write a review.', 'error');
    }
    return;
  }
  
  addReview(propertyId, {
    rating,
    title,
    comment,
    userName: name || 'Anonymous'
  });
  
  if (window.showToast) {
    showToast('Review submitted successfully!', 'success');
  }
  
  cancelReview();
  
  const reviewsSection = document.querySelector(`[data-reviews="${propertyId}"]`);
  if (reviewsSection) {
    reviewsSection.innerHTML = renderReviewsSection(propertyId);
  }
}

function cancelReview() {
  const form = document.getElementById('reviewForm');
  if (form) form.remove();
}

function escapeHtmlReview(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

window.getReviews = getReviews;
window.addReview = addReview;
window.getAverageRating = getAverageRating;
window.renderStars = renderStars;
window.renderReviewsSection = renderReviewsSection;
window.showReviewForm = showReviewForm;
window.previewRating = previewRating;
window.resetRatingPreview = resetRatingPreview;
window.setRating = setRating;
window.submitReview = submitReview;
window.cancelReview = cancelReview;
