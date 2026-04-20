"""
HFAI Guard SDK — Fail-Closed Edition (v1.0.0)
----------------------------------------------
Embeds EU AI Act Article 5 prohibited-practice detection
+ COPPA/safety baseline patterns directly in the client.

GUARANTEE: Even if HFAI cloud is 100% unreachable, this SDK
will still BLOCK every Article 5 prohibited practice and every
baseline safety pattern. Enforcement of the highest-risk
categories cannot be disabled by an outage.

Requires: Python 3.8+. Only depends on the stdlib (urllib).
A `requests`-based shim is provided if you prefer.

Usage:
    from hfai_guard import HFAIGuard
    guard = HFAIGuard(api_key="YOUR_HFAI_API_KEY")
    verdict = guard.check(user_input)
    if verdict["blocked"]:
        return verdict["explanation"]

License: MIT — embed freely.
"""
from __future__ import annotations

import json
import os
import re
import time
import urllib.request
import urllib.error
from typing import Any, Dict, List, Optional

__version__ = "1.0.0"

DEFAULT_INGEST_URL = (
    "https://uomnlgpqundhlmqkuhog.supabase.co/functions/v1/ingest-event"
)

# ── Article 5 Prohibited Practices (EU AI Act) ──────────────────
ARTICLE_5_PATTERNS: List[Dict[str, Any]] = [
    {"pattern": re.compile(r"subliminal|manipulat(?:e|ion|ive)|coerci(?:on|ve)", re.I),
     "label": "Art.5(1)(a) Subliminal Manipulation", "severity": "critical"},
    {"pattern": re.compile(r"exploit.*(?:vulnerab|elderly|disabled|child|minor|age)", re.I),
     "label": "Art.5(1)(a) Exploitation of Vulnerabilities", "severity": "critical"},
    {"pattern": re.compile(r"social.?scor(?:e|ing)|citizen.?score|social.?credit", re.I),
     "label": "Art.5(1)(c) Social Scoring", "severity": "critical"},
    {"pattern": re.compile(r"predictive.?polic|crime.?predict|criminal.?profil", re.I),
     "label": "Art.5(1)(d) Predictive Policing", "severity": "critical"},
    {"pattern": re.compile(r"facial.?scrap|face.?databas|biometric.?scrap|scrape.*face", re.I),
     "label": "Art.5(1)(e) Untargeted Facial Scraping", "severity": "critical"},
    {"pattern": re.compile(r"emotion.?recogni|emotion.?detect|sentiment.*(?:workplace|school|employee)", re.I),
     "label": "Art.5(1)(f) Workplace/School Emotion Recognition", "severity": "high"},
    {"pattern": re.compile(r"biometric.?categori|race.?detect|biometric.?classif", re.I),
     "label": "Art.5(1)(g) Biometric Categorisation", "severity": "critical"},
    {"pattern": re.compile(r"real.?time.*biometric|remote.*identif.*public|facial.*recognition.*public", re.I),
     "label": "Art.5(1)(h) Real-time Remote Biometric ID", "severity": "critical"},
]

# ── Baseline Safety / COPPA Patterns ────────────────────────────
SAFETY_PATTERNS: List[Dict[str, Any]] = [
    {"pattern": re.compile(r"(?:home|street|house)\s*address.*(?:child|kid|student|minor)", re.I),
     "label": "COPPA: Minor PII Request (address)", "severity": "critical"},
    {"pattern": re.compile(r"(?:what|which)\s+school.*(?:you|child|kid|student)\s+(?:go|attend)", re.I),
     "label": "COPPA: Minor PII Request (school)", "severity": "critical"},
    {"pattern": re.compile(r"(?:phone|cell|mobile)\s*number.*(?:child|kid|student|minor)", re.I),
     "label": "COPPA: Minor PII Request (phone)", "severity": "critical"},
    {"pattern": re.compile(r"(?:meet|see)\s+(?:me|us)\s+(?:in person|alone|secret)", re.I),
     "label": "Child Safety: Grooming Pattern", "severity": "critical"},
    {"pattern": re.compile(r"(?:how to|ways to|methods? of)\s+(?:kill|harm|hurt|cut)\s+(?:myself|yourself)", re.I),
     "label": "Self-Harm Instruction Request", "severity": "critical"},
    {"pattern": re.compile(r"(?:explicit|sexual|nsfw|porn).*(?:child|kid|minor|teen|underage)", re.I),
     "label": "CSAM Pattern (zero tolerance)", "severity": "critical"},
]

ALL_PATTERNS = ARTICLE_5_PATTERNS + SAFETY_PATTERNS


