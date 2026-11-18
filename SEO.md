# Search and app launch readiness

Source changes prepared on 18 November 2026. The existing host is Cloudflare
Pages; these changes take effect after deployment of this checkout.

## Implemented

- Store buttons are real HTTPS links to the supplied published listings in both
  languages. On matching mobile devices, a direct click attempts the native
  App Store or Google Play. Android uses an intent restricted to the Play Store
  package, with an encoded HTTPS fallback. iPhone/iPad uses `itms-apps` and a
  timed HTTPS fallback. Leaving the page cancels the timer. Desktop, modifier
  clicks and JavaScript-disabled browsers retain normal HTTPS links. Safari
  also receives Apple's Smart App Banner. Browser policies can still decline
  an external-app handoff; test a real iPhone/iPad and Android after deployment.
- Astro emits complete static HTML for every public page. Navigation, FAQs,
  support details, screenshots and store links do not depend on JavaScript.
- All 14 public pages have localized, unique titles/descriptions, self-referencing
  canonicals, reciprocal English/Hungarian hreflang and `x-default`. Canonical,
  internal and sitemap URLs end in `/`, matching Cloudflare's directory routes.
- Astro regenerates `sitemap-index.xml` and its URL set from built public routes
  on every build. `/sitemap.xml` permanently redirects to that index. Endpoints,
  the 404 and disabled content collections are excluded. A generated static
  sitemap is sufficient for these static pages; no runtime service is needed.
- Production permits crawling and indexing. Placeholder, explicitly flagged
  staging builds and Cloudflare preview branches emit `noindex` and disallow
  crawling. Keep production `SITE_NOINDEX` unset; set it to `true` in the
  Cloudflare **Preview** environment. `CF_PAGES_PRODUCTION_BRANCH` can override
  the default production branch name `main`. Preview builds should retain the
  production `SITE_URL` so canonical identities remain stable.
- Organization, WebSite and localized WebPage/AboutPage JSON-LD establish the
  provider, contact details, language and page identity. Homepages include
  SoftwareApplication data with both published download URLs and free-app
  availability. No fabricated reviews or ratings are included.
- `/about/` and `/hu/rolunk/` explain the app, provider and support contact.
  Both homepages answer practical questions about price, offline use, exporting
  and languages. The features pages retain real screenshots. The pricing pages
  distinguish Free from the one-time Pro upgrade and label prices as references.
- Each page has Open Graph/Twitter metadata and an existing generated 1200×630
  preview image, including the new About pages.
- Screenshots already use responsive AVIF/WebP, lazy loading and explicit image
  dimensions. The hero is SVG, and the site has no client-side UI framework.

## Verification

Run `npm run verify` (`npm.cmd run verify` in Windows PowerShell). It runs:

1. Store-link behavior tests for iPhone Safari/Chrome, iPad desktop mode,
   Android, desktop, modifier clicks, fallback, repeated taps and return from
   a native handoff.
2. Astro and Function type checks, then the production static build.
3. Checks on every built page: static main content/H1, indexing directives,
   unique metadata, canonical origin and path, reciprocal hreflang, sitemap/HTML
   agreement and completeness, internal links, store anchors, social previews,
   JSON-LD, image dimensions and 404 recovery markup.

The production build passed all checks with 14 public pages and 14 social
images. All pages and PNG previews returned 200 over the local HTTP preview,
and a missing URL returned 404. A separate preview-branch build passed the same
checks with `noindex`; account verification tags were tested with dummy tokens
in that isolated output only. The largest generated screenshot is 57,412 bytes.

The root `404.html` preserves Cloudflare's real missing-page responses. Do not
add a `/* /index.html 200` SPA rewrite. Live production before these changes
returned 404 for an unknown route and 308 redirects from `/features` and
`/hu/funkciok` to their slash versions. Check the newly deployed About URLs,
all sitemap URLs, the `/sitemap.xml` 301 and an unknown route after release.

## Search Console and Bing: account actions still required

No authenticated Google Search Console, Bing or Cloudflare administration
connection was available for this task. Verification and indexing status cannot
be established from repository files alone.

