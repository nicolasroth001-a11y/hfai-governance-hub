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

  function resubmit(originalTarget) {
    // Re-fire the original submission on the host page (ChatGPT/Claude/Gemini)
    try {
      const composer = originalTarget && document.body.contains(originalTarget)
        ? originalTarget
        : document.querySelector('textarea, [contenteditable="true"]');
      if (!composer) return;
      composer.focus?.();
      // Try to click the send button first (most reliable across hosts)
      const btn = document.querySelector(
        'button[data-testid*="send"], button[aria-label*="Send" i], button[aria-label*="submit" i]'
      );
      if (btn && !btn.disabled) {
        btn.click();
        return;
      }
      // Fallback: dispatch a synthetic Enter keydown that bypasses our capture listener
      const ev = new KeyboardEvent("keydown", {
        key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true, cancelable: true,
      });
      Object.defineProperty(ev, "__hfaiOverride", { value: true });
      composer.dispatchEvent(ev);
    } catch (e) { console.warn("[HFAI Guard] resubmit failed", e); }
  }

  function showBlocker(matches, text, originalTarget) {
    const overlay = document.createElement("div");
    overlay.className = "hfai-guard-overlay";
    overlay.innerHTML = `
      <div class="hfai-guard-modal" role="dialog" aria-labelledby="hfai-guard-title">
        <div class="hfai-guard-shield">🛡</div>
        <h2 id="hfai-guard-title">Blocked by HFAI Guard</h2>
        <p class="hfai-guard-sub">This prompt matches a regulated or unsafe pattern. Review before sending.</p>
        <ul class="hfai-guard-matches">
          ${matches.map((m) => `<li>${m.replace(/</g, "&lt;")}</li>`).join("")}
        </ul>
        <div class="hfai-guard-step" id="hfai-guard-step1">
          <div class="hfai-guard-actions">
            <button class="hfai-guard-btn-secondary" id="hfai-guard-cancel">Cancel &amp; edit prompt</button>
            <button class="hfai-guard-btn-primary" id="hfai-guard-ack">I understand — send anyway</button>
          </div>
        </div>
        <div class="hfai-guard-step" id="hfai-guard-step2" style="display:none">
          <p class="hfai-guard-confirm">This override will be logged to your audit trail with your device ID and timestamp.</p>
          <div class="hfai-guard-actions">
            <button class="hfai-guard-btn-secondary" id="hfai-guard-back">Back</button>
            <button class="hfai-guard-btn-primary" id="hfai-guard-confirm">Confirm &amp; send</button>
          </div>
        </div>
        <p class="hfai-guard-foot">
          <a class="hfai-guard-link" href="https://hfa-i.org/customer/guard" target="_blank" rel="noopener">View dashboard →</a>
          &nbsp;·&nbsp; Logged to your HFAI workspace
        </p>
      </div>
    `;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    const step1 = overlay.querySelector("#hfai-guard-step1");
    const step2 = overlay.querySelector("#hfai-guard-step2");

    overlay.querySelector("#hfai-guard-cancel")?.addEventListener("click", close);
    overlay.querySelector("#hfai-guard-back")?.addEventListener("click", () => {
      step2.style.display = "none"; step1.style.display = "block";
    });
    overlay.querySelector("#hfai-guard-ack")?.addEventListener("click", () => {
      step1.style.display = "none"; step2.style.display = "block";
    });
    overlay.querySelector("#hfai-guard-confirm")?.addEventListener("click", () => {
      try {
        chrome.runtime.sendMessage({ type: "HFAI_REPORT_OVERRIDE", text, matches });
      } catch { /* extension context lost */ }
      close();
      // Slight delay so React/host frameworks settle after overlay removal
      setTimeout(() => resubmit(originalTarget), 50);
    });

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
    if (e.__hfaiOverride) return; // user-confirmed override re-fire
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
    showBlocker(matches, text, target);
  }, true);

  // Also intercept clicks on send buttons (covers paste-and-click flows).
  document.addEventListener("click", (e) => {
    if (e.__hfaiOverride) return;
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
    showBlocker(matches, text, composer);
  }, true);
})();
