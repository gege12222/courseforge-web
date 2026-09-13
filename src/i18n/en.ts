/**
 * English UI strings. This file is the shape of the contract: `UIStrings` is
 * derived from it, so hu.ts cannot omit a key without failing `astro check`,
 * which `npm run build` runs first. A missing translation is a build error,
 * never a silent English fallback.
 *
 * Long-form prose (privacy, terms, cookies, the blog) lives in Markdown under
 * src/content/, not here. This file is labels, headings and short copy.
 *
 * Every product claim traces to AUDIT.md. Nothing on the "half-built" list
 * appears anywhere in here.
 */
export const en = {
  meta: {
    locale: 'en',
    localeName: 'English',
    htmlLang: 'en',
    ogLocale: 'en_GB',
    switchTo: 'Magyar',
    switchToLabel: 'Switch to Hungarian',
  },

  nav: {
    home: 'Home',
    features: 'Features',
    pricing: 'Pricing',
    courses: 'Courses',
    blog: 'Blog',
    menu: 'Menu',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    skipToContent: 'Skip to content',
  },

  common: {
    appName: 'CourseForge',
    tagline: 'Design with precision. Ride with confidence.',
    comingSoon: 'Coming soon',
    preRelease: 'Pre-release',
    readMore: 'Read more',
    backTo: 'Back to',
    download: 'Download',
    metres: 'm',
    and: 'and',
  },

  home: {
    title: 'CourseForge — show jumping course designer for iOS and Android',
    description:
      'Design show jumping courses on your phone or tablet. Place obstacles to the metre, number the track, see the ride, and export a plan. Works fully offline.',
    heroTitle: 'Designing a course? Child’s play.',
    heroLead: 'Spend less time planning and more time on what really matters.',
    heroSub:
      'Fast, simple and precise show jumping course design — anywhere, straight from your phone.',
    heroScreenshotAlt: 'The CourseForge editor showing a numbered course with the suggested route',
    heroSceneAlt:
      'A vertical and an oxer, with a curving trail of hoofprints showing the line the horse takes between them.',

    whatTitle: 'What it does',
    what: [
      {
        title: 'Arena to scale',
        body: 'Set the arena to whatever size you need, so the course always follows real dimensions.',
      },
      {
        title: 'Easy obstacle placement',
        body: 'Move, rotate and precisely position obstacles with ease.',
      },
      {
        title: 'Visible distances and lines',
        body: 'Plan your distances and riding lines with clear visual guidance.',
      },
      {
        title: 'Export and share',
        body: 'Save your finished course as a PDF or image and share it with ease.',
      },
    ],

    screenshotsTitle: 'In the app',
    screenshotsLead: 'Screenshots from the current build, running in Hungarian.',

    offlineTitle: 'No account. Your courses stay with you.',
    offlineBody: [
      'You don’t need to register to use CourseForge, and designing a course doesn’t need a constant internet connection.',
      'Your designs and settings are stored directly on your own device. We don’t upload your courses to a server of ours either — they only leave your device if you export or share them yourself.',
    ],
    offlineClosing: 'You design it. Your device stores it. You decide what to share.',
    offlineNote:
      'Running the ads in the Free version and handling Pro purchases means external providers may process limited technical and purchase data. The privacy policy covers that in detail.',

    coursesTeaserTitle: 'Ready-made courses',
    coursesTeaserLead: 'Download a full course, open it in CourseForge, and ride it or edit it.',
    coursesTeaserCta: 'Browse the course library',
  },

  features: {
    title: 'Features',
    description:
      'Everything CourseForge does today: scale arenas, 25 obstacle types, snapping and alignment, course numbering, suggested routes, stride estimates, material counts, and PDF or photo export.',
    groups: [
      {
        title: 'The arena',
        items: [
          'Arena width and length freely adjustable between 10 and 300 metres. (Pro)',
          'Four surface colours. (Pro)',
          'Adjustable grid spacing.',
        ],
      },
      {
        title: 'Obstacles and objects',
        items: [
          'A wide choice of obstacles.',
          'Start and finish markers, obstacle numbering, jury box, entrance and exit.',
          'Decorations: flower box, flowers, bush, tree, cone and flag.',
          'Obstacles are 3.0 metres wide by default, and the width is adjustable.',
          'Combinations of two or three elements, each element its own type, with the distance between them set individually.',
        ],
      },
      {
        title: 'Designing',
        items: [
          'Simple selecting, moving and rotating.',
          'Duplicate, delete and reorder layers.',
          'Move and zoom the arena to make editing easier.',
        ],
      },
      {
        title: 'Getting it exact',
        items: [
          'Snap to the grid, to another obstacle and to centres, with guides.',
          'Drop points to measure distances.',
          'You can see how many stands and poles you need, so there is nothing to count up.',
        ],
      },
      {
        title: 'Course order and the ride',
        items: [
          'Tap the obstacles in riding order and number them.',
          'A dashed line joins the numbered obstacles, and you can move it freely using points.',
          'Stride counts between fences up to 31 metres, shown as an estimate.',
        ],
      },
      {
        title: 'Don’t lose your work',
        items: ['Fifty steps of undo.', 'Autosave.', 'Unfinished courses are waiting under Saved courses.'],
      },
      {
        title: 'Export',
        items: [
          'Export an editable CourseForge file, an A4 PDF that turns landscape when the arena is wider than it is long, or a photo.',
          'Choose a readable plan with larger symbols, or accurate scale that keeps obstacles at their true relative size.',
          'Turn the route, distances, stride counts, measurements and grid on or off before you export.',
        ],
      },
      {
        title: 'Make it yours',
        items: ['English and Hungarian.', 'Metres, or feet and inches.'],
      },
    ],
  },

  pricing: {
    title: 'Pricing',
    description:
      'CourseForge is free and ad-supported. Lifetime Pro is a single payment that removes the ads and unlocks the arena size, every footing colour and the extended object library.',
    heading: 'Free to use. Pro if you want more.',

    freeName: 'Free',
    freePrice: '0',
    freeTagline: 'Ad-supported. Everything you need to design and share a course.',
    freeFeatures: [
      'Design, number and export a full course',
      'Export as PDF, photo or an editable CourseForge file',
      'Shows ads',
    ],

    proName: 'Lifetime Pro',
    proTagline: 'One payment. No subscription, no renewal.',
    proBadge: 'One-off',
    proFeatures: [
      'No ads',
      'Set the arena to any size',
      'Every footing colour',
      'The extended object library',
      'Everything in Free',
    ],

    priceNote:
      'Reference prices. The App Store and Google Play convert to your local currency and add any local tax, so what you pay may differ by country.',
  },

  courses: {
    title: 'Course library',
    description:
      'Download complete show jumping courses and open them in CourseForge. Filter by difficulty and fence height.',
    lead: 'Complete courses you can download and open in CourseForge — then ride them as they are or change anything you like.',
    filterTitle: 'Filter',
    filterDifficulty: 'Difficulty',
    filterHeight: 'Fence height',
    filterAll: 'All',
    filterResults: 'course',
    filterResultsPlural: 'courses',
    filterNone: 'No course matches those filters.',
    filterClear: 'Clear filters',
    empty: 'There are no published courses yet.',

    metaDifficulty: 'Difficulty',
    metaHeight: 'Fence height',
    metaArena: 'Arena',
    metaDesigner: 'Designer',
    metaDiscipline: 'Discipline',
    metaPublished: 'Published',
    metaObstacles: 'Numbered obstacles',
    metaRouteLength: 'Route length',
    metaLicense: 'Use',

    planCaption: 'Course plan drawn from the downloadable file.',
    planAlt: 'Top-down plan of the course',

    downloadTitle: 'Download the course',
    downloadCta: 'Download the CourseForge file',
    downloadMeta: 'CourseForge file',
    fileContentsTitle: 'What is in the file',
    fileContents:
      'The arena size and surface, every obstacle with its position, width and rotation, the riding order with numbers and combination letters, and the route. Nothing about a device or a person — see the privacy policy.',

    heights: {
      upTo80: 'Up to 80 cm',
      ninetyToHundred: '90–100 cm',
      oneTenToOneTwenty: '1.10–1.20 m',
      overOneThirty: '1.30 m and above',
    },
    difficulties: {
      beginner: 'Beginner',
      club: 'Club',
      regional: 'Regional',
      national: 'National',
    },
    disciplines: {
      showjumping: 'Show jumping',
      schooling: 'Schooling',
      pony: 'Pony',
    },
    licenses: {
      'free-to-ride': 'Free to download and ride, including club and training use. Please do not resell or republish the file itself.',
    },
    licenseUnconfirmed: 'These terms are not final yet.',
  },

  importGuide: {
    title: 'How to open this in CourseForge',
    lead: 'The app cannot open a course file straight from a tap yet, so there are three steps.',
    steps: [
      'Download the file. Your browser saves it — on iPhone it goes to Files, on Android to Downloads.',
      'Open CourseForge and go to Saved courses.',
      'Tap Import course and pick the file. It opens in the editor as a new course.',
    ],
    ios: 'On iPhone and iPad, the download lands in Files under Downloads. If Safari asks, choose Download rather than View.',
    android: 'On Android, the download lands in your Downloads folder and the file picker opens there by default.',
    note: 'Tapping the file itself will not open CourseForge yet. That is coming — the app has to register the file type with iOS and Android first.',
  },

  /** Unused while the blog is switched off — kept so the copy is not lost. */
  blog: {
    title: 'Blog',
    description: 'Notes on designing show jumping courses, and on building CourseForge.',
    lead: 'Notes on course design, and on building the app.',
    empty: 'No posts yet.',
    readingTime: 'min read',
    published: 'Published',
    updated: 'Updated',
    author: 'By',
    tags: 'Tags',
    tagTitle: 'Posts tagged',
    tagDescription: 'All CourseForge posts tagged',
    allPosts: 'All posts',
    rss: 'RSS feed',
    rssTitle: 'CourseForge — blog',
    rssDescription: 'Notes on designing show jumping courses, and on building CourseForge.',
    onlyInOtherLanguage: 'This post is only available in',
  },

  waitlist: {
    title: 'Join the waitlist',
    lead: 'One email when CourseForge reaches the App Store and Google Play. Nothing else, ever.',
    emailLabel: 'Email address',
    emailPlaceholder: 'you@example.com',
    consentLabel:
      'Store my email address so I can be told once, by email, when CourseForge launches. It will not be used for anything else and not shared with anyone.',
    submit: 'Join the waitlist',
    submitting: 'Adding you…',
    success: 'You are on the list. One email at launch, nothing else.',
    errorGeneric: 'That did not go through. Please try again in a moment.',
    errorEmail: 'Please check the email address.',
    errorConsent: 'Please tick the consent box so I am allowed to store your address.',
    stored: 'Stored: your email address and the time you signed up. Nothing else — no IP address, no browser, no referrer.',
  },

  store: {
    title: 'Get CourseForge',
    appleAlt: 'Coming soon to the App Store',
    googleAlt: 'Coming soon to Google Play',
    appleLine1: 'Coming soon to the',
    appleLine2: 'App Store',
    googleLine1: 'Coming soon to',
    googleLine2: 'Google Play',
  },

  impressum: {
    title: 'Impresszum',
    description: 'Service provider details for the CourseForge website, as required by Hungarian law.',
    lead: 'Published under the Hungarian E-commerce Act (2001. évi CVIII. törvény, Ekertv. § 4), which requires these details for a commercial online service.',
    fields: {
      name: 'Name',
      address: 'Registered address',
      taxNumber: 'Tax number (adószám)',
      registrationNumber: 'Registration number',
      registrationAuthority: 'Registering authority',
      email: 'Email',
    },
    pending: 'To be completed before launch',
    hosting: 'Hosting',
    hostingBody: 'This site is hosted by Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA.',
  },

  legal: {
    reviewNotice:
      'Draft. This text has not been through a final legal review and must be checked before launch.',
    lastUpdated: 'Last updated',
    contact: 'Questions about this page:',
  },

  footer: {
    legal: 'Legal',
    privacy: 'Privacy policy',
    terms: 'Terms',
    impressum: 'Impresszum',
    rights: 'CourseForge',
  },

  notFound: {
    title: 'Page not found',
    description: 'That page does not exist.',
    heading: 'That page does not exist.',
    lead: 'The link may be out of date, or the page may have moved.',
    cta: 'Go to the homepage',
  },
};

/**
 * The contract every locale must satisfy. Deliberately NOT `as const` — with
 * literal types, hu.ts would have to repeat the English strings verbatim to
 * typecheck. Widened strings give what we actually want: every key required,
 * any value.
 */
export type UIStrings = typeof en;
