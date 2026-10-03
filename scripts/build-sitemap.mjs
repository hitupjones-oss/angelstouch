#!/usr/bin/env node
/** Writes public/sitemap.xml from every page in the project (runs before each build). */
import { readdirSync, statSync, writeFileSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const SITE = 'https://www.angelstouchcbrf.com';
const SKIP = new Set(['node_modules', 'dist', 'public', 'src', 'scripts', 'content', 'media-src', 'docs', '.git']);
const PRIORITY = { '/': '1.0', '/memory-care/': '0.9', '/activities/': '0.8', '/dining/': '0.8', '/living-spaces/': '0.8', '/contact/': '0.8', '/about/': '0.7', '/careers/': '0.7', '/faq/': '0.7', '/journal/': '0.6' };
const today = new Date().toISOString().slice(0, 10);

const pages = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (name === 'index.html') {
      if (/<meta name="robots" content="noindex"/.test(readFileSync(full, 'utf8'))) continue;
      const rel = relative('.', dir).replace(/\\/g, '/');
      pages.push(rel ? `/${rel}/` : '/');
    }
  }
})('.');

pages.sort((a, b) => (PRIORITY[b] ?? '0.5') - (PRIORITY[a] ?? '0.5') || a.localeCompare(b));
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map((p) => `  <url><loc>${SITE}${p}</loc><lastmod>${today}</lastmod><priority>${PRIORITY[p] ?? (p.startsWith('/journal/') ? '0.5' : '0.6')}</priority></url>`)
  .join('\n')}
</urlset>
`;
writeFileSync('public/sitemap.xml', xml);
console.log(`sitemap: ${pages.length} urls`);
