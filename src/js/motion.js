import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.defaults({ ease: 'expo.out', duration: 1.2 });

export { gsap, ScrollTrigger, SplitText };

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function initSmoothScroll() {
  if (prefersReducedMotion()) return null;
  const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // In-page anchors glide instead of jumping.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -70, duration: 1.4 });
  });
  return lenis;
}

/**
 * Declarative scroll reveals.
 *   data-reveal            fade + rise + un-blur
 *   data-reveal="lines"    masked line-by-line rise (headlines)
 *   data-reveal="clip"     media unmasks from an inset rounded rect, image settles from 1.15×
 *   data-reveal="stagger"  direct children rise in sequence
 *   data-scrub="words"     words brighten as you scroll through them
 *   data-parallax="0.2"    element drifts against scroll
 *   data-count="24"        number counts up once (supports data-decimals, data-suffix)
 *   data-draw              SVG strokes draw on as they enter
 */
export function initReveals(scope = document) {
  const reduced = prefersReducedMotion();
  const q = (sel) => [...scope.querySelectorAll(sel)];

  if (reduced) {
    q('[data-count]').forEach((el) => (el.textContent = formatCount(el, +el.dataset.count)));
    return;
  }

  q('[data-reveal]').forEach((el) => {
    if (el.dataset.revealDone) return;
    el.dataset.revealDone = '1';
    const type = el.dataset.reveal || 'up';
    const delay = parseFloat(el.dataset.delay || 0);
    const st = { trigger: el, start: el.dataset.start || 'top 88%', once: true };

    if (type === 'lines' || type === 'words') {
      const split = SplitText.create(el, { type: type === 'lines' ? 'lines' : 'words,lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
        onSplit(self) {
          return gsap.from(type === 'lines' ? self.lines : self.words, {
            yPercent: 115, rotate: 1.5, opacity: 0, duration: 1.4, stagger: type === 'lines' ? 0.12 : 0.04, delay,
            scrollTrigger: st,
          });
        } });
      gsap.set(el, { autoAlpha: 1 });
      return split;
    }
    if (type === 'clip') {
      const media = el.querySelector('img, video, canvas');
      const tl = gsap.timeline({ scrollTrigger: st, delay });
      tl.fromTo(el, { clipPath: 'inset(14% 10% 14% 10% round 40px)', autoAlpha: 1 }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.8, ease: 'expo.inOut' });
      if (media) tl.fromTo(media, { scale: 1.18 }, { scale: 1, duration: 2.2, ease: 'expo.out' }, 0);
      return;
    }
    if (type === 'stagger') {
      gsap.set(el, { autoAlpha: 1 });
      gsap.from(el.children, { y: 36, autoAlpha: 0, filter: 'blur(6px)', duration: 1.2, stagger: 0.09, delay, scrollTrigger: st, clearProps: 'filter' });
      return;
    }
    if (type === 'fade') {
      gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.6, delay, scrollTrigger: st });
      return;
    }
    gsap.fromTo(el, { y: 40, autoAlpha: 0, filter: 'blur(8px)' }, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 1.3, delay, scrollTrigger: st, clearProps: 'filter' });
  });

  q('[data-scrub="words"]').forEach((el) => {
    const split = SplitText.create(el, { type: 'words', wordsClass: 'scrub-word' });
    gsap.fromTo(split.words, { opacity: 0.16 }, {
      opacity: 1, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
    });
  });

  q('[data-parallax]').forEach((el) => {
    const amt = parseFloat(el.dataset.parallax) || 0.15;
    gsap.fromTo(el, { yPercent: -amt * 50 }, {
      yPercent: amt * 50, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  q('[data-count]').forEach((el) => {
    const target = +el.dataset.count;
    const obj = { v: 0 };
    el.textContent = formatCount(el, 0);
    gsap.to(obj, {
      v: target, duration: 2.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => (el.textContent = formatCount(el, obj.v)),
    });
  });

  // Timeline rails fill as the reader moves through them.
  q('[data-progress-line]').forEach((el) => {
    gsap.fromTo(el, { '--fill': 0 }, {
      '--fill': 1, ease: 'none',
      scrollTrigger: { trigger: el.closest('[data-progress-scope]') || el.parentElement, start: 'top 75%', end: 'bottom 55%', scrub: 0.5 },
    });
  });

  // Bar charts grow from the baseline, one bar at a time.
  q('[data-bars]').forEach((chart) => {
    gsap.from(chart.children, {
      scaleY: 0, duration: 1.2, ease: 'expo.out', stagger: 0.09,
      scrollTrigger: { trigger: chart, start: 'top 80%', once: true },
    });
  });

  q('[data-draw]').forEach((svg) => {
    const paths = svg.querySelectorAll('path, line, polyline, rect, circle');
    paths.forEach((p) => {
      const len = p.getTotalLength ? p.getTotalLength() : 0;
      if (!len) return;
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    });
    gsap.to(paths, {
      strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut', stagger: 0.04,
      scrollTrigger: { trigger: svg, start: 'top 85%', once: true },
    });
  });
}

function formatCount(el, v) {
  const decimals = +(el.dataset.decimals || 0);
  return `${el.dataset.prefix || ''}${v.toFixed(decimals)}${el.dataset.suffix || ''}`;
}
