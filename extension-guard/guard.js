// HFAI Guard — content script.
// Intercepts text submissions on ChatGPT / Claude / Gemini before they're sent.
// Local fail-closed enforcement of EU AI Act Art.5, COPPA, and core safety patterns.

(() => {
  if (window.__HFAI_GUARD_LOADED__) return;
  window.__HFAI_GUARD_LOADED__ = true;

  // Reusable fragments
  const PERSONS = "(?:people|humans?|citizens?|individuals?|persons?|users?|employees?|workers?|staff|students?|pupils?|residents?|customers?|applicants?|candidates?|tenants?|patients?|voters?|kids?|children|minors?|teens?|adults?|men|women)";
  const SCORE_VERB = "(?:rank|score|rate|grade|classify|categori[sz]e|profile|sort|tier|judge|evaluate|assess)";
  const PREDICT_TARGETS = "(?:crime|criminal|offender|recidivism|reoffend|guilt|threat|terror|violence|fraud|risk\\s+of\\s+(?:crime|offen))";

  const PATTERNS = [
    // Art.5(1)(a) — Subliminal / manipulative techniques
    { pattern: /subliminal|manipulat(?:e|ing|ion|ive)|coerci(?:on|ve)|dark.?pattern|nudg(?:e|ing).*(?:without|against).*(?:consent|will|knowledge)/i, label: "EU AI Act Art.5(1)(a) — Subliminal Manipulation" },
    { pattern: /(?:influence|persuade|push|trick|deceive|mislead)\s+\w*\s*(?:people|users?|consumers?|voters?|children)\s+(?:without|against)\s+(?:their\s+)?(?:consent|knowledge|awareness|will)/i, label: "EU AI Act Art.5(1)(a) — Covert Influence" },

    // Art.5(1)(b) — Exploiting vulnerabilities
    { pattern: /exploit\w*.{0,40}(?:vulnerab|elderly|disab|child|minor|poor|homeless|addict|mental|cognitive|grief|debt)/i, label: "EU AI Act Art.5(1)(b) — Exploiting Vulnerable Groups" },
    { pattern: /target\w*.{0,30}(?:elderly|disabled|children|minors|low.?income|homeless|addicts?|grieving)/i, label: "EU AI Act Art.5(1)(b) — Targeting Vulnerable Groups" },

    // Art.5(1)(c) — Social scoring / ranking persons
    { pattern: /social.?scor(?:e|ing)|citizen.?score|social.?credit/i, label: "EU AI Act Art.5(1)(c) — Social Scoring" },
    { pattern: new RegExp(`${SCORE_VERB}\\s+(?:all\\s+|every\\s+|each\\s+)?${PERSONS}\\b`, "i"), label: "EU AI Act Art.5(1)(c) — Scoring/Ranking of Persons" },
    { pattern: new RegExp(`(?:scoring|ranking|rating|grading|profiling|classification)\\s+system\\s+(?:for|of|on)\\s+${PERSONS}`, "i"), label: "EU AI Act Art.5(1)(c) — System to Score Persons" },
    { pattern: new RegExp(`${PERSONS}\\s+(?:scoring|ranking|rating|grading|profiling)\\s+system`, "i"), label: "EU AI Act Art.5(1)(c) — Person-scoring system" },
    { pattern: /(?:behaviou?r|trustworthiness|reputation|loyalty|character|honesty|productivity)\s+(?:score|rating|index|ranking|tier)/i, label: "EU AI Act Art.5(1)(c) — Behavioral Scoring of Persons" },
    { pattern: new RegExp(`(?:assign|give|create|build|make|design|develop)\\s+\\w*\\s*(?:a\\s+)?(?:score|rating|rank|grade|tier)\\s+(?:to|for)\\s+${PERSONS}`, "i"), label: "EU AI Act Art.5(1)(c) — Assigning scores to persons" },

    // Art.5(1)(d) — Predictive policing
    { pattern: /predictive.?polic|crime.?predict|criminal.?profil|pre.?crime/i, label: "EU AI Act Art.5(1)(d) — Predictive Policing" },
    { pattern: new RegExp(`predict\\w*.{0,40}${PREDICT_TARGETS}`, "i"), label: "EU AI Act Art.5(1)(d) — Predictive Policing (paraphrase)" },
    { pattern: new RegExp(`(?:identif|find|flag|detect)\\w*.{0,40}(?:future|potential|likely)\\s+(?:criminal|offender|terrorist|threat)`, "i"), label: "EU AI Act Art.5(1)(d) — Future-criminal identification" },

    // Art.5(1)(e) — Untargeted scraping of facial images
    { pattern: /facial.?scrap|face.?databas|biometric.?scrap|scrape.{0,30}(?:faces?|facial|images?\s+of\s+people)|harvest.{0,30}faces?|build.{0,40}face\s+(?:database|recognition)\s+(?:from|using)\s+(?:internet|web|social|cctv)/i, label: "EU AI Act Art.5(1)(e) — Facial Scraping" },

    // Art.5(1)(f) — Emotion recognition in workplace / school
    { pattern: /emotion.?recogni|emotion.?detect|sentiment.{0,20}(?:workplace|school|employee|worker|student|classroom)/i, label: "EU AI Act Art.5(1)(f) — Emotion Recognition" },
    { pattern: /detect.{0,30}(?:emotion|mood|feeling|stress|engagement|attention)\s+(?:of|in|from|among)\s+(?:employee|worker|student|classroom|workplace|staff|pupil)/i, label: "EU AI Act Art.5(1)(f) — Emotion Recognition (paraphrase)" },

    // Art.5(1)(g) — Biometric categorisation by sensitive traits
    { pattern: /biometric.?categori|race.?detect|biometric.?classif/i, label: "EU AI Act Art.5(1)(g) — Biometric Categorisation" },
    { pattern: /(?:infer|determine|predict|detect|classify|identify)\s+\w*\s*(?:race|ethnicity|religion|sexual.?orientation|gender.?identity|political.?(?:view|opinion|affiliation)|union\s+membership)\s+(?:from|using|by)\s+(?:face|biometric|voice|photo|image)/i, label: "EU AI Act Art.5(1)(g) — Inferring Sensitive Traits" },

    // Art.5(1)(h) — Real-time remote biometric identification in public
    { pattern: /real.?time.{0,30}biometric|remote.{0,30}identif.{0,30}public|facial.{0,30}recognition.{0,30}(?:public|street|crowd|protest|rally)|live.{0,20}face.{0,20}(?:recognition|matching)/i, label: "EU AI Act Art.5(1)(h) — Real-time Remote Biometric ID" },

    // COPPA — children's PII
    { pattern: /(?:home|street|house|residential|mailing)\s*address.{0,40}(?:child|kid|student|minor|pupil|teen|under.?13|under.?age)/i, label: "COPPA — Minor PII (address)" },
    { pattern: /(?:phone|cell|mobile|contact)\s*number.{0,40}(?:child|kid|student|minor|pupil|teen|under.?13|under.?age)/i, label: "COPPA — Minor PII (phone)" },
    { pattern: /(?:collect|gather|store|harvest)\s+\w*\s*(?:data|information|info|details|pii)\s+(?:on|about|from)\s+(?:children|kids|minors|under.?13|pupils|students under)/i, label: "COPPA — Collecting Minor Data" },

    // Safety — self-harm
    { pattern: /(?:how\s+to|ways?\s+to|methods?\s+of|best\s+way\s+to|easiest\s+way\s+to|help\s+me)\s+(?:kill|harm|hurt|cut|injure|end)\s+(?:myself|yourself|himself|herself|themselves|my\s+life|your\s+life)/i, label: "Safety — Self-harm instruction request" },
    { pattern: /(?:commit\s+suicide|suicide\s+method|painless\s+(?:death|suicide))/i, label: "Safety — Suicide method request" },

    // Safety — CSAM (zero tolerance)
    { pattern: /(?:explicit|sexual|nsfw|porn|nude|naked|erotic)\w*.{0,40}(?:child|kid|minor|teen|underage|under.?18|pre.?teen|toddler|infant)/i, label: "Safety — CSAM (zero tolerance)" },
    { pattern: /(?:child|minor|underage|kid)\s*(?:porn|sex|sexual|erotic|nude)/i, label: "Safety — CSAM (zero tolerance)" },

    // Safety — weapons / mass harm
    { pattern: /(?:how\s+to|instructions?\s+(?:for|to)|guide\s+to|recipe\s+for)\s+(?:make|build|synthesi[sz]e|create|manufacture)\s+\w*\s*(?:bomb|explosive|ied|nerve\s+agent|sarin|ricin|anthrax|bioweapon|chemical\s+weapon|nuclear\s+weapon|dirty\s+bomb|pipe\s+bomb)/i, label: "Safety — Weapon/Mass-harm instructions" },
    { pattern: /(?:synthesi[sz]e|manufacture|cook)\s+(?:methamphetamine|fentanyl|heroin|cocaine|mdma)/i, label: "Safety — Illicit Drug Synthesis" },

    // Safety — malware / cyberattack
    { pattern: /(?:write|create|generate|build|make)\s+\w*\s*(?:malware|ransomware|keylogger|spyware|rootkit|trojan|virus|worm|backdoor|exploit\s+code|0.?day|zero.?day)/i, label: "Safety — Malicious code request" },
    { pattern: /(?:ddos|sql\s*injection|phishing\s+kit|credential\s+stuffing)\s+(?:script|attack|tool|payload|code)/i, label: "Safety — Cyberattack tooling" },

    // Hate / harassment / violence incitement
    { pattern: /(?:slur|insult|dehumani[sz]e|attack)\s+\w*\s*(?:black|white|jewish|muslim|asian|hispanic|latino|gay|lesbian|trans|women|men)\s+(?:people|community)/i, label: "Safety — Hate speech generation" },
    { pattern: /(?:incite|encourage|promote|justify)\s+\w*\s*(?:violence|genocide|ethnic\s+cleansing|lynching)/i, label: "Safety — Incitement to violence" },

    // GDPR — direct identifiers
    { pattern: /\b\d{3}-\d{2}-\d{4}\b/, label: "GDPR — US SSN detected" },
    { pattern: /\b(?:4\d{3}|5[1-5]\d{2}|3[47]\d{2}|6011)[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/, label: "GDPR — Possible credit card number" },
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
    const shieldUrl = (typeof chrome !== "undefined" && chrome.runtime?.getURL)
      ? chrome.runtime.getURL("shield.png")
      : "";
    overlay.innerHTML = `
      <div class="hfai-guard-modal" role="dialog" aria-labelledby="hfai-guard-title">
        <div class="hfai-guard-shield">${shieldUrl ? `<img src="${shieldUrl}" alt="HFAI Guard" />` : "🛡"}</div>
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
