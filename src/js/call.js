import { gsap } from './motion.js';
import { sourceFor } from './video.js';

/**
 * Virtual-consultation "video call" window: two live tiles (family + care team), a running call timer,
 * and an active-speaker ring that hands off between tiles like a real call.
 */
export default function initCall({ reduced }) {
  document.querySelectorAll('[data-call]').forEach((root) => {
    const tiles = [...root.querySelectorAll('[data-call-tile]')];
    const videos = tiles.map((t) => t.querySelector('video'));
    const timer = root.querySelector('[data-call-timer]');
    let seconds = 4 * 60 + 12;
    let tick = null;
    let speak = null;
    let speaker = 1;

    const start = () => {
      videos.forEach((v) => {
        if (!v.src) v.src = sourceFor(v.dataset.src);
        if (!reduced) v.play().catch(() => {});
      });
      if (reduced) return;
      tick ??= setInterval(() => {
        seconds++;
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        if (timer) timer.textContent = `${m}:${s}`;
      }, 1000);
      speak ??= setInterval(() => {
        speaker = 1 - speaker;
        tiles.forEach((t, i) => t.toggleAttribute('data-speaking', i === speaker));
      }, 3800);
    };
    const stop = () => {
      videos.forEach((v) => v.pause());
      clearInterval(tick);
      clearInterval(speak);
      tick = speak = null;
    };

    tiles.forEach((t, i) => t.toggleAttribute('data-speaking', i === speaker));
    new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: '150px 0px' }).observe(root);

    if (!reduced) {
      gsap.fromTo(
        root,
        { rotateX: 14, y: 80, scale: 0.94, autoAlpha: 0 },
        { rotateX: 0, y: 0, scale: 1, autoAlpha: 1, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: root, start: 'top 85%', once: true } },
      );
      gsap.from(root.querySelectorAll('[data-call-tile]'), {
        scale: 0.9,
        autoAlpha: 0,
        duration: 1.2,
        stagger: 0.18,
        delay: 0.4,
        ease: 'expo.out',
        scrollTrigger: { trigger: root, start: 'top 85%', once: true },
      });
    }
  });
}
