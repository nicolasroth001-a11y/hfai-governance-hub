// HFAI Guard — content script.
// Intercepts text submissions on ChatGPT / Claude / Gemini before they're sent.
// Local fail-closed enforcement of EU AI Act Art.5, COPPA, and core safety patterns.

(() => {
  if (window.__HFAI_GUARD_LOADED__) return;
  window.__HFAI_GUARD_LOADED__ = true;

  const PATTERNS = [
    { pattern: /subliminal|manipulat(?:e|ion|ive)|coerci(?:on|ve)/i, label: "EU AI Act Art.5(1)(a) — Subliminal Manipulation" },
    { pattern: /exploit.*(?:vulnerab|elderly|disabled|child|minor)/i, label: "EU AI Act Art.5(1)(a) — Exploiting Vulnerable Groups" },
    { pattern: /social.?scor(?:e|ing)|citizen.?score|social.?credit/i, label: "EU AI Act Art.5(1)(c) — Social Scoring" },
    { pattern: /predictive.?polic|crime.?predict|criminal.?profil/i, label: "EU AI Act Art.5(1)(d) — Predictive Policing" },
    { pattern: /facial.?scrap|face.?databas|biometric.?scrap/i, label: "EU AI Act Art.5(1)(e) — Facial Scraping" },
    { pattern: /emotion.?recogni|emotion.?detect|sentiment.*(?:workplace|school|employee)/i, label: "EU AI Act Art.5(1)(f) — Workplace/School Emotion Recognition" },
    { pattern: /biometric.?categori|race.?detect|biometric.?classif/i, label: "EU AI Act Art.5(1)(g) — Biometric Categorisation" },
    { pattern: /(?:home|street|house)\s*address.*(?:child|kid|student|minor)/i, label: "COPPA — Minor PII (address)" },
    { pattern: /(?:phone|cell|mobile)\s*number.*(?:child|kid|student|minor)/i, label: "COPPA — Minor PII (phone)" },
    { pattern: /(?:how to|ways to|methods? of)\s+(?:kill|harm|hurt|cut)\s+(?:myself|yourself)/i, label: "Safety — Self-harm instruction request" },
    { pattern: /(?:explicit|sexual|nsfw|porn).*(?:child|kid|minor|teen|underage)/i, label: "Safety — CSAM (zero tolerance)" },
    // PII baseline — common patterns
    { pattern: /\b\d{3}-\d{2}-\d{4}\b/, label: "GDPR — US SSN detected" },
    { pattern: /\b(?:\d[ -]*?){13,16}\b/, label: "GDPR — Possible credit card number" },
  ];

  function check(text) {
    if (!text) return [];
    return PATTERNS.filter((p) => p.pattern.test(text)).map((p) => p.label);
  }

  function showBlocker(matches, text) {
    const overlay = document.createElement("div");
    overlay.className = "hfai-guard-overlay";
    overlay.innerHTML = `
      <div class="hfai-guard-modal" role="dialog" aria-labelledby="hfai-guard-title">
        <div class="hfai-guard-shield">🛡</div>
        <h2 id="hfai-guard-title">Blocked by HFAI Guard</h2>
        <p class="hfai-guard-sub">This prompt matches a regulated or unsafe pattern. It was not sent.</p>
        <ul class="hfai-guard-matches">
          ${matches.map((m) => `<li>${m.replace(/</g, "&lt;")}</li>`).join("")}
        </ul>
        <div class="hfai-guard-actions">
          <button class="hfai-guard-btn-primary" id="hfai-guard-ok">Got it</button>
          <a class="hfai-guard-link" href="https://hfa-i.org/customer/guard" target="_blank" rel="noopener">View dashboard →</a>
        </div>
        <p class="hfai-guard-foot">Free · Logged anonymously to your HFAI workspace</p>
      </div>
    `;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    overlay.querySelector("#hfai-guard-ok")?.addEventListener("click", close);

    try {
      chrome.runtime.sendMessage({ type: "HFAI_REPORT_BLOCK", text, matches });
    } catch { /* extension context lost */ }
  }

  function getInputText(el) {
    if (!el) return "";
    if (el.value !== undefined) return el.value;
    if (el.innerText !== undefined) return el.innerText;
    return "";
  }

  // Capture-phase Enter listener: stops the keystroke before any framework handler runs.
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.shiftKey || e.isComposing) return;
    const target = e.target;
    if (!target || !(target instanceof HTMLElement)) return;
    const tag = target.tagName;
    if (tag !== "TEXTAREA" && !target.isContentEditable && tag !== "INPUT") return;

    const text = getInputText(target);
    const matches = check(text);
    if (matches.length === 0) return;

    e.preventDefault();
    e.stopImmediatePropagation();
    showBlocker(matches, text);
  }, true);

  // Also intercept clicks on send buttons (covers paste-and-click flows).
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const btn = target.closest('button[data-testid*="send"], button[aria-label*="Send" i], button[aria-label*="submit" i]');
    if (!btn) return;
    const composer = document.querySelector('textarea, [contenteditable="true"]');
    const text = getInputText(composer);
    const matches = check(text);
    if (matches.length === 0) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    showBlocker(matches, text);
  }, true);
})();
