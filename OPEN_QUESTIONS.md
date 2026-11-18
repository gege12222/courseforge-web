# Open questions and assumptions

## Launch update — 18 November 2026

The app is now released. The older pre-launch notes below are historical where
they conflict with this update. Both store buttons now link to live listings and
attempt native store handoffs on matching devices. iOS listing ID: `6798715396`;
Android package: `com.gege.courseforge`. The iOS lookup lists bundle ID
`com.example.courseforge`, version `1.0.1`, and minimum iOS `15.6`. The app schema
now reports availability instead of pre-order. App-to-website association files
still require verified signing/team details; opening a store does not depend on
those files. See [SEO.md](SEO.md) for the current SEO audit and account tasks.

Everything I had to decide without you, everything still outstanding, and one
section you can hand straight to the app agent.

Numbering continues from `AUDIT.md`, so #1–#14 are the questions you answered in
`ANSWERS.md`. Anything still open there is repeated here with its current state.

---

## Still blocking

### #2 — Bundle identifiers, Apple Team ID, Play signing fingerprint
**Status: open, expected to stay open for a while.**

Written as obvious placeholders, never plausible fakes:

| Placeholder | Where |
|---|---|
| `BUNDLE_ID_PENDING` | `public/.well-known/apple-app-site-association`, `public/.well-known/assetlinks.json`, `src/config/site.ts` |
| `TEAMID_PENDING` | `apple-app-site-association`, `src/config/site.ts` |
| `SHA256_PENDING` | `assetlinks.json`, `src/config/site.ts` |

Both files are served with `Content-Type: application/json` via `public/_headers`,
the AASA without a file extension, as Apple requires. **They do nothing until the
identifiers are real and the app side is done** — see the hand-off section at the
bottom. Nothing on the site claims a course file opens in the app; the import
guide describes the three-step reality instead.

### #7 — Domain: settled
**Status: done.** `SITE_URL` now defaults to `https://courseforge.hu`, so the
noindex and the blanket `Disallow: /` are off and the build no longer prints the
placeholder warning. Canonicals, hreflang, the sitemap and every OG image URL
point at that origin. An environment variable still overrides it for staging.

**`app-ads.txt` is in `public/`** carrying the AdMob line
`google.com, pub-5067995864382499, DIRECT, f08c47fec0942fa0`, served as
`text/plain` via `public/_headers`. It only validates if the developer website
recorded in Google Play and App Store Connect is exactly this domain — see
DEPLOY.md.

### #8 — Pricing: back, with two tiers
**Status: built.** `/pricing` and `/hu/arak` show a Free card and a Lifetime Pro
card. Prices live in `PRICING` in `src/config/site.ts` — **$6.99 / 2990 Ft** —
shown with the reader's own currency first and the other alongside, over a note
saying the stores convert and tax locally so the figure varies by country.

**One thing to settle: `/features` and `/pricing` currently disagree.** The
features page says arena size from 10 to 300 m, four surface colours and the full
25-object library are in the app, which is true of v0.1.0 and came straight from
the audit. The pricing page now lists arena size, every footing colour and the
extended object library as Lifetime Pro. Both cannot be read at once without a
reader noticing. Two ways out: mark the Pro items on the features page, or split
that page into Free and Pro columns. Tell me which and it is a short job.

### Course library: switched off for the first release
**Status: pages removed, everything else kept.**

`/courses`, `/hu/palyak` and the individual course pages are gone, along with the
nav and footer links, the sitemap entries and the OG images. `courses` is out of
`ROUTES`, so all of that followed automatically. The homepage teaser went with it.

Kept and still working, so switching it back on is a route file plus a `ROUTES`
line: the course Markdown in `src/content/courses/`, the `.courseforge` file in
`public/courses/`, the build-time plan renderer in `src/lib/course-plan/`,
`src/lib/courses.ts`, `src/lib/og-plan.ts`, the import guide component, and
`courses/README.md`. The `_headers` rules for `.courseforge` downloads and the
`.well-known` files that point at `/courses/*` are also untouched.

The two page components were deleted — like the blog ones, they carry
`routeId="courses"` and stop type-checking the moment `courses` leaves `ROUTES`.

### Blog: switched off
**Status: pages removed, content and infrastructure kept.**

`/blog`, `/hu/blog`, the post pages, the tag pages and both RSS feeds are gone,
along with the nav and footer links, the `<link rel="alternate">` feed hints and
the OG images. `blog` is out of `ROUTES`, so the sitemap and hreflang followed
automatically. `BlogPosting` JSON-LD went with it — there is no post for it to
describe.

Kept, so nothing is lost: the real post in `src/content/blog/en|hu/`, the
collection schema in `src/content.config.ts` (which still validates those files),
`src/lib/blog.ts`, and the `blog` strings in both locales, marked unused.

