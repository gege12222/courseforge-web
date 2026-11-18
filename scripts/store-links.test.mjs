import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import { readSiteConfig } from './read-site-config.mjs';

const { STORES } = await readSiteConfig();
const source = await readFile(new URL('../src/lib/store-links.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const exports = {};
vm.runInNewContext(outputText, { exports });
const { enhanceStoreLinks } = exports;

function setup(userAgent, maxTouchPoints = 0) {
  const links = Object.entries(STORES).map(([store, urls]) => Object.assign(new EventTarget(), {
    href: urls.web,
    dataset: { store, nativeUrl: urls.native },
  }));
  const root = Object.assign(new EventTarget(), {
    visibilityState: 'visible', querySelectorAll: () => links,
  });
  const timers = new Map();
  const visits = [];
  let nextTimer = 0;
  const browser = Object.assign(new EventTarget(), {
    setTimeout: (fn) => { timers.set(++nextTimer, fn); return nextTimer; },
    clearTimeout: (id) => timers.delete(id),
    location: { assign: (url) => visits.push(url) },
  });
  enhanceStoreLinks(root, browser, { userAgent, maxTouchPoints });
  return {
    root, browser, visits, timers,
    click(store, options = {}) {
      const event = Object.assign(new Event('click', { cancelable: true }), { button: 0, ...options });
      links.find((link) => link.dataset.store === store).dispatchEvent(event);
      return event;
    },
    tick() { for (const [id, fn] of [...timers]) { timers.delete(id); fn(); } },
    hide() { root.visibilityState = 'hidden'; root.dispatchEvent(new Event('visibilitychange')); },
  };
}

test('published listing IDs and the Android intent fallback are correct', () => {
  assert.equal(STORES.apple.web, 'https://apps.apple.com/us/app/courseforge/id6798715396');
  assert.equal(STORES.google.web, 'https://play.google.com/store/apps/details?id=com.gege.courseforge');
  assert.match(STORES.google.native, /^intent:\/\/details\?id=com\.gege\.courseforge#Intent;scheme=market;package=com\.android\.vending;/);
  assert.equal(decodeURIComponent(STORES.google.native.match(/S.browser_fallback_url=([^;]+)/)[1]), STORES.google.web);
});

for (const [name, ua, touches] of [
  ['iPhone Safari', 'Mozilla/5.0 (iPhone) AppleWebKit Safari/604.1', 1],
  ['iPhone Chrome', 'Mozilla/5.0 (iPhone) AppleWebKit CriOS/142', 1],
  ['iPad desktop mode', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit Safari/605.1', 5],
]) {
  test(`${name} attempts the native App Store`, () => {
    const s = setup(ua, touches);
    assert.equal(s.click('apple').defaultPrevented, true);
    assert.deepEqual(s.visits, ['itms-apps://apps.apple.com/app/id6798715396']);
  });
}

test('Android attempts Google Play in the store app', () => {
  const s = setup('Mozilla/5.0 (Linux; Android 15) Chrome/142');
  assert.equal(s.click('google').defaultPrevented, true);
  assert.deepEqual(s.visits, [STORES.google.native]);
});

test('desktop and opposite-platform links keep their HTTPS navigation', () => {
  for (const [ua, store] of [['Windows NT 10.0', 'apple'], ['Macintosh', 'apple'], ['iPhone', 'google'], ['Android', 'apple']]) {
    const s = setup(ua);
    assert.equal(s.click(store).defaultPrevented, false);
    assert.deepEqual(s.visits, []);
  }
});

test('modifier clicks and middle clicks keep normal browser behavior', () => {
  for (const options of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }, { shiftKey: true }, { button: 1 }]) {
    const s = setup('iPhone');
    assert.equal(s.click('apple', options).defaultPrevented, false);
    assert.deepEqual(s.visits, []);
  }
});

test('a blocked handoff falls back to the HTTPS listing', () => {
  for (const [ua, store] of [['iPhone', 'apple'], ['Android', 'google']]) {
    const s = setup(ua);
    s.click(store);
    s.tick();
    assert.deepEqual(s.visits, [STORES[store].native, STORES[store].web]);
    assert.equal(s.timers.size, 0);
  }
});

test('returning after a successful native handoff does not redirect to the web', () => {
  const s = setup('iPhone');
  s.click('apple');
  s.hide();
  s.root.visibilityState = 'visible';
  s.tick();
  assert.deepEqual(s.visits, [STORES.apple.native]);
  assert.equal(s.timers.size, 0);
});

test('pagehide cancels pending navigation', () => {
  const s = setup('Android');
  s.click('google');
  s.browser.dispatchEvent(new Event('pagehide'));
  s.tick();
  assert.deepEqual(s.visits, [STORES.google.native]);
});

test('repeated taps leave only one fallback', () => {
  const s = setup('iPhone');
  s.click('apple');
  s.click('apple');
  assert.equal(s.timers.size, 1);
  s.tick();
  assert.deepEqual(s.visits, [STORES.apple.native, STORES.apple.native, STORES.apple.web]);
});

test('a synchronous native-navigation error immediately uses the web listing', () => {
  const s = setup('iPhone');
  s.browser.location.assign = (url) => {
    if (url.startsWith('itms-apps:')) throw new Error('Unsupported scheme');
    s.visits.push(url);
  };
  s.click('apple');
  assert.deepEqual(s.visits, [STORES.apple.web]);
  assert.equal(s.timers.size, 0);
});
