---
name: Reviewer Architecture
description: Configurable company-assigned reviewers + Sovereign HFAI backup reviewer with override authority
type: feature
---

## Reviewer Model

**All Tiers — Company-Assigned Reviewers:**
- Every company assigns their own human reviewers
- Permissions are configurable per org via `reviewer_permissions` table
- Company admin decides how much control to delegate to their reviewer
- Configurable toggles: review violations, manage rules, manage AI systems, approve deployments

**Sovereign Tier — HFAI Backup Reviewer:**
- HFAI appoints a backup reviewer with `reviewer_type = 'hfai_appointed'`
- Has `can_override_decisions = true` and `is_backup_reviewer = true`
- Can override company reviewer decisions when compliance risk is detected
- Overrides are tracked in `reviewer_overrides` table with mandatory justification

## Database Tables
- `reviewer_permissions` — per-org configurable permissions for each reviewer
- `reviewer_overrides` — audit trail of HFAI override decisions
- `reviewer_type` enum: `company_assigned` | `hfai_appointed`

## Permission Model
| Permission | Default | Description |
|---|---|---|
| can_review_violations | true | Always on — core reviewer function |
| can_manage_rules | false | Create/edit/disable governance rules |
| can_manage_systems | false | Modify AI system configurations |
| can_approve_deployments | false | Approve deployment readiness |
| can_override_decisions | false | Override other reviewer decisions (HFAI only) |
