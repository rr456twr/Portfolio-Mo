// ── DOM refs ────────────────────────────────────────────
const expBgLayer  = document.getElementById('exp-bg-layer');
const skillsContent = document.getElementById('skills-content');
const cursor      = document.getElementById('cursor');
const portal      = document.getElementById('portal');
const heroText    = document.getElementById('hero-text');
const pageBg      = document.getElementById('page-bg');
const darkBg      = document.getElementById('dark-bg');
const gridLines   = document.getElementById('grid-lines');
const darkContent = document.getElementById('dark-content');
const expContent  = document.getElementById('experience-content');
const aboutContent = document.getElementById('about-content');
const scrollHint  = document.getElementById('scroll-hint');
const nav         = document.getElementById('nav');
const navLinks    = document.querySelectorAll('#nav a');
const navContact  = document.getElementById('nav-contact');
const scrollSpacer = document.getElementById('scroll-spacer');

// ── Hamburger menu ──────────────────────────────────────
const hamburger  = document.getElementById('nav-hamburger');
const navDrawer  = document.getElementById('nav-links');
const navOverlay = document.getElementById('nav-overlay');

function openMenu() {
  hamburger.classList.add('is-open');
  navDrawer.classList.add('is-open');
  navOverlay.classList.add('is-open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  hamburger.classList.remove('is-open');
  navDrawer.classList.remove('is-open');
  navOverlay.classList.remove('is-open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  hamburger.classList.contains('is-open') ? closeMenu() : openMenu();
});
navOverlay.addEventListener('click', closeMenu);
navDrawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

// ── Nav active link (click-based) ───────────────────────
const navLinkEls = Array.from(navLinks).filter(a => !a.classList.contains('contact'));

navLinkEls.forEach(a => {
  a.addEventListener('click', (e) => {
    navLinkEls.forEach(l => l.classList.remove('nav-active'));
    a.classList.add('nav-active');
    if (a.getAttribute('href') === '#') e.preventDefault();
  });
});

const homeLink = navLinkEls.find(a => a.textContent.trim().toUpperCase() === 'HOME');
if (homeLink) homeLink.classList.add('nav-active');

// ── Touch card flip ──────────────────────────────────────
document.querySelectorAll('.sk-card-wrap').forEach(card => {
  card.addEventListener('click', () => {
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      card.classList.toggle('flipped');
    }
  });
});

navLinks.forEach((a) => { a.style.color = ''; });

function syncHamburger(c) {
  hamburger.querySelectorAll('span').forEach(s => {
    s.style.background = `rgb(${c},${c},${c})`;
  });
}

// ── Constants ───────────────────────────────────────────
const R = 110;
const TOTAL_BASE = () => innerHeight * 0.5;  // portal intro length

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const remap = (v, a, b, c, d) => c + clamp((v - a) / (b - a), 0, 1) * (d - c);
const ease  = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
const lerp  = (a, b, t) => a + (b - a) * t;

function maxScale() {
  const d = Math.sqrt(innerWidth * innerWidth + innerHeight * innerHeight);
  return (d / R) * 1.05;
}

// ── Scroll spacer: just enough to run portal intro ──────
function updateScrollHeight() {
  scrollSpacer.style.height = (TOTAL_BASE() + innerHeight) + 'px';
}

// ── Section definitions ──────────────────────────────────
// index 0 = Hero (the dark-content divider stage after portal)
// index 1 = Experience
// index 2 = About Me
// index 3 = Skills
const SECTIONS = [
  { el: darkContent,  name: 'HOME'       },
  { el: expContent,   name: 'EXPERIENCE' },
  { el: aboutContent, name: 'ABOUT'      },
  { el: skillsContent, name: 'SKILLS'   },
];

const CROSSFADE_MS = 680;  // duration of crossfade transition

let snapMode    = false;   // true once portal animation completes
let currentIdx  = 0;       // active section index (0 = Hero dark)
let isAnimating = false;   // lock during crossfade

// ── Apply opacity to all sections directly ───────────────
function setSectionOpacity(idx, op, pointer) {
  const s = SECTIONS[idx];
  if (!s) return;
  s.el.style.opacity       = op;
  s.el.style.pointerEvents = pointer ? 'auto' : 'none';
  // exp-bg-layer follows experience section
  if (idx === 1) expBgLayer.style.opacity = op;
}

// Set initial states
SECTIONS.forEach((_, i) => setSectionOpacity(i, 0, false));

