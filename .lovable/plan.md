## Goal

Fix the review errors (admin + reviewer can't action violations) and rework the Guard popup so "Got it" is a true acknowledgment that lets the user proceed — with the override fully logged to the audit trail.

---

## 1. Fix the review errors (root cause)

**Problem:** The `human_reviews` table has no `INSERT` policy for the **admin** role, and the reviewer policy requires `has_role(auth.uid(), 'reviewer')` which fails for admin accounts trying to action a violation from `/admin/violations`. Same issue blocks any UPDATE for admins.

**Migration adds:**
- `INSERT` policy: `Admins create any review` → `WITH CHECK (has_role(auth.uid(), 'admin'))`
- `UPDATE` policy: `Admins update any review` → `USING (has_role(auth.uid(), 'admin'))`

The existing hash-chain trigger (`compute_review_integrity_hash`) keeps working — it runs BEFORE INSERT regardless of role, so audit integrity stays intact.

---

## 2. Acknowledgment flow on the Guard popup (keep current look)

Current behavior: popup shows violation → "Got it" dismisses it → prompt is dropped silently. User wants: popup shows violation → user acknowledges → prompt **is sent** → override logged.

**New flow (same visual style, no redesign):**

1. Popup appears with violation details (unchanged look).
2. Primary button changes from `Got it` → **`I understand — send anyway`**
3. Secondary button: **`Cancel & edit prompt`** (current dismiss behavior)
4. On "send anyway": small inline confirm strip slides in:
   _"This override will be logged to your audit trail."_ → **`Confirm send`** / **`Back`**
5. On confirm: re-fire the original keystroke/submit on the host page (ChatGPT/Claude/Gemini) AND POST a `user_override` event to `ingest-event` with the original payload + `override: true`.

**Files touched (extension only — no visual rewrite):**
- `extension-guard/guard.js` — 2-step button logic + re-fire submit
- `extension-guard/background.js` — new `USER_OVERRIDE` message handler → posts event with `event_type: 'user_override'`
- `extension-guard/popup.html` + `popup.js` — add an "Overrides today" counter next to "Blocks today"
- Rebuild `public/hfai-guard.zip`

---

## 3. Surface overrides in the dashboard

- `src/pages/customer/CustomerGuard.tsx` — add an **Overrides** tile alongside the existing **Blocks** tile, sourced from `ai_events` where `event_type = 'user_override'` for the org.
- No schema changes needed — `ai_events` already accepts arbitrary `event_type` strings and the org RLS works.

---

## Files to edit

- `supabase/migrations/<new>.sql` — admin INSERT + UPDATE policies on `human_reviews`
- `extension-guard/guard.js`
- `extension-guard/background.js`
- `extension-guard/popup.html`
- `extension-guard/popup.js`
- `public/hfai-guard.zip` (rebuilt)
- `src/pages/customer/CustomerGuard.tsx`

## Out of scope (per your feedback)

- No visual redesign of the popup — current look stays.
- No CSS rewrite.
- No changes to the reviewer permissions model.

---

Approve and I'll ship it.