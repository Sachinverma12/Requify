window.addEventListener("scroll", () => {
  const header = document.getElementById("header");
  if (window.scrollY > 100) {
    header.classList.add("header-scrolled");
  } else {
    header.classList.remove("header-scrolled");
  }
});

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navLinks = document.getElementById("navLinks");

if (mobileMenuBtn && navLinks) {
  mobileMenuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

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

    navLinks.classList.remove("active");
  });
});

const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, observerOptions);

document.querySelectorAll(".fade-in").forEach((el) => {
  observer.observe(el);
});

function animateCounter(element, target) {
  let count = 0;
  const increment = target / 100;
  const timer = setInterval(() => {
    count += increment;
    if (count >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(count);
    }
  }, 20);
}

const statsSection = document.querySelector(".stats");
let statsAnimated = false;

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !statsAnimated) {
      statsAnimated = true;
      animateCounter(document.getElementById("propertiesSold"), 1250);
      animateCounter(document.getElementById("happyClients"), 850);
      animateCounter(document.getElementById("yearsExperience"), 15);
      animateCounter(document.getElementById("awards"), 25);
    }
  });
}, observerOptions);

statsObserver.observe(statsSection);

document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const name = formData.get("name");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const message = formData.get("message");

  if (!name || !email || !message) {
    alert("Please fill in all required fields.");
    return;
  }

  const submitBtn = document.querySelector(".submit-btn");
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Sending...";
  submitBtn.disabled = true;

  setTimeout(() => {
    alert("Thank you for your message! We will get back to you soon.");
    this.reset();
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }, 2000);
});

window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector(".hero");
  if (hero) hero.style.transform = `translateY(${scrolled * 0.5}px)`;
});

document.querySelectorAll(".feature-card").forEach((card, index) => {
  card.addEventListener("mouseenter", function () {
    this.style.transform = `translateY(-10px) rotate(2deg)`;
  });
  card.addEventListener("mouseleave", function () {
    this.style.transform = `translateY(-10px) rotate(0deg)`;
  });
});

document.querySelectorAll(".property-card").forEach((card, index) => {
  card.addEventListener("mouseenter", function () {
    this.style.transform = `translateY(-8px) scale(1.02)`;
  });
  card.addEventListener("mouseleave", function () {
    this.style.transform = `translateY(-8px) scale(1)`;
  });
});

document.querySelectorAll(".property-card").forEach((card) => {
  card.addEventListener("click", function () {
    const title = this.querySelector(".property-title").textContent;
    const price = this.querySelector(".property-price").textContent;
    const location = this.querySelector(".property-location span").textContent;

    alert(
      `Property Details: \n\nTitle: ${title}\nPrice: ${price}\nLocation: ${location}\n\nContact us for more information.`,
    );
  });
});

function typeWriter(element, text, speed = 100) {
  let i = 0;
  element.textContent = "";
  element.style.opacity = "1";

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

window.addEventListener("load", () => {
  const heroTitle = document.querySelector(".hero-content h1");
  if (heroTitle) {
    setTimeout(() => {
      typeWriter(heroTitle, "Find Your Dream Home", 80);
    }, 1000);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const elements = document.querySelectorAll(".fade-in");
  elements.forEach((el, index) => {
    el.style.animationDelay = `${index * 0.1}s`;
  });

const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0px)';
      }
    });
  }, { threshold: 0.1 });

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });

  console.log("The thing is loading successfully");
});
