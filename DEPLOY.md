# Deploying courseforge-web

For the current launch/SEO release, run `npm run verify` before deploying and
follow [SEO.md](SEO.md) for search verification, live crawler checks and remaining
account settings. Set `SITE_NOINDEX=true` in the Cloudflare **Preview** environment
only; leave it unset in **Production**. Canonicals keep the production domain.

Cloudflare Pages, connected to GitHub, rebuilding on every push. Static output,
one Pages Function for the waitlist, no other server.

Everything below is what to click, in order. Where a value has to be typed
exactly, it is in `code`.

---

## Before you start

- A GitHub account.
- A Cloudflare account (the free plan is enough for all of this).
- A domain, or the willingness to launch on the `*.pages.dev` address Cloudflare
  gives you and add a domain later.

---

## 1. Create the GitHub repository

This folder is already a git repository on branch `main`, with a `.gitignore`
that keeps `node_modules`, `dist` and `.astro` out. Nothing has been committed
yet.

1. Go to **github.com → New repository**.
2. Name it `courseforge-web`. **Private** is fine — Cloudflare can read private
   repositories once you authorise it.
3. Do **not** tick "Add a README", "Add .gitignore" or "Choose a licence" —
   this folder already has what it needs and those would collide.
4. **Create repository**, then run these in this folder:

```bash
git add .
git commit -m "CourseForge marketing site"
git remote add origin https://github.com/<you>/courseforge-web.git
git push -u origin main
```

---

## 2. Create the Cloudflare Pages project

1. Cloudflare dashboard → left sidebar → **Compute (Workers & Pages)**.
2. **Create** → **Pages** tab → **Connect to Git**.
3. **Connect GitHub**, authorise Cloudflare, and pick `courseforge-web`.
   If the repository is not listed, use **Add repositories** in GitHub's
   authorisation screen — Cloudflare only sees what you grant it.
4. On the **Set up builds and deployments** screen:

   | Field | Value |
   |---|---|
   | Project name | `courseforge-web` |
   | Production branch | `main` |
   | Framework preset | **Astro** (or None — the values below are what matter) |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | leave empty |

5. Expand **Environment variables (advanced)** and add, for **Production**:

   | Variable | Value |
   |---|---|
   | `NODE_VERSION` | `20` |
   | `SITE_URL` | only if you need to override `https://courseforge.hu` |
   | `CONTACT_EMAIL` | only if you need to override `support@courseforge.hu` |

   `NODE_VERSION` is not optional. Cloudflare's default is older than this
   project supports.

   `SITE_URL` and `CONTACT_EMAIL` already default to the live values in
   `src/config/site.ts`, so you only set them here for a staging host. If
   `SITE_URL` is ever pointed back at the placeholder, every page ships
   `noindex, nofollow`, `robots.txt` disallows everything, and the build prints
   a warning — that guard is still in place.

6. **Save and Deploy.** The first build takes two or three minutes.

7. Repeat the three environment variables for the **Preview** environment
   (Settings → Environment variables → Preview), or preview deploys will build
   against the placeholder domain. That is harmless — they stay noindexed — but
   the links in previews will point at the wrong host.

---

## 3. Create the KV namespace for the waitlist

The waitlist is the only server-side code on the site:
`functions/api/waitlist.ts`, about 25 lines, writing an email address and a
timestamp. It needs a KV namespace bound to the name `WAITLIST` or it will 500.

1. Dashboard → **Storage & Databases** → **KV** → **Create a namespace**.
2. Name it `courseforge-waitlist` → **Add**.
3. Go back to **Compute (Workers & Pages)** → your `courseforge-web` project →
   **Settings** → **Bindings** → **Add** → **KV namespace**.
4. Fill in:

   | Field | Value |
   |---|---|
   | Variable name | `WAITLIST` — exactly this, it is what the code reads |
   | KV namespace | `courseforge-waitlist` |

5. **Save**, and do the same under the **Preview** environment if you want the
   form to work on preview deploys.
6. **Redeploy** — bindings only attach on the next build. Deployments →
   **Retry deployment** on the latest one.

### Checking it works

Submit the form on the live site, then Dashboard → **KV** → your namespace →
**View** . You should see one key, `email:someone@example.com`, whose value is an
ISO timestamp. Nothing else is stored: no IP address, no user agent, no
referrer, which is what the privacy policy promises.

### Reading the list at launch

KV → your namespace → **View** lists the keys. For more than a page of them,
use the API:

```bash
npx wrangler kv key list --namespace-id <id> --remote
```

Strip the `email:` prefix and you have your mailing list.

---

## 4. Custom domain and DNS

### If courseforge.hu is already on Cloudflare

1. Project → **Custom domains** → **Set up a custom domain**.
2. Enter `courseforge.hu` → **Continue** → **Activate domain**.
3. Cloudflare adds the DNS record itself. Nothing to type.
4. Repeat for `www.courseforge.hu`. Add it as a second custom domain, then a
   **Redirect Rule** sending `www.courseforge.hu/*` to `https://courseforge.hu/$1`
   with a 301. The canonical tags all point at the apex, so www should redirect
   rather than serve a second copy of the site.

### courseforge.hu is registered at Rackhost

Move the nameservers to Cloudflare. The alternative — leaving DNS at Rackhost and
pointing a `CNAME` at `courseforge-web.pages.dev` — only works for `www`, because
DNS does not allow a CNAME at the apex, and the apex is the canonical host here.

