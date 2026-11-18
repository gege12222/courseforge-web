# courseforge-web

The marketing site for **CourseForge**, the show-jumping course designer app.
Static Astro 5, English and Hungarian, deployed to Cloudflare Pages at
**https://courseforge.hu**.

The Flutter app lives in the sibling `CourseForge/` folder and is **read-only**
from here. This project copies assets out of it and reads its source for facts;
it never writes to it.

## Running it

```bash
npm install
npm run dev        # http://localhost:4321
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | `astro check` + `tsc` on the Pages Function, then the static build. A missing translation key fails here. |
| `npm run preview` | Serve `dist/` locally |
| `npm run verify` | Test store handoffs, build, and check static content, indexing, sitemap, links and metadata in both languages |
| `npm run test:stores` | Test native store handoffs, HTTPS fallbacks and desktop behavior |
| `npm run fonts` | Rebuild the Space Grotesk subset (needs Python + fontTools) |
| `npm run favicons` | Rebuild the favicon PNGs from the brand SVG |

`fonts` and `favicons` are not part of the build. Their output is committed;
run them only when the brand assets change.

## Where things live

| Path | |
|---|---|
| `src/config/site.ts` | **Single source of truth** — domain, contact, app facts, pricing, business details, and the `ROUTES` map that defines every URL in both languages |
| `src/i18n/{en,hu}.ts` | All UI copy. `hu.ts` is type-checked against `en.ts`, so a missing key is a build error |
| `src/styles/tokens.css` | The only file allowed to contain a colour literal (three documented exceptions are named in the file) |
| `src/content/legal/` | Terms, Privacy and Cookies as Markdown, per language |
| `public/_headers` | Cloudflare Pages headers — course MIME type, `app-ads.txt` as `text/plain`, security headers |
| `public/app-ads.txt` | AdMob seller authorisation. Must stay at the domain root |

## Docs

- [`DEPLOY.md`](DEPLOY.md) — Cloudflare Pages setup, custom domain, `app-ads.txt`
- [`AUDIT.md`](AUDIT.md) — what was read out of the Flutter app, and what was not
- [`ANSWERS.md`](ANSWERS.md) — the confirmed facts this site is built on
- [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md) — what is still unconfirmed
- [`SEO.md`](SEO.md) — launch SEO changes, verification and remaining search/Cloudflare account steps

## Adding a page

Add the slug to `ROUTES` in `src/config/site.ts`, create the route file under
`src/pages/` and its Hungarian twin under `src/pages/hu/`, then add the copy to
both `en.ts` and `hu.ts`. The header, footer, language switcher, hreflang tags
and sitemap all read `ROUTES`, so nothing else needs touching.
