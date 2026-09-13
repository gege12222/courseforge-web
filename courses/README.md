# How to publish a course

You need three things: a course file exported from the app, and one short text
file per language. That is it. There is no image to make and nothing to resize —
the plan you see on the website is drawn from the course file itself, every time
the site is built.

You do not need to be a developer to follow this, but you do need a GitHub
account with access to this repository.

---

## Step 1 — Export the course from CourseForge

1. Open the course in the app.
2. Tap **Export**.
3. Choose **Editable CourseForge file** (not PDF, not photo).
4. Share it to yourself — email, AirDrop, Drive, whatever gets it onto a
   computer.

You will end up with a file ending in **`.courseforge`**.

## Step 2 — Give the file a good name

Rename it to lowercase words joined by hyphens, with no accents and no spaces:

| Good | Bad |
|---|---|
| `grand-prix-110.courseforge` | `Nyári Nagydíj.courseforge` |
| `pony-club-80.courseforge` | `pony club 80.courseforge` |
| `winter-indoor-100.courseforge` | `Winter_Indoor_100.COURSEFORGE` |

**This name becomes part of the web address**, so
`grand-prix-110.courseforge` gives you `yoursite.com/courses/grand-prix-110`.
Pick something you would be happy to see in a link. It has to be the same for
both languages.

## Step 3 — Put the file in `public/courses/`

On GitHub: open the `public/courses` folder → **Add file** → **Upload files** →
drop it in → **Commit changes**.

## Step 4 — Write the English description

Create a new file at `src/content/courses/en/grand-prix-110.md`, using the same
name as your course file but ending in `.md` instead of `.courseforge`.

Paste this in and edit it:

```markdown
---
title: 'Summer Grand Prix — 1.10 m'
description: 'One or two sentences. This shows on the course list and in search results.'
difficulty: club
fenceHeight: 110
designer: Your Name
discipline: showjumping
publishedAt: 2026-08-06
courseFile: grand-prix-110.courseforge
license: free-to-ride
---

Write about the course here in normal sentences. What it asks, where the
question is, anything a course builder should know before setting it up.
Blank lines separate paragraphs.
```

### What each line means

| Field | What to put | Allowed values |
|---|---|---|
| `title` | The course name as riders would say it | Any text. Wrap in `'` quotes |
| `description` | One or two sentences | Any text, up to 300 characters |
| `difficulty` | Who it suits | `beginner`, `club`, `regional`, `national` |
| `fenceHeight` | **In centimetres**, no unit | `110` for 1.10 m, `80` for 80 cm |
| `designer` | Who built it | Any text |
| `discipline` | What kind of course | `showjumping`, `schooling`, `pony` |
| `publishedAt` | The date | `YYYY-MM-DD` |
| `courseFile` | The file from step 3 | Must match exactly, including `.courseforge` |
| `license` | Terms of use | `free-to-ride`, or leave the line out |

Optional extras:

- `draft: true` — keeps the course off the site until you remove the line.
  Useful for writing it up before you are ready to publish.
- `arenaSize: '50 × 60'` — you do not need this. If you add it and it does not
  match the arena in the course file, the build stops and tells you. It exists
  only as a double-check.

## Step 5 — Write the Hungarian version

The same again at `src/content/courses/hu/grand-prix-110.md` — **same file
name**, Hungarian `title`, `description` and body text.

The matching file names are what pairs the two pages together, so
`/courses/grand-prix-110` and `/hu/palyak/grand-prix-110` know about each other
and tell Google they are translations. If the names differ, the pairing breaks.

A course can exist in one language only if you want. It simply will not appear
in the other language's list.

## Step 6 — Commit

Commit the three files. Cloudflare rebuilds the site automatically and the
course is live in a couple of minutes.

---

## What happens automatically

You do not create any of this by hand:

- **The course plan** — arena, obstacles, numbers, combination letters and the
  ride line, drawn from your course file.
- **The social preview image** — the picture that shows when someone shares the
  link on Facebook, WhatsApp or Slack.
- **Arena size, number of obstacles and route length** — read out of the file.
- **The download button**, with the right file type so phones save it properly.
- **The filters** on the course list, from `difficulty` and `fenceHeight`.

Change the course in the app, export it again, replace the file, and everything
above updates itself. There is no second copy to keep in step.

## When something goes wrong

The build stops with a message rather than publishing something broken. The
usual causes:

**"Course file public/courses/x.courseforge does not exist"**
The `courseFile` line does not match the uploaded file. Check the spelling and
that you did not lose the `.courseforge` ending.

**"is not a valid CourseForge course file"**
The file is damaged, or it is not a course export — most often a PDF or photo
export renamed by hand. Export again and choose the editable file.

**"frontmatter arenaSize … does not match the course file"**
You added `arenaSize` and the course was since resized. Fix the number or delete
the line.

**"Invalid enum value" on `difficulty` or `discipline`**
A typo or a value not in the tables above. They are case-sensitive:
`club`, not `Club`.

---

## A worked example

The repository already contains one complete course. Copy its three files and
change them rather than starting from scratch:

```
public/courses/grand-prix-110.courseforge
src/content/courses/en/grand-prix-110.md
src/content/courses/hu/grand-prix-110.md
```

## Removing a course

Delete all three files, or add `draft: true` to both Markdown files to hide it
while keeping it around.
