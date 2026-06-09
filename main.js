const expBgLayer = document.getElementById('exp-bg-layer');
const skillsContent   = document.getElementById('skills-content');
const cursor          = document.getElementById('cursor');
const portal          = document.getElementById('portal');
const heroText        = document.getElementById('hero-text');
const pageBg          = document.getElementById('page-bg');
const darkBg          = document.getElementById('dark-bg');
const gridLines       = document.getElementById('grid-lines');
const darkContent     = document.getElementById('dark-content');
const expContent      = document.getElementById('experience-content');
const aboutContent    = document.getElementById('about-content');
const scrollHint      = document.getElementById('scroll-hint');
const nav             = document.getElementById('nav');
const navLinks        = document.querySelectorAll('#nav a');
const navContact      = document.getElementById('nav-contact');
const scrollSpacer    = document.getElementById('scroll-spacer');

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

// Close on any nav link tap
navDrawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

// ── Nav active link (click-based) ───────────────────────
const navLinkEls = Array.from(navLinks).filter(a => !a.classList.contains('contact'));

navLinkEls.forEach(a => {
  a.addEventListener('click', (e) => {
    // Mark clicked link as active, clear others
    navLinkEls.forEach(l => l.classList.remove('nav-active'));
    a.classList.add('nav-active');
    // href="#" — prevent jump
    if (a.getAttribute('href') === '#') e.preventDefault();
  });
});

// Set HOME active on load
const homeLink = navLinkEls.find(a => a.textContent.trim().toUpperCase() === 'HOME');
if (homeLink) homeLink.classList.add('nav-active');

// ── Touch card flip ──────────────────────────────────────
document.querySelectorAll('.sk-card-wrap').forEach(card => {
  card.addEventListener('click', () => {
    // Only apply on touch/coarse pointer devices
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      card.classList.toggle('flipped');
    }
  });
});

// Clear any stale inline colors so CSS --nav-fg variable takes over
navLinks.forEach((a) => { a.style.color = ''; });

// Keep hamburger bar colour in sync with nav-fg
function syncHamburger(c) {
  hamburger.querySelectorAll('span').forEach(s => { s.style.background = `rgb(${c},${c},${c})`; });
}

const R = 110;

// Phase 1: intro portal + dark-bg animation  (was 2.4 → now 1.3×)
const TOTAL_BASE = () => innerHeight * 0.5;
// Extended to 7.0× — gives Skills section enough room after About Me
const TOTAL_EXT  = () => innerHeight * 7.0;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const remap = (v, a, b, c, d) => c + clamp((v - a) / (b - a), 0, 1) * (d - c);
const ease  = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
const lerp  = (a, b, t) => a + (b - a) * t;

function maxScale() {
  const d = Math.sqrt(innerWidth * innerWidth + innerHeight * innerHeight);
  return (d / R) * 1.05;
}

function updateScrollHeight() {
  scrollSpacer.style.height = (TOTAL_EXT() + innerHeight) + 'px';
}

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

let raf = false;
window.addEventListener('scroll', () => {
  if (!raf) { requestAnimationFrame(tick); raf = true; }
});