**Write down the current zone before you touch anything.** In Rackhost, Domainek →
**DNS profilok**, open the profile the domain uses and copy every record,
especially `MX` and any `TXT` holding SPF, DKIM or DMARC. `support@courseforge.hu`
is printed on the privacy policy and the impresszum — if the MX records do not
survive the move, that mailbox stops receiving, which includes GDPR requests.

1. **Cloudflare → Add a site → `courseforge.hu` → Free.** Cloudflare scans the
   existing zone and imports what it finds.
2. **Check the imported records against your copy, one by one.** The scan is
   best-effort, not authoritative. Fix anything missing now, while the domain is
   still answering from Rackhost. Do not add an `A` or `CNAME` for the apex —
   step 6 does that.
3. Cloudflare shows **two nameservers**, like `xxx.ns.cloudflare.com`.
4. **Rackhost → Saját domainek → Részletek → Névszerverek módosítása.** Create a
   profile with the two Cloudflare nameservers and remove Rackhost's.
   Rackhost validates that the new nameservers actually answer for the domain and
   refuses the change until they do — so the domain must already be added in
   Cloudflare (step 1) before this will go through. An error here usually means
   step 1 was skipped or is not finished, not that anything is broken.
5. **Wait.** Cloudflare emails you when the domain goes active. The `.hu` registry
   plus propagation can take up to 24 hours. The site stays reachable at its
   `*.pages.dev` URL throughout.
6. Once active, come back to **Custom domains** in the Pages project and follow
   the steps above for the apex and `www`.
7. **SSL/TLS → Overview → Full (strict)**, and turn on **Always Use HTTPS**.

### After the domain is live

Nothing to change — `SITE_URL` already is `https://courseforge.hu`.

Certificates are automatic. Give it a few minutes before worrying.

---

## 5. Turn on Web Analytics

Cookieless, and the only measurement on the site.

1. Dashboard → **Analytics & Logs** → **Web Analytics**.
2. **Add a site** → choose **Pages project** → pick `courseforge-web`.
3. **Enable**.

Cloudflare injects the beacon into responses itself. **Do not paste a script tag
into the site** — there is no analytics code in this repository, and there should
not be. That is what lets section 7 of the privacy policy say, truthfully, that
the site sets no cookies.

Data appears within a few minutes of the first visitor.

---

## 6. app-ads.txt for AdMob

`public/app-ads.txt` ships with the site and lands at
`https://courseforge.hu/app-ads.txt`, served as `text/plain`:

```
google.com, pub-5067995864382499, DIRECT, f08c47fec0942fa0
```

For AdMob to accept it:

1. **The developer website in the stores must be exactly this domain.** In Google
   Play Console it is Store presence → Main store listing → Website; in App Store
   Connect it is the Marketing URL on the app record. If either says
   `www.courseforge.hu` while the file sits on the apex, or points at
   `bagemedia.hu`, the crawl fails — this is the usual reason app-ads.txt stays
   "not found".
2. **No redirect chain.** One redirect is tolerated, more is not. If you add the
   www redirect above, keep the file reachable at the apex without further hops.
3. **Wait at least 24 hours**, then check AdMob → Apps → app-ads.txt for the
   status. It can take longer if the app is not yet published, because the
   crawler starts from the store listing.
4. Verify it yourself first: open the URL and confirm you see plain text, not a
   download or an HTML page.

Adding another ad network later means adding a line, not replacing the file.

## 7. After the first deploy — check these

- `https://courseforge.hu/robots.txt` — says `Allow: /` and names the sitemap.
- `https://courseforge.hu/sitemap-index.xml` — loads, and the URLs use the
  domain.
- `https://courseforge.hu/app-ads.txt` — plain text, one `google.com` line.
- `https://courseforge.hu/.well-known/apple-app-site-association` — returns JSON.
  It contains placeholders and does nothing yet; see `OPEN_QUESTIONS.md`.
- Both languages: `/` and `/hu`, and the language switcher moves you between
  matching pages rather than to the homepage.

---

## Routine work

**The course library is switched off** for the first release — see
`OPEN_QUESTIONS.md`. The renderer, the example course and
[`courses/README.md`](courses/README.md) are all still in the repo, so turning it
back on does not mean rebuilding it.

**The blog is switched off** — see `OPEN_QUESTIONS.md`. The posts and the
collection are still in the repo; there are no blog pages or feeds.

**Rolling back** — Deployments → the last good one → **Rollback**. Instant, no
rebuild.

**Previewing a change** — push a branch and open a pull request. Cloudflare
builds a preview at its own URL, noindexed.

---

## Running it locally

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # type-checks first, then builds
npm run preview      # serve dist exactly as Cloudflare will
npm run verify       # build, then check canonicals, hreflang and OG images
```

Two build steps are deliberately **not** run on Cloudflare, because their
outputs are committed:

```bash
npm run fonts        # rebuild the Space Grotesk subset — needs Python + fonttools
npm run fonts:check  # verify Hungarian ő/ű, writes docs/font-check-hungarian.png
npm run favicons     # regenerate favicons from the app icon
npm run plans        # render every course plan to docs/plans/ for eyeballing
```

`npm run build` is `astro check && astro build`, so a type error — including a
translation key missing from `hu.ts` — fails the deploy instead of shipping
half-English pages.

---

## Costs

Everything above is inside Cloudflare's free tier at this scale: unlimited static
requests, 100,000 Function invocations a day, 1,000 KV writes a day. A waitlist
signup is one Function call and one KV write.