1. Add the `courseforge.hu` domain property in Google Search Console and verify
   the DNS TXT record in Cloudflare. Alternatively use the HTTPS URL-prefix
   property, put the actual HTML verification token in the production build
   variable `GOOGLE_SITE_VERIFICATION`, and redeploy. The shared head emits the
   tag only when a token is configured.
2. Add the site to Bing Webmaster Tools (or import the verified Google property).
   HTML verification is supported through `BING_SITE_VERIFICATION`.
3. Submit `https://courseforge.hu/sitemap-index.xml` to both services. Inspect
   `/`, `/hu/`, `/features/`, `/hu/funkciok/`, `/about/` and `/hu/rolunk/`, and
   request indexing for the new/changed pages.
4. Monitor Page indexing, selected canonicals, search impressions/clicks and Core
   Web Vitals. Group English and `/hu/` URLs separately to see each audience.
   Recheck after major releases. Sitemap submission does not guarantee indexing.

## Cloudflare crawler access: account action still required

The live robots response contains a **Cloudflare-managed block before the
repository's robots.txt**. Editing the source cannot remove those managed
directives or bypass WAF/AI Crawl Control enforcement.

On 18 November, homepage requests with Googlebot, bingbot, OAI-SearchBot,
ChatGPT-User and Claude-SearchBot user agents returned 200. A PerplexityBot
request returned 403. These are diagnostic user-agent probes from this
environment, not proof of access from each operator's verified crawler network.

Review the relevant request in Cloudflare security events and the AI crawler
access policies. Permit verified search crawlers and user-directed retrieval
agents for public pages where desired, including Perplexity's search crawler.
Scope any exception to verified bots and public content; a user-agent string
alone is not authentication. Keep training preferences a separate decision.
The managed file currently disallows several training/data crawlers and
Google-Extended; review that policy deliberately if visibility in products
covered by those controls is desired. Recheck the **live** robots response and
crawler requests after changing dashboard settings.

Cloudflare documents how its managed rules are prepended to an existing file:
[robots.txt settings](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/).
Its [verified bot documentation](https://developers.cloudflare.com/bots/concepts/bot/verified-bots/)
explains how crawler identities are validated.

## Performance and measurement limits

The public PageSpeed API returned HTTP 429 (shared API quota exhausted), so no
new Lighthouse score, LCP, INP or CLS result is claimed. Run mobile PageSpeed
Insights on both homepages and the screenshot-heavy features pages after
deployment. Use Search Console field data when traffic is sufficient; local
asset checks do not prove real-user Core Web Vitals.

No Cloudflare analytics beacon was present in the fetched production homepage.
No tracking service or conversion dashboard was provisioned here. Configure a
chosen analytics service in the account and ensure the site's disclosures match
the actual setup before collecting data. Store-click counts measure outbound
interest, not completed app installs; install attribution must use store-side
reporting. Search Console/Bing provide search discovery data independently of
adding a visitor-tracking script.

## Content and discoverability

The current intent map is deliberately small:

| Intent | English | Hungarian |
| --- | --- | --- |
| Find/download a show jumping course planner | `/` | `/hu/` |
| Course editor, distances, PDF export, actual screenshots | `/features/` | `/hu/funkciok/` |
| Free version and one-time Pro pricing | `/pricing/` | `/hu/arak/` |
| Provider, app identity and support | `/about/` | `/hu/rolunk/` |

Use actual search-query data to guide future pages. No keyword-volume research,
manufactured testimonials, mass-generated location pages or invented expertise
is claimed. A Google Business Profile should only be created if the business
meets Google's eligibility rules; a mobile app does not establish eligibility.

No `llms.txt` is needed for this work. Crawlable useful content and accurate
entity data are the foundation; neither schema nor a text file guarantees AI
citations. Google's [AI features guidance](https://developers.google.com/search/docs/appearance/ai-features)
and [localized page guidance](https://developers.google.com/search/docs/specialty/international/localized-versions)
describe these fundamentals.