// ── Crossfade to a target section ────────────────────────
function goToSection(targetIdx, direction) {
  if (isAnimating) return;
  if (targetIdx < 0 || targetIdx >= SECTIONS.length) return;
  if (targetIdx === currentIdx) return;

  isAnimating = true;

  const prev = currentIdx;
  currentIdx = targetIdx;

  // Update nav active link
  const targetName = SECTIONS[targetIdx].name;
  navLinkEls.forEach(a => {
    const text = a.textContent.trim().toUpperCase();
    if (text === targetName || (targetName === 'HOME' && text === 'HOME')) {
      a.classList.add('nav-active');
    } else {
      a.classList.remove('nav-active');
    }
  });

  // Crossfade: fade out prev, fade in next simultaneously
  const prevEl    = SECTIONS[prev].el;
  const targetEl  = SECTIONS[targetIdx].el;

  // Prepare target: make it visible but transparent, no pointer events yet
  targetEl.style.transition  = `opacity ${CROSSFADE_MS}ms cubic-bezier(0.4,0,0.2,1)`;
  prevEl.style.transition    = `opacity ${CROSSFADE_MS}ms cubic-bezier(0.4,0,0.2,1)`;
  if (prev === 1) expBgLayer.style.transition = `opacity ${CROSSFADE_MS}ms cubic-bezier(0.4,0,0.2,1)`;

  targetEl.style.opacity     = 0;
  targetEl.style.pointerEvents = 'none';

  // Force reflow
  void targetEl.offsetWidth;

  // Trigger fade
  prevEl.style.opacity    = 0;
  targetEl.style.opacity  = 1;
  if (prev === 1) expBgLayer.style.opacity = 0;

  // Update nav & bg style for new section
  updateNavForSection(targetIdx);

  setTimeout(() => {
    prevEl.style.pointerEvents    = 'none';
    targetEl.style.pointerEvents  = 'auto';
    // Clear transitions so JS tick can take over if needed
    prevEl.style.transition       = '';
    targetEl.style.transition     = '';
    if (prev === 1) expBgLayer.style.transition = '';
    isAnimating = false;
  }, CROSSFADE_MS);
}

// ── Nav / bg style per section ────────────────────────────
function updateNavForSection(idx) {
  // 0 = dark stage, 1 = experience (dark), 2 = about (dark), 3 = skills (light)
  const isLight = (idx === 3);
  const navC = isLight ? 35 : 255;

  nav.style.setProperty('--nav-fg', `rgb(${navC},${navC},${navC})`);
  syncHamburger(navC);

  if (isLight) {
    nav.classList.remove('nav-dark-mode');
    nav.style.background = 'rgba(249,248,246,0.25)';
    cursor.style.background  = 'rgba(44,44,44,0.06)';
    cursor.style.borderColor = 'rgba(44,44,44,0.70)';
  } else {
    nav.classList.add('nav-dark-mode');
    nav.style.background = 'rgba(10,10,15,0.25)';
    cursor.style.background  = 'rgba(200,195,185,0.08)';
    cursor.style.borderColor = 'rgba(200,195,185,0.75)';
  }
}

// ── Wheel / keyboard / touch input ───────────────────────
let wheelAccum  = 0;
const WHEEL_THRESHOLD = 80;

let touchStartY = 0;
const TOUCH_THRESHOLD = 50;

function handleNext() { goToSection(currentIdx + 1); }
function handlePrev() { goToSection(currentIdx - 1); }

window.addEventListener('wheel', (e) => {
  if (!snapMode) return;

  // If current section has internal scroll (mobile overflow-y), let it scroll
  const el = SECTIONS[currentIdx].el;
  const scrollable = el.scrollHeight > el.clientHeight + 2;
  if (scrollable) {
    const atTop    = el.scrollTop <= 0;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
    if (e.deltaY > 0 && !atBottom) return;
    if (e.deltaY < 0 && !atTop) return;
  }

  e.preventDefault();

  wheelAccum += e.deltaY;
  if (Math.abs(wheelAccum) >= WHEEL_THRESHOLD) {
    wheelAccum > 0 ? handleNext() : handlePrev();
    wheelAccum = 0;
  }
}, { passive: false });

window.addEventListener('touchstart', (e) => {
  if (!snapMode) return;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
  if (!snapMode) return;
  const dy = touchStartY - e.changedTouches[0].clientY;

  // Allow internal scroll in overflowing sections
  const el = SECTIONS[currentIdx].el;
  const scrollable = el.scrollHeight > el.clientHeight + 2;
  if (scrollable) {
    const atTop    = el.scrollTop <= 0;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
    if (dy > 0 && !atBottom) return;
    if (dy < 0 && !atTop) return;
  }

  if (Math.abs(dy) >= TOUCH_THRESHOLD) {
    dy > 0 ? handleNext() : handlePrev();
  }
}, { passive: true });

window.addEventListener('keydown', (e) => {
  if (!snapMode) return;
  if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); handleNext(); }
  if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); handlePrev(); }
});

