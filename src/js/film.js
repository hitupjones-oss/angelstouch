import { gsap, ScrollTrigger, SplitText } from './motion.js';
import { sourceFor } from './video.js';

/**
 * The home-page title film.
 *
 * Chapters: What we do → Why we do it → Awards → Google rating → Angels Touch (logo).
 * A single GSAP timeline is the source of truth; video playback is synced to it on every tick,
 * so chapter jumps, skip, pause and replay always leave the footage in the right place.
 */

const SHOTS = [
  { clip: 'laugh', start: 0, end: 5.0 },
  { clip: 'painting', start: 4.6, end: 7.9 },
  { clip: 'crafts', start: 7.4, end: 10.5 },
  { clip: 'caregiver', start: 10.0, end: 13.1 },
  { clip: 'sunrise', start: 12.6, end: 17.7 },
  { clip: 'caregiver', start: 25.4, end: Infinity }, // ambient loop behind the final logo
];
const CHAPTERS = [0, 12.6, 16.8, 21.2, 25.4];
const SESSION_KEY = 'at-film-seen';

export default async function initFilm({ reduced }) {
  const root = document.querySelector('[data-film]');
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  const $$ = (s) => [...root.querySelectorAll(s)];

  const clips = Object.fromEntries($$('[data-clip]').map((v) => [v.dataset.clip, v]));
  const chapterBtns = $$('[data-chapter]');
  const toggleBtn = $('[data-film-toggle]');
  const skipBtn = $('[data-film-skip]');
  const replayBtn = $('[data-film-replay]');
  const state = { userPaused: false, visible: true, lastTime: 0 };

  /* — Media loading: first shot immediately, the rest right after — */
  Object.values(clips).forEach((v) => {
    v.muted = true;
    v.playsInline = true;
    v.loop = true;
  });
  const first = clips.laugh;
  if (!reduced) {
    first.src = sourceFor(first.dataset.src);
    const loadRest = () => Object.values(clips).forEach((v) => v !== first && !v.src && (v.src = sourceFor(v.dataset.src)));
    first.addEventListener('canplay', loadRest, { once: true });
    setTimeout(loadRest, 2500);
  }

  // Let the headline fonts settle before splitting text into lines.
  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]);

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' }, onUpdate: () => sync(), onComplete: () => finished() });

  /* — Helpers — */
  const split = (el, type = 'lines') => SplitText.create(el, { type, mask: 'lines', linesClass: 'split-line' });
  const titleIn = (el, at, opts = {}) => {
    const s = split(el, opts.words ? 'words,lines' : 'lines');
    tl.set(el, { autoAlpha: 1 }, at);
    tl.fromTo(opts.words ? s.words : s.lines, { yPercent: 118, rotate: 2, filter: 'blur(6px)' }, { yPercent: 0, rotate: 0, filter: 'blur(0px)', duration: 1.5, stagger: opts.words ? 0.06 : 0.14 }, at);
  };
  const fadeUp = (el, at, d = 1.2) => tl.fromTo(el, { autoAlpha: 0, y: 24, filter: 'blur(6px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: d }, at);
  const sceneOut = (el, at) => tl.to(el, { autoAlpha: 0, y: -24, filter: 'blur(10px)', duration: 0.7, ease: 'power2.in' }, at);
  let prevClip = null;
  const clipIn = (name, at, dur) => {
    tl.fromTo(clips[name], { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.1, ease: 'power2.inOut' }, at);
    tl.fromTo(clips[name], { scale: 1.12 }, { scale: 1.0, duration: dur + 1, ease: 'none' }, at);
    // once the cross-dissolve is done, retire the previous shot so DOM order never matters
    if (prevClip && prevClip !== name) tl.set(clips[prevClip], { autoAlpha: 0 }, at + 1.15);
    prevClip = name;
  };
  const leak = (at) =>
    tl.fromTo($('.film__leak'), { xPercent: -70, autoAlpha: 0 }, { xPercent: 70, autoAlpha: 0.85, duration: 0.8, ease: 'power1.in' }, at - 0.35)
      .to($('.film__leak'), { autoAlpha: 0, duration: 0.6, ease: 'power1.out' }, at + 0.45);

  gsap.set($$('.film__scene'), { autoAlpha: 0 });

  /* ── Chapter 1 · What we do ───────────────────────────────── */
  tl.fromTo($('.film__media'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.6, ease: 'power2.out' }, 0);
  clipIn('laugh', 0, 5);
  tl.set($('[data-scene="what"]'), { autoAlpha: 1 }, 0.4);
  fadeUp($('[data-scene="what"] .eyebrow'), 0.5);
  titleIn($('[data-scene="what"] .film__title'), 0.8);
  sceneOut($('[data-scene="what"]'), 4.2);

  const wordScene = (scene, clip, at) => {
    leak(at);
    clipIn(clip, at, 3.4);
    tl.set($(`[data-scene="${scene}"]`), { autoAlpha: 1 }, at + 0.2);
    const word = $(`[data-scene="${scene}"] .film__word`);
    const chars = SplitText.create(word, { type: 'chars', charsClass: 'film-char' }).chars;
    tl.fromTo(chars, { yPercent: 60, autoAlpha: 0, filter: 'blur(12px)' }, { yPercent: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 1.4, stagger: 0.045 }, at + 0.3);
    fadeUp($(`[data-scene="${scene}"] .film__caption`), at + 0.8, 1);
    sceneOut($(`[data-scene="${scene}"]`), at + 2.6);
  };
  wordScene('color', 'painting', 4.6);
  wordScene('laughter', 'crafts', 7.4);
  wordScene('connection', 'caregiver', 10.0);

  /* ── Chapter 2 · Why we do it ─────────────────────────────── */
  leak(12.6);
  clipIn('sunrise', 12.6, 5);
  tl.set($('[data-scene="why"]'), { autoAlpha: 1 }, 12.8);
  fadeUp($('[data-scene="why"] .eyebrow'), 12.9);
  titleIn($('[data-scene="why"] .film__title'), 13.2);
  sceneOut($('[data-scene="why"]'), 16.4);

  /* ── Chapter 3 · Awards ───────────────────────────────────── */
  tl.fromTo($('.film__dark'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: 'power2.inOut' }, 16.6);
  tl.set($('[data-scene="awards"]'), { autoAlpha: 1 }, 16.9);
  fadeUp($('[data-scene="awards"] .eyebrow'), 17.0);
  titleIn($('[data-scene="awards"] .film__title'), 17.2, { words: true });
  tl.fromTo($$('.film__badge'), { autoAlpha: 0, y: 70, rotateX: -35, scale: 0.92 }, { autoAlpha: 1, y: 0, rotateX: 0, scale: 1, duration: 1.6, stagger: 0.22 }, 17.7);
  tl.fromTo($$('.film__badge-glint'), { xPercent: -160 }, { xPercent: 160, duration: 1.3, stagger: 0.18, ease: 'power2.inOut' }, 18.9);
  tl.fromTo($$('.film__badge .label'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.15 }, 18.6);
  sceneOut($('[data-scene="awards"]'), 20.8);

  /* ── Chapter 4 · Google ───────────────────────────────────── */
  const gScene = $('[data-scene="google"]');
  tl.set(gScene, { autoAlpha: 1 }, 21.2);
  const arcs = $$('.film__g-arc');
  arcs.forEach((p) => gsap.set(p, { strokeDasharray: p.getTotalLength(), strokeDashoffset: p.getTotalLength() }));
  tl.fromTo($('.film__g'), { scale: 0.6, rotate: -90, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 1.4 }, 21.2);
  tl.to(arcs, { strokeDashoffset: 0, duration: 0.45, stagger: 0.24, ease: 'power2.inOut' }, 21.3);
  tl.fromTo($('.film__g-solid'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power1.inOut' }, 22.4);
  tl.to($('.film__g-draw'), { autoAlpha: 0, duration: 0.5 }, 22.5);
  titleIn($('.film__google-title'), 22.3, { words: true });

  const stars = $$('.film__star');
  tl.fromTo(stars, { scale: 0.4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.9, stagger: 0.08, ease: 'back.out(2.2)' }, 22.6);
  stars.forEach((star, i) => {
    const at = 23.0 + i * 0.24;
    const fill = i === 4 ? 50 : 0; // 4.5 stars → the fifth fills halfway
    tl.fromTo(star.querySelector('.film__star-fill'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: `inset(0 ${fill}% 0 0)`, duration: 0.42, ease: 'power2.out' }, at);
    tl.fromTo(star.querySelector('.film__star-flash'), { scale: 0.2, autoAlpha: 0.95 }, { scale: 2.6, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, at + 0.1);
    tl.fromTo(star, { scale: 1 }, { scale: 1.18, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' }, at + 0.05);
  });
  const score = $('[data-score]');
  const scoreObj = { v: 0 };
  tl.fromTo(scoreObj, { v: 0 }, { v: 4.5, duration: 1.3, ease: 'power2.out' }, 23.0); // text is written in sync() so chapter jumps stay correct
  fadeUp($('.film__score'), 22.9, 0.8);
  // Gold shimmer sweep, then the stars flash.
  tl.fromTo($('.film__stars-shimmer'), { xPercent: -120, autoAlpha: 1 }, { xPercent: 120, duration: 1.1, ease: 'power2.inOut' }, 24.3);
  tl.to(stars, { filter: 'brightness(1.55) drop-shadow(0 0 18px rgba(251,188,4,.85))', duration: 0.16, stagger: { each: 0.07, yoyo: true, repeat: 3 }, ease: 'power1.inOut' }, 24.4);
  sceneOut(gScene, 25.4);

  /* ── Chapter 5 · Angels Touch ─────────────────────────────── */
  tl.to($('.film__dark'), { autoAlpha: 0, duration: 1.4, ease: 'power2.inOut' }, 25.4);
  tl.fromTo(clips.caregiver, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.6, ease: 'power2.inOut' }, 25.4);
  tl.fromTo(clips.caregiver, { scale: 1.08 }, { scale: 1, duration: 4, ease: 'power2.out' }, 25.4);
  tl.to($$('.film__media video:not([data-clip="caregiver"])'), { autoAlpha: 0, duration: 0.6 }, 25.4);
  tl.fromTo($('.film__end-glow'), { autoAlpha: 0, scale: 0.6, xPercent: -50, yPercent: -50 }, { autoAlpha: 1, scale: 1, xPercent: -50, yPercent: -50, duration: 2.2 }, 25.5); // GSAP owns transforms, so centering lives here
  tl.to($$('.film__bars span'), { scaleY: 0, duration: 1.6, ease: 'expo.inOut' }, 25.5);
  tl.set($('[data-scene="end"]'), { autoAlpha: 1 }, 25.6);
  const wipe = $('.film__logo-wipe');
  tl.fromTo(wipe, { attr: { width: 0 } }, { attr: { width: 2400 }, duration: 1.9, ease: 'power2.inOut' }, 25.7);
  tl.fromTo($('.film__logo .logo__halo'), { y: -140, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.8, ease: 'expo.out' }, 26.6);
  tl.fromTo($('.film__logo .logo__tagline'), { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 1.2 }, 26.9);
  tl.fromTo($('.film__logo'), { filter: 'drop-shadow(0 0 0px rgba(255,255,255,0))' }, { filter: 'drop-shadow(0 0 28px rgba(199,215,245,.75))', duration: 0.8, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 27.1);
  titleIn($('.film__tagline'), 27.4, { words: true });
  fadeUp($('.film__cta'), 27.9, 1.2);
  fadeUp($('.film__chip'), 28.2, 1.2);

  /* — Video sync: whichever shot covers the current time plays; everything else pauses — */
  function sync() {
    const t = tl.time();
    const jumped = Math.abs(t - state.lastTime) > 0.5;
    state.lastTime = t;
    for (const [name, v] of Object.entries(clips)) {
      const shot = SHOTS.find((s) => s.clip === name && t >= s.start - 0.05 && t < s.end);
      if (shot && !reduced) {
        if (v.dataset.shot !== String(shot.start) || jumped) {
          v.dataset.shot = String(shot.start);
          try {
            v.currentTime = Math.max(0, Math.min(t - shot.start, (v.duration || 5) - 0.2));
          } catch {}
        }
        if (v.paused && !state.userPaused && state.visible && v.src) v.play().catch(() => {});
      } else if (!v.paused) v.pause();
    }
    score.textContent = scoreObj.v.toFixed(1);
    updateChapters(t);
  }

  function updateChapters(t) {
    chapterBtns.forEach((btn, i) => {
      const start = CHAPTERS[i];
      const end = CHAPTERS[i + 1] ?? tl.duration();
      const p = gsap.utils.clamp(0, 1, (t - start) / (end - start));
      btn.style.setProperty('--p', p.toFixed(3));
      btn.toggleAttribute('data-current', t >= start && t < end);
    });
  }

  function setPlaying(playing) {
    toggleBtn.setAttribute('aria-label', playing ? 'Pause film' : 'Play film');
    toggleBtn.querySelector('use').setAttribute('href', playing ? '#i-pause' : '#i-play');
    root.classList.toggle('is-paused', !playing);
  }

  function play() {
    if (tl.progress() === 1) return;
    state.userPaused = false;
    tl.play();
    setPlaying(true);
    sync();
  }
  function pause(byUser = true) {
    if (byUser) state.userPaused = true;
    tl.pause();
    Object.values(clips).forEach((v) => {
      // keep the ambient end-loop running unless the user paused
      if (byUser || tl.progress() < 1) v.pause();
    });
    setPlaying(false);
  }
  function finished() {
    root.classList.add('is-finished');
    skipBtn.hidden = true;
    replayBtn.hidden = false;
    toggleBtn.hidden = true;
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {}
    sync();
  }
  function replay() {
    root.classList.remove('is-finished');
    skipBtn.hidden = false;
    replayBtn.hidden = true;
    toggleBtn.hidden = false;
    if (!clips.painting.src) Object.values(clips).forEach((v) => !v.src && (v.src = sourceFor(v.dataset.src)));
    gsap.set($$('.film__bars span'), { scaleY: 1 });
    tl.restart();
    state.userPaused = false;
    setPlaying(true);
  }

  toggleBtn.addEventListener('click', () => (tl.isActive() ? pause() : play()));
  skipBtn.addEventListener('click', () => {
    tl.progress(1);
    replayBtn.focus({ preventScroll: true });
  });
  replayBtn.addEventListener('click', replay);
  chapterBtns.forEach((btn, i) =>
    btn.addEventListener('click', () => {
      if (!clips.painting.src) Object.values(clips).forEach((v) => !v.src && (v.src = sourceFor(v.dataset.src)));
      root.classList.remove('is-finished');
      skipBtn.hidden = false;
      replayBtn.hidden = true;
      toggleBtn.hidden = false;
      tl.seek(CHAPTERS[i]);
      play();
    }),
  );

  // Pause while off-screen; resume when back (unless the user paused).
  ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: 'bottom 25%',
    onLeave: () => {
      state.visible = false;
      if (tl.isActive()) tl.pause();
      Object.values(clips).forEach((v) => v.pause());
    },
    onEnterBack: () => {
      state.visible = true;
      if (!state.userPaused && tl.progress() < 1) play();
      else sync();
    },
  });

  // Gentle scroll-away: the end card lifts and the footage settles.
  if (!reduced) {
    gsap.to($('.film__stage'), {
      scale: 0.94,
      borderRadius: 32,
      ease: 'none',
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
    });
    // fromTo with plain opacity: autoAlpha would read the not-yet-visible scene as 0 and lock it there
    gsap.fromTo($('[data-scene="end"] .film__end-inner'), { yPercent: 0, opacity: 1 }, {
      yPercent: -18,
      opacity: 0.2,
      ease: 'none',
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  if (import.meta.env.DEV) window.__film = { tl, sync };

  /* — Start — */
  let seen = false;
  try {
    seen = sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {}

  root.classList.add('is-ready');
  if (reduced || seen) {
    if (seen && !reduced) Object.values(clips).forEach((v) => !v.src && (v.src = sourceFor(v.dataset.src)));
    tl.progress(1);
    finished();
    return;
  }
  setPlaying(true);
  const start = () => {
    if (tl.time() === 0 && !tl.isActive()) {
      tl.play();
      sync();
    }
  };
  if (first.readyState >= 3) start();
  else {
    first.addEventListener('canplay', start, { once: true });
    setTimeout(start, 1800); // never wait long — posters carry the first beat if video is slow
  }
}
