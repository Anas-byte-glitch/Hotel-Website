/* ═══════════════════════════════════════════════════════════════
   AURÈLE GRAND HOTEL — script.js
   All interactive functionality
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ────────────────────────────────────────────────────────────────
   UTILS
──────────────────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ────────────────────────────────────────────────────────────────
   LOADING SCREEN
──────────────────────────────────────────────────────────────── */
function initLoader() {
  const loader = $('#loader');
  if (!loader) return;

  // Hide loader after animation finishes
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.classList.remove('loading');

    // Trigger hero reveal after loader hides
    $$('.reveal-up').forEach(el => {
      el.style.animationPlayState = 'running';
    });
  }, 2000);
}

/* ────────────────────────────────────────────────────────────────
   SCROLL PROGRESS BAR
──────────────────────────────────────────────────────────────── */
function initScrollProgress() {
  const bar = $('#scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${progress}%`;
  }, { passive: true });
}

/* ────────────────────────────────────────────────────────────────
   DARK MODE TOGGLE
──────────────────────────────────────────────────────────────── */
function initDarkMode() {
  const btn = $('#dark-toggle');
  if (!btn) return;

  const saved = localStorage.getItem('aurele-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('aurele-theme', next);
  });
}

/* ────────────────────────────────────────────────────────────────
   STICKY NAVBAR
──────────────────────────────────────────────────────────────── */
function initNavbar() {
  const navbar = $('#navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ────────────────────────────────────────────────────────────────
   MOBILE HAMBURGER MENU
──────────────────────────────────────────────────────────────── */
function initMobileMenu() {
  const hamburger = $('#hamburger');
  const navLinks  = $('#nav-links');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on link click
  $$('a', navLinks).forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ────────────────────────────────────────────────────────────────
   SMOOTH SCROLLING
──────────────────────────────────────────────────────────────── */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = $(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ────────────────────────────────────────────────────────────────
   BACK TO TOP
──────────────────────────────────────────────────────────────── */
function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ────────────────────────────────────────────────────────────────
   SCROLL REVEAL (IntersectionObserver)
──────────────────────────────────────────────────────────────── */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // Add fade-in class to sections
  const targets = [
    ...$$('.about-grid > *'),
    ...$$('.room-card'),
    ...$$('.amenity-card'),
    ...$$('.contact-grid > *'),
    ...$$('.gallery-item'),
  ];

  targets.forEach((el, i) => {
    el.classList.add('fade-in');
    el.style.transitionDelay = `${(i % 4) * 0.1}s`;
    observer.observe(el);
  });
}

/* ────────────────────────────────────────────────────────────────
   LAZY LOADING
──────────────────────────────────────────────────────────────── */
function initLazyLoad() {
  if ('loading' in HTMLImageElement.prototype) return; // Native support

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  });

  $$('img.lazy').forEach(img => observer.observe(img));
}

/* ────────────────────────────────────────────────────────────────
   ROOM CARD BUTTONS — pre-fill booking form
──────────────────────────────────────────────────────────────── */
function initRoomButtons() {
  $$('[data-room]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const room = btn.dataset.room;
      const roomSelect = $('#b-room');
      if (roomSelect) {
        roomSelect.value = room;
        roomSelect.dispatchEvent(new Event('change'));
      }
    });
  });
}

/* ────────────────────────────────────────────────────────────────
   BOOKING FORM
──────────────────────────────────────────────────────────────── */
function initBookingForm() {
  const form = $('#booking-form');
  if (!form) return;

  const checkinInput  = $('#b-checkin');
  const checkoutInput = $('#b-checkout');

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  if (checkinInput)  checkinInput.min  = today;
  if (checkoutInput) checkoutInput.min = today;

  // Update checkout min when checkin changes
  checkinInput?.addEventListener('change', () => {
    if (checkinInput.value) {
      const nextDay = new Date(checkinInput.value);
      nextDay.setDate(nextDay.getDate() + 1);
      checkoutInput.min = nextDay.toISOString().split('T')[0];

      if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
        checkoutInput.value = '';
      }
    }
  });

  // Availability check button
  const checkAvailBtn = $('#check-avail');
  const availDisplay  = $('#avail-check');

  checkAvailBtn?.addEventListener('click', () => {
    const checkin  = checkinInput?.value;
    const checkout = checkoutInput?.value;
    const room     = $('#b-room')?.value;

    if (!checkin || !checkout || !room) {
      showAvailability('Please select room type and dates first.', false);
      return;
    }

    // Simulate async check
    availDisplay.textContent = '⟳ Checking availability…';
    availDisplay.className = 'availability-check';

    setTimeout(() => {
      // Fake logic: ~80% available
      const available = Math.random() > 0.2;
      const nights = Math.round((new Date(checkout) - new Date(checkin)) / 86400000);

      if (available) {
        showAvailability(`✓ Available for ${nights} night${nights !== 1 ? 's' : ''}. Your selected dates are open — proceed with your reservation.`, true);
      } else {
        showAvailability(`✗ Unfortunately, ${room} is not available for the selected dates. Please try different dates or contact our concierge.`, false);
      }
    }, 1200);
  });

  function showAvailability(message, available) {
    const el = $('#avail-check');
    if (!el) return;
    el.textContent = message;
    el.className = `availability-check ${available ? 'available' : 'unavailable'}`;
  }

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateBookingForm(form)) return;

    const data = {
      id:       Date.now().toString(),
      name:     $('#b-name').value.trim(),
      email:    $('#b-email').value.trim(),
      phone:    $('#b-phone').value.trim(),
      guests:   $('#b-guests').value,
      checkin:  checkinInput.value,
      checkout: checkoutInput.value,
      room:     $('#b-room').value,
      requests: $('#b-requests').value.trim(),
      created:  new Date().toISOString(),
    };

    // Save to LocalStorage
    const bookings = JSON.parse(localStorage.getItem('aurele-bookings') || '[]');
    bookings.push(data);
    localStorage.setItem('aurele-bookings', JSON.stringify(bookings));

    // Show confirmation modal
    showBookingModal(data);
    form.reset();
    $('#avail-check').textContent = '';
    $('#avail-check').className = 'availability-check';
  });
}

