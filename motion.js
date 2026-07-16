// ========================================
// REQUIFY MOTION ENGINE
// Advanced animations & micro-interactions
// ========================================

(function () {
  'use strict';

  // ========================================
  // 1. CUSTOM CURSOR FOLLOWER
  // ========================================
  const cursor = document.createElement('div');
  const cursorDot = document.createElement('div');
  cursor.className = 'custom-cursor';
  cursorDot.className = 'cursor-dot';
  document.body.appendChild(cursor);
  document.body.appendChild(cursorDot);

  let cursorX = 0, cursorY = 0;
  let dotX = 0, dotY = 0;

  document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
  });

  function animateCursor() {
    dotX += (cursorX - dotX) * 0.15;
    dotY += (cursorY - dotY) * 0.15;
    cursor.style.transform = `translate(${cursorX - 20}px, ${cursorY - 20}px)`;
    cursorDot.style.transform = `translate(${cursorX - 4}px, ${cursorY - 4}px)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Cursor hover effects
  document.querySelectorAll('a, button, .feature-card, .property-card, .cta-btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor-hover');
      cursorDot.classList.add('cursor-dot-hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor-hover');
      cursorDot.classList.remove('cursor-dot-hover');
    });
  });

  // ========================================
  // 2. MAGNETIC BUTTON EFFECT
  // ========================================
  document.querySelectorAll('.btn-primary, .btn-secondary, .cta-btn, .submit-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });

  // ========================================
  // 3. SCROLL PROGRESS INDICATOR
  // ========================================
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    progressBar.style.width = `${progress}%`;
  });

  // ========================================
  // 4. STAGGERED CARD ENTRANCE
  // ========================================
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('card-revealed');
        }, index * 100);
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.feature-card, .property-card, .stat-card').forEach(card => {
    card.classList.add('card-animate');
    cardObserver.observe(card);
  });

  // ========================================
  // 5. PARALLAX ON SCROLL (MULTI-LAYER)
  // ========================================
  let rafId = null;
  function parallaxScroll() {
    const scrolled = window.pageYOffset;
    
    // Hero parallax layers
    const hero = document.querySelector('.hero');
    if (hero && scrolled < window.innerHeight) {
      const heroBg = hero.querySelector('::before');
      hero.style.setProperty('--parallax-y', `${scrolled * 0.5}px`);
    }

    // Floating elements
    document.querySelectorAll('[data-parallax]').forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const yPos = (scrolled - el.offsetTop + window.innerHeight) * speed;
        el.style.transform = `translateY(${yPos}px)`;
      }
    });

    // Reveal elements on scroll
    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) {
        el.classList.add('revealed');
      }
    });
  }

  window.addEventListener('scroll', () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(parallaxScroll);
  });

  // ========================================
  // 6. TEXT REVEAL ANIMATION
  // ========================================
  const textRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const text = entry.target;
        const chars = text.textContent.split('');
        text.innerHTML = '';
        chars.forEach((char, i) => {
          const span = document.createElement('span');
          span.textContent = char === ' ' ? '\u00A0' : char;
          span.style.animationDelay = `${i * 0.03}s`;
          span.className = 'char-reveal';
          text.appendChild(span);
        });
        textRevealObserver.unobserve(text);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.text-reveal').forEach(el => {
    textRevealObserver.observe(el);
  });

  // ========================================
  // 7. TILT EFFECT ON PROPERTY CARDS
  // ========================================
  document.querySelectorAll('.property-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tiltX = (y - 0.5) * 10;
      const tiltY = (x - 0.5) * -10;
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      card.style.transition = 'transform 0.5s ease';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });

  // ========================================
  // 8. IMAGE REVEAL ON SCROLL
  // ========================================
  const imageRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('image-revealed');
        imageRevealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.property-image, .feature-icon').forEach(img => {
    img.classList.add('image-reveal');
    imageRevealObserver.observe(img);
  });

  // ========================================
  // 9. RIPPLE EFFECT ON BUTTONS
  // ========================================
  document.querySelectorAll('.btn-primary, .submit-btn, .cta-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: rippleEffect 0.6s ease-out;
        pointer-events: none;
      `;

      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  });

  // ========================================
  // 10. SMOOTH PAGE TRANSITION
  // ========================================
  const pageTransition = document.createElement('div');
  pageTransition.className = 'page-transition-overlay';
  pageTransition.innerHTML = '<div class="loader"></div>';
  document.body.appendChild(pageTransition);

  // Fade out on load
  window.addEventListener('load', () => {
    setTimeout(() => {
      pageTransition.classList.add('loaded');
    }, 300);
  });

  // Fade in on navigation
  document.querySelectorAll('a[href]').forEach(link => {
    if (link.href.startsWith(window.location.origin) && !link.href.includes('#')) {
      link.addEventListener('click', function (e) {
        if (this.hostname === window.location.hostname) {
          e.preventDefault();
          pageTransition.classList.remove('loaded');
          setTimeout(() => {
            window.location.href = this.href;
          }, 400);
        }
      });
    }
  });

  // ========================================
  // 11. HOVER LIFT EFFECT ON CARDS
  // ========================================
  document.querySelectorAll('.feature-card, .property-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
      this.style.boxShadow = '0 20px 40px rgba(79, 70, 229, 0.15)';
    });
    card.addEventListener('mouseleave', function () {
      this.style.boxShadow = '';
    });
  });

  // ========================================
  // 12. SMOOTH NUMBER COUNTER
  // ========================================
  function smoothCounter(element, target, duration = 2000) {
    let start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOut * target);

      element.textContent = current.toLocaleString() + '+';

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ========================================
  // 13. SCROLL-LINKED HEADER ANIMATION
  // ========================================
  let lastScrollY = 0;
  const header = document.getElementById('header');

  window.addEventListener('scroll', () => {
    const currentScrollY = window.pageYOffset;

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      header.style.transform = 'translateY(-100%)';
    } else {
      header.style.transform = 'translateY(0)';
    }

    lastScrollY = currentScrollY;
  });

  // ========================================
  // 14. IMAGE GALLERY HOVER ZOOM
  // ========================================
  document.querySelectorAll('.property-image').forEach(img => {
    img.addEventListener('mouseenter', function () {
      this.style.transform = 'scale(1.05)';
      this.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });
    img.addEventListener('mouseleave', function () {
      this.style.transform = 'scale(1)';
    });
  });

  // ========================================
  // 15. FORM INPUT ANIMATIONS
  // ========================================
  document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
    input.addEventListener('focus', function () {
      this.parentElement.classList.add('input-focused');
    });
    input.addEventListener('blur', function () {
      if (!this.value) {
        this.parentElement.classList.remove('input-focused');
      }
    });
  });

  // ========================================
  // 16. SMOOTH SCROLL PROGRESS BAR
  // ========================================
  const sections = document.querySelectorAll('section');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-visible');
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(section => sectionObserver.observe(section));

  // ========================================
  // 17. FEATURE ICON FLOAT ANIMATION
  // ========================================
  document.querySelectorAll('.feature-icon').forEach((icon, i) => {
    icon.style.animationDelay = `${i * 0.2}s`;
    icon.classList.add('icon-float');
  });

  // ========================================
  // 18. SMOOTH SCROLL TO SECTION
  // ========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

})();
