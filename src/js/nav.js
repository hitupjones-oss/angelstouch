/** Header: solid-on-scroll, hide on scroll down, reveal on scroll up. Also drives the sticky CTA dock. */
export function initHeader(lenis) {
  const header = document.querySelector('[data-header]');
  const dock = document.querySelector('[data-dock]');
  if (!header) return;
  let lastY = window.scrollY;
  const dockThreshold = () => (document.querySelector('[data-film]') ? window.innerHeight * 0.6 : 220);

  const update = (y = window.scrollY) => {
    header.classList.toggle('is-scrolled', y > 24);
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    if (goingDown && y > 520 && !document.body.classList.contains('menu-open') && !header.classList.contains('mega-open') && !header.matches(':focus-within')) {
      header.classList.add('is-hidden');
    } else if (goingUp || y < 520) {
      header.classList.remove('is-hidden');
    }
    if (dock) dock.classList.toggle('is-visible', y > dockThreshold() && !document.body.classList.contains('drawer-open'));
    lastY = y;
  };

  if (lenis) lenis.on('scroll', ({ scroll }) => update(scroll));
  else window.addEventListener('scroll', () => update(), { passive: true });
  update();
}

/** Full-screen menu for phones & tablets. */
export function initMobileMenu(lenis) {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  const header = document.querySelector('[data-header]');
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    header.classList.toggle('menu-open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      lenis?.stop();
      menu.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
      menu.querySelectorAll('li, .mobile-menu__foot, .mobile-menu__group').forEach((el, i) =>
        el.animate(
          [
            { opacity: 0, transform: 'translateY(24px)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: 700, delay: 60 + i * 45, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' },
        ),
      );
    } else {
      menu.hidden = true;
      lenis?.start();
    }
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => e.target.closest('a') && setOpen(false));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true' && (setOpen(false), toggle.focus()));
  window.matchMedia('(min-width: 1100px)').addEventListener('change', (e) => e.matches && setOpen(false));
}

/**
 * "Our care" mega menu.
 * Mouse: opens on hover with a short intent delay and closes after a grace period, so the pointer can travel
 * from the trigger into the panel. Separate open/close timers cancel each other, so re-entering never races a close.
 * Touch & keyboard: the trigger toggles; Escape, focus leaving or a tap outside closes it.
 */
export function initMegaMenu() {
  const header = document.querySelector('[data-header]');
  document.querySelectorAll('.has-menu').forEach((item) => {
    const trigger = item.querySelector('[data-menu-trigger]');
    const menu = item.querySelector('[data-menu]');
    let openTimer;
    let closeTimer;
    let openedByHover = false;
    const isOpen = () => trigger.getAttribute('aria-expanded') === 'true';
    const set = (open) => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
      if (!open) openedByHover = false;
      trigger.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      header?.classList.toggle('mega-open', open);
    };

    item.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(closeTimer);
      if (!isOpen()) {
        clearTimeout(openTimer);
        openTimer = setTimeout(() => {
          openedByHover = true;
          set(true);
        }, 80);
      }
    });
    item.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => set(false), 320);
    });

    // A click right after a hover-open keeps the menu open instead of toggling it shut.
    trigger.addEventListener('click', () => {
      if (openedByHover) {
        openedByHover = false;
        set(true);
      } else set(!isOpen());
    });
    item.addEventListener('focusout', (e) => !item.contains(e.relatedTarget) && set(false));
    item.addEventListener('keydown', (e) => e.key === 'Escape' && isOpen() && (set(false), trigger.focus()));
    document.addEventListener('pointerdown', (e) => isOpen() && !item.contains(e.target) && set(false));
  });
}
