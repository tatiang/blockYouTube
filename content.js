const SELECTORS = [
  // Shorts shelf on home/subscriptions
  "ytd-rich-shelf-renderer[is-shorts]",
  "ytd-reel-shelf-renderer",
  // Shorts tab in channel pages
  "tp-yt-paper-tab:has(#tab-title:not([hidden]))",
  // Shorts items inside rich grid / search results
  "ytd-rich-item-renderer:has(a[href*='/shorts/'])",
  "ytd-video-renderer:has(a[href*='/shorts/'])",
  "ytd-compact-video-renderer:has(a[href*='/shorts/'])",
  "ytd-grid-video-renderer:has(a[href*='/shorts/'])",
  // Shorts chip in search filters
  "yt-chip-cloud-chip-renderer:has([title='Shorts'])",
  // Left-nav Shorts link
  "ytd-guide-entry-renderer:has(a[title='Shorts'])",
  "ytd-mini-guide-entry-renderer:has(a[title='Shorts'])",
  // Playables shelf and items
  "ytd-rich-item-renderer:has(a[href*='/playables'])",
  "ytd-video-renderer:has(a[href*='/playables'])",
  "ytd-compact-video-renderer:has(a[href*='/playables'])",
  // Left-nav Playables link
  "ytd-guide-entry-renderer:has(a[title='Playables'])",
  "ytd-mini-guide-entry-renderer:has(a[title='Playables'])",
  // Playables chip in search filters
  "yt-chip-cloud-chip-renderer:has([title='Playables'])",
];

const STYLE_ID = "ytsb-hide";

function injectStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  // CSS :has() covers most cases without JS intervention
  style.textContent = `
    ytd-rich-shelf-renderer[is-shorts],
    ytd-reel-shelf-renderer,
    ytd-rich-item-renderer:has(a[href*="/shorts/"]),
    ytd-video-renderer:has(a[href*="/shorts/"]),
    ytd-compact-video-renderer:has(a[href*="/shorts/"]),
    ytd-grid-video-renderer:has(a[href*="/shorts/"]),
    yt-chip-cloud-chip-renderer:has([title="Shorts"]),
    ytd-guide-entry-renderer:has(a[title="Shorts"]),
    ytd-mini-guide-entry-renderer:has(a[title="Shorts"]),
    ytd-rich-item-renderer:has(a[href*="/playables"]),
    ytd-video-renderer:has(a[href*="/playables"]),
    ytd-compact-video-renderer:has(a[href*="/playables"]),
    yt-chip-cloud-chip-renderer:has([title="Playables"]),
    ytd-guide-entry-renderer:has(a[title="Playables"]),
    ytd-mini-guide-entry-renderer:has(a[title="Playables"]) {
      display: none !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

const BLOCKED_PAGE = chrome.runtime.getURL("blocked.html");

function checkAndRedirect() {
  const path = location.pathname;
  if (path.startsWith("/shorts")) {
    location.replace(BLOCKED_PAGE + "?from=youtube.com%2Fshorts");
  } else if (path.startsWith("/playables")) {
    location.replace(BLOCKED_PAGE + "?from=youtube.com%2Fplayables");
  } else if (path.startsWith("/hashtag/shorts")) {
    location.replace(BLOCKED_PAGE + "?from=youtube.com%2Fhashtag%2Fshorts");
  } else if (/^\/@[^/]+\/shorts/.test(path)) {
    location.replace(BLOCKED_PAGE + "?from=youtube.com%2F%40channel%2Fshorts");
  }
}

// YouTube is a SPA — watch for url changes via yt-navigate-finish
document.addEventListener("yt-navigate-finish", checkAndRedirect);

injectStyle();
checkAndRedirect();

// MutationObserver as a fallback for elements the CSS selector misses
// (e.g. older YouTube layouts without full :has() support)
const observer = new MutationObserver(() => {
  for (const sel of SELECTORS) {
    try {
      document.querySelectorAll(sel).forEach((el) => {
        el.style.setProperty("display", "none", "important");
      });
    } catch {
      // :has() may throw in older Chromium builds — CSS handles it instead
    }
  }
});

observer.observe(document.documentElement, { childList: true, subtree: true });
