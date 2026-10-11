#!/usr/bin/env node
/**
 * Generates /journal/index.html and /journal/<slug>/index.html from content/journal.json.
 * Run automatically before every build (see package.json), or manually: node scripts/build-journal.mjs
 *
 * To add a post: append an entry to content/journal.json — { slug, title, date, description, image, blocks: [[kind, text]] }
 * where kind is "p", "h2", "h3" or "li". `image` is any asset name in public/media/img.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SITE = 'https://www.angelstouchcbrf.com';
const posts = JSON.parse(readFileSync('content/journal.json', 'utf8')).sort((a, b) => new Date(b.date) - new Date(a.date));

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const iso = (d) => new Date(d).toISOString().slice(0, 10);

function body(blocks) {
  let out = '';
  let inList = false;
  for (const [kind, text] of blocks) {
    if (kind === 'li' && !inList) {
      out += '<ul>';
      inList = true;
    }
    if (kind !== 'li' && inList) {
      out += '</ul>';
      inList = false;
    }
    out += `<${kind}>${esc(text)}</${kind}>\n          `;
  }
  if (inList) out += '</ul>';
  return out.trim();
}

const card = (p, cls = '', heading = 'h2') => `
        <a class="post-card ${cls}" href="/journal/${p.slug}/">
          <span class="post-card__media"><img data-img="${p.image}" sizes="(min-width: 900px) 40vw, 100vw" alt="" loading="lazy" decoding="async"></span>
          <span class="stack" style="--flow: var(--space-3)">
            <time class="label" datetime="${iso(p.date)}">${p.date}</time>
            <${heading}>${esc(p.title)}</${heading}>
            <p>${esc(p.description)}</p>
          </span>
        </a>`;

const page = ({ title, description, canonical, image, schema, main, bodyClass = '' }) => `<!doctype html>
<html lang="en">
<head>
  <!-- @include head -->
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE}/media/img/${image}-1600.webp">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
  <script type="module" src="/src/js/main.js"></script>
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<!-- @include header -->

<main id="main">
${main}
</main>

<!-- @include footer -->
</body>
</html>
`;

/* — Index — */
mkdirSync('journal', { recursive: true });
const [latest, ...rest] = posts;
writeFileSync(
  'journal/index.html',
  page({
    title: 'Journal — Guidance on Assisted Living & Memory Care | Angels Touch',
    description: 'Practical guidance for families exploring assisted living and memory care in the Green Bay area, from the team at Angels Touch.',
    canonical: `${SITE}/journal/`,
    image: latest.image,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Angels Touch Journal',
      url: `${SITE}/journal/`,
      blogPost: posts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: `${SITE}/journal/${p.slug}/`, datePublished: iso(p.date) })),
    },
    main: `  <section class="page-hero page-hero--split">
    <div class="container page-hero__inner" style="grid-template-columns: 1fr">
      <div class="page-hero__copy">
        <ol class="crumbs"><li><a href="/">Home</a></li><li>Journal</li></ol>
        <p class="eyebrow">Journal</p>
        <h1 data-reveal="lines">Guidance for <em>the road ahead.</em></h1>
        <p class="lead" data-reveal>Thoughtful answers to the questions families face when exploring assisted living and memory care.</p>
      </div>
    </div>
  </section>

  <section class="section section--flush-top">
    <div class="container">
      <div class="post-grid" data-reveal="stagger">${card(latest, 'post-card--feature')}${rest.map((p) => card(p, '', 'h3')).join('')}
      </div>
    </div>
  </section>`,
  }),
);

/* — Posts — */
for (const p of posts) {
  const related = posts.filter((x) => x !== p).slice(0, 3);
  mkdirSync(`journal/${p.slug}`, { recursive: true });
  writeFileSync(
    `journal/${p.slug}/index.html`,
    page({
      title: `${p.title} | Angels Touch Journal`,
      description: p.description,
      canonical: `${SITE}/journal/${p.slug}/`,
      image: p.image,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: p.title,
        description: p.description,
        datePublished: iso(p.date),
        image: `${SITE}/media/img/${p.image}-1600.webp`,
        author: { '@type': 'Organization', name: 'Angels Touch Assisted Living & Memory Care' },
        publisher: { '@id': `${SITE}/#business` },
        mainEntityOfPage: `${SITE}/journal/${p.slug}/`,
      },
      main: `  <article>
    <header class="container--narrow" style="padding-top: calc(var(--header-h) + var(--space-7))">
      <ol class="crumbs"><li><a href="/">Home</a></li><li><a href="/journal/">Journal</a></li></ol>
      <h1 class="h1" style="margin-top: var(--space-5)" data-reveal="lines">${esc(p.title)}</h1>
      <p class="post-meta" style="margin-top: var(--space-4)"><time class="label" datetime="${iso(p.date)}">${p.date}</time><span class="label">· Angels Touch team</span></p>
    </header>
    <div class="container">
      <div class="article-hero" data-reveal="clip"><img data-img="${p.image}" sizes="(min-width: 1320px) 1320px, 100vw" alt="" fetchpriority="high"></div>
    </div>
    <div class="container--narrow prose">
          ${body(p.blocks)}
    </div>
    <aside class="container--narrow" style="margin-top: var(--space-8)">
      <div class="form-card" style="display:grid; gap: var(--space-4); justify-items:start">
        <p class="eyebrow">Have questions?</p>
        <p class="h3">We’re happy to talk it through — no pressure, just answers.</p>
        <div class="btn-row"><button class="btn btn--primary" type="button" data-open-callback>Call Me Back</button><a class="btn btn--ghost" href="/contact/">Plan a visit</a></div>
      </div>
    </aside>
  </article>

  <section class="section">
    <div class="container">
      <div class="section-head"><p class="eyebrow">Keep reading</p></div>
      <div class="post-grid">${related.map((r) => card(r, '', 'h3')).join('')}
      </div>
    </div>
  </section>`,
    }),
  );
}
console.log(`journal: ${posts.length} posts`);