// ── Dot / nav link navigation ─────────────────────────────
// Allow nav links to jump to sections when snap mode is active
navLinkEls.forEach(a => {
  a.addEventListener('click', (e) => {
    if (!snapMode) return;
    e.preventDefault();
    const text = a.textContent.trim().toUpperCase();
    const idx = SECTIONS.findIndex(s => s.name === text);
    if (idx !== -1) goToSection(idx);
  });
});

// ── Portal intro tick (scroll-driven) ────────────────────
let raf = false;
window.addEventListener('scroll', () => {
  if (!raf) { requestAnimationFrame(tick); raf = true; }
});

function tick() {
  raf = false;
  if (snapMode) return;  // once snap mode is active, scroll tick does nothing

  const sy = window.scrollY;
  const p  = clamp(sy / TOTAL_BASE(), 0, 1);

  /* ── Portal scale ── */
  const scaleP = ease(remap(p, 0, 0.3, 0, 1));
  portal.style.transform = `translate(-50%, -50%) scale(${1 + scaleP * maxScale()})`;

  /* ── Portal colour ── */
  const cP  = remap(p, 0.05, 0.52, 0, 1);
  const sh  = Math.round(255 * (1 - cP));
  const shd = Math.round(sh * 0.88);
  portal.style.background =
    `radial-gradient(circle at 42% 38%, rgb(${sh},${sh},${sh}) 0%, rgb(${Math.round(sh*0.96)},${Math.round(sh*0.96)},${Math.round(sh*0.96)}) 35%, rgb(${shd},${shd},${shd}) 100%)`;

  /* ── Portal glow ── */
  const glowA = clamp(1 - remap(p, 0.05, 0.45, 0, 1), 0, 1);
  portal.style.boxShadow = glowA > 0.01
    ? `0 0 ${100 * glowA}px rgba(210,205,195,${0.55 * glowA}), 0 0 ${200 * glowA}px rgba(200,195,185,${0.22 * glowA})`
    : 'none';
  portal.style.setProperty('--ring-opacity', String(glowA * 0.6));

  /* ── Hero text ── */
  const textP = ease(remap(p, 0, 0.30, 0, 1));
  heroText.style.opacity   = 1 - textP;
  heroText.style.transform = `translateY(calc(-50% - ${textP * 18}px))`;

  /* ── Scroll hint ── */
  scrollHint.style.opacity = 1 - remap(p, 0, 0.12, 0, 1);

  /* ── Dark BG ── */
  const darkP = ease(remap(p, 0.12, 0.68, 0, 1));
  darkBg.style.opacity    = darkP * 0.97;
  pageBg.style.opacity    = 1 - darkP;
  gridLines.style.opacity = remap(darkP, 0.4, 1, 0, 0.7);
  darkBg.style.setProperty('--dark-vortex', String(lerp(0, 1, remap(darkP, 0.12, 1, 0, 1))));

  /* ── Nav colour during intro ── */
  const navT = remap(darkP, 0.45, 1, 0, 1);
  const navC = Math.round(lerp(35, 255, navT));
  nav.style.setProperty('--nav-fg', `rgb(${navC},${navC},${navC})`);
  syncHamburger(navC);

  if (darkP > 0.45) {
    nav.style.background = `rgba(10,10,15,${0.25 * Math.min(1, (darkP - 0.45) / 0.3)})`;
    nav.classList.add('nav-dark-mode');
    cursor.style.background  = 'rgba(200,195,185,0.08)';
    cursor.style.borderColor = 'rgba(200,195,185,0.75)';
  } else {
    nav.style.background = 'rgba(249,248,246,0.25)';
    nav.classList.remove('nav-dark-mode');
    cursor.style.background  = 'rgba(44,44,44,0.06)';
    cursor.style.borderColor = 'rgba(44,44,44,0.70)';
  }

  /* ── Dark content (Hero section 0) fades in at end of intro ── */
  const dcIn = ease(remap(p, 0.78, 0.98, 0, 1));
  darkContent.style.opacity       = dcIn;
  darkContent.style.pointerEvents = dcIn > 0.1 ? 'auto' : 'none';

  /* ── Activate snap mode when portal animation is complete ── */
  if (p >= 0.99 && !snapMode) {
    enterSnapMode();
  }
}

// ── Enter snap mode ───────────────────────────────────────
function enterSnapMode() {
  snapMode = true;

  // Freeze scroll at top so the fixed scene stays fully visible
  window.scrollTo(0, 0);
  document.body.style.overflow = 'hidden';
  scrollSpacer.style.display   = 'none';

  // Ensure portal & bg are in their final intro state
  portal.style.transform = `translate(-50%, -50%) scale(${1 + maxScale()})`;
  portal.style.boxShadow = 'none';
  darkBg.style.opacity   = '0.97';
  pageBg.style.opacity   = '0';
  gridLines.style.opacity = '0.7';
  darkBg.style.setProperty('--dark-vortex', '1');
  heroText.style.opacity = '0';
  scrollHint.style.opacity = '0';

  // Show first snap section (index 0 = Hero dark stage)
  currentIdx = 0;
  setSectionOpacity(0, 1, true);
  updateNavForSection(0);

  // Show snap progress dots
  updateDots();
}

