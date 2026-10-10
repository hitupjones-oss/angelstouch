import { defineConfig } from 'vite';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname, relative, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FORM_ENDPOINT } from './src/js/config.js';

const root = dirname(fileURLToPath(import.meta.url));
const partialsDir = resolve(root, 'src/partials');
const IGNORE = new Set(['node_modules', 'dist', 'public', 'src', 'scripts', 'content', '.git']);

/** Every index.html (and 404.html) in the project becomes a page. */
function findPages(dir = root, out = {}) {
  for (const name of readdirSync(dir)) {
    if (IGNORE.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) findPages(full, out);
    else if (name === 'index.html' || (dir === root && name === '404.html')) {
      const key = relative(root, full).replace(/\\/g, '/').replace(/\.html$/, '') || 'index';
      out[key] = full;
    }
  }
  return out;
}

/** Read the pixel size of a WebP file from its header (VP8, VP8L or VP8X). */
function webpSize(file) {
  const b = readFileSync(file);
  const chunk = b.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (chunk === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (chunk === 'VP8L') {
    const bits = b.readUInt32LE(21);
    return [1 + (bits & 0x3fff), 1 + ((bits >> 14) & 0x3fff)];
  }
  return null;
}

const IMG_WIDTHS = [160, 320, 480, 640, 800, 960, 1600, 2400];
/** data-img="name" → src + srcset (+ width/height) from the renditions in public/media/img. */
function expandImg(_, name, rest = '') {
  const sizes = IMG_WIDTHS.filter((w) => existsSync(resolve(root, `public/media/img/${name}-${w}.webp`)));
  if (!sizes.length) throw new Error(`data-img: no renditions found for "${name}"`);
  const def = sizes.find((w) => w >= 960) ?? sizes.at(-1);
  const [w, h] = webpSize(resolve(root, `public/media/img/${name}-${def}.webp`)) ?? [];
  const dims = /\swidth=/.test(rest) || !w ? '' : ` width="${w}" height="${h}"`;
  return ` src="/media/img/${name}-${def}.webp" srcset="${sizes.map((s) => `/media/img/${name}-${s}.webp ${s}w`).join(', ')}"${dims}${rest}`;
}

/** Build FAQPage JSON-LD from the page's own accordion markup, so questions live in one place. */
function faqSchema(html) {
  const text = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').replace(/&amp;/g, '&').trim();
  const items = [...html.matchAll(/<span class="accordion__q">([\s\S]*?)<\/span>[\s\S]*?<div class="accordion__a">([\s\S]*?)<\/div>/g)];
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(([, q, a]) => ({ '@type': 'Question', name: text(q), acceptedAnswer: { '@type': 'Answer', text: text(a) } })),
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

/**
 * Tiny HTML-partials system:
 *   <!-- @include header -->            → contents of src/partials/header.html
 *   data-nav="/about/"                  → aria-current="page" on the matching page
 *   data-nav-group="/a/,/b/"            → data-active on a parent when any child matches
 *   data-img="care-together"            → responsive src/srcset/width/height
 */
function htmlPartials() {
  const include = (html, depth = 0) =>
    depth > 5
      ? html
      : html.replace(/<!--\s*@include\s+([\w-]+)\s*-->/g, (_, name) =>
          include(readFileSync(resolve(partialsDir, `${name}.html`), 'utf8'), depth + 1),
        );

  return {
    name: 'html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const rel = relative(root, dirname(ctx.filename)).replace(/\\/g, '/');
        const page = rel ? `/${rel}/` : '/';
        let out = include(html);
        out = out.replace(/\sdata-nav="([^"]+)"/g, (_, href) =>
          href === page || (href !== '/' && page.startsWith(href)) ? ' aria-current="page"' : '',
        );
        out = out.replace(/\sdata-nav-group="([^"]+)"/g, (_, list) =>
          list.split(',').some((href) => page.startsWith(href)) ? ' data-active="true"' : '',
        );
        out = out.replace(/\sdata-img="([\w-]+)"([^>]*)/g, expandImg);
        out = out.replace('<!-- @faq-schema -->', () => faqSchema(out));
        return out;
      },
    },
    handleHotUpdate({ file, server }) {
      if (file.startsWith(partialsDir)) server.ws.send({ type: 'full-reload' });
    },
  };
}

/*
 * Forms need somewhere to post. Netlify Forms works with no setup; any other host needs FORM_ENDPOINT
 * (src/js/config.js). On Vercel with no endpoint configured, forms run in demo mode: they show the
 * confirmation but say plainly that nothing was sent. VITE_SIMULATE_FORMS=1 forces demo mode anywhere.
 */
const simulateForms = process.env.VITE_SIMULATE_FORMS || (process.env.VERCEL && !FORM_ENDPOINT ? '1' : '');

export default defineConfig({
  appType: 'mpa',
  define: { 'import.meta.env.VITE_SIMULATE_FORMS': JSON.stringify(simulateForms) },
  plugins: [htmlPartials()],
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 700, // three.js is lazy-loaded on the home page only
    rollupOptions: { input: findPages() },
  },
  server: { host: true },
  preview: { host: true },
});
