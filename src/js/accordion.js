/** Disclosure accordions: <button class="accordion__trigger" aria-expanded aria-controls> + .accordion__panel */
export function initAccordions() {
  document.querySelectorAll('.accordion__trigger').forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (panel && btn.getAttribute('aria-expanded') !== 'true') panel.setAttribute('inert', '');
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      btn.closest('.accordion__item')?.classList.toggle('is-open', open);
      panel?.toggleAttribute('inert', !open);
    });
  });
}