// ── Cursor ────────────────────────────────────────────────
document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

// ── Dot navigation ───────────────────────────────────────
let dotsContainer = null;

function buildDots() {
  dotsContainer = document.createElement('div');
  dotsContainer.id = 'snap-dots';
  dotsContainer.style.cssText = `
    position: fixed;
    right: 28px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 300;
    opacity: 0;
    transition: opacity 0.5s ease;
  `;

  SECTIONS.forEach((s, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', s.name);
    dot.dataset.idx = i;
    dot.style.cssText = `
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: 1.5px solid rgba(200,195,185,0.7);
      background: transparent;
      cursor: pointer;
      padding: 0;
      transition: background 0.3s ease, transform 0.3s ease, border-color 0.3s ease;
    `;
    dot.addEventListener('click', () => goToSection(i));
    dotsContainer.appendChild(dot);
  });

  document.body.appendChild(dotsContainer);
}

function updateDots() {
  if (!dotsContainer) buildDots();

  // Show dots
  dotsContainer.style.opacity = '1';

  const isLight = currentIdx === 3;
  const dotColor = isLight
    ? 'rgba(44,44,44,0.7)'
    : 'rgba(200,195,185,0.7)';

  dotsContainer.querySelectorAll('button').forEach((dot, i) => {
    const active = i === currentIdx;
    dot.style.background    = active ? dotColor : 'transparent';
    dot.style.borderColor   = dotColor;
    dot.style.transform     = active ? 'scale(1.3)' : 'scale(1)';
  });
}

// Patch goToSection to update dots
const _goToSection = goToSection;
window.goToSection = function(targetIdx) {
  _goToSection(targetIdx);
  setTimeout(updateDots, 50);
};

// Re-wire event listeners to use patched version
// (already using goToSection directly, dots update via setTimeout above)
// Patch: override internal references
Object.defineProperty(window, '_snapGoTo', { value: goToSection });

// Actually re-assign so all internal calls update dots too:
// We'll wrap via a simpler approach — hook into the animation end
const origGoTo = goToSection;
function goToSectionWithDots(targetIdx) {
  origGoTo(targetIdx);
  // Update dots after a tick (currentIdx already updated inside origGoTo)
  requestAnimationFrame(updateDots);
}

// Override wheel / keyboard / touch to use wrapped version
// (rebuild those handlers pointing to goToSectionWithDots)
// Easier: just patch handleNext / handlePrev
function handleNextDot() { goToSectionWithDots(currentIdx + 1); }
function handlePrevDot() { goToSectionWithDots(currentIdx - 1); }

// Rebuild wheel handler
window.addEventListener('wheel', (e) => {
  if (!snapMode) return;
  const el = SECTIONS[currentIdx].el;
  const scrollable = el.scrollHeight > el.clientHeight + 2;
  if (scrollable) {
    const atTop    = el.scrollTop <= 0;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
    if (e.deltaY > 0 && !atBottom) return;
    if (e.deltaY < 0 && !atTop) return;
  }
  e.preventDefault();
  wheelAccum += e.deltaY;
  if (Math.abs(wheelAccum) >= WHEEL_THRESHOLD) {
    wheelAccum > 0 ? handleNextDot() : handlePrevDot();
    wheelAccum = 0;
  }
}, { passive: false });

window.addEventListener('touchend', (e) => {
  if (!snapMode) return;
  const dy = touchStartY - e.changedTouches[0].clientY;
  const el = SECTIONS[currentIdx].el;
  const scrollable = el.scrollHeight > el.clientHeight + 2;
  if (scrollable) {
    const atTop    = el.scrollTop <= 0;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
    if (dy > 0 && !atBottom) return;
    if (dy < 0 && !atTop) return;
  }
  if (Math.abs(dy) >= TOUCH_THRESHOLD) {
    dy > 0 ? handleNextDot() : handlePrevDot();
  }
}, { passive: true });

window.addEventListener('keydown', (e) => {
  if (!snapMode) return;
  if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); handleNextDot(); }
  if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); handlePrevDot(); }
});

navLinkEls.forEach(a => {
  a.addEventListener('click', (e) => {
    if (!snapMode) return;
    e.preventDefault();
    const text = a.textContent.trim().toUpperCase();
    const idx = SECTIONS.findIndex(s => s.name === text);
    if (idx !== -1) goToSectionWithDots(idx);
  });
});

// ── Init ──────────────────────────────────────────────────
window.addEventListener('resize', () => {
  updateScrollHeight();
  if (!snapMode) tick();
});

updateScrollHeight();
tick();