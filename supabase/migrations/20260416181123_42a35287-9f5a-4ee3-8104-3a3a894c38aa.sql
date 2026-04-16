-- Track nightly governance data exports to data warehouses (Snowflake, etc.)
CREATE TABLE IF NOT EXISTS public.compliance_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL,
  export_type TEXT NOT NULL DEFAULT 'nightly_full',
  tables_exported TEXT[] NOT NULL DEFAULT ARRAY['violations','human_reviews','ai_events','audit_logs','rules','remediation_actions'],
  rows_exported INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_compliance_exports_org ON public.compliance_exports(org_id, started_at DESC);

ALTER TABLE public.compliance_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all compliance exports"
  ON public.compliance_exports FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customers view own compliance exports"
  ON public.compliance_exports FOR SELECT TO authenticated
  USING (org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid()));

CREATE POLICY "Reviewers view org compliance exports"
  ON public.compliance_exports FOR SELECT TO authenticated
  USING (reviewer_has_org_access(auth.uid(), org_id));

CREATE POLICY "Service inserts compliance exports"
  ON public.compliance_exports FOR INSERT TO authenticated
  WITH CHECK (
    (org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid()))
    OR has_role(auth.uid(), 'admin'::app_role)
  );