// ========================================
// HEADER SCROLL EFFECT
// ========================================
window.addEventListener("scroll", () => {
  const header = document.getElementById("header");
  if (window.scrollY > 100) {
    header.classList.add("header-scrolled");
  } else {
    header.classList.remove("header-scrolled");
  }
});

// ========================================
// MOBILE MENU
// ========================================
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navLinks = document.getElementById("navLinks");

if (mobileMenuBtn && navLinks) {
  mobileMenuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    // Animate hamburger to X
    const spans = mobileMenuBtn.querySelectorAll("span");
    if (navLinks.classList.contains("active")) {
      spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
      spans[1].style.opacity = "0";
      spans[2].style.transform = "rotate(-45deg) translate(5px, -5px)";
    } else {
      spans[0].style.transform = "none";
      spans[1].style.opacity = "1";
      spans[2].style.transform = "none";
    }
  });
}

// ========================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ========================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    if (navLinks) {
      navLinks.classList.remove("active");
      const spans = mobileMenuBtn?.querySelectorAll("span");
      if (spans) {
        spans[0].style.transform = "none";
        spans[1].style.opacity = "1";
        spans[2].style.transform = "none";
      }
    }
  });
});

// ========================================
// SCROLL-TRIGGERED ANIMATIONS
// ========================================
const animationObserverOptions = {
  threshold: 0.15,
  rootMargin: "0px 0px -50px 0px"
};

const animationObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("anim-visible");
      // Also trigger stagger children
      if (entry.target.classList.contains("stagger-children")) {
        entry.target.classList.add("visible");
      }
    }
  });
}, animationObserverOptions);

// Observe all animation classes
document.querySelectorAll(
  ".fade-in, .anim-slide-left, .anim-slide-right, .anim-slide-up, .anim-scale-in, .anim-rotate-in, .anim-flip-in, .stagger-children"
).forEach((el) => {
  animationObserver.observe(el);
});

// ========================================
// FADE-IN OBSERVER (Legacy)
// ========================================
const fadeObserverOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px"
};

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, fadeObserverOptions);

document.querySelectorAll(".fade-in").forEach((el) => {
  fadeObserver.observe(el);
});

// ========================================
// SECTION REVEAL ANIMATION
// ========================================
document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  });

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.05 });

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });

  // Stagger animation delay for children
  const elements = document.querySelectorAll(".fade-in");
  elements.forEach((el, index) => {
    el.style.animationDelay = `${index * 0.1}s`;
  });
});

// ========================================
// STATS COUNTER ANIMATION
// ========================================
function animateCounter(element, target, duration = 2000) {
  if (!element) return;
  let start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(easeOut * target);
    
    element.textContent = current.toLocaleString() + '+';
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target.toLocaleString() + '+';
    }
  }

  requestAnimationFrame(update);
}

const statsSection = document.querySelector(".stats");
let statsAnimated = false;

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !statsAnimated) {
      statsAnimated = true;
      animateCounter(document.getElementById("propertiesSold"), 500);
      animateCounter(document.getElementById("happyClients"), 300);
      animateCounter(document.getElementById("yearsExperience"), 10);
      animateCounter(document.getElementById("awards"), 15);
    }
  });
}, { threshold: 0.3 });

if (statsSection) statsObserver.observe(statsSection);

// ========================================
// HERO PARALLAX EFFECT
// ========================================
let ticking = false;
window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrolled = window.pageYOffset;
      const hero = document.querySelector(".hero");
      if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.4}px)`;
        // Fade out hero content on scroll
        const heroContent = document.querySelector(".hero-content");
        if (heroContent) {
          const opacity = 1 - (scrolled / (window.innerHeight * 0.8));
          heroContent.style.opacity = Math.max(0, opacity);
        }
      }
      ticking = false;
    });
    ticking = true;
  }
});

// ========================================
// TYPEWRITER EFFECT
// ========================================
function typeWriter(element, text, speed = 80) {
  if (!element) return;
  let i = 0;
  element.textContent = "";
  element.style.opacity = "1";
  element.classList.add("typing-cursor");

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else {
      element.classList.remove("typing-cursor");
    }
  }
  type();
}

window.addEventListener("load", () => {
  const heroTitle = document.querySelector(".hero-content h1");
  if (heroTitle) {
    setTimeout(() => {
      typeWriter(heroTitle, "Find Your Dream Home", 70);
    }, 500);
  }
});

// ========================================
// TILT EFFECT ON CARDS
// ========================================
function addTiltEffect(elements) {
  elements.forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) translateY(0)";
    });
  });
}

// Apply tilt to feature cards
document.addEventListener("DOMContentLoaded", () => {
  const featureCards = document.querySelectorAll(".feature-card");
  addTiltEffect(featureCards);
});

// ========================================
// CONTACT FORM
// ========================================
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("Phone");
    const message = formData.get("message");

    if (!name || !email || !message) {
      if (window.showToast) {
        showToast("Please fill in all required fields.", "error");
      } else {
        alert("Please fill in all required fields.");
      }
      return;
    }

    const submitBtn = document.querySelector(".submit-btn");
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    setTimeout(() => {
      if (window.showToast) {
        showToast("Thank you for your message! We will get back to you soon.", "success");
      } else {
        alert("Thank you for your message! We will get back to you soon.");
      }
      this.reset();
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }, 2000);
  });
}

// ========================================
// MORTGAGE CALCULATOR
// ========================================
function calculateEMI() {
  const principal = parseFloat(document.getElementById('loanAmount').value);
  const annualRate = parseFloat(document.getElementById('interestRate').value);
  const years = parseInt(document.getElementById('loanTenure').value);

  if (!principal || !annualRate || !years) {
    if (window.showToast) {
      showToast("Please fill in all fields.", "error");
    }
    return;
  }

  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;

  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  const emiResult = document.getElementById('emiResult');
  emiResult.style.display = 'block';
  emiResult.style.animation = 'slideInUp 0.5s ease';

  document.getElementById('emiAmount').textContent = formatCurrency(emi);
  document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
  document.getElementById('totalPayment').textContent = formatCurrency(totalPayment);
}

// ========================================
// FILTER FUNCTIONALITY
// ========================================
let allProperties = [];

function applyFilters() {
  const location = document.getElementById('filterLocation')?.value.toLowerCase() || '';
  const type = document.getElementById('filterType')?.value.toLowerCase() || '';
  const minPrice = parseFloat(document.getElementById('filterPriceMin')?.value) || 0;
  const maxPrice = parseFloat(document.getElementById('filterPriceMax')?.value) || Infinity;
  const sortBy = document.getElementById('filterSort')?.value || 'newest';

  let filtered = allProperties.filter(p => {
    const matchLocation = !location || (p.location && p.location.toLowerCase().includes(location));
    const matchType = !type || (p.category && p.category.toLowerCase().includes(type));
    const price = parseInt(p.price?.toString().replace(/[^0-9]/g, '')) || 0;
    const matchPrice = price >= minPrice && price <= maxPrice;
    return matchLocation && matchType && matchPrice;
  });

  filtered.sort((a, b) => {
    const priceA = parseInt(a.price?.toString().replace(/[^0-9]/g, '')) || 0;
    const priceB = parseInt(b.price?.toString().replace(/[^0-9]/g, '')) || 0;
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);

    switch (sortBy) {
      case 'price-low': return priceA - priceB;
      case 'price-high': return priceB - priceA;
      case 'oldest': return dateA - dateB;
      default: return dateB - dateA;
    }
  });

  if (window.renderFilteredProperties) {
    window.renderFilteredProperties(filtered);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const applyBtn = document.getElementById('applyFilters');
  const clearBtn = document.getElementById('clearFilters');

  if (applyBtn) applyBtn.addEventListener('click', applyFilters);
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      document.getElementById('filterLocation').value = '';
      document.getElementById('filterType').value = '';
      document.getElementById('filterPriceMin').value = '';
      document.getElementById('filterPriceMax').value = '';
      document.getElementById('filterSort').value = 'newest';
      applyFilters();
    });
  }
});

window.setAllProperties = (props) => { allProperties = props; };
window.applyFilters = applyFilters;
