import { prefersReducedMotion } from './motion.js';

/**
 * Ambient background videos: <video data-lazy-video="/media/video/name"> picks the 720p or 1080p
 * rendition, loads only when near the viewport, and plays only while visible.
 * With reduced motion the poster image stays put.
 */
export function initLazyVideos(scope = document) {
  const videos = [...scope.querySelectorAll('video[data-lazy-video]')];
  if (!videos.length) return;
  const reduced = prefersReducedMotion();

  const io = new IntersectionObserver(
    (entries) => {
      for (const { target: v, isIntersecting } of entries) {
        if (isIntersecting) {
          if (!v.dataset.loaded) {
            v.src = sourceFor(v.dataset.lazyVideo);
            v.dataset.loaded = '1';
          }
          if (!reduced) v.play().catch(() => {});
        } else if (!v.paused) {
          v.pause();
        }
      }
    },
    { rootMargin: '200px 0px' },
  );
  videos.forEach((v) => {
    v.muted = true;
    v.playsInline = true;
    if (reduced) v.removeAttribute('autoplay');
    io.observe(v);
  });
}

export function sourceFor(base) {
  const wide = Math.max(window.innerWidth, window.innerHeight) * Math.min(window.devicePixelRatio || 1, 2);
  const slow = navigator.connection?.saveData || /2g/.test(navigator.connection?.effectiveType || '');
  return `${base}-${wide > 1500 && !slow ? 1080 : 720}.mp4`;
}
