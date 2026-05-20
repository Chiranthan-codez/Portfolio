/* ============================================
   PORTFOLIO — SCRIPT.JS
   Features: Typing, counters, scroll reveal,
   dark/light mode, mobile menu, form validation,
   cursor glow, back-to-top, skill bars, filters
============================================ */

'use strict';

/* ── Utility ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

/* ============================================
   PRELOADER
============================================ */
function initPreloader() {
  const preloader = $('#preloader');
  if (!preloader) return;
  window.addEventListener('load', () => {
    setTimeout(() => preloader.classList.add('hidden'), 600);
  });
}

/* ============================================
   CURSOR GLOW
============================================ */
function initCursorGlow() {
  const cursor = $('#cursor-glow');
  if (!cursor || window.matchMedia('(pointer: coarse)').matches) {
    if (cursor) cursor.remove();
    return;
  }
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });
}

/* ============================================
   NAVIGATION
============================================ */
function initNav() {
  const nav        = $('nav');
  const hamburger  = $('.hamburger');
  const mobileMenu = $('.mobile-menu');
  const themeBtn   = $('.theme-toggle');
  const links      = $$('.nav-links a, .mobile-menu a');

  /* Scroll effects */
  window.addEventListener('scroll', () => {
    nav && nav.classList.toggle('scrolled', window.scrollY > 40);
    updateBackTop();
  }, { passive: true });

  /* Hamburger toggle */
  on(hamburger, 'click', () => {
    hamburger.classList.toggle('open');
    mobileMenu && mobileMenu.classList.toggle('open');
    document.body.style.overflow =
      mobileMenu && mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  /* Close mobile menu on link click */
  $$('.mobile-menu a').forEach(a => {
    on(a, 'click', () => {
      hamburger && hamburger.classList.remove('open');
      mobileMenu && mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* Active link highlight */
  const current = location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* Dark / Light toggle */
  const saved = localStorage.getItem('theme');
  if (saved === 'light') document.body.classList.add('light');

  on(themeBtn, 'click', () => {
    document.body.classList.toggle('light');
    localStorage.setItem('theme',
      document.body.classList.contains('light') ? 'light' : 'dark');
  });
}

/* ============================================
   BACK TO TOP
============================================ */
function updateBackTop() {
  const btn = $('#back-top');
  if (!btn) return;
  btn.classList.toggle('visible', window.scrollY > 400);
}
function initBackTop() {
  const btn = $('#back-top');
  on(btn, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ============================================
   TYPING ANIMATION
============================================ */
function initTyping() {
  const el = $('#typed-text');
  if (!el) return;

  const phrases = el.dataset.phrases
    ? JSON.parse(el.dataset.phrases)
    : ['Full Stack Developer', 'UI/UX Enthusiast', 'Open Source Contributor', 'Problem Solver'];

  let pIdx = 0, cIdx = 0, deleting = false;

  function tick() {
    const phrase = phrases[pIdx];
    el.textContent = deleting ? phrase.slice(0, cIdx--) : phrase.slice(0, cIdx++);

    let delay = deleting ? 60 : 100;

    if (!deleting && cIdx > phrase.length) {
      delay = 1800;
      deleting = true;
    } else if (deleting && cIdx < 0) {
      deleting = false;
      cIdx = 0;
      pIdx = (pIdx + 1) % phrases.length;
      delay = 400;
    }
    setTimeout(tick, delay);
  }
  tick();
}

/* ============================================
   ANIMATED COUNTERS
============================================ */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(update);
}

/* ============================================
   SCROLL REVEAL + COUNTER + SKILL TRIGGERS
============================================ */
function initScrollReveal() {
  const revealEls  = $$('.reveal');
  const counterEls = $$('[data-target]');
  const skillBars  = $$('.skill-bar-fill');
  const rings      = $$('.ring-fill');
  const triggered  = new WeakSet();

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;

      /* Reveal */
      if (e.target.classList.contains('reveal')) {
        e.target.classList.add('visible');
      }

      /* Counter */
      if (e.target.hasAttribute('data-target') && !triggered.has(e.target)) {
        triggered.add(e.target);
        animateCounter(e.target);
      }

      /* Skill bar */
      if (e.target.classList.contains('skill-bar-fill') && !triggered.has(e.target)) {
        triggered.add(e.target);
        e.target.style.width = (e.target.dataset.width || '0') + '%';
      }

      /* SVG ring */
      if (e.target.classList.contains('ring-fill') && !triggered.has(e.target)) {
        triggered.add(e.target);
        const pct = parseInt(e.target.dataset.pct || 0, 10);
        const circumference = 251.2;
        e.target.style.strokeDashoffset = circumference - (circumference * pct / 100);
      }
    });
  }, { threshold: 0.2 });

  revealEls.forEach(el => observer.observe(el));
  counterEls.forEach(el => observer.observe(el));
  skillBars.forEach(el => observer.observe(el));
  rings.forEach(el => observer.observe(el));
}

/* ============================================
   PROJECT FILTER
============================================ */
function initFilter() {
  const btns  = $$('.filter-btn');
  const cards = $$('.project-card');
  if (!btns.length) return;

  btns.forEach(btn => {
    on(btn, 'click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        if (match) {
          card.style.display = '';
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = '';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => { card.style.display = 'none'; }, 320);
        }
      });
    });
  });
}

