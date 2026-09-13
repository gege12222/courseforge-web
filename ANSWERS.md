# Answers to AUDIT.md open questions

Good audit. Answers below, numbered to match. Where I write **DECISION NEEDED**, I have not
answered — do not proceed past that point on a guess, ask me.

Save this file as `courseforge-web/ANSWERS.md` and keep it updated as things get resolved.

---

## Change of plan: render course previews at build time

Before the numbered answers — one architectural change that affects 5 and 6.

The course file is plain JSON with meter coordinates and an ordered step list. So **the website
renders its own course previews.** Write a build-time module that reads a `.courseforge` file and
emits an SVG arena plan. Per course I then upload **one file** — no separate preview PNG.

Why: a hand-exported PNG goes stale the moment I edit the course, and I would have to remember to
re-export. A build-time render can never disagree with the file it came from. It also gives every
course page a unique OG image at no extra cost, and the SVG is a few KB against a few hundred for a
PNG.

Scope it tightly:

- **Do render**: arena rectangle with surface colour from `surfaceColorValue`, all jump-category
  elements, start/finish markers, obstacle numbers from `routeDefinition.steps[]`, combination
  letters, measurement lines only if trivial.
- **Do render simply**: the route as a smoothed polyline (Catmull–Rom → cubic path) through the
  ordered step anchors. **Do not** reimplement `route_generator`'s approach/landing anchors, curve
  dots, or Bézier transitions. This is a thumbnail, not a second renderer. If it looks
  approximately right at 600 px wide, it is right.
- **Skip**: decorations (flowers, bush, tree, cone, flag), judge booth, entrance/exit. They add
  noise at thumbnail size. Render them as small neutral dots or omit entirely.
- Use the app's colours — `#E9EEEA` arena fill, `#E94F37` poles, `#FFC857` route, `#173E37` at 13%
  grid. Match `element_symbol_painter.dart` geometry as closely as is reasonable.

Two output sizes from the same module: an inline SVG for the course page and index card, and a
1200×630 PNG for OG. Fail the build loudly on a malformed course file rather than emitting a broken
preview.

---

## 1. Typeface — answered

**Space Grotesk for headings, the wordmark, and UI labels. System stack for body copy.**

- Self-host, weights **500 and 700 only** (do not ship 600 as well — three weights of a display face
  is bytes for nothing).
- Subset Latin + Latin Extended-A.
- Body: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. This matches what the app
  actually renders in, costs zero bytes, and reads better than a display face at 16 px.

**Verify ő and ű before Phase 2 ends, and show me a rendered sample.** Check specifically that the
double acute is a real glyph and not a synthesised or substituted umlaut — that failure mode looks
fine in a glyph-coverage check and wrong on screen. If Space Grotesk's double acute is bad at either
weight, tell me and we pick something else for headings rather than shipping broken Hungarian.

## 2. Bundle identifiers — DECISION NEEDED (does not block Phase 2)

I have not chosen these yet, and they depend on the domain (question 7). Proceed with clearly
marked placeholders.

For now:

- Write `apple-app-site-association` and `assetlinks.json` with obvious placeholder values —
  `TEAMID_PENDING`, `SHA256_PENDING` — never plausible-looking fakes.
- Serve AASA with no extension and `Content-Type: application/json`.
- In `OPEN_QUESTIONS.md`, write out **the exact Flutter-side changes** needed: the
  `.entitlements` file with `com.apple.developer.associated-domains`, the `CFBundleDocumentTypes`
  and `UTExportedTypeDeclarations` entries, the Android `VIEW` intent filter with `autoVerify`, and
  the `applicationId`/namespace change. Be specific enough that I can hand that section to the app
  agent as its own task.
- Do not let the website claim files open directly in the app. Until these are wired, they do not.

Note for me, not you: the Play signing SHA-256 only exists after the app is created in Play Console,
and the Team ID after Apple Developer enrolment. So this stays open for a while.

## 3. MIME type — answered

**`application/vnd.courseforge.course+json`.**

Not plain `application/json`, for two reasons. First, browsers render `application/json` inline in a
viewer tab instead of downloading it, which breaks the whole point of the courses page. Second, when
the Android intent filter eventually lands, matching on `application/json` would register CourseForge
as a handler for *every* JSON file on the device.

In `public/_headers`, for `/courses/*.courseforge`:

```
Content-Type: application/vnd.courseforge.course+json; charset=utf-8
Content-Disposition: attachment
X-Content-Type-Options: nosniff
```

Also put `download` on the anchor. Belt and braces — some browsers ignore one or the other.

Record this type in `OPEN_QUESTIONS.md` as the value that must later match the iOS
`UTExportedTypeDeclarations` and the Android intent filter.

## 4. Screenshots — I will supply, treat as blocking

I will export these. Assume **six**, in **both locales**, so twelve files:

1. Home / saved courses with several real courses
2. Arena with a finished numbered course and the route line visible
3. Object library open, jumps category
4. Combination editor or the distance/stride readout
5. Snapping or alignment guides mid-gesture
6. Export sheet

All with real course content — no empty states, no `Untitled course`, no placeholder names. Use
sensible Hungarian and English course names.

