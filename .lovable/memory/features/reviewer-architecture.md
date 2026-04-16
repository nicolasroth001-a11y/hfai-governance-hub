---
name: Reviewer Architecture
description: Customer-managed in-house reviewers with optional HFAI Expert support and org-scoped data access
type: feature
---

## Reviewer Model (v2 — Customer-Managed)

**In-House Reviewers (All Paid Tiers):**
- Customer admin creates reviewer accounts via "Add In-House Reviewer" form
- Uses `create-in-house-reviewer` edge function
- Reviewer profile gets `role = 'reviewer'` and `org_id` set to customer's org
- Reviewer signs in at unified `/login` (renamed from "Customer Sign In" to "Sign In")
- Auto-redirected to `/reviewer/dashboard` based on profile role
- Sees most of the same data as customer admin (violations, rules, events, AI systems) but scoped to their org only
- Only customer admin can create reviewer accounts — reviewers cannot provision more reviewers
- Unlimited reviewers for all paid tiers

**HFAI Expert Reviewer (Add-on / Sovereign Included):**
- Customer requests via "Request HFAI Expert" button → triggers `request-hfai-expert` edge function
- Sends email notification to HFAI admin team
- HFAI admin assigns expert via Admin portal with `reviewer_type = 'hfai_appointed'`
- HFAI Expert can view org data, submit reviews, flag critical risks, and block dangerous violations
- Has `can_override_decisions = true` — can override in-house reviewer decisions when compliance risk detected
- Always available to the company that paid for the service
- Sovereign tier: included; other tiers: paid add-on

## Data Isolation (RLS)
- `reviewer_has_org_access(user_id, org_id)` security definer function
- In-house reviewers: scoped by `profiles.org_id` match
- HFAI experts: scoped by `reviewer_permissions` entries for specific orgs
- All reviewer RLS policies updated from global access to org-scoped access

## Database Tables
- `reviewer_permissions` — per-org permissions for each reviewer (unique on org_id, reviewer_id)
- `reviewer_overrides` — audit trail of HFAI override decisions
- `reviewer_type` enum: `company_assigned` | `hfai_appointed`

## Permission Model
| Permission | Default | Description |
|---|---|---|
| can_review_violations | true | Always on — core reviewer function |
| can_manage_rules | false | Create/edit/disable governance rules |
| can_manage_systems | false | Modify AI system configurations |
| can_approve_deployments | false | Approve deployment readiness |
| can_override_decisions | false | Override other reviewer decisions (HFAI Expert only) |

## Login Flow
- Unified `/login` page for customers + reviewers
- After authentication, profile role determines redirect:
  - `customer` → `/customer/dashboard`
  - `reviewer` → `/reviewer/dashboard`
  - `admin` → `/admin/dashboard`
- Admin login remains separate at `/login/admin`