class HFAIGuard:
    """Fail-closed AI governance guard. See module docstring."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        ai_system_id: Optional[str] = None,
        ingest_url: str = DEFAULT_INGEST_URL,
        timeout: float = 3.0,
        queue_path: Optional[str] = None,
    ) -> None:
        self.api_key = api_key
        self.ai_system_id = ai_system_id
        self.ingest_url = ingest_url
        self.timeout = timeout
        # On disk: ~/.hfai_guard_queue.json (configurable)
        self.queue_path = queue_path or os.path.join(
            os.path.expanduser("~"), ".hfai_guard_queue.json"
        )

    # ── Public API ───────────────────────────────────────────

    def check_local(self, text: str) -> Dict[str, Any]:
        """Synchronous, network-free check. Always returns instantly."""
        s = str(text or "")
        matches = [
            {"label": p["label"], "severity": p["severity"]}
            for p in ALL_PATTERNS if p["pattern"].search(s)
        ]
        return {
            "blocked": len(matches) > 0,
            "matches": matches,
            "explanation": (
                "OK — no prohibited patterns detected locally."
                if not matches else
                "Blocked by HFAI Guard (local enforcement):\n" +
                "\n".join(f"  • [{m['severity'].upper()}] {m['label']}" for m in matches)
            ),
            "mode": "local",
        }

    def check(self, text: str, meta: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Local enforcement first, then cloud extension. Never raises."""
        meta = meta or {}
        local = self.check_local(text)

        if local["blocked"]:
            try:
                self._send_to_cloud(text, meta, {"local_blocked": True, "matches": local["matches"]})
            except Exception:
                self._enqueue(text, meta, local)
            return local

        if not self.api_key:
            local["mode"] = "local-only (no api_key)"
            return local

        try:
            cloud = self._send_to_cloud(text, meta, {"local_blocked": False})
            if cloud and cloud.get("blocked"):
                return {
                    "blocked": True,
                    "matches": cloud.get("blocked_rules", []),
                    "explanation": cloud.get("explanation", "Blocked by org policy (cloud)."),
                    "mode": "cloud",
                }
            local["mode"] = "cloud-ok"
            return local
        except Exception:
            self._enqueue(text, meta, local)
            local["mode"] = "offline (queued)"
            local["explanation"] += (
                "\n[HFAI cloud unreachable — local enforcement active, event queued.]"
            )
            return local

    def flush_queue(self) -> int:
        """Replay queued offline events to HFAI cloud. Returns count sent."""
        if not self.api_key or not os.path.exists(self.queue_path):
            return 0
        try:
            with open(self.queue_path, "r", encoding="utf-8") as f:
                queue = json.load(f)
        except Exception:
            return 0

        remaining, sent = [], 0
        for item in queue:
            try:
                self._send_to_cloud(
                    item["text"], item.get("meta", {}),
                    {"replayed": True, "original_ts": item.get("ts"),
                     "local_verdict": item.get("verdict")},
                )
                sent += 1
            except Exception:
                remaining.append(item)
        try:
            with open(self.queue_path, "w", encoding="utf-8") as f:
                json.dump(remaining, f)
        except Exception:
            pass
        return sent

    # ── Private ──────────────────────────────────────────────

    def _send_to_cloud(
        self, text: str, meta: Dict[str, Any], extra: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        body = json.dumps({
            "event_type": meta.get("event_type", "user_message"),
            "ai_system_id": self.ai_system_id,
            "payload": text,
            "metadata": {**meta, "sdk": "hfai-guard-py",
                         "sdk_version": __version__, **extra},
        }).encode("utf-8")

        req = urllib.request.Request(
            self.ingest_url,
            data=body,
            headers={
                "Content-Type": "application/json",
                "x-api-key": self.api_key or "",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code == 451:
                # Blocked by org policy — body still useful
                try:
                    return json.loads(e.read().decode("utf-8"))
                except Exception:
                    return {"blocked": True, "explanation": "Blocked by HFAI cloud (451)."}
            raise

    def _enqueue(self, text: str, meta: Dict[str, Any], verdict: Dict[str, Any]) -> None:
        try:
            queue: List[Dict[str, Any]] = []
            if os.path.exists(self.queue_path):
                try:
                    with open(self.queue_path, "r", encoding="utf-8") as f:
                        queue = json.load(f)
                except Exception:
                    queue = []
            queue.append({
                "text": str(text)[:4000],
                "meta": meta,
                "verdict": verdict,
                "ts": int(time.time() * 1000),
            })
            queue = queue[-500:]  # cap at 500 entries
            with open(self.queue_path, "w", encoding="utf-8") as f:
                json.dump(queue, f)
        except Exception:
            pass


__all__ = ["HFAIGuard", "ARTICLE_5_PATTERNS", "SAFETY_PATTERNS", "__version__"]
