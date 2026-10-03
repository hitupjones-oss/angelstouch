import { FORM_ENDPOINT } from './config.js';

/**
 * Progressive-enhancement form handling. Without JS, forms post normally (Netlify Forms → /thank-you/).
 * With JS, they submit in place and swap to an animated success state.
 */
export function initForms() {
  document.querySelectorAll('form[data-form]').forEach((form) => {
    const wrap = form.closest('[data-form-wrap]');
    const success = (wrap?.parentElement || form.parentElement).querySelector('[data-form-success]');
    const error = form.querySelector('.form__error');
    const submit = form.querySelector('[type="submit"]');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      error && (error.hidden = true);
      submit.disabled = true;
      submit.setAttribute('aria-busy', 'true');

      const data = new FormData(form);
      const hasFile = [...data.values()].some((v) => v instanceof File && v.size);
      try {
        if (import.meta.env.DEV || import.meta.env.VITE_SIMULATE_FORMS) {
          await new Promise((r) => setTimeout(r, 700)); // dev server or demo build: simulate success
        } else {
          const res = await fetch(FORM_ENDPOINT || '/', {
            method: 'POST',
            headers: FORM_ENDPOINT ? { Accept: 'application/json' } : hasFile ? {} : { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: FORM_ENDPOINT || hasFile ? data : new URLSearchParams(data).toString(),
          });
          if (!res.ok) throw new Error(res.statusText);
        }
        if (wrap) wrap.hidden = true;
        else form.hidden = true;
        if (success) {
          success.hidden = false;
          success.focus({ preventScroll: true });
        }
        form.reset();
        window.dataLayer?.push({ event: 'form_submit', form: form.getAttribute('name') });
      } catch {
        if (error) error.hidden = false;
      } finally {
        submit.disabled = false;
        submit.removeAttribute('aria-busy');
      }
    });
  });

  // Re-opening the drawer after a success shows the form again.
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-open-callback]')) return;
    const drawer = document.querySelector('[data-drawer]');
    const wrap = drawer?.querySelector('[data-form-wrap]');
    const success = drawer?.querySelector('[data-form-success]');
    if (wrap && success && !success.hidden) {
      wrap.hidden = false;
      success.hidden = true;
    }
  });
}
