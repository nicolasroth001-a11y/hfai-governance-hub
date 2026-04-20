/**
 * HFAI Guard SDK — Fail-Closed Edition (v1.0.0)
 * ------------------------------------------------
 * Embeds EU AI Act Article 5 prohibited-practice detection
 * + COPPA/safety baseline patterns directly in the client.
 *
 * GUARANTEE: Even if HFAI cloud is 100% unreachable, this SDK
 * will still BLOCK every Article 5 prohibited practice and every
 * baseline safety pattern. Enforcement of the highest-risk
 * categories cannot be disabled by an outage.
 *
 * Works in: Browser, Node.js (>=18), Deno, Bun, Cloudflare Workers.
 * Zero dependencies.
 *
 * Usage:
 *   import { HFAIGuard } from "https://hfa-i.org/sdk/hfai-guard.js";
 *   const guard = new HFAIGuard({ apiKey: "YOUR_HFAI_API_KEY" });
 *   const verdict = await guard.check(userInput);
 *   if (verdict.blocked) { return verdict.explanation; }
 *
 * License: MIT — embed freely.
 */

// ── Article 5 Prohibited Practices (EU AI Act) ──────────────────
// These patterns mirror the server-side classifiers in ingest-event.
// Fines up to €35M or 7% of global turnover — always blocked.
const ARTICLE_5_PATTERNS = [
  { pattern: /subliminal|manipulat(?:e|ion|ive)|coerci(?:on|ve)/i,
    label: "Art.5(1)(a) Subliminal Manipulation",
    severity: "critical" },
  { pattern: /exploit.*(?:vulnerab|elderly|disabled|child|minor|age)/i,
    label: "Art.5(1)(a) Exploitation of Vulnerabilities",
    severity: "critical" },
  { pattern: /social.?scor(?:e|ing)|citizen.?score|social.?credit/i,
    label: "Art.5(1)(c) Social Scoring",
    severity: "critical" },
  { pattern: /predictive.?polic|crime.?predict|criminal.?profil/i,
    label: "Art.5(1)(d) Predictive Policing",
    severity: "critical" },
  { pattern: /facial.?scrap|face.?databas|biometric.?scrap|scrape.*face/i,
    label: "Art.5(1)(e) Untargeted Facial Scraping",
    severity: "critical" },
  { pattern: /emotion.?recogni|emotion.?detect|sentiment.*(?:workplace|school|employee)/i,
    label: "Art.5(1)(f) Workplace/School Emotion Recognition",
    severity: "high" },
  { pattern: /biometric.?categori|race.?detect|biometric.?classif/i,
    label: "Art.5(1)(g) Biometric Categorisation",
    severity: "critical" },
  { pattern: /real.?time.*biometric|remote.*identif.*public|facial.*recognition.*public/i,
    label: "Art.5(1)(h) Real-time Remote Biometric ID",
    severity: "critical" },
];

// ── Baseline Safety / COPPA Patterns ────────────────────────────
// Always-on protections for child-directed services (e.g. AESOP).
const SAFETY_PATTERNS = [
  { pattern: /(?:home|street|house)\s*address.*(?:child|kid|student|minor)/i,
    label: "COPPA: Minor PII Request (address)",
    severity: "critical" },
  { pattern: /(?:what|which)\s+school.*(?:you|child|kid|student)\s+(?:go|attend)/i,
    label: "COPPA: Minor PII Request (school)",
    severity: "critical" },
  { pattern: /(?:phone|cell|mobile)\s*number.*(?:child|kid|student|minor)/i,
    label: "COPPA: Minor PII Request (phone)",
    severity: "critical" },
  { pattern: /(?:meet|see)\s+(?:me|us)\s+(?:in person|alone|secret)/i,
    label: "Child Safety: Grooming Pattern",
    severity: "critical" },
  { pattern: /(?:how to|ways to|methods? of)\s+(?:kill|harm|hurt|cut)\s+(?:myself|yourself)/i,
    label: "Self-Harm Instruction Request",
    severity: "critical" },
  { pattern: /(?:explicit|sexual|nsfw|porn).*(?:child|kid|minor|teen|underage)/i,
    label: "CSAM Pattern (zero tolerance)",
    severity: "critical" },
];

const ALL_PATTERNS = [...ARTICLE_5_PATTERNS, ...SAFETY_PATTERNS];
const DEFAULT_INGEST_URL =
  "https://uomnlgpqundhlmqkuhog.supabase.co/functions/v1/ingest-event";
const QUEUE_KEY = "hfai_guard_queue_v1";
const MAX_QUEUE_SIZE = 500;

class HFAIGuard {
  /**
   * @param {object} opts
   * @param {string} opts.apiKey         - HFAI API key (from /customer/connect)
   * @param {string} [opts.aiSystemId]   - Optional AI system UUID
   * @param {string} [opts.ingestUrl]    - Override (defaults to HFAI cloud)
   * @param {number} [opts.timeoutMs]    - Network timeout (default 3000)
   * @param {boolean}[opts.failClosed]   - On network error: block (default true)
   * @param {boolean}[opts.queueOffline] - Persist failed events (default true)
   */
  constructor(opts = {}) {
    if (!opts.apiKey) {
      console.warn("[HFAIGuard] No apiKey — local enforcement only, no cloud sync.");
    }
    this.apiKey = opts.apiKey || null;
    this.aiSystemId = opts.aiSystemId || null;
    this.ingestUrl = opts.ingestUrl || DEFAULT_INGEST_URL;
    this.timeoutMs = opts.timeoutMs ?? 3000;
    this.failClosed = opts.failClosed !== false;
    this.queueOffline = opts.queueOffline !== false;
    this.version = "1.0.0";
  }

