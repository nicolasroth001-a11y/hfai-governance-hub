# HFAI Guard — Internal System Reference

**One-page onboarding for engineers / on-call.**

## What it is
A free Chrome extension (`extension-guard/`) that blocks EU AI Act Art. 5 + COPPA + safety
violations on ChatGPT, Claude, and Gemini. Every block silently provisions an HFAI workspace
and logs the event. The "Whoop band" funnel into the paid HFAI platform.

## Components

| Component | Path | Role |
|---|---|---|
| Chrome extension | `extension-guard/` | Content script regex-blocks prompts before send |
| Packaged zip | `public/hfai-guard.zip` | Auto-rebuilt by GitHub Actions on every deploy |
| Auto-provision | `supabase/functions/guard-register/` | Creates anonymous org + API key on first install |
| Event ingest | `supabase/functions/ingest-event/` | Records each block, increments daily stats |
| Bare-min dashboard | `src/pages/customer/CustomerGuard.tsx` | Free-tier view, gated detail behind `SubscriptionGate` |
| Claim flow | `src/pages/customer/CustomerGuardClaim.tsx` + `claim_guard_device` RPC | Links anonymous org to a real signup |
| Public landing | `src/pages/GuardLandingPage.tsx` (`/guard`) | Install instructions + zip download |

## Data flow

```
[user types prompt in ChatGPT]
        │
        ▼
[guard.js content script]  ← regex check (fail-closed, never needs network)
        │ (matches)
        ▼
[overlay shown] + chrome.runtime.sendMessage("HFAI_REPORT_BLOCK")
        │
        ▼
[background.js] ── ensureRegistered() ──► POST /guard-register
        │                                      │
        │                                      ├─ idempotent on device_token
        │                                      ├─ IP-capped at 20 fresh orgs/24h
        │                                      └─ returns api_key + org_id (cached in chrome.storage.local)
        │
        └──────────────────────► POST /ingest-event (x-api-key)
                                       └─ writes ai_events + increments guard_block_stats
```

## Tables (Guard-specific)

- `guard_devices` — anonymous device → org mapping. `install_source` includes `|ip:<x>` tag for daily-cap query.
- `guard_block_stats` — daily aggregate per org × category. Updated atomically via `increment_guard_block_stat()`.
- `organizations.signup_via_guard` — flag for segmentation / analytics.

RLS: only members of the org (via `profiles.org_id`) or admins can read. The extension
writes via service-role-backed edge functions (no client RLS needed).

## Key behaviors / gotchas

1. **Anon key in `background.js` is the publishable key** (matches `.env`). Not a leak.
2. **Service-role key is ONLY in edge functions.** Never client-side.
3. **Block enforcement is local-first** — `guard.js` blocks even if cloud is unreachable.
   Cloud is for telemetry + dashboard, not enforcement.
4. **`hfai-guard.zip` rebuilds in CI** on every push to `main` (see `.github/workflows/deploy.yml`).
   Do NOT manually commit a stale zip.
5. **Free → Starter** is the upgrade path. `FEATURE_TIER` in `src/lib/stripe-config.ts`
   maps Guard features to `free` tier; everything else gates.
6. **Claim flow** uses `claim_guard_device(device_token)` RPC which either:
   - **adopts** — links the anonymous Guard org to the new user's profile, OR
   - **merges** — moves device + stats into the user's existing org.

## Failure modes & where to look

| Symptom | Look at |
|---|---|
| Blocks not showing in dashboard | `ingest-event` logs; check `x-api-key` header |
| Extension keeps re-registering | `guard_devices` should have row for `device_token`; check storage in `chrome://extensions` |
| New install hangs | `guard-register` logs; possibly hit IP daily cap (HTTP 429) |
| Stale zip downloaded | GitHub Actions run for "Package HFAI Guard extension" step |
| Claim returns "Device not found" | Token mismatch — check the `?token=` query param |

## Known non-blockers
- 3 "always-true" RLS warnings on `service_role`-only policies (`email_send_log`,
  `email_unsubscribe_tokens`, `newsletter_subscribers`). Service role bypasses RLS regardless;
  the policies just scope to that role. Intentional.
- 26 "SECURITY DEFINER executable" warnings on `has_role`, `reviewer_has_org_access`,
  `claim_guard_device`, `increment_guard_block_stat`, etc. These MUST be SECURITY DEFINER
  to bypass RLS recursion. Intentional and required.