Build the homepage and `/features` with correctly-sized placeholder boxes at the real aspect ratio so
layout is finished and I am only dropping files in. **Do not** invent screenshots, mock up fake app
UI in HTML, or ship a homepage with no visual of the app.

## 5. Course preview images — superseded

See the section at the top. No PNG uploads. The build renders previews from the course file.

## 6. Illustration — yes, and it is the same work as 5

Hand-author SVGs matching `element_symbol_painter.dart`. Build the renderer's symbol set **first**,
then reuse those symbols standalone on `/features`.

Limit the standalone illustration set to the ones that read clearly at small size: vertical, oxer,
triple bar, cross rail, wall, gate, Liverpool, open water, cavaletti. Skip the decorations.

## 7. Domain — DECISION NEEDED, blocks canonical URLs

Not chosen. Do not guess and do not scaffold against a placeholder domain string scattered through
the codebase — put the site URL in **one** config constant that everything else reads, so switching
it later is a one-line change.

For my own decision: English is the root and the app is not Hungary-specific, so a `.hu` domain would
be the wrong signal. Leaning `.app` or `.com`.

## 8. Pricing page — answered

The honest version, and nothing more:

- **Free to download and use.** Every feature listed on `/features` is in the free app.
- Ad-supported, with a **one-time ad-free purchase planned**. No price, no product ID, no date.
- No pricing table, no tier comparison, no "Pro" column. There is one tier. A three-column pricing
  grid for a free app with one planned IAP is theatre.

Do not write "Free forever", do not write a struck-through price, do not imply a launch discount.

## 9. Name spelling — answered

**`CourseForge`, one word, everywhere on the website.** Logo lockup one word.

Add to `OPEN_QUESTIONS.md` for the app side: `CFBundleDisplayName` in `ios/Runner/Info.plist` is
`Course Forge` and should become `CourseForge`, and the splash wordmark in
`course_forge_brand.dart:76` likewise. Otherwise the App Store listing disagrees with the site.

## 10. On-dark gold — approved

Yes. Add `#E3BC4B` to `tokens.css` as a documented on-dark gold, distinct from `#C9A227`.

Use `#C9A227` on light surfaces, `#E3BC4B` on navy. Comment both in the token file explaining why
there are two, so nobody "fixes" it later. `#C9A227` on `#1B2A4A` does not clear WCAG AA for text,
which is the whole reason the second token exists — do not use it for text on navy anywhere.

## 11. Website dark mode — answered: no

**Light only.** The app is light-only, there are no dark tokens to inherit, and this would mean
inventing a dark palette that the app does not have, then QA-ing every page twice.

Set `color-scheme: light` so browsers do not auto-invert form controls. If we ever add dark mode to
the app, the site follows then — not before.

## 12. Course licensing — DECISION NEEDED, blocks /courses and /terms

Not settled. Build `/courses` with the licence line pulled from a **single config constant** plus an
optional per-course frontmatter override, so I can set it once when I decide.

My current thinking, for you to draft against and me to confirm: courses are designed by me, free to
download and ride, free for club and training use, no resale or redistribution of the files
themselves. Draft the terms clause that way and mark it clearly as unconfirmed.

Add `designer` and `license` to the course collection schema now regardless.

## 13. Impresszum — I will fill

Labelled blank fields, as planned. Include: név, székhely, adószám, nyilvántartási szám, e-mail,
telefon, and the registering authority. Leave values empty — do not put example data in, because
example data is exactly what gets shipped by accident.

## 14. Waitlist and privacy contact email — DECISION NEEDED

Depends on the domain. Use a single config constant, same as the domain.

Store only email plus UTC timestamp in KV, nothing else — no IP, no user agent, no referrer. The
consent checkbox must state plainly what the address is used for (one notification when the app
launches) and that it will not be used for anything else. Then honour that.

---

## Standing instructions, beyond the questions

**Your "half-built, stubbed, or missing" table is binding.** Nothing on it appears anywhere on the
website — not on `/features`, not in a roadmap section, not as "coming soon". Specifically: no pony
or custom stride mode, no default arena preset, no route validation, no dark mode, no ads or IAP as
present-tense features. If a feature is in `app_en.arb` but has no UI, it does not exist.

**The README is stale — the code wins.** Where they disagree, `/features` follows the code. Imperial
units ship and can be listed; the stride modes do not and cannot.

**Document the real import workflow.** Until deep links are wired, downloading a course means: save
the file → open CourseForge → Saved courses → Import course → pick the file. Put a short, honest
three-step guide on every course page, with the iOS and Android paths noted separately, because the
iOS route through Files is the more confusing one. Do not describe a one-tap flow that does not exist
yet.

**Version 0.1.0, debug keystore, placeholder bundle IDs.** The app is pre-release and the site says
so. Store badges are "Coming soon" and go to the waitlist. No launch date anywhere.

**Privacy policy gets an easy job.** Your dependency audit found no HTTP client, no analytics, no
crash reporter, no ads SDK, no auth — the app is genuinely offline. Say that plainly and
specifically; it is a real selling point and most apps cannot claim it. The website's own privacy
section covers Cloudflare Web Analytics (cookieless) and the waitlist KV, and nothing else, because
there is nothing else.

**No cookie banner.** If you find yourself needing one, you have added something you should not
have. Remove it instead.

Proceed to Phase 2.