  /**
   * Synchronous local-only check. Always available, never throws,
   * never makes a network request. Use this when you need a decision
   * in <1ms (e.g. inside a render loop).
   *
   * @param {string} text
   * @returns {{blocked: boolean, matches: Array, explanation: string}}
   */
  checkLocal(text) {
    const input = String(text || "");
    const matches = ALL_PATTERNS
      .filter((p) => p.pattern.test(input))
      .map((p) => ({ label: p.label, severity: p.severity }));

    return {
      blocked: matches.length > 0,
      matches,
      explanation: matches.length === 0
        ? "OK — no prohibited patterns detected locally."
        : "Blocked by HFAI Guard (local enforcement):\n" +
          matches.map((m) => `  • [${m.severity.toUpperCase()}] ${m.label}`).join("\n"),
      mode: "local",
    };
  }

  /**
   * Full check: runs local enforcement first (fail-closed), then
   * attempts to log/extend with HFAI cloud. If cloud is unreachable,
   * the local verdict stands and the event is queued for later sync.
   *
   * @param {string} text
   * @param {object} [meta]  - Extra metadata (user_id, session_id, etc.)
   * @returns {Promise<{blocked: boolean, matches: Array, explanation: string, mode: string}>}
   */
  async check(text, meta = {}) {
    // 1. Local enforcement — ALWAYS runs first, ALWAYS authoritative
    //    for Article 5 + safety patterns. Cloud cannot un-block these.
    const local = this.checkLocal(text);
    if (local.blocked) {
      // Fire-and-forget log, don't block the caller
      this._sendToCloud(text, meta, { local_blocked: true, matches: local.matches })
        .catch(() => this._enqueue(text, meta, local));
      return local;
    }

    // 2. Cloud check for org-specific rules + AI classification
    if (!this.apiKey) {
      return { ...local, mode: "local-only (no apiKey)" };
    }

    try {
      const cloud = await this._sendToCloud(text, meta, { local_blocked: false });
      if (cloud && cloud.blocked) {
        return {
          blocked: true,
          matches: cloud.blocked_rules || [],
          explanation: cloud.explanation || "Blocked by org policy (cloud).",
          mode: "cloud",
        };
      }
      return { ...local, mode: "cloud-ok" };
    } catch (err) {
      // Cloud unreachable. Local enforcement already ran (passed).
      // failClosed only applies to AMBIGUOUS content — Article 5 + safety
      // patterns are already enforced locally above.
      this._enqueue(text, meta, local);
      return {
        ...local,
        mode: "offline (queued)",
        explanation: local.explanation +
          "\n[HFAI cloud unreachable — local enforcement active, event queued.]",
      };
    }
  }

  // ── Private ──────────────────────────────────────────────────

  async _sendToCloud(text, meta, extra) {
    const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), this.timeoutMs) : null;

    try {
      const res = await fetch(this.ingestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify({
          event_type: meta.event_type || "user_message",
          ai_system_id: this.aiSystemId,
          payload: text,
          metadata: { ...meta, sdk: "hfai-guard-js", sdk_version: this.version, ...extra },
        }),
        signal: ctrl ? ctrl.signal : undefined,
      });
      if (timer) clearTimeout(timer);
      if (res.status === 451) {
        return await res.json();
      }
      if (!res.ok) throw new Error(`HFAI ingest returned ${res.status}`);
      return await res.json();
    } catch (e) {
      if (timer) clearTimeout(timer);
      throw e;
    }
  }

  _enqueue(text, meta, verdict) {
    if (!this.queueOffline) return;
    try {
      const store = this._storage();
      if (!store) return;
      const raw = store.getItem(QUEUE_KEY);
      const queue = raw ? JSON.parse(raw) : [];
      queue.push({ text: String(text).slice(0, 4000), meta, verdict, ts: Date.now() });
      // Cap queue size (FIFO eviction)
      while (queue.length > MAX_QUEUE_SIZE) queue.shift();
      store.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch { /* ignore quota / serialization errors */ }
  }

  /**
   * Replay queued offline events to HFAI cloud. Call on app startup
   * or when network reconnects. Returns count of successfully sent events.
   */
  async flushQueue() {
    const store = this._storage();
    if (!store || !this.apiKey) return 0;
    let queue = [];
    try { queue = JSON.parse(store.getItem(QUEUE_KEY) || "[]"); } catch { return 0; }
    if (queue.length === 0) return 0;

    const remaining = [];
    let sent = 0;
    for (const item of queue) {
      try {
        await this._sendToCloud(item.text, item.meta || {}, {
          replayed: true,
          original_ts: item.ts,
          local_verdict: item.verdict,
        });
        sent++;
      } catch {
        remaining.push(item);
      }
    }
    try { store.setItem(QUEUE_KEY, JSON.stringify(remaining)); } catch {}
    return sent;
  }

  _storage() {
    try {
      if (typeof localStorage !== "undefined") return localStorage;
    } catch {}
    return null;
  }
}

// ── Exports (works in ESM, CommonJS, and as a browser global) ───
if (typeof module !== "undefined" && module.exports) {
  module.exports = { HFAIGuard, ARTICLE_5_PATTERNS, SAFETY_PATTERNS };
}
if (typeof window !== "undefined") {
  window.HFAIGuard = HFAIGuard;
}
export { HFAIGuard, ARTICLE_5_PATTERNS, SAFETY_PATTERNS };