function validateBookingForm(form) {
  let valid = true;

  const validators = {
    'b-name':     { test: v => v.trim().length >= 2, msg: 'Please enter your full name.' },
    'b-email':    { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Please enter a valid email address.' },
    'b-phone':    { test: v => /^\+?[\d\s\-().]{7,}$/.test(v.trim()), msg: 'Please enter a valid phone number.' },
    'b-guests':   { test: v => !!v, msg: 'Please select the number of guests.' },
    'b-checkin':  { test: v => !!v, msg: 'Please select a check-in date.' },
    'b-checkout': { test: v => !!v, msg: 'Please select a check-out date.' },
    'b-room':     { test: v => !!v, msg: 'Please select a room type.' },
  };

  Object.entries(validators).forEach(([id, rule]) => {
    const input = $(`#${id}`, form);
    if (!input) return;
    const errorEl = input.nextElementSibling;
    const val = input.value;

    if (!rule.test(val)) {
      valid = false;
      if (errorEl) errorEl.textContent = rule.msg;
      input.setAttribute('aria-invalid', 'true');
    } else {
      if (errorEl) errorEl.textContent = '';
      input.removeAttribute('aria-invalid');
    }
  });

  // Check checkout > checkin
  const checkin  = new Date($('#b-checkin')?.value);
  const checkout = new Date($('#b-checkout')?.value);
  if ($('#b-checkin')?.value && $('#b-checkout')?.value && checkout <= checkin) {
    valid = false;
    const el = $('#b-checkout').nextElementSibling;
    if (el) el.textContent = 'Check-out date must be after check-in date.';
  }

  return valid;
}

function showBookingModal(data) {
  const modal   = $('#booking-modal');
  const details = $('#modal-details');
  const body    = $('#modal-body');

  if (!modal) return;

  const nights = Math.round((new Date(data.checkout) - new Date(data.checkin)) / 86400000);

  if (body) body.textContent = `Thank you, ${data.name}. Your reservation at Aurèle Grand Hotel has been received and our concierge team will contact you shortly to confirm all details.`;

  if (details) {
    details.innerHTML = `
      <strong>Booking Reference:</strong> AUR-${data.id.slice(-6).toUpperCase()}<br>
      <strong>Room:</strong> ${data.room}<br>
      <strong>Check-in:</strong> ${formatDate(data.checkin)}<br>
      <strong>Check-out:</strong> ${formatDate(data.checkout)}<br>
      <strong>Duration:</strong> ${nights} night${nights !== 1 ? 's' : ''}<br>
      <strong>Guests:</strong> ${data.guests}<br>
      <strong>Confirmation sent to:</strong> ${data.email}
    `;
  }

  modal.hidden = false;
  document.body.style.overflow = 'hidden';

  // Focus modal
  setTimeout(() => $('#modal-ok')?.focus(), 100);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

function initBookingModal() {
  const modal   = $('#booking-modal');
  const closeBtn = $('#modal-close');
  const okBtn    = $('#modal-ok');
  const backdrop = $('.modal-backdrop', modal);

  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
  };

  closeBtn?.addEventListener('click', closeModal);
  okBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal?.hidden) closeModal();
  });
}

