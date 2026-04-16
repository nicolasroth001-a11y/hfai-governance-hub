// Nightly export of governance tables (violations, reviews, audit logs, rules, remediations, ai_events)
// Pushes data to each org's configured Snowflake or S3 integration via INSERT statements / object PUT.
// Triggered by pg_cron at 02:00 UTC daily, or manually from the UI.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const EXPORTABLE_TABLES = [
  "violations", "human_reviews", "ai_events", "audit_logs",
  "rules", "remediation_actions",
] as const;

// Snowflake — execute multi-row INSERT via SQL REST API
// cfg: { account, warehouse, database, schema, username, password, role? }
async function pushToSnowflake(cfg: any, table: string, rows: any[]) {
  if (rows.length === 0) return { ok: true, status: 200, rows: 0 };
  if (!cfg.account || !cfg.username || !cfg.password || !cfg.database || !cfg.schema || !cfg.warehouse) {
    throw new Error("Snowflake requires account, username, password, database, schema, warehouse");
  }

  // Build a JSON variant insert: stage the batch as one statement using SELECT FROM VALUES.
  const cols = Object.keys(rows[0]);
  const valuesSql = rows.slice(0, 1000).map((_, i) =>
    `(${cols.map((_, j) => `?`).join(", ")})`
  ).join(", ");
  const bindings = rows.slice(0, 1000).flatMap((row) =>
    cols.map((c) => {
      const v = row[c];
      if (v === null || v === undefined) return { type: "TEXT", value: null };
      if (typeof v === "object") return { type: "TEXT", value: JSON.stringify(v) };
      return { type: "TEXT", value: String(v) };
    })
  );

  const stmt = `INSERT INTO ${cfg.database}.${cfg.schema}.HFAI_${table.toUpperCase()} (${cols.map((c) => `"${c}"`).join(", ")}) VALUES ${valuesSql}`;

  // Snowflake SQL API uses key-pair JWT or basic auth via account URL.
  // For Phase 2 we use basic auth (simpler customer setup).
  const auth = btoa(`${cfg.username}:${cfg.password}`);
  const url = `https://${cfg.account}.snowflakecomputing.com/api/v2/statements`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-Snowflake-Authorization-Token-Type": "BASIC",
    },
    body: JSON.stringify({
      statement: stmt,
      database: cfg.database,
      schema: cfg.schema,
      warehouse: cfg.warehouse,
      role: cfg.role,
      bindings: Object.fromEntries(bindings.map((b, i) => [String(i + 1), b])),
      timeout: 60,
    }),
  });
  return { ok: res.ok, status: res.status, rows: rows.length, body: (await res.text()).slice(0, 500) };
}

