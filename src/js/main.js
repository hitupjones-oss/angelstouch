import '@fontsource-variable/fraunces/opsz.css';
import '@fontsource-variable/fraunces/opsz-italic.css';
import '@fontsource-variable/figtree';
import '@fontsource/atkinson-hyperlegible-mono/400.css';
import '@fontsource/atkinson-hyperlegible-mono/500.css';
import '../styles/main.css';

import { gsap, ScrollTrigger, prefersReducedMotion, initSmoothScroll, initReveals } from './motion.js';
import { initHeader, initMobileMenu, initMegaMenu } from './nav.js';
import { initDrawer } from './drawer.js';
import { initForms } from './forms.js';
import { initAccordions } from './accordion.js';
import { initLazyVideos } from './video.js';

document.documentElement.classList.add('motion-ready');

const lenis = initSmoothScroll();
initHeader(lenis);
initMobileMenu(lenis);
initMegaMenu();
initDrawer(lenis);
initForms();
initAccordions();
initLazyVideos();

document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

/* Page-specific modules load only where their markup exists. */
const lazyModules = [
  ['[data-film]', () => import('./film.js')],
  ['[data-halo]', () => import('./halo-section.js')],
  ['[data-call]', () => import('./call.js')],
  ['[data-floorplan]', () => import('./floorplan.js')],
  ['[data-testimonials]', () => import('./testimonials.js')],
  ['[data-home]', () => import('./home.js')],
];
const pending = lazyModules
  .filter(([selector]) => document.querySelector(selector))
  .map(([, load]) => load().then((m) => m.default?.({ lenis, gsap, ScrollTrigger, reduced: prefersReducedMotion() })));

/* Reveals run after page modules have pinned their sections so trigger positions are correct. */
Promise.allSettled(pending).then(() => {
  initReveals();
  ScrollTrigger.refresh();
});

window.addEventListener('load', () => ScrollTrigger.refresh());
