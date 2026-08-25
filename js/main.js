// Ritesh Portfolio — main.js
// Theme, cursor, reveals, typewriter, easter eggs. Loaded on index.html.
'use strict';

console.log('%c⚡ Ritesh Portfolio', 'color:#7c3aed;font-size:20px;font-weight:bold');
console.log('%cTry the Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A', 'color:#06ffa5');

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Toast (non-blocking notifications) ---------- */

function showToast(message, duration = 3200) {
  document.querySelectorAll('.toast').forEach((t) => t.remove());
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}

/* ---------- Loader ---------- */

window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.style.transform = 'translateY(-100%)';
  }, REDUCED_MOTION ? 0 : 800);
});

/* ---------- Scroll handlers (single rAF-throttled listener) ---------- */

(function initScroll() {
  const progress = document.getElementById('progress');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav ul a');
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const doc = document.documentElement;
      const height = doc.scrollHeight - doc.clientHeight;
      if (progress) progress.style.width = `${(doc.scrollTop / height) * 100}%`;

      let current = '';
      sections.forEach((sec) => {
        if (window.scrollY >= sec.offsetTop - 150) current = sec.getAttribute('id');
      });
      navLinks.forEach((a) => {
        a.classList.remove('active');
        if (a.getAttribute('href') === `#${current}`) a.classList.add('active');
      });
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---------- Custom Cursor (pointer devices only) ---------- */

const cursor = document.querySelector('.cursor');
const dot = document.querySelector('.cursor-dot');
const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (FINE_POINTER && cursor && dot && !REDUCED_MOTION) {
  let mouseX = 0, mouseY = 0, curX = 0, curY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${e.clientX}px`;
    dot.style.top = `${e.clientY}px`;
  });
  (function animateCursor() {
    curX += (mouseX - curX) * 0.15;
    curY += (mouseY - curY) * 0.15;
    if (cursor) {
      cursor.style.left = `${curX - 10}px`;
      cursor.style.top = `${curY - 10}px`;
    }
    requestAnimationFrame(animateCursor);
  })();
  document.querySelectorAll('a, button, .feature-card, .project').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor && cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('hover'));
  });

  // Magnetic Buttons
  if (!REDUCED_MOTION) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.4}px)`;
      });
      btn.addEventListener('mouseleave', () => (btn.style.transform = 'translate(0,0)'));
    });
  }
}

/* ---------- Reveal on Scroll + skill bars ---------- */

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      if (entry.target.classList.contains('skill-bar')) {
        const fill = entry.target.querySelector('.fill');
        if (fill) fill.style.width = `${fill.dataset.width}%`;
      }
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal, .skill-bar').forEach((el) => observer.observe(el));

/* ---------- Feature Cards mouse glow ---------- */

document.querySelectorAll('.feature-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--y', `${e.clientY - rect.top}px`);
  });
});

/* ---------- Typewriter ---------- */

const roles = ['Full-Stack Developer', 'UI Engineer', 'Open Source Builder', 'Problem Solver'];
const typeEl = document.getElementById('typewriter');

if (typeEl && REDUCED_MOTION) {
  typeEl.textContent = roles[0];
} else if (typeEl) {
  let roleIndex = 0, charIndex = 0, isDeleting = false;
  (function typeLoop() {
    const current = roles[roleIndex];
    if (isDeleting) {
      typeEl.textContent = current.substring(0, --charIndex);
    } else {
      typeEl.textContent = current.substring(0, ++charIndex);
    }
    let speed = isDeleting ? 40 : 90;
    if (!isDeleting && charIndex === current.length) {
      speed = 1500;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      speed = 500;
    }
    setTimeout(typeLoop, speed);
  })();
}

/* ---------- Theme Toggle ---------- */

const themeBtn = document.getElementById('themeToggle');
let theme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', theme);
if (themeBtn) {
  themeBtn.textContent = theme === 'dark' ? '🌙' : '☀️';
  themeBtn.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeBtn.textContent = theme === 'dark' ? '🌙' : '☀️';
  });
}

/* ---------- Contact Form ---------- */

document.getElementById('contactForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const name = form.querySelector('input[aria-label="Your name"]')?.value.trim() || 'there';
  const email = form.querySelector('input[type="email"]')?.value.trim() || '';
  const type = form.querySelector('input[aria-label="Project type"]')?.value.trim() || 'New project';
  const message = form.querySelector('textarea')?.value.trim() || '';

  // Static site — hand off to the visitor's mail app instead of pretending to send.
  const subject = encodeURIComponent(`Portfolio inquiry: ${type}`);
  const body = encodeURIComponent(`Hi Ritesh,\n\n${message}\n\n— ${name}${email ? ` (${email})` : ''}`);
  window.location.href = `mailto:ritesh@example.com?subject=${subject}&body=${body}`;

  const btn = form.querySelector('button');
  const orig = btn.textContent;
  btn.textContent = 'Opening your email app… ✉️';
  showToast('Thanks! Your email app should open now.');
  setTimeout(() => (btn.textContent = orig), 2500);
});

/* ---------- Konami Code Easter Egg ---------- */

const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let kIndex = 0;
document.addEventListener('keydown', (e) => {
  if (e.key === konami[kIndex]) {
    kIndex++;
    if (kIndex === konami.length) { activateEasterEgg(); kIndex = 0; }
  } else {
    kIndex = 0;
  }
});

function activateEasterEgg() {
  document.body.classList.add('konami-active');
  if (!REDUCED_MOTION) {
    for (let i = 0; i < 100; i++) {
      const conf = document.createElement('div');
      conf.style.position = 'fixed';
      conf.style.left = `${Math.random() * 100}vw`;
      conf.style.top = '-10px';
      conf.style.width = '8px';
      conf.style.height = '8px';
      conf.style.background = `hsl(${Math.random() * 360},100%,50%)`;
      conf.style.zIndex = '999999';
      conf.style.borderRadius = '50%';
      conf.style.pointerEvents = 'none';
      document.body.appendChild(conf);
      conf.animate(
        [
          { transform: 'translateY(0) rotate(0)', opacity: 1 },
          { transform: `translateY(${100 + Math.random() * 50}vh) rotate(${720 * Math.random()}deg)`, opacity: 0 }
        ],
        { duration: 2000 + Math.random() * 2000, easing: 'cubic-bezier(.25,.46,.45,.94)' }
      ).onfinish = () => conf.remove();
    }
  }
  setTimeout(() => document.body.classList.remove('konami-active'), 3000);
  showToast('🎉 Konami code activated — you are officially awesome!');
}

/* ---------- Tilt Effect for Project Cards ---------- */

if (!REDUCED_MOTION) {
  document.querySelectorAll('.project').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = (y - rect.height / 2) / 10;
      const rotateY = (rect.width / 2 - x) / 10;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => (card.style.transform = ''));
  });
}

/* ---------- Dynamic Greeting ---------- */

const hour = new Date().getHours();
const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
const greetEl = document.getElementById('greeting');
if (greetEl) greetEl.textContent = greet;

/* ---------- PWA registration ---------- */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* offline support unavailable — fine */ });
  });
}

/* ---------- Expose for other modules (effects.js) ---------- */

window.Ritesh = { showToast, triggerKonami: activateEasterEgg };
