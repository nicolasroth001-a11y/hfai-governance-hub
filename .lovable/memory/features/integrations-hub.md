---
name: Integrations Hub
description: Customer-configurable Slack, Teams, custom webhook, and S3 audit-export integrations with delivery audit log
type: feature
---

## Overview
Located at `/customer/integrations`. Lets customer admins push violation alerts and compliance evidence to external systems.

## Catalog
| Type | Min Tier | Purpose |
|---|---|---|
| `slack` | Pro | Incoming-webhook alerts to any channel |
| `teams` | Pro | MessageCard alerts to Teams channels |
| `webhook_custom` | Pro | POST to any HTTPS endpoint with optional HMAC secret |
| `jira` | Pro | Auto-create Jira issues via REST API v3 (Basic auth) |
| `snowflake` | Enterprise | Nightly auto-export of governance tables via SQL API v2 |
| `datadog` | Enterprise | Stream events with severity tags to `api.{site}/api/v1/events` |
| `pagerduty` | Enterprise | Trigger incidents via Events API v2 (`events.pagerduty.com/v2/enqueue`) |
| `s3` | Sovereign | Nightly JSONL export to customer-owned bucket (SigV4 signed PUT) |

## Tables
- `integrations` — per-org config (`integration_type`, `config` JSONB, `trigger_events[]`, `enabled`, `last_delivered_at`, `last_error`)
- `integration_deliveries` — audit log of every dispatch (success/failure, response_status, error_message)
- `compliance_exports` — nightly export run log (tables_exported, rows_exported, status, error_message, completed_at)

RLS: customer admins manage own org; reviewers read-only via `reviewer_has_org_access`; admins see all.

## Edge Functions
- `integration-dispatch` — fan-out dispatcher for real-time alerts. Routes to Slack/Teams/Webhook/Jira/Datadog/PagerDuty by `integration_type`. S3 + Snowflake are queued (returned 202) and shipped via the nightly export.
- `nightly-compliance-export` — pulls last 24h from `violations`, `human_reviews`, `ai_events`, `audit_logs`, `rules`, `remediation_actions` for each org with an enabled Snowflake or S3 integration. Pushes via Snowflake SQL API v2 (basic auth) or S3 SigV4-signed PUT (JSONL). Scheduled via pg_cron `hfai-nightly-compliance-export` at 02:00 UTC. Manually invokable from the UI ("Run export now" button).

## UI Touchpoints
- `CustomerIntegrations.tsx` — catalog + per-integration config dialog, enable/disable, test send, delete
- `SendToIntegrationButton` (`src/components/integrations/`) — contextual dropdown shown on `CustomerViolationDetail` to push the current violation to any active integration
- Sidebar: "Integrations" link under Settings group with Pro tier gate
- `FEATURE_TIER["Integrations"] = "pro"` in `stripe-config.ts`
