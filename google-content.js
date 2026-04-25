(function () {
  const BLOCKED_PAGE = chrome.runtime.getURL("blocked.html");

  function goBlocked(reason) {
    location.replace(BLOCKED_PAGE + "?from=" + encodeURIComponent("google.com (" + reason + ")"));
  }

  function checkURL() {
    const params = new URLSearchParams(location.search);
    if (params.get("udm") === "39") {
      goBlocked("Shorts search");
      return;
    }
    const hash = location.hash;
    if (hash.includes("fpstate=ive") && hash.includes("vld=")) {
      goBlocked("Shorts player");
    }
  }

  // Check immediately — catches direct navigation to a URL that already has the hash.
  checkURL();

  // Catch traditional hash-fragment changes (e.g. location.hash = '...').
  window.addEventListener("hashchange", checkURL);

  // Google updates the URL via history.pushState, NOT via hash assignment, so
  // the hashchange event never fires. We intercept pushState/replaceState by
  // injecting a tiny shim into the page's own JS context (content scripts run
  // in an isolated world and can't monkey-patch the page's history object directly).
  const shim = document.createElement("script");
  shim.textContent = `(function(){
    function wrap(method) {
      const orig = history[method];
      history[method] = function(state, title, url) {
        orig.call(this, state, title, url);
        window.dispatchEvent(new CustomEvent("__ytsb_nav", { detail: String(url || location.href) }));
      };
    }
    wrap("pushState");
    wrap("replaceState");
  })();`;
  (document.head || document.documentElement).appendChild(shim);
  shim.remove();

  window.addEventListener("__ytsb_nav", function (e) {
    const url = e.detail || "";
    if ((url.includes("fpstate=ive") && url.includes("vld=")) || url.includes("udm=39")) {
      checkURL();
    }
  });

  // Final safety net: re-check once the DOM is fully ready,
  // in case the hash was set after document_start.
  document.addEventListener("DOMContentLoaded", checkURL);
})();
