import { gsap, ScrollTrigger } from './motion.js';

/**
 * Section controller for the Circle of Care.
 * - Desktop: the section pins and scrolling turns the halo through the four pillars (Apple-style).
 * - Touch / small screens: tabs + drag/swipe on the 3D stage, gentle auto-advance while in view.
 * - Three.js loads only when the section approaches the viewport; without WebGL, photos stand in.
 */
export default function initHaloSection({ lenis, reduced }) {
  const root = document.querySelector('[data-halo]');
  if (!root) return;
  const canvas = root.querySelector('canvas');
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = [...root.querySelectorAll('[role="tabpanel"]')];
  const progressEl = root.querySelector('.halo__progress i');
  let scene = null;
  let current = 0;
  let pin = null;
  let auto = null;
  let userTouched = false;

  function show(i, { fromScene = false, instant = false } = {}) {
    if (i === current && !instant) return;
    const prev = panels[current];
    current = i;
    tabs.forEach((t, k) => {
      t.setAttribute('aria-selected', String(k === i));
      t.tabIndex = k === i ? 0 : -1;
    });
    root.dataset.index = String(i);
    if (progressEl) gsap.to(progressEl, { scaleX: (i + 1) / tabs.length, duration: 0.8, ease: 'expo.out' });
    panels.forEach((p, k) => (p.hidden = k !== i));
    const next = panels[i];
    if (!instant && !reduced) {
      gsap.fromTo(next.querySelectorAll('.halo__panel-anim > *'), { y: 26, autoAlpha: 0, filter: 'blur(6px)' }, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.9, stagger: 0.06, ease: 'expo.out', clearProps: 'filter' });
      if (prev && prev !== next) gsap.set(prev, { clearProps: 'all' });
    }
    if (!fromScene) scene?.setActive(i, { silent: true });
  }

  /* Tabs (click + arrow keys) */
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      userTouched = true;
      if (pin) {
        const y = pin.start + ((i + 0.5) / tabs.length) * (pin.end - pin.start);
        lenis ? lenis.scrollTo(y, { duration: 1.2 }) : window.scrollTo({ top: y, behavior: 'smooth' });
      } else show(i);
    });
    tab.addEventListener('keydown', (e) => {
      const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const n = (i + dir + tabs.length) % tabs.length;
      tabs[n].focus();
      tabs[n].click();
    });
  });

  show(0, { instant: true });

  /* Desktop pin: scroll progress picks the pillar */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)', () => {
    pin = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: () => `+=${window.innerHeight * 2.6}`,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const i = Math.min(tabs.length - 1, Math.floor(self.progress * tabs.length * 0.9999));
        show(i);
      },
    });
    return () => {
      pin?.kill();
      pin = null;
    };
  });

  /* Lazy-load Three.js */
  const supportsWebGL = (() => {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch {
      return false;
    }
  })();
  if (!supportsWebGL || !canvas) {
    root.classList.add('halo--fallback');
    return;
  }

  const io = new IntersectionObserver(
    async (entries) => {
      const visible = entries[0].isIntersecting;
      if (visible && !scene) {
        const { createHaloScene } = await import('./halo-scene.js');
        scene = createHaloScene(canvas, {
          reduced,
          onSelect: (i) => {
            userTouched = true;
            if (pin) {
              const y = pin.start + ((i + 0.5) / tabs.length) * (pin.end - pin.start);
              lenis ? lenis.scrollTo(y, { duration: 1.2 }) : window.scrollTo({ top: y });
            } else show(i, { fromScene: true });
          },
        });
        scene.setActive(current, { silent: true });
        root.classList.add('halo--ready');
      }
      if (!scene) return;
      if (visible) {
        scene.start();
        if (!pin && !reduced && !auto) {
          auto = setInterval(() => !userTouched && show((current + 1) % tabs.length), 6500);
        }
      } else {
        scene.stop();
        clearInterval(auto);
        auto = null;
      }
    },
    { rootMargin: '300px 0px' },
  );
  io.observe(root);
  canvas.addEventListener('pointerdown', () => (userTouched = true));
}