/* ============================================
   CONTACT FORM VALIDATION
============================================ */
function initForm() {
  const form = $('#contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('.form-submit');
  const fields = {
    name:    { el: $('#f-name'),    rules: ['required', 'minlen:2']   },
    email:   { el: $('#f-email'),   rules: ['required', 'email']      },
    subject: { el: $('#f-subject'), rules: ['required', 'minlen:4']   },
    message: { el: $('#f-message'), rules: ['required', 'minlen:20']  },
  };

  const messages = {
    required:  'This field is required.',
    email:     'Please enter a valid email address.',
    'minlen:2':  'Must be at least 2 characters.',
    'minlen:4':  'Must be at least 4 characters.',
    'minlen:20': 'Please write at least 20 characters.',
  };

  function validate(key, { el, rules }) {
    const val = el.value.trim();
    const errEl = form.querySelector(`#err-${key}`);
    for (const rule of rules) {
      let fail = false;
      if (rule === 'required' && !val) fail = true;
      if (rule === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) fail = true;
      if (rule.startsWith('minlen:')) {
        const n = parseInt(rule.split(':')[1], 10);
        if (val && val.length < n) fail = true;
      }
      if (fail) {
        el.classList.add('error');
        if (errEl) { errEl.textContent = messages[rule]; errEl.classList.add('show'); }
        return false;
      }
    }
    el.classList.remove('error');
    if (errEl) errEl.classList.remove('show');
    return true;
  }

  /* Inline validation on blur */
  Object.entries(fields).forEach(([key, field]) => {
    on(field.el, 'blur',  () => validate(key, field));
    on(field.el, 'input', () => { if (field.el.classList.contains('error')) validate(key, field); });
  });

  on(form, 'submit', e => {
    e.preventDefault();
    const allValid = Object.entries(fields).every(([k, f]) => validate(k, f));
    if (!allValid) return;

    /* Simulate send */
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      form.reset();
      showNotification('Message sent! I\'ll get back to you soon.', 'success');
    }, 1800);
  });
}

/* ── Notification popup ── */
function showNotification(msg, type = 'success') {
  let notif = $('#notif');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'notif';
    notif.className = 'notification';
    notif.innerHTML = `<span class="notification-icon"></span><span class="notification-msg"></span>`;
    document.body.appendChild(notif);
  }
  notif.querySelector('.notification-icon').textContent = type === 'success' ? '✓' : '✕';
  notif.querySelector('.notification-msg').textContent  = msg;
  notif.className = `notification ${type === 'success' ? 'success' : 'error-n'}`;
  void notif.offsetWidth; // reflow
  notif.classList.add('show');
  setTimeout(() => notif.classList.remove('show'), 4000);
}

/* ============================================
   SMOOTH PAGE TRANSITIONS
============================================ */
function initPageTransitions() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9998;
    background:var(--bg);pointer-events:none;
    opacity:0;transition:opacity 0.35s ease;
  `;
  document.body.appendChild(overlay);

  /* Fade in on load */
  requestAnimationFrame(() => requestAnimationFrame(() => { overlay.style.opacity = '0'; }));

  /* Fade out before nav */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
    e.preventDefault();
    overlay.style.opacity = '1';
    setTimeout(() => { location.href = href; }, 360);
  });
}

/* ============================================
   INIT
============================================ */
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initCursorGlow();
  initNav();
  initBackTop();
  initTyping();
  initScrollReveal();
  initFilter();
  initForm();
  initPageTransitions();
});
