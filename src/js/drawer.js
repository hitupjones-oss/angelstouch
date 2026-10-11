/**
 * "Call Me Back" drawer. Any element with [data-open-callback] opens it.
 *   data-open-callback="video"  → preselects "Video call"
 *   data-open-callback="team"   → preselects "Joining the team"
 */
export function initDrawer(lenis) {
  const drawer = document.querySelector('[data-drawer]');
  if (!drawer) return;
  const panel = drawer.querySelector('.drawer__panel');
  let lastFocus = null;

  const focusables = () =>
    [...panel.querySelectorAll('a[href], button:not([disabled]), input:not([type=hidden]):not([tabindex="-1"]), textarea, select, [tabindex]:not([tabindex="-1"])')].filter(
      (el) => el.offsetParent !== null,
    );

  const open = (preset) => {
    lastFocus = document.activeElement;
    if (preset === 'video') panel.querySelector('[data-video-option]')?.click();
    if (preset === 'team') panel.querySelector('input[name="topic"][value="Joining the team"]')?.click();
    drawer.hidden = false;
    document.body.classList.add('drawer-open');
    document.querySelector('[data-dock]')?.classList.remove('is-visible');
    lenis?.stop();
    requestAnimationFrame(() => {
      drawer.classList.add('is-open');
      setTimeout(() => (panel.querySelector('input:not([type=hidden]):not([type=radio]):not([tabindex="-1"])') || panel).focus({ preventScroll: true }), 350);
    });
  };

  const close = () => {
    drawer.classList.remove('is-open');
    document.body.classList.remove('drawer-open');
    lenis?.start();
    setTimeout(() => {
      drawer.hidden = true;
      lastFocus?.focus?.({ preventScroll: true });
    }, 500);
  };

  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open-callback]');
    if (opener) {
      e.preventDefault();
      open(opener.dataset.openCallback);
    } else if (e.target.closest('[data-close-callback]')) {
      close();
    }
  });

  drawer.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    if (e.key !== 'Tab') return;
    const items = focusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Deep link: /#call-me-back opens the drawer.
  if (location.hash === '#call-me-back') open();
}
