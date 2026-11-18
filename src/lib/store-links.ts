/** HTTPS anchors work without JS. Native handoffs only run during a user click. */
export function enhanceStoreLinks(root = document, browser = window, device = navigator) {
  const ios = /iPad|iPhone|iPod/i.test(device.userAgent) ||
    (/Macintosh/i.test(device.userAgent) && device.maxTouchPoints > 1);
  const android = /Android/i.test(device.userAgent);
  let cancelPending = () => {};

  root.querySelectorAll<HTMLAnchorElement>('a[data-store]').forEach((link) => {
    link.addEventListener('click', (event) => {
      // Preserve open-in-new-tab, context menus, and links to the other platform.
      if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
          event.ctrlKey || event.shiftKey || event.altKey) return;
      const matchingStore = (ios && link.dataset.store === 'apple') ||
        (android && link.dataset.store === 'google');
      const nativeUrl = link.dataset.nativeUrl;
      if (!matchingStore || !nativeUrl) return;

      event.preventDefault();
      cancelPending();

      // Browsers may decline a custom scheme. Keep a web fallback, but cancel it
      // as soon as the store takes over so returning doesn't trigger a redirect.
      const finish = () => {
        browser.clearTimeout(timer);
        root.removeEventListener('visibilitychange', onVisibility);
        browser.removeEventListener('pagehide', finish);
      };
      const onVisibility = () => {
        if (root.visibilityState === 'hidden') finish();
      };
      const timer = browser.setTimeout(() => {
        finish();
        if (root.visibilityState === 'visible') browser.location.assign(link.href);
      }, 1800);
      cancelPending = finish;
      root.addEventListener('visibilitychange', onVisibility);
      browser.addEventListener('pagehide', finish);
      try {
        browser.location.assign(nativeUrl);
      } catch {
        finish();
        browser.location.assign(link.href);
      }
    });
  });
}
