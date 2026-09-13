/**
 * Hungarian UI strings.
 *
 * Written as Hungarian, not translated from English: sentence rhythm and word
 * order are native, and the terminology matches what the app itself says
 * (course_forge/lib/l10n/app_hu.arb) so the site and the app never call the
 * same thing two different names. Key terms held to the app's usage:
 *
 *   pálya · akadály · aréna · nyomvonal · pályasorrend · vágtaugrás
 *   meredek · oxer · kombináció · vizesárok · vizestálca · kitörő · rúd · talaj
 *
 * `: UIStrings` is what makes a missing key a build error.
 */
import type { UIStrings } from './en';

export const hu: UIStrings = {
  meta: {
    locale: 'hu',
    localeName: 'Magyar',
    htmlLang: 'hu',
    ogLocale: 'hu_HU',
    switchTo: 'English',
    switchToLabel: 'Váltás angol nyelvre',
  },

  nav: {
    home: 'Főoldal',
    features: 'Funkciók',
    pricing: 'Árak',
    courses: 'Pályák',
    blog: 'Blog',
    menu: 'Menü',
    openMenu: 'Menü megnyitása',
    closeMenu: 'Menü bezárása',
    skipToContent: 'Ugrás a tartalomra',
  },

  common: {
    appName: 'CourseForge',
    tagline: 'Tervezz pontosan. Lovagolj magabiztosan.',
    comingSoon: 'Hamarosan',
    preRelease: 'Megjelenés előtt',
    readMore: 'Tovább',
    backTo: 'Vissza:',
    download: 'Letöltés',
    metres: 'm',
    and: 'és',
  },

  home: {
    title: 'CourseForge — díjugrató pályatervező iOS-re és Androidra',
    description:
      'Tervezz díjugrató pályát telefonon vagy tableten. Méterre pontos akadályok, számozott pályasorrend, javasolt nyomvonal és nyomtatható terv. Internet nélkül is működik.',
    heroTitle: 'Pályát tervezni? Gyerekjáték.',
    heroLead: 'Tölts kevesebb időt a pálya tervezésével, és többet azzal, ami igazán számít.',
    heroSub:
      'Gyors, egyszerű és precíz díjugrató pályatervezés – bárhol, közvetlenül a telefonodról.',
    heroScreenshotAlt: 'A CourseForge szerkesztő számozott pályával és a javasolt nyomvonallal',
    heroSceneAlt:
      'Egy meredek és egy oxer, köztük ívelt patanyomsorral, amely a ló által belovagolt vonalat mutatja.',

    whatTitle: 'Mit tud',
    what: [
      {
        title: 'Méretarányos aréna',
        body: 'Az aréna méretét szabadon állíthatod, így a pálya mindig a valós méreteket követi.',
      },
      {
        title: 'Egyszerű akadályelhelyezés',
        body: 'Az akadályok gyorsan mozgathatók, forgathatók és pontosan pozicionálhatók.',
      },
      {
        title: 'Látható távolságok és vonalak',
        body: 'Az app segít a távolságok és a lovaglási vonalak megtervezésében.',
      },
      {
        title: 'Export és megosztás',
        body: 'A kész pálya PDF-ként vagy képként menthető és könnyen megosztható.',
      },
    ],

    screenshotsTitle: 'Az alkalmazásban',
    screenshotsLead: 'Képek a mostani változatból, magyar nyelven.',

    offlineTitle: 'Nincs fiók. A pályáid nálad maradnak.',
    offlineBody: [
      'A CourseForge használatához nem kell regisztrálnod, a pályatervezéshez pedig nincs szükség állandó internetkapcsolatra.',
      'A terveid és beállításaid közvetlenül a saját eszközödön tárolódnak. A pályáidat sem töltjük fel saját szerverre, csak akkor hagyják el az eszközödet, ha te exportálod vagy megosztod őket.',
    ],
    offlineClosing: 'Te tervezed. Az eszközöd tárolja. Te döntöd el, mit osztasz meg.',
    offlineNote:
      'A Free verzió hirdetései és a Pro-vásárlások működtetése során külső szolgáltatók korlátozott technikai és vásárlási adatokat kezelhetnek. Erről részletesen az Adatkezelési tájékoztatóban olvashatsz.',

    coursesTeaserTitle: 'Kész pályák',
    coursesTeaserLead: 'Töltsd le egy teljes pályát, nyisd meg a CourseForge-ban, aztán lovagold vagy alakítsd át.',
    coursesTeaserCta: 'Pályák megtekintése',
  },

  features: {
    title: 'Funkciók',
    description:
      'Amit a CourseForge ma tud: méretarányos aréna, 25 elemtípus, igazítás és illesztés, pályasorrend, javasolt nyomvonal, vágtaugrás-becslés, eszközlista, PDF- és képexport.',
    groups: [
      {
        title: 'Az aréna',
        items: [
          'Az aréna szélessége és hosszúsága 10 és 300 méter között szabadon változtatható.',
          'Négy talajszín.',
          'Állítható rácsköz.',
        ],
      },
      {
        title: 'Akadályok és elemek',
        items: [
          'Széleskörű akadályválaszték.',
          'Start- és céljelölő, akadályszámozás, zsűri, bejárat és kijárat.',
          'Díszítőelemek: virágláda, virágok, bokor, fa, bója és zászló.',
          'Az akadályok alapból 3,0 méter szélesek, viszont a szélesség állítható.',
          'Két- vagy háromelemű kombináció, minden elem külön típussal, és külön beállítható távolsággal.',
        ],
      },
      {
        title: 'Tervezés',
        items: [
          'Egyszerű kijelölés, mozgatás, forgatás.',
          'Másolás, törlés és rétegsorrend.',
          'Mozgasd, nagyítsd az arénát, hogy egyszerűbb legyen a szerkesztés.',
        ],
      },
      {
        title: 'Pontos munka',
        items: [
          'Igazítás a rácshoz, másik akadályhoz és középpontokhoz, segédvonalakkal.',
          'Helyezz le pontokat a távolságok méréséhez.',
          'Látod a szükséges kitörők és rudak számát, így nem kell számolgatnod.',
        ],
      },
      {
        title: 'Pályasorrend és a vonal',
        items: [
          'Érintsd meg az akadályokat lovaglási sorrendben, és számozd meg őket.',
          'Szaggatott vonal köti össze a számozott akadályokat, amelyet pontok segítségével szabadon mozgathatsz.',
          'Vágtaugrások száma 31 méterig, becslésként jelölve.',
        ],
      },
      {
        title: 'Ne veszítsd el a munkád',
        items: ['Ötven lépésig visszavonás.', 'Automatikus mentés.', 'A befejezetlen pályáidat a Mentett pályák között találod.'],
      },
      {
        title: 'Export',
        items: [
          'Szerkeszthető CourseForge-fájl, A4-es PDF — ami fekvő lesz, ha az aréna szélesebb, mint amilyen hosszú —, vagy kép.',
          'Választhatsz jól olvasható tervet nagyobb jelekkel, vagy valósághű méretarányt, ami megtartja az akadályok igazi arányait.',
          'Export előtt ki- és bekapcsolható a nyomvonal, a távolságok, a vágtaugrások, a mérések és a rács.',
        ],
      },
      {
        title: 'Testreszabás',
        items: ['Magyar és angol nyelv.', 'Méter, vagy láb és hüvelyk.'],
      },
    ],
  },

  pricing: {
    title: 'Árak',
    description:
      'A CourseForge ingyenes és hirdetéssel támogatott. A Lifetime Pro egyszeri fizetés: eltűnnek a hirdetések, és feloldódik az arénaméret, az összes talajszín és a bővített elemtár.',
    heading: 'Ingyenes. Pro, ha többet szeretnél.',

    freeName: 'Ingyenes',
    freePrice: '0',
    freeTagline: 'Hirdetéssel támogatott. Minden benne van, ami egy pálya megtervezéséhez és megosztásához kell.',
    freeFeatures: [
      'Teljes pálya tervezése, számozása és exportálása',
      'Export PDF-be, képbe vagy szerkeszthető CourseForge-fájlba',
      'Hirdetéseket jelenít meg',
    ],

    proName: 'Lifetime Pro',
    proTagline: 'Egyszeri fizetés. Nincs előfizetés, nincs megújítás.',
    proBadge: 'Egyszeri',
    proFeatures: [
      'Nincs hirdetés',
      'Tetszőleges arénaméret',
      'Az összes talajszín',
      'Bővített elemtár',
      'Minden, ami az ingyenes verzióban',
    ],

    priceNote:
      'Irányárak. Az App Store és a Google Play a helyi pénznemre vált, és hozzáadja a helyi adót, így országonként eltérhet, amit ténylegesen fizetsz.',
  },

  courses: {
    title: 'Pályák',
    description:
      'Töltsd le a kész díjugrató pályákat, és nyisd meg őket a CourseForge-ban. Szűrhetsz nehézség és akadálymagasság szerint.',
    lead: 'Teljes pályák, amiket letölthetsz és megnyithatsz a CourseForge-ban — aztán lovagolhatod így, vagy átalakíthatsz rajta bármit.',
    filterTitle: 'Szűrés',
    filterDifficulty: 'Nehézség',
    filterHeight: 'Akadálymagasság',
    filterAll: 'Mind',
    filterResults: 'pálya',
    filterResultsPlural: 'pálya',
    filterNone: 'Egy pálya sem felel meg a szűrésnek.',
    filterClear: 'Szűrés törlése',
    empty: 'Még nincs közzétett pálya.',

    metaDifficulty: 'Nehézség',
    metaHeight: 'Akadálymagasság',
    metaArena: 'Aréna',
    metaDesigner: 'Pályaépítő',
    metaDiscipline: 'Szakág',
    metaPublished: 'Közzétéve',
    metaObstacles: 'Számozott akadályok',
    metaRouteLength: 'Nyomvonal hossza',
    metaLicense: 'Felhasználás',

    planCaption: 'A pályaterv a letölthető fájlból készült.',
    planAlt: 'A pálya felülnézeti terve',

    downloadTitle: 'A pálya letöltése',
    downloadCta: 'CourseForge-fájl letöltése',
    downloadMeta: 'CourseForge-fájl',
    fileContentsTitle: 'Mi van a fájlban',
    fileContents:
      'Az aréna mérete és talaja, minden akadály a helyével, szélességével és forgatásával, a pályasorrend a számokkal és kombinációjelölésekkel, valamint a nyomvonal. Eszközre vagy személyre utaló adat nincs benne — lásd az adatvédelmi tájékoztatót.',

    heights: {
      upTo80: 'Legfeljebb 80 cm',
      ninetyToHundred: '90–100 cm',
      oneTenToOneTwenty: '1,10–1,20 m',
      overOneThirty: '1,30 m és fölötte',
    },
    difficulties: {
      beginner: 'Kezdő',
      club: 'Klub',
      regional: 'Regionális',
      national: 'Országos',
    },
    disciplines: {
      showjumping: 'Díjugratás',
      schooling: 'Iskolamunka',
      pony: 'Póni',
    },
    licenses: {
      'free-to-ride':
        'Szabadon letölthető és lovagolható, klub- és edzéshasználatra is. A fájlt kérlek ne add el és ne tedd közzé újra máshol.',
    },
    licenseUnconfirmed: 'Ezek a feltételek még nem véglegesek.',
  },

  importGuide: {
    title: 'Így nyitod meg a CourseForge-ban',
    lead: 'Az alkalmazás egyelőre nem tudja egy érintésre megnyitni a pályafájlt, ezért három lépés kell hozzá.',
    steps: [
      'Töltsd le a fájlt. A böngésző elmenti — iPhone-on a Fájlok, Androidon a Letöltések közé.',
      'Nyisd meg a CourseForge-ot, és menj a Mentett pályák menüpontra.',
      'Érintsd meg a Pálya importálása lehetőséget, és válaszd ki a fájlt. Új pályaként nyílik meg a szerkesztőben.',
    ],
    ios: 'iPhone-on és iPaden a letöltés a Fájlok alkalmazás Letöltések mappájába kerül. Ha a Safari rákérdez, a Letöltést válaszd, ne a Megtekintést.',
    android: 'Androidon a letöltés a Letöltések mappába kerül, és a fájlválasztó is ott nyílik meg.',
    note: 'Magára a fájlra koppintva egyelőre nem nyílik meg a CourseForge. Ez még jönni fog — előbb az alkalmazásnak be kell jelentenie a fájltípust az iOS-nél és az Androidnál.',
  },

  /** Unused while the blog is switched off — kept so the copy is not lost. */
  blog: {
    title: 'Blog',
    description: 'Jegyzetek a díjugrató pályatervezésről és a CourseForge fejlesztéséről.',
    lead: 'Jegyzetek a pályatervezésről és az alkalmazás készítéséről.',
    empty: 'Még nincs bejegyzés.',
    readingTime: 'perc olvasás',
    published: 'Közzétéve',
    updated: 'Frissítve',
    author: 'Szerző:',
    tags: 'Címkék',
    tagTitle: 'Bejegyzések ezzel a címkével:',
    tagDescription: 'A CourseForge minden bejegyzése ezzel a címkével:',
    allPosts: 'Összes bejegyzés',
    rss: 'RSS-hírcsatorna',
    rssTitle: 'CourseForge — blog',
    rssDescription: 'Jegyzetek a díjugrató pályatervezésről és a CourseForge fejlesztéséről.',
    onlyInOtherLanguage: 'Ez a bejegyzés csak ezen a nyelven olvasható:',
  },

  waitlist: {
    title: 'Feliratkozás',
    lead: 'Egyetlen e-mail, amikor a CourseForge felkerül az App Store-ba és a Google Play-re. Semmi más, soha.',
    emailLabel: 'E-mail-cím',
    emailPlaceholder: 'te@pelda.hu',
    consentLabel:
      'Hozzájárulok, hogy az e-mail-címemet eltároljátok, és a megjelenéskor egyszer e-mailben értesítsetek. Más célra nem használjátok, és nem adjátok ki senkinek.',
    submit: 'Feliratkozom',
    submitting: 'Feliratkozás…',
    success: 'Felkerültél a listára. A megjelenéskor egy e-mail, más semmi.',
    errorGeneric: 'Ez most nem sikerült. Kérlek, próbáld újra egy kicsit később.',
    errorEmail: 'Kérlek, ellenőrizd az e-mail-címet.',
    errorConsent: 'Kérlek, jelöld be a hozzájárulást, hogy eltárolhassam a címedet.',
    stored: 'Amit eltárolunk: az e-mail-címed és a feliratkozás időpontja. Semmi más — se IP-cím, se böngésző, se hivatkozó oldal.',
  },

  store: {
    title: 'A CourseForge letöltése',
    appleAlt: 'Hamarosan az App Store-ban',
    googleAlt: 'Hamarosan a Google Play-en',
    appleLine1: 'Hamarosan az',
    appleLine2: 'App Store-ban',
    googleLine1: 'Hamarosan a',
    googleLine2: 'Google Play-en',
  },

  impressum: {
    title: 'Impresszum',
    description: 'A CourseForge weboldal szolgáltatói adatai, az Ekertv. előírásai szerint.',
    lead: 'A 2001. évi CVIII. törvény (Ekertv.) 4. §-a alapján közzétett szolgáltatói adatok, amelyeket kereskedelmi célú online szolgáltatásnál kötelező megadni.',
    fields: {
      name: 'Név',
      address: 'Székhely',
      taxNumber: 'Adószám',
      registrationNumber: 'Nyilvántartási szám',
      registrationAuthority: 'Nyilvántartó hatóság',
      email: 'E-mail',
    },
    pending: 'Megjelenés előtt kitöltendő',
    hosting: 'Tárhelyszolgáltató',
    hostingBody: 'Az oldal tárhelyszolgáltatója a Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA.',
  },

  legal: {
    reviewNotice:
      'Munkaváltozat. Ezt a szöveget még nem véglegesítette jogi ellenőrzés, megjelenés előtt ellenőrizni kell.',
    lastUpdated: 'Utolsó módosítás',
    contact: 'Kérdés ezzel az oldallal kapcsolatban:',
  },

  footer: {
    legal: 'Jogi',
    privacy: 'Adatvédelem',
    terms: 'Felhasználási feltételek',
    impressum: 'Impresszum',
    rights: 'CourseForge',
  },

  notFound: {
    title: 'Nincs ilyen oldal',
    description: 'Ez az oldal nem létezik.',
    heading: 'Ez az oldal nem létezik.',
    lead: 'Lehet, hogy a hivatkozás elavult, vagy az oldal máshova került.',
    cta: 'Vissza a főoldalra',
  },
};