function tick() {
  raf = false;
  const sy     = window.scrollY;
  // p drives the original intro animation (0 → 1 over first 2.4× viewport)
  const p      = clamp(sy / TOTAL_BASE(), 0, 1);
  // pX drives the extended section reveals (0 → 1 over full 6× viewport)
  const pX     = sy / TOTAL_EXT();

  /* ── Portal scale ── */
  const scaleP = ease(remap(p, 0, 0.3, 0, 1));
  portal.style.transform = `translate(-50%, -50%) scale(${1 + scaleP * maxScale()})`;

  /* ── Portal colour: holo white → black ── */
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

  /* ── Hero text: fade + lift ── */
  const textP = ease(remap(p, 0, 0.30, 0, 1));
  heroText.style.opacity   = 1 - textP;
  heroText.style.transform = `translateY(calc(-50% - ${textP * 18}px))`;

  /* ── Scroll hint ── */
  scrollHint.style.opacity = 1 - remap(p, 0, 0.12, 0, 1);

  /* ── Dark background ── */
  const darkP = ease(remap(p, 0.12, 0.68, 0, 1));
  darkBg.style.opacity    = darkP * 0.97;
  pageBg.style.opacity    = 1 - darkP;
  gridLines.style.opacity = remap(darkP, 0.4, 1, 0, 0.7);
  darkBg.style.setProperty('--dark-vortex', String(lerp(0, 1, remap(darkP, 0.12, 1, 0, 1))));

  /* ── Nav colour: original dark → pure white (dark sections)
     → back to dark when Skills (light bg) fades in               ── */
  const navT = remap(darkP, 0.45, 1, 0, 1);
  // skillsOp already computed below but we need it here — compute early
  const _skillsOp = ease(remap(pX, 0.72, 0.80, 0, 1));
  // lerp: dark(35) → white(255) for dark sections, then white → dark(35) for skills
  const navCBase = Math.round(lerp(35, 255, navT));
  const navC     = Math.round(lerp(navCBase, 35, _skillsOp));
  nav.style.setProperty('--nav-fg', `rgb(${navC},${navC},${navC})`);
  syncHamburger(navC);

  // dark-mode class: underline colour follows --nav-fg (white on dark, dark on light)
  if (darkP > 0.45 && _skillsOp < 0.5) {
    nav.classList.add('nav-dark-mode');
  } else {
    nav.classList.remove('nav-dark-mode');
  }

  /* ── Cursor ── */
  if (_skillsOp > 0.5 || darkP < 0.6) {
    // Light background: dark ring
    cursor.style.background = 'rgba(44,44,44,0.06)';
    cursor.style.borderColor = 'rgba(44,44,44,0.70)';
  } else {
    // Dark background: light ring
    cursor.style.background = 'rgba(200,195,185,0.08)';
    cursor.style.borderColor = 'rgba(200,195,185,0.75)';
  }

  /* ── Dark content (divider)
     Fades in at end of intro, fades out as Experience comes in.
     TOTAL_BASE = 1.3× → pX at that point = 1.3/5.0 = 0.26         ── */
  const dcIn  = ease(remap(p,  0.78, 0.98, 0, 1));
  const dcOut = ease(remap(pX, 0.22, 0.27, 0, 1));
  const dcOp  = dcIn * (1 - dcOut);
  darkContent.style.opacity       = dcOp;
  darkContent.style.pointerEvents = dcOp > 0.1 ? 'auto' : 'none';

  /* ── Experience section
     pX 0.25 → 0.33 : fade in
     pX 0.48 → 0.56 : fade out                                       ── */
  const expIn = ease(remap(pX, 0.07, 0.12, 0, 1));
  const expOut = ease(remap(pX, 0.48, 0.56, 0, 1));
  const expOp  = expIn * (1 - expOut);
  expContent.style.opacity       = expOp;
  expContent.style.pointerEvents = expOp > 0.1 ? 'auto' : 'none';
  expBgLayer.style.opacity = expOp;

  /* ── About Me section — crossfade: starts fading IN while
     Experience is fading out (overlap at pX 0.50–0.56)             ── */
  const aboutOp = ease(remap(pX, 0.50, 0.58, 0, 1)) * (1 - ease(remap(pX, 0.70, 0.78, 0, 1)));
  aboutContent.style.opacity       = aboutOp;
  aboutContent.style.pointerEvents = aboutOp > 0.1 ? 'auto' : 'none';

  /* ── Skills section — fades in after About Me fades out ── */
  const skillsOp = _skillsOp;
  skillsContent.style.opacity       = skillsOp;
  skillsContent.style.pointerEvents = skillsOp > 0.1 ? 'auto' : 'none';
}

window.addEventListener('resize', () => {
  updateScrollHeight();
  tick();
});

updateScrollHeight();
tick();
