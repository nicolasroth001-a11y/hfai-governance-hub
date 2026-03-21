import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authErr } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authErr || !user) throw new Error("Unauthorized");

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id, name, email, role")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) throw new Error("No organization found");

    const orgId = profile.org_id;

    // Fetch all compliance data in parallel
    const [orgRes, systemsRes, violationsRes, rulesRes, reviewsRes, logsRes] = await Promise.all([
      supabase.from("organizations").select("*").eq("id", orgId).single(),
      supabase.from("ai_systems").select("*").eq("org_id", orgId),
      supabase.from("violations").select("*").eq("org_id", orgId).order("created_at", { ascending: false }).limit(500),
      supabase.from("rules").select("*").or(`org_id.eq.${orgId},org_id.is.null`),
      supabase.from("human_reviews").select("*"),
      supabase.from("audit_logs").select("*").eq("org_id", orgId).order("created_at", { ascending: false }).limit(200),
    ]);

    const org = orgRes.data;
    const systems = systemsRes.data || [];
    const violations = violationsRes.data || [];
    const rules = rulesRes.data || [];
    const reviews = reviewsRes.data || [];
    const logs = logsRes.data || [];

    // Build compliance report
    const report = {
      report_metadata: {
        title: "EU AI Act Compliance Report",
        generated_at: new Date().toISOString(),
        generated_by: profile.name || profile.email,
        organization: org?.name || "Unknown",
        framework: "EU AI Act (Regulation 2024/1689)",
        platform: "HFAI — Human-First AI Governance",
      },
      executive_summary: {
        total_ai_systems: systems.length,
        high_risk_systems: systems.filter((s: any) => s.eu_risk_tier === "high_risk" || s.risk_level === "high" || s.risk_level === "critical").length,
        classified_systems: systems.filter((s: any) => s.eu_risk_tier && s.eu_risk_tier !== "not_classified").length,
        total_violations: violations.length,
        open_violations: violations.filter((v: any) => v.status === "open").length,
        resolved_violations: violations.filter((v: any) => v.status === "resolved").length,
        total_human_reviews: reviews.length,
        active_rules: rules.filter((r: any) => r.enabled).length,
        audit_entries: logs.length,
      },
      ai_system_inventory: systems.map((s: any) => ({
        name: s.name,
        model_type: s.model_type,
        provider: s.provider,
        version: s.version,
        eu_risk_tier: s.eu_risk_tier || "not_classified",
        internal_risk_level: s.risk_level,
        owner_team: s.owner_team,
        status: s.status,
        data_governance_notes: s.data_governance_notes || "",
        transparency_uri: s.transparency_uri || "",
        registered_at: s.created_at,
      })),
      violations_summary: {
        by_severity: {
          critical: violations.filter((v: any) => v.severity === "critical").length,
          high: violations.filter((v: any) => v.severity === "high").length,
          medium: violations.filter((v: any) => v.severity === "medium").length,
          low: violations.filter((v: any) => v.severity === "low").length,
        },
        by_status: {
          open: violations.filter((v: any) => v.status === "open").length,
          investigating: violations.filter((v: any) => v.status === "investigating").length,
          resolved: violations.filter((v: any) => v.status === "resolved").length,
        },
        recent_violations: violations.slice(0, 20).map((v: any) => ({
          id: v.id,
          description: v.description,
          severity: v.severity,
          status: v.status,
          detected_at: v.detected_at,
          resolution_notes: v.resolution_notes,
        })),
      },
      human_oversight: {
        total_reviews: reviews.length,
        approved: reviews.filter((r: any) => r.decision === "approved").length,
        rejected: reviews.filter((r: any) => r.decision === "rejected").length,
        pending: reviews.filter((r: any) => r.decision === "pending" || !r.decision).length,
      },
      governance_rules: rules.map((r: any) => ({
        name: r.name,
        category: r.category,
        severity: r.severity,
        enabled: r.enabled,
        description: r.description,
      })),
      compliance_attestation: {
        record_keeping_art12: "Active — All AI events automatically logged with full metadata",
        human_oversight_art14: `Active — ${reviews.length} human review decisions recorded`,
        risk_management_art9: `Active — ${rules.filter((r: any) => r.enabled).length} governance rules enforced`,
        transparency_art13: "Active — Full audit trail maintained",
        accuracy_monitoring_art15: `Active — ${violations.length} potential issues detected and tracked`,
      },
    };

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