// S3 — basic PUT to S3 using AWS SigV4 (lightweight, no SDK)
async function pushToS3(cfg: any, table: string, rows: any[], orgId: string) {
  if (!cfg.bucket || !cfg.region || !cfg.access_key_id || !cfg.secret_access_key) {
    throw new Error("S3 requires bucket, region, access_key_id, secret_access_key");
  }
  if (rows.length === 0) return { ok: true, status: 200, rows: 0 };

  const date = new Date();
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const prefix = (cfg.prefix ?? "hfai/").replace(/\/$/, "");
  const key = `${prefix}/${yyyy}/${mm}/${dd}/${orgId}/${table}.jsonl`;

  // JSON Lines — one record per line
  const body = rows.map((r) => JSON.stringify(r)).join("\n");

  // SigV4 sign
  const host = `${cfg.bucket}.s3.${cfg.region}.amazonaws.com`;
  const url = `https://${host}/${key}`;
  const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const enc = new TextEncoder();
  async function hmac(key: ArrayBuffer | Uint8Array, msg: string): Promise<ArrayBuffer> {
    const k = await crypto.subtle.importKey("raw", key as any, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return crypto.subtle.sign("HMAC", k, enc.encode(msg));
  }
  async function sha256(msg: string): Promise<string> {
    const buf = await crypto.subtle.digest("SHA-256", enc.encode(msg));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  const payloadHash = await sha256(body);
  const canonicalRequest = [
    "PUT", `/${key}`, "",
    `host:${host}`, `x-amz-content-sha256:${payloadHash}`, `x-amz-date:${amzDate}`, "",
    "host;x-amz-content-sha256;x-amz-date", payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${cfg.region}/s3/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, await sha256(canonicalRequest)].join("\n");

  const kDate = await hmac(enc.encode(`AWS4${cfg.secret_access_key}`), dateStamp);
  const kRegion = await hmac(kDate, cfg.region);
  const kService = await hmac(kRegion, "s3");
  const kSigning = await hmac(kService, "aws4_request");
  const signatureBuf = await hmac(kSigning, stringToSign);
  const signature = [...new Uint8Array(signatureBuf)].map((b) => b.toString(16).padStart(2, "0")).join("");

  const authHeader = `AWS4-HMAC-SHA256 Credential=${cfg.access_key_id}/${credentialScope}, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=${signature}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": authHeader,
      "x-amz-date": amzDate,
      "x-amz-content-sha256": payloadHash,
      "Content-Type": "application/x-ndjson",
    },
    body,
  });
  return { ok: res.ok, status: res.status, rows: rows.length, body: (await res.text()).slice(0, 500) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Optional body — { org_id?: string, integration_id?: string }
    let body: any = {};
    try { body = await req.json(); } catch { /* cron may send empty */ }

    // Find all enabled snowflake + s3 integrations (or filter by org_id/integration_id)
    let q = supabase.from("integrations")
      .select("id, org_id, integration_type, config, display_name")
      .eq("enabled", true)
      .in("integration_type", ["snowflake", "s3"]);
    if (body.org_id) q = q.eq("org_id", body.org_id);
    if (body.integration_id) q = q.eq("id", body.integration_id);
    const { data: integrations, error } = await q;
    if (error) throw error;

    const summary: any[] = [];

    for (const integ of integrations ?? []) {
      const exportRow: any = {
        org_id: integ.org_id,
        integration_id: integ.id,
        export_type: "nightly_full",
        tables_exported: EXPORTABLE_TABLES as any,
        status: "running",
      };
      const { data: exportLog } = await supabase
        .from("compliance_exports").insert(exportRow).select("id").single();

      let totalRows = 0;
      let lastError: string | null = null;

      // Use last 24h for nightly cadence
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      for (const table of EXPORTABLE_TABLES) {
        try {
          const { data: rows } = await supabase
            .from(table).select("*").eq("org_id", integ.org_id)
            .gte("created_at", since).limit(1000);
          if (!rows || rows.length === 0) continue;

          const result = integ.integration_type === "snowflake"
            ? await pushToSnowflake(integ.config as any, table, rows)
            : await pushToS3(integ.config as any, table, rows, integ.org_id);

          if (!result.ok) {
            lastError = `${table}: ${result.body ?? `status ${result.status}`}`.slice(0, 500);
            break;
          }
          totalRows += result.rows;
        } catch (e: any) {
          lastError = `${table}: ${String(e?.message ?? e)}`.slice(0, 500);
          break;
        }
      }

      const finalStatus = lastError ? "failed" : "success";
      if (exportLog?.id) {
        // Direct update via service role
        await fetch(`${SUPABASE_URL}/rest/v1/compliance_exports?id=eq.${exportLog.id}`, {
          method: "PATCH",
          headers: {
            "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}`,
            "Content-Type": "application/json", "Prefer": "return=minimal",
          },
          body: JSON.stringify({
            status: finalStatus, rows_exported: totalRows,
            error_message: lastError, completed_at: new Date().toISOString(),
          }),
        });
      }

      // Update integration health
      await supabase.from("integrations").update({
        last_delivered_at: lastError ? undefined : new Date().toISOString(),
        last_error: lastError,
      }).eq("id", integ.id);

      summary.push({
        integration_id: integ.id, type: integ.integration_type,
        status: finalStatus, rows: totalRows, error: lastError,
      });
    }

    return new Response(JSON.stringify({ exported: summary.length, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (e: any) {
    console.error("nightly-compliance-export error", e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
