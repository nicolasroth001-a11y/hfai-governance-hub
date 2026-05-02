CREATE TABLE public.public_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  score INT NOT NULL,
  risk_label TEXT NOT NULL,
  detected_ai_count INT NOT NULL DEFAULT 0,
  findings_count INT NOT NULL DEFAULT 0,
  has_critical BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_public_scans_created_at ON public.public_scans(created_at DESC);

ALTER TABLE public.public_scans ENABLE ROW LEVEL SECURITY;

-- Public can read individual rows (they're already anonymized to domain only)
CREATE POLICY "Public scans are readable by anyone"
ON public.public_scans
FOR SELECT
USING (true);

-- No public insert - only service role (edge function) writes
-- (Service role bypasses RLS, so no policy needed)

-- Aggregate stats RPC for the landing page
CREATE OR REPLACE FUNCTION public.get_public_scan_stats()
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_scans', (SELECT COUNT(*) FROM public.public_scans),
    'scans_this_week', (SELECT COUNT(*) FROM public.public_scans WHERE created_at > now() - interval '7 days'),
    'average_score', (SELECT COALESCE(ROUND(AVG(score))::INT, 0) FROM public.public_scans),
    'pct_critical', (
      SELECT CASE WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(100.0 * COUNT(*) FILTER (WHERE has_critical) / COUNT(*))::INT
      END
      FROM public.public_scans
    ),
    'pct_with_ai', (
      SELECT CASE WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(100.0 * COUNT(*) FILTER (WHERE detected_ai_count > 0) / COUNT(*))::INT
      END
      FROM public.public_scans
    ),
    'recent', (
      SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
      FROM (
        SELECT domain, score, risk_label, detected_ai_count, findings_count, created_at
        FROM public.public_scans
        ORDER BY created_at DESC
        LIMIT 12
      ) r
    )
  ) INTO result;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_scan_stats() TO anon, authenticated;