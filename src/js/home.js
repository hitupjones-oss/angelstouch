import { gsap, ScrollTrigger } from './motion.js';

/** Home-page scroll choreography beyond the generic reveals. */
export default function initHome({ reduced }) {
  initExpand(reduced);
  initRating(reduced);
  initTilt(reduced);
  initMarquee(reduced);
}

/* Infinite photo marquee: duplicate the set once so the loop is seamless */
function initMarquee(reduced) {
  document.querySelectorAll('.marquee').forEach((m) => {
    if (reduced) {
      // static, swipeable strip — make it keyboard-scrollable too
      m.tabIndex = 0;
      m.setAttribute('role', 'region');
      m.setAttribute('aria-label', 'Photos from a day at Angels Touch');
      return;
    }
    const track = m.querySelector('.marquee__track');
    [...track.children].forEach((li) => {
      const clone = li.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('img').forEach((img) => (img.alt = ''));
      track.appendChild(clone);
    });
    m.classList.add('is-looping');
  });
}

/* Apple-style "the picture grows to fill the screen" moment */
function initExpand(reduced) {
  document.querySelectorAll('[data-expand]').forEach((root) => {
    const media = root.querySelector('.expand__media');
    const inner = media.querySelector('video, img');
    const copy = root.querySelectorAll('.expand__copy > *');
    const intro = root.querySelectorAll('.expand__intro > *');
    if (reduced) {
      gsap.set(media, { clipPath: 'inset(0% 0% 0% 0% round 0px)' });
      return;
    }
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
    });
    const startClip = getComputedStyle(media).clipPath; // responsive starting frame comes from CSS
    tl.fromTo(media, { clipPath: startClip }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1 }, 0)
      .fromTo(inner, { scale: 1.3 }, { scale: 1, duration: 1 }, 0)
      .to(intro, { autoAlpha: 0, y: -40, stagger: 0.03, duration: 0.3 }, 0.05)
      .fromTo(root.querySelector('.expand__shade'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.55)
      .fromTo(copy, { autoAlpha: 0, y: 50, filter: 'blur(8px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', stagger: 0.08, duration: 0.35 }, 0.62);
  });
}

/* Google rating card: the G draws itself, stars fill one by one with a flash, then twinkle now and then */
function initRating(reduced) {
  document.querySelectorAll('[data-rating]').forEach((root) => {
    const arcs = [...root.querySelectorAll('.g-draw path')];
    const solid = root.querySelector('.g-solid');
    const stars = [...root.querySelectorAll('.rating__star')];
    const score = root.querySelector('[data-rating-score]');
    if (reduced) return;
    arcs.forEach((p) => gsap.set(p, { strokeDasharray: p.getTotalLength(), strokeDashoffset: p.getTotalLength() }));
    gsap.set(solid, { autoAlpha: 0 });
    stars.forEach((s) => gsap.set(s.querySelector('.rating__star-fill'), { clipPath: 'inset(0 100% 0 0)' }));
    const obj = { v: 0 };
    const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 75%', once: true } });
    tl.fromTo(root.querySelector('.g-wrap'), { rotate: -120, scale: 0.6 }, { rotate: 0, scale: 1, duration: 1.4, ease: 'expo.out' }, 0)
      .to(arcs, { strokeDashoffset: 0, duration: 0.45, stagger: 0.2, ease: 'power2.inOut' }, 0.1)
      .to(solid, { autoAlpha: 1, duration: 0.4 }, 1.05)
      .to(root.querySelector('.g-draw'), { autoAlpha: 0, duration: 0.4 }, 1.15)
      .to(obj, { v: +score.dataset.ratingScore, duration: 1.6, ease: 'power2.out', onUpdate: () => (score.textContent = obj.v.toFixed(1)) }, 0.9);
    stars.forEach((s, i) => {
      const pct = +(s.dataset.fill ?? 100);
      tl.to(s.querySelector('.rating__star-fill'), { clipPath: `inset(0 ${100 - pct}% 0 0)`, duration: 0.4, ease: 'power2.out' }, 1.0 + i * 0.22)
        .fromTo(s.querySelector('.rating__flash'), { scale: 0.2, autoAlpha: 1 }, { scale: 2.8, autoAlpha: 0, duration: 0.9 }, 1.05 + i * 0.22)
        .fromTo(s, { scale: 1 }, { scale: 1.2, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out' }, 1.0 + i * 0.22);
    });
    tl.fromTo(root.querySelector('.rating__shimmer'), { xPercent: -130 }, { xPercent: 130, duration: 1.2, ease: 'power2.inOut' }, 2.3);
    // An occasional golden twinkle keeps the card alive without being busy.
    tl.add(() => {
      gsap.timeline({ repeat: -1, repeatDelay: 4.5 })
        .to(stars, { filter: 'brightness(1.5) drop-shadow(0 0 14px rgba(251,188,4,.8))', duration: 0.18, stagger: { each: 0.08, yoyo: true, repeat: 1 } })
        .fromTo(root.querySelector('.rating__shimmer'), { xPercent: -130 }, { xPercent: 130, duration: 1.2, ease: 'power2.inOut' }, 0);
    });
  });
}

/* Award plaques lean toward the pointer */
function initTilt(reduced) {
  if (reduced || !window.matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    const glare = el.querySelector('.tilt-glare');
    const rx = gsap.quickTo(el, 'rotateX', { duration: 0.6, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotateY', { duration: 0.6, ease: 'power3' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      rx(-y * 14);
      ry(x * 16);
      glare && gsap.to(glare, { opacity: 0.55, x: x * 120, y: y * 120, duration: 0.4 });
    });
    el.addEventListener('pointerleave', () => {
      rx(0);
      ry(0);
      glare && gsap.to(glare, { opacity: 0, duration: 0.6 });
    });
  });
  ScrollTrigger.refresh();
}
