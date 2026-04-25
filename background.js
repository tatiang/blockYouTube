// Keeps the declarativeNetRequest ruleset enabled across browser restarts.
// No additional logic needed — rules.json handles URL-level redirects.
chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds: ["ruleset_shorts"],
  });
});
