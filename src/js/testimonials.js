import { gsap } from './motion.js';

/** Testimonial carousel: crossfading quotes with a timed progress bar; pauses on hover/focus and off-screen. */
export default function initTestimonials({ reduced }) {
  document.querySelectorAll('[data-testimonials]').forEach((root) => {
    const slides = [...root.querySelectorAll('[data-slide]')];
    const dots = [...root.querySelectorAll('[data-dot]')];
    const prevBtn = root.querySelector('[data-prev]');
    const nextBtn = root.querySelector('[data-next]');
    const DURATION = 8;
    let i = 0;
    let bar = null;
    let visible = false;
    let hold = false;

    const go = (n, dir = 1) => {
      const from = slides[i];
      i = (n + slides.length) % slides.length;
      const to = slides[i];
      slides.forEach((s) => s.setAttribute('aria-hidden', String(s !== to)));
      dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
      if (from !== to) {
        if (reduced) {
          from.hidden = true;
          to.hidden = false;
        } else {
          gsap.to(from, { autoAlpha: 0, x: -30 * dir, filter: 'blur(8px)', duration: 0.6, ease: 'power2.in', onComplete: () => (from.hidden = true) });
          to.hidden = false;
          gsap.fromTo(to, { autoAlpha: 0, x: 40 * dir, filter: 'blur(8px)' }, { autoAlpha: 1, x: 0, filter: 'blur(0px)', duration: 1.1, delay: 0.45, ease: 'expo.out' });
        }
      }
      runBar();
    };

    const runBar = () => {
      bar?.kill();
      const fill = dots[i]?.querySelector('i');
      dots.forEach((d) => gsap.set(d.querySelector('i'), { scaleX: 0 }));
      if (!fill || reduced) return;
      bar = gsap.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: DURATION, ease: 'none', paused: !visible || hold, onComplete: () => go(i + 1) });
    };

    slides.forEach((s, k) => (s.hidden = k !== 0));
    dots.forEach((d, k) => d.addEventListener('click', () => go(k, k > i ? 1 : -1)));
    prevBtn?.addEventListener('click', () => go(i - 1, -1));
    nextBtn?.addEventListener('click', () => go(i + 1, 1));
    root.addEventListener('pointerenter', () => ((hold = true), bar?.pause()));
    root.addEventListener('pointerleave', () => ((hold = false), visible && bar?.resume()));
    root.addEventListener('focusin', () => ((hold = true), bar?.pause()));
    root.addEventListener('focusout', () => ((hold = false), visible && bar?.resume()));
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !hold) bar?.resume();
      else bar?.pause();
    }).observe(root);
    go(0);
  });
}
