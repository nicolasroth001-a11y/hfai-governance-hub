
-- 1. DB function: get org counts in a single query (replaces N+1 pattern)
CREATE OR REPLACE FUNCTION public.get_org_counts()
RETURNS TABLE(org_id uuid, user_count bigint, system_count bigint, violation_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    o.id AS org_id,
    COALESCE(p.cnt, 0) AS user_count,
    COALESCE(s.cnt, 0) AS system_count,
    COALESCE(v.cnt, 0) AS violation_count
  FROM organizations o
  LEFT JOIN (SELECT org_id, COUNT(*) AS cnt FROM profiles GROUP BY org_id) p ON p.org_id = o.id
  LEFT JOIN (SELECT org_id, COUNT(*) AS cnt FROM ai_systems GROUP BY org_id) s ON s.org_id = o.id
  LEFT JOIN (SELECT org_id, COUNT(*) AS cnt FROM violations GROUP BY org_id) v ON v.org_id = o.id;
$$;

-- 2. DB function: analytics aggregation (replaces client-side JS)
CREATE OR REPLACE FUNCTION public.get_analytics_summary()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH page_stats AS (
    SELECT route, COUNT(*) AS views, COUNT(DISTINCT session_id) AS unique_sessions
    FROM analytics
    GROUP BY route
    ORDER BY views DESC
    LIMIT 50
  ),
  traffic AS (
    SELECT (created_at AT TIME ZONE 'UTC')::date AS d, COUNT(*) AS views
    FROM analytics
    WHERE created_at >= now() - interval '30 days'
    GROUP BY d
    ORDER BY d
  ),
  referrers AS (
    SELECT COALESCE(referrer, 'direct') AS referrer, COUNT(*) AS cnt
    FROM analytics
    WHERE referrer IS NOT NULL AND referrer != ''
    GROUP BY referrer
    ORDER BY cnt DESC
    LIMIT 10
  ),
  totals AS (
    SELECT COUNT(*) AS total_views, COUNT(DISTINCT session_id) AS unique_sessions
    FROM analytics
  )
  SELECT jsonb_build_object(
    'pages', COALESCE((SELECT jsonb_agg(jsonb_build_object('route', route, 'views', views, 'unique', unique_sessions)) FROM page_stats), '[]'::jsonb),
    'traffic', COALESCE((SELECT jsonb_agg(jsonb_build_object('date', d, 'views', views)) FROM traffic), '[]'::jsonb),
    'referrers', COALESCE((SELECT jsonb_agg(jsonb_build_object('referrer', referrer, 'count', cnt)) FROM referrers), '[]'::jsonb),
    'totalViews', (SELECT total_views FROM totals),
    'uniqueSessions', (SELECT unique_sessions FROM totals)
  ) INTO result;

  RETURN result;
END;
$$;

-- 3. Performance indexes on org_id columns
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON public.profiles (org_id);
CREATE INDEX IF NOT EXISTS idx_ai_systems_org_id ON public.ai_systems (org_id);
CREATE INDEX IF NOT EXISTS idx_violations_org_id ON public.violations (org_id);
CREATE INDEX IF NOT EXISTS idx_ai_events_org_id ON public.ai_events (org_id);
CREATE INDEX IF NOT EXISTS idx_rules_org_id ON public.rules (org_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON public.audit_logs (org_id);
CREATE INDEX IF NOT EXISTS idx_human_reviews_violation_id ON public.human_reviews (violation_id);
CREATE INDEX IF NOT EXISTS idx_violations_status ON public.violations (status);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics (created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON public.analytics (session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_route ON public.analytics (route);
