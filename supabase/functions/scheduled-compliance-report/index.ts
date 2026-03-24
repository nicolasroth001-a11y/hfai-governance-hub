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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all organizations with contact emails
    const { data: orgs, error: orgErr } = await supabase
      .from("organizations")
      .select("id, name, contact_email");
    if (orgErr) throw new Error(`Failed to fetch orgs: ${orgErr.message}`);

    const results: { org: string; status: string; error?: string }[] = [];

    for (const org of orgs ?? []) {
      if (!org.contact_email) {
        results.push({ org: org.name, status: "skipped", error: "No contact email" });
        continue;
      }

      try {
        // Fetch compliance data for this org
        const [systemsRes, violationsRes, rulesRes, reviewsRes] = await Promise.all([
          supabase.from("ai_systems").select("id, eu_risk_tier, risk_level").eq("org_id", org.id),
          supabase.from("violations").select("id, severity, status").eq("org_id", org.id),
          supabase.from("rules").select("id, enabled").or(`org_id.eq.${org.id},org_id.is.null`),
          supabase.from("human_reviews").select("id"),
        ]);

        const systems = systemsRes.data ?? [];
        const violations = violationsRes.data ?? [];
        const rules = rulesRes.data ?? [];
        const reviews = reviewsRes.data ?? [];

        const reportData = {
          orgName: org.name,
          totalSystems: systems.length,
          highRiskSystems: systems.filter((s: any) =>
            s.eu_risk_tier === "high_risk" || s.risk_level === "high" || s.risk_level === "critical"
          ).length,
          totalViolations: violations.length,
          openViolations: violations.filter((v: any) => v.status === "open").length,
          resolvedViolations: violations.filter((v: any) => v.status === "resolved").length,
          totalReviews: reviews.length,
          activeRules: rules.filter((r: any) => r.enabled).length,
          reportDate: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          dashboardUrl: "https://www.hfa-i.org/customer/compliance",
        };

        // Send the email via send-transactional-email
        const { error: sendErr } = await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "weekly-compliance-report",
            recipientEmail: org.contact_email,
            idempotencyKey: `weekly-report-${org.id}-${new Date().toISOString().split("T")[0]}`,
            templateData: reportData,
          },
        });

        if (sendErr) {
          results.push({ org: org.name, status: "error", error: sendErr.message });
        } else {
          results.push({ org: org.name, status: "sent" });
        }
      } catch (e) {
        results.push({ org: org.name, status: "error", error: e.message });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
