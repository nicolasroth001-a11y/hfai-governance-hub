import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Verify caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase
      .from("analytics")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10000);

    if (error) {
      console.error("Query error:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch analytics" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rows = data || [];

    const pageMap = new Map<string, { views: number; sessions: Set<string> }>();
    for (const row of rows) {
      const entry = pageMap.get(row.route) || { views: 0, sessions: new Set() };
      entry.views++;
      entry.sessions.add(row.session_id);
      pageMap.set(row.route, entry);
    }
    const pages = Array.from(pageMap.entries())
      .map(([route, { views, sessions }]) => ({ route, views, unique: sessions.size }))
      .sort((a, b) => b.views - a.views);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailyMap = new Map<string, number>();
    for (const row of rows) {
      const d = new Date(row.created_at);
      if (d >= thirtyDaysAgo) {
        const key = d.toISOString().slice(0, 10);
        dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
      }
    }
    const traffic = Array.from(dailyMap.entries())
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const refMap = new Map<string, number>();
    for (const row of rows) {
      if (row.referrer) {
        refMap.set(row.referrer, (refMap.get(row.referrer) || 0) + 1);
      }
    }
    const referrers = Array.from(refMap.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    const totalViews = rows.length;
    const uniqueSessions = new Set(rows.map((r) => r.session_id)).size;

    return new Response(
      JSON.stringify({ pages, traffic, referrers, totalViews, uniqueSessions }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("Analytics error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