/* ────────────────────────────────────────────────────────────────
   GALLERY LIGHTBOX
──────────────────────────────────────────────────────────────── */
function initGallery() {
  const lightbox  = $('#lightbox');
  const lbImg     = $('#lb-img');
  const lbCaption = $('#lb-caption');
  const lbClose   = $('#lb-close');
  const lbPrev    = $('#lb-prev');
  const lbNext    = $('#lb-next');

  if (!lightbox) return;

  const items = $$('.gallery-item');
  let current = 0;

  function openLightbox(index) {
    current = index;
    const item = items[index];
    if (!item) return;

    lbImg.src = item.dataset.src || $('img', item)?.src || '';
    lbImg.alt = $('img', item)?.alt || '';
    lbCaption.textContent = item.dataset.caption || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    items[current]?.focus();
  }

  function navigate(dir) {
    current = (current + dir + items.length) % items.length;
    const item = items[current];
    lbImg.src = item.dataset.src || $('img', item)?.src || '';
    lbImg.alt = $('img', item)?.alt || '';
    lbCaption.textContent = item.dataset.caption || '';
  }

  // Attach events to gallery items
  items.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => navigate(-1));
  lbNext.addEventListener('click', () => navigate(1));

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
}

/* ────────────────────────────────────────────────────────────────
   TESTIMONIAL SLIDER
──────────────────────────────────────────────────────────────── */
function initTestimonials() {
  const track  = $('#testi-track');
  const prev   = $('#testi-prev');
  const next   = $('#testi-next');
  const dots   = $$('.dot', $('#testi-dots'));

  if (!track) return;

  const slides = $$('.testi-slide', track);
  let current  = 0;
  let timer    = null;

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;

    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', String(i === current));
    });
  }

  function startAutoPlay() {
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  function stopAutoPlay() {
    clearInterval(timer);
  }

  prev?.addEventListener('click', () => { goTo(current - 1); stopAutoPlay(); startAutoPlay(); });
  next?.addEventListener('click', () => { goTo(current + 1); stopAutoPlay(); startAutoPlay(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); stopAutoPlay(); startAutoPlay(); });
  });

  // Swipe support
  let startX = 0;
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? current + 1 : current - 1);
      stopAutoPlay(); startAutoPlay();
    }
  });

  startAutoPlay();
}

/* ────────────────────────────────────────────────────────────────
   CONTACT FORM
──────────────────────────────────────────────────────────────── */
function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;

    const validators = {
      'c-name':    { test: v => v.trim().length >= 2, msg: 'Please enter your name.' },
      'c-email':   { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Please enter a valid email.' },
      'c-message': { test: v => v.trim().length >= 10, msg: 'Please enter a message (at least 10 characters).' },
    };

    Object.entries(validators).forEach(([id, rule]) => {
      const input   = $(`#${id}`, form);
      const errorEl = input?.nextElementSibling;
      if (!input) return;

      if (!rule.test(input.value)) {
        valid = false;
        if (errorEl) errorEl.textContent = rule.msg;
        input.setAttribute('aria-invalid', 'true');
      } else {
        if (errorEl) errorEl.textContent = '';
        input.removeAttribute('aria-invalid');
      }
    });

    if (!valid) return;

    // Simulate send
    const btn = $('button[type="submit"]', form);
    const originalText = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      form.reset();
      btn.textContent = 'Message Sent ✓';
      btn.style.background = '#90ee90';
      btn.style.color = '#000';
      btn.style.borderColor = '#90ee90';

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
        btn.style.borderColor = '';
        btn.disabled = false;
      }, 3000);
    }, 1500);
  });
}

/* ────────────────────────────────────────────────────────────────
   NEWSLETTER FORM
──────────────────────────────────────────────────────────────── */
function initNewsletter() {
  const form      = $('#newsletter-form');
  const errorEl   = $('#nl-error');
  const successEl = $('#nl-success');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('#nl-email');
    const email = input?.value?.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (errorEl)   errorEl.textContent   = 'Please enter a valid email address.';
      if (successEl) successEl.textContent = '';
      return;
    }

    // Check for duplicates
    const subscribers = JSON.parse(localStorage.getItem('aurele-newsletter') || '[]');
    if (subscribers.includes(email)) {
      if (errorEl)   errorEl.textContent   = 'You are already subscribed.';
      if (successEl) successEl.textContent = '';
      return;
    }

    // Save
    subscribers.push(email);
    localStorage.setItem('aurele-newsletter', JSON.stringify(subscribers));

    if (errorEl)   errorEl.textContent   = '';
    if (successEl) successEl.textContent = '✓ Thank you. Welcome to Aurèle.';

    form.reset();

    setTimeout(() => {
      if (successEl) successEl.textContent = '';
    }, 5000);
  });
}

/* ────────────────────────────────────────────────────────────────
   SET CURRENT YEAR IN FOOTER
──────────────────────────────────────────────────────────────── */
function initYear() {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ────────────────────────────────────────────────────────────────
   INIT ALL
──────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initScrollProgress();
  initDarkMode();
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initBackToTop();
  initScrollReveal();
  initLazyLoad();
  initRoomButtons();
  initBookingForm();
  initBookingModal();
  initGallery();
  initTestimonials();
  initContactForm();
  initNewsletter();
  initYear();
});