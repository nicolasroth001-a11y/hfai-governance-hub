---
name: Integrations Hub
description: Customer-configurable Slack, Teams, custom webhook, and S3 audit-export integrations with delivery audit log
type: feature
---

## Overview
Located at `/customer/integrations`. Lets customer admins push violation alerts and compliance evidence to external systems.

## Catalog (Phase 1)
| Type | Min Tier | Purpose |
|---|---|---|
| `slack` | Pro | Incoming-webhook alerts to any channel |
| `teams` | Pro | MessageCard alerts to Teams channels |
| `webhook_custom` | Pro | POST to any HTTPS endpoint with optional HMAC secret |
| `s3` | Sovereign | Nightly audit-trail/evidence export to customer-owned bucket |

Phase 2 (planned): Snowflake, Databricks, BigQuery (Enterprise+); Jira, Linear (Pro+).

## Tables
- `integrations` — per-org config (`integration_type`, `config` JSONB, `trigger_events[]`, `enabled`, `last_delivered_at`, `last_error`)
- `integration_deliveries` — audit log of every dispatch (success/failure, response_status, error_message)

RLS: customer admins manage own org; reviewers read-only via `reviewer_has_org_access`; admins see all.

## Edge Function
`integration-dispatch` — fan-out dispatcher. Accepts `{ event_type, violation_id?, message?, integration_id? }`. Resolves org from caller's profile, filters integrations by `trigger_events`, sends to each, writes audit row.

## UI Touchpoints
- `CustomerIntegrations.tsx` — catalog + per-integration config dialog, enable/disable, test send, delete
- `SendToIntegrationButton` (`src/components/integrations/`) — contextual dropdown shown on `CustomerViolationDetail` to push the current violation to any active integration
- Sidebar: "Integrations" link under Settings group with Pro tier gate
- `FEATURE_TIER["Integrations"] = "pro"` in `stripe-config.ts`
