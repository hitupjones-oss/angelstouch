import { gsap } from './motion.js';

/**
 * Suite floor plans: tabs switch between Studio A, Studio B and the One-Bedroom Suite.
 * Walls draw themselves in, then furniture and dimension labels settle into place.
 */
export default function initFloorplans({ reduced }) {
  document.querySelectorAll('[data-floorplan]').forEach((root) => {
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const plans = [...root.querySelectorAll('[role="tabpanel"]')];
    let current = -1;

    const draw = (plan) => {
      if (reduced) return;
      const walls = plan.querySelectorAll('.fp-wall');
      const furniture = plan.querySelectorAll('.fp-furniture > *');
      const labels = plan.querySelectorAll('.fp-label, .fp-dim');
      walls.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      const tl = gsap.timeline();
      tl.to(walls, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.12 })
        .fromTo(furniture, { autoAlpha: 0, scale: 0.85, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.7, stagger: 0.05, ease: 'back.out(1.6)' }, 0.9)
        .fromTo(labels, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.04 }, 1.2);
      plan.querySelectorAll('.fp-stat [data-to]').forEach((el) => {
        const o = { v: 0 };
        tl.to(o, { v: +el.dataset.to, duration: 1.4, ease: 'power2.out', onUpdate: () => (el.textContent = Math.round(o.v)) }, 0.3);
      });
    };

    const show = (i) => {
      if (i === current) return;
      current = i;
      tabs.forEach((t, k) => {
        t.setAttribute('aria-selected', String(k === i));
        t.tabIndex = k === i ? 0 : -1;
      });
      plans.forEach((p, k) => (p.hidden = k !== i));
      draw(plans[i]);
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => show(i));
      tab.addEventListener('keydown', (e) => {
        const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        const n = (i + dir + tabs.length) % tabs.length;
        tabs[n].focus();
        show(n);
      });
    });

    // First plan draws when the section scrolls into view.
    plans.forEach((p, k) => (p.hidden = k !== 0));
    new IntersectionObserver(
      ([e], io) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        show(0);
      },
      { threshold: 0.35 },
    ).observe(root);
  });
}