Putting it back means restoring the `ROUTES` line, six route files, two RSS
endpoints, `blogPostingSchema`, the OG entries and the nav link. The three page
components were deleted — they reference `routeId="blog"`, which stops
type-checking the moment `blog` leaves `ROUTES`, so they could not simply sit
parked.

### #12 — Course licensing
**Status: drafted as you described, clearly marked unconfirmed.**

`DEFAULT_COURSE_LICENSE` in `src/config/site.ts` is `free-to-ride`; a course can
override it with `license:` in its frontmatter. Both `designer` and `license` are
in the collection schema as you asked. The wording — free to download and ride,
club and training use included, no resale or redistribution of the files — appears
in three places, all fed from that constant:

- the sidebar on every course page, followed by "These terms are not final yet.",
- the terms page, inside a marked block quote,
- the Hungarian equivalents of both.

Confirm the wording and I remove the "not final" line.

### #14 — Contact address
**Status: answered by your legal documents.** `CONTACT_EMAIL` is now
`support@courseforge.hu`, taken from the Terms of Use and the Privacy Policy.
Still overridable by environment variable.

### #13 — Impresszum values
**Status: done.**

Filled from `BUSINESS` in `src/config/site.ts` — the same values the Terms of Use
and the Privacy Policy publish, so the three pages cannot drift. The phone row
was removed at your request.

