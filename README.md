# Angels Touch Assisted Living & Memory Care — website

A ground-up redesign of [angelstouchcbrf.com](https://www.angelstouchcbrf.com): a cinematic, accessible, mobile-first
static site with an intro title film, an interactive Three.js "Circle of Care", and Apple-style scroll choreography.

- **Stack:** Vite (multi-page) · vanilla JS · GSAP + ScrollTrigger + SplitText · Lenis smooth scroll · Three.js · self-hosted fonts
- **Output:** plain static files in `dist/` — host anywhere (Netlify, Vercel, Cloudflare Pages, Apache/cPanel)
- **Brand:** see [`docs/brand-guide.md`](docs/brand-guide.md) · **Media sources & prompts:** see [`docs/media.md`](docs/media.md)

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # journal + sitemap + production build → dist/
npm run preview    # serve dist/ locally
```

## Sitemap (old → new)

The old site had 14 pages with heavily repeated copy — the same “Why choose us” list appeared on nearly every page,
there were two careers pages, two FAQ lists, an empty reviews page and a separate call-back form page.
The new structure gives every fact one home:

| New page | Replaces | Purpose |
|---|---|---|
| `/` | `/`, `/reviews`, `/hibu-video-splash` | Title film, care overview, awards + Google rating, reviews, virtual consults |
| `/memory-care/` | `/assisted-living-memory-care` | The specialty — approach, daily rhythm, safety, levels of care |
| `/activities/` | `/assisted-living-activities` | Calendar, outdoor spaces, activity team |
| `/dining/` | `/assisted-living-nutrition` | Chef-made meals, diets, dignified dining |
| `/living-spaces/` | `/assisted-living-space-layouts` | Suites, amenities, animated floor plans, real photos |
| `/about/` | `/about` | Ownership, the full “Angels Touch difference”, care team, awards timeline |
| `/careers/` | `/careers`, `/employment-and-careers` | Benefits + one application form |
| `/faq/` | `/faqs` + home-page FAQs | 15 questions in one place (with FAQ schema) |
| `/contact/` | `/contact`, `/request-call-back-form` | All ways to reach us, form, map |
| `/journal/` | `/blog` + 7 posts | Migrated articles at `/journal/<slug>/` |

All old URLs **301-redirect** to their new homes. Equivalent rules ship for each host:
`public/_redirects` (Netlify / Cloudflare Pages), `vercel.json` (Vercel), `public/.htaccess` (Apache).

**Call Me Back** is available on every page: a floating pill on desktop and a two-button dock (Call now / Call Me Back) on phones.
It opens a short form drawer instead of sending people to a separate page. Link to `/#call-me-back` to open it directly.

## Forms

Three forms: `callback` (drawer, every page), `contact`, and `careers` (with optional resume upload).

- **On Netlify:** works out of the box via Netlify Forms (`data-netlify="true"`). Set up email notifications in the Netlify dashboard.
- **Anywhere else:** set `FORM_ENDPOINT` in `src/js/config.js` to a Formspree (or similar) endpoint.
- Without JavaScript, forms post normally and land on `/thank-you/`.
- In `npm run dev`, submissions are simulated so the success state can be previewed.

## Editing content

| What | Where |
|---|---|
| Header, footer, Call Me Back drawer, icons | `src/partials/*.html` (included with `<!-- @include name -->`) |
| Page copy | each page’s `index.html` |
| FAQ | `faq/index.html` — the FAQ structured data is generated from the visible questions at build time |
| Journal posts | `content/journal.json`, then `npm run journal` (also runs on every build) |
| Form endpoint | `src/js/config.js` |
| Colors, type scale, spacing | `src/styles/tokens.css` |

**Images:** use `<img data-img="asset-name" sizes="…" alt="…">` — the build expands it into a responsive `srcset`
with intrinsic width/height. Add new photos to `media-src/img/` and run `npm run media -- images`.

**Videos:** add masters to `media-src/video/`, list loops in `scripts/optimize-media.mjs`, run `npm run media -- videos`.
Use `<video data-lazy-video="/media/video/name" poster="/media/video/name-poster.webp" muted playsinline loop>` —
it picks 720p/1080p automatically, loads near the viewport and pauses off-screen.

## How the motion works

| Piece | File | Notes |
|---|---|---|
| Title film (home hero) | `src/js/film.js`, `src/styles/film.css` | One GSAP timeline drives text, footage, awards, the drawn Google “G”, the flashing gold stars and the logo reveal. Chapters, pause, skip and replay; plays once per session; pauses off-screen. |
| Circle of Care | `src/js/halo-section.js`, `src/js/halo-scene.js` | Three.js scene loaded lazily. Pins and turns with scroll on desktop; tabs + drag/tap on touch; photo fallback without WebGL. |
| Scroll reveals | `src/js/motion.js` | Declarative: `data-reveal`, `data-reveal="lines|clip|stagger"`, `data-scrub="words"`, `data-count`, `data-bars`, `data-progress-line`. |
| Expanding memory-care film, rating card, award tilt, marquee | `src/js/home.js` | |
| Video-call window | `src/js/call.js` | Two generated webcam clips composited into a live “call”. |
| Floor plans | `src/js/floorplan.js` | SVG walls draw in from real room dimensions. |

Everything honors `prefers-reduced-motion`.

## Quality checks done

- Responsive at 390 (phone), 834 (tablet portrait), 1180 (tablet landscape) and 1440 (desktop).
- axe-core (WCAG 2.1 AA + best practice): no violations on any page.
- Semantic landmarks, skip link, focus-trapped drawer, keyboard-operable tabs/accordions/carousel, visible focus rings,
  16px+ form inputs (no iOS zoom), 44px+ touch targets.
- Structured data: LocalBusiness, BreadcrumbList, FAQPage, Blog/BlogPosting, ContactPage.
- Three.js (~150 KB gzipped) only loads on the home page as the visitor nears the Circle of Care.

## Before launch — please confirm

- **Founding year:** the old site says both 2006 (careers page) and 2008 (home/about). The new site uses **2008**.
- **Google rating:** shown as **4.5★** per the brief; update the numbers in `index.html` and `about/index.html` if it changes.
- **Google review link:** currently a Google Maps search for the business; swap in the direct listing URL once known (`index.html` and `about/index.html`).
- **Analytics:** the old site used Google Tag Manager `GTM-W487CGFD` and GA4 `G-4QW17GJBKE` — add your tag to `src/partials/head.html`
  if you want tracking carried over (forms already push a `form_submit` event to `dataLayer`).