`registrationAuthority` is **Nemzeti Adó- és Vámhivatal (NAV)**. For a Hungarian
egyéni vállalkozó the register has been kept by NAV since 1 July 2020; the local
notary, the chamber of commerce and the ministry are the common wrong answers.
Source: [Fogyasztó Barát on impresszum
mistakes](https://fogyasztobarat.hu/amit-a-legtobbszor-elrontanak-az-impresszumban/).
Worth a second check against your own registration paperwork.

### Carried in from your legal documents

Four things came out of reading the Terms of Use and the Privacy Policy.

**The conciliation board.** Confirmed by you as correct — no change made.

**Web server log retention has been removed** from Privacy §7 and from the
retention table, at your request. The hosting provider row stays: Cloudflare,
Inc. with its privacy policy URL.

**Cloudflare Web Analytics was missing from the privacy notice.** Your §7 said
the website uses no analytics, while the cookie policy describes the cookieless
Cloudflare Web Analytics the site actually runs. I added a paragraph to §7 and a
row to the retention table covering it, plus the `localStorage` language
preference, so the two documents agree. Read those two additions — they are the
only substantive text I added to your document.

**The course library is not covered by any clause.** The terms I originally
drafted had a paragraph saying the downloadable courses are free to ride but not
for resale, and every course page still links to the terms for its licence line.
Your document does not mention the course library at all, so #12 now points at a
clause that no longer exists.



---

## Decisions I made without asking

Each of these was a judgement call inside the scope you set. Tell me if any is
wrong and it is a small change.

### Hungarian slugs for the legal pages
Your answers covered `funkciok`, `arak`, `palyak`, `blog`. The rest I chose:

| English | Hungarian |
|---|---|
| `/privacy` | `/hu/adatvedelem` |
| `/terms` | `/hu/aszf` |
| `/cookies` | `/hu/sutik` |
| `/impresszum` | `/hu/impresszum` |

`aszf` because that is what a Hungarian reader expects to see for terms.
All live in `ROUTES` in `src/config/site.ts`.

### Store badges are not the official artwork
You asked for the official Apple and Google badges rendered as "Coming soon".
Those two requirements conflict: both companies' guidelines require their badge
to link to a live store listing and forbid altering the artwork or its wording,
so a badge relabelled "Coming soon" pointing at a waitlist would breach both.

What is there instead: neutral navy buttons of the same size and shape, saying
"Coming soon to the App Store" and "Coming soon to Google Play", linking to the
waitlist. They already follow the guidelines on minimum height (52 px against a
40 px minimum), matched heights and clear space, so dropping the real artwork in
at launch is a like-for-like swap. `src/components/StoreBadges.astro` explains
this at the top of the file.

### `previewImage` is not in the course schema
Superseded by your build-time renderer decision. The plan on the page and the OG
image both come from the `.courseforge` file. `arenaSize` stayed in the schema
but is optional and only ever used as a cross-check: if it contradicts the file,
the build stops rather than displaying a wrong number.

### Cross rail, wall and gate symbols are conventions, not copies
`element_symbol_painter.dart` draws these in ways I could not reproduce exactly
from the outside, so I used standard plan-view conventions: a cross rail is a
pole with a crossing mark, a wall is a solid block, a gate is a panel with
uprights. Verticals, oxers, triple bars, Liverpools, open water and cavaletti do
match the app. If any of them reads wrong to you, they are all in
`src/lib/course-plan/symbols.ts`, one function each.

### START and FINISH markers are drawn larger than life
The app stores them as 2.0 × 0.5 m. At plan scale the words are illegible, so
they are drawn at a floor of 4 × 1.5 m — the app's own arena view does the same
thing, treating them as labels rather than objects.

### `--cf-ink-faint` was darkened
The app's faintest grey, `#7d918a`, is a symbol outline colour, never text. As
12 px text it measures 3.1:1 and fails WCAG AA. The token is now `#5c6e68`
(5.0:1 on the canvas), and `#7d918a` is kept as `--cf-plan-outline` where it
belongs. This is the only token whose value knowingly differs from the app.

### JSON-LD `offers` uses EUR
`SoftwareApplication` needs `priceCurrency` alongside `price: 0`. I used `EUR`
with `availability: PreOrder`. If the app will be priced in HUF, say so and I
change one line in `src/lib/seo.ts`.

### Tag pages declare only their own language
"course design" and "pályatervezés" are different words with different URLs, so
tag pages have no counterpart. They emit one `hreflang` and no cross-language
pair, and they are excluded from the sitemap. This is also the one place in the
current content where the single-language hreflang path is actually exercised.

### The 404 has no canonical
It is served for every unmatched path, so a canonical would be a claim about a
URL that does not exist. It is `noindex`, shows both languages, and the build
verifier skips it.

### One blog post, in both languages
You said no placeholder posts, so there is exactly one real post — on walking
distances before building a course — written in English and rewritten in
Hungarian, linked by `translationKey`. The Hungarian is not a translation of the
English; it is the same argument written again in Hungarian.

Consequence worth knowing: the "post exists in one language only" code path is
implemented and type-checked but **not exercised by current content**. The first
single-language post you write will be the first live test of it.

---

## What I need from you

### English screenshots
Twelve files were promised; six arrived, all Hungarian. They are in
`src/assets/screenshots/hu/`, named `01-home` through `06-object-library`, and
they are used on the homepage and the features page.

`src/components/Screenshot.astro` already accepts a missing image and renders a
correctly proportioned placeholder at 1170 × 2532, so when the English set
arrives it is: drop the files into `src/assets/screenshots/en/`, and switch the
imports in `HomePage.astro` and `FeaturesPage.astro` to pick by locale. Nothing
about the layout changes.

The Hungarian pages currently show Hungarian screenshots, which is right. The
English pages also show the Hungarian ones, which is not — it is the honest
placeholder, and the caption says "running in Hungarian" so nobody is misled.

### Confirmation on the licence wording (#12)
### The domain (#7), and then `SITE_URL` set in Cloudflare
### The impresszum values (#13) and the contact address (#14)

---

## Hand-off: what the Flutter app needs to change

Everything here is app-side. The website is already serving what its half
requires. You can give this section to the app agent as its own task.

None of it is optional if you want a course file to open in CourseForge when
someone taps it on a phone. Today, on both platforms, tapping a `.courseforge`
file does nothing useful — the app registers no file type and no domain
association, which is why the site documents the manual import route instead.

### 1. Replace the placeholder identifiers

Currently `com.example.courseforge` on both platforms, marked `TODO(release)`.

- `android/app/build.gradle.kts` — `namespace` and `applicationId`.
- `ios/Runner.xcodeproj/project.pbxproj` — `PRODUCT_BUNDLE_IDENTIFIER`
  (three occurrences for Runner, plus the RunnerTests variants).
- The Android Kotlin source path under `android/app/src/main/kotlin/…` has to
  move to match the new package.

Also still on the list from `AUDIT.md`: the release build signs with the **debug**
keystore.

### 2. Declare the file type on iOS

In `ios/Runner/Info.plist`. The MIME type and extension must match the website
exactly — `application/vnd.courseforge.course+json` and `courseforge`.

```xml
<key>CFBundleDocumentTypes</key>
<array>
  <dict>
    <key>CFBundleTypeName</key>
    <string>CourseForge course</string>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>LSHandlerRank</key>
    <string>Owner</string>
    <key>LSItemContentTypes</key>
    <array><string>com.yourdomain.courseforge.course</string></array>
  </dict>
</array>
<key>UTExportedTypeDeclarations</key>
<array>
  <dict>
    <key>UTTypeIdentifier</key>
    <string>com.yourdomain.courseforge.course</string>
    <key>UTTypeDescription</key>
    <string>CourseForge course</string>
    <key>UTTypeConformsTo</key>
    <array><string>public.json</string></array>
    <key>UTTypeTagSpecification</key>
    <dict>
      <key>public.filename-extension</key>
      <array><string>courseforge</string></array>
      <key>public.mime-type</key>
      <array><string>application/vnd.courseforge.course+json</string></array>
    </dict>
  </dict>
</array>
<key>LSSupportsOpeningDocumentsInPlace</key>
<false/>
```

`false` for in-place editing is deliberate: the app imports a copy into its own
database rather than editing the file where it sits, which is what
`CourseFileService.decode` plus `importCourse` already does.

### 3. Declare the file type on Android

In `android/app/src/main/AndroidManifest.xml`, inside the existing `<activity>`,
alongside the `MAIN`/`LAUNCHER` filter:

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="content" />
  <data android:scheme="file" />
  <data android:mimeType="application/vnd.courseforge.course+json" />
</intent-filter>
```

Do **not** match on `application/json` or `*/*`. Either would register
CourseForge as a handler for every JSON file on the device, which is the reason
the vendor MIME type was chosen in the first place.

Android often hands over files with a generic MIME type, so also match the
extension as a fallback:

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="content" android:host="*"
        android:mimeType="*/*" android:pathPattern=".*\\.courseforge" />
</intent-filter>
```

### 4. Handle the incoming file in Dart

Nothing reads an inbound intent today. `receive_sharing_intent` or
`app_links` will do it. The handler should go straight to the code that already
exists:

`CourseFileService.decode(source)` → `CourseRepository.importCourse(data, newUuid)`
→ navigate to `AppRoutes.editor(id)`.

That is exactly what `_importCourse` in `saved_courses_screen.dart:186` does
after the file picker returns, including the 5 MB guard. Factoring that body out
into a method both paths call is most of the work.

### 5. Associate the domain, for tapping a link

Only needed if you want a `/courses/…` **link** to open the app, as opposed to a
downloaded file. The website files are already in place with placeholders.

**iOS** — create `ios/Runner/Runner.entitlements` (there is no entitlements file
at all right now) and add it to the Xcode target:

```xml
<key>com.apple.developer.associated-domains</key>
<array><string>applinks:yourdomain.com</string></array>
```

**Android** — add `android:autoVerify="true"` to an `https` intent filter:

```xml
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="https" android:host="yourdomain.com"
        android:pathPrefix="/courses" />
  <data android:scheme="https" android:host="yourdomain.com"
        android:pathPrefix="/hu/palyak" />
</intent-filter>
```

Then fill in the real values on the website side:

- `public/.well-known/apple-app-site-association` — replace
  `TEAMID_PENDING.BUNDLE_ID_PENDING` with `TEAMID.com.yourdomain.courseforge`.
- `public/.well-known/assetlinks.json` — replace `BUNDLE_ID_PENDING` with the
  `applicationId` and `SHA256_PENDING` with the SHA-256 of the **Play upload
  certificate**, which only exists after the app is created in Play Console
  (Play Console → Setup → App integrity).
- `src/config/site.ts` — the same three values in `APP`, so anything else that
  needs them stays in step.

### 6. Two small consistency fixes

- `ios/Runner/Info.plist` — `CFBundleDisplayName` is `Course Forge`; everything
  else, including the website, says `CourseForge`. Left as-is it will show up
  as a mismatch on the App Store listing.
- `course_forge/lib/core/branding/course_forge_brand.dart:76` — the splash
  wordmark also reads `Course Forge`.

### 7. Documentation that no longer matches the code

Found during the audit, listed here so it does not get lost. The website follows
the code, not these documents.

- `README.md` says metric is the only unit system. Imperial ships and works.
- `README.md` and `TASKS.md` claim configurable pony and custom stride lengths.
  `CourseRepository.updateStrideConfiguration()` has **no caller** and there is
  no UI; every course is created `StrideMode.horse` and the stride estimate is
  hardcoded horse ranges.
- `README.md` claims default arena preset and default surface settings.
  `AppSettings.defaultArenaPreset` and `defaultSurface` are persisted but nothing
  reads or writes them, and the translated strings for them are unused.
- `TASKS.md` lists Route Phase E (manual waypoint editing) as unchecked. It is
  implemented — curve dots are draggable, undoable and saved.

---

## Things deliberately not built

Named so their absence reads as a decision rather than an oversight.

- **No cookie banner**, because nothing sets a cookie. The only browser storage
  is one `localStorage` key holding `en` or `hu`.
- **No analytics code in the repository.** Cloudflare injects the Web Analytics
  beacon itself once enabled in the dashboard. Pasting a script tag here would
  make the cookie policy's claims harder to verify, for no gain.
- **No client-side framework, no islands, no router.** The only JavaScript is
  three small inline scripts: the mobile nav toggle, the course filters, and the
  waitlist form.
- **No dark mode** (#11). `color-scheme: light` is set so browsers do not
  auto-invert form controls.
- **Nothing from the "half-built" table in `AUDIT.md`** appears anywhere on the
  site — no pony or custom strides, no default arena preset, no route validation,
  no ads or purchases described in the present tense.
