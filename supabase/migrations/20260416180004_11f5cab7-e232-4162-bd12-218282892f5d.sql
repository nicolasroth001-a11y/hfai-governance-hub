-- Integrations table: per-org configuration for external services
CREATE TABLE public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  integration_type text NOT NULL CHECK (integration_type IN ('slack', 'teams', 's3', 'webhook_custom')),
  enabled boolean NOT NULL DEFAULT true,
  display_name text NOT NULL DEFAULT '',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  trigger_events text[] NOT NULL DEFAULT ARRAY['high_severity','critical']::text[],
  last_delivered_at timestamptz,
  last_error text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_integrations_org ON public.integrations(org_id);
CREATE INDEX idx_integrations_type ON public.integrations(org_id, integration_type) WHERE enabled = true;

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all integrations"
  ON public.integrations FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customers manage own integrations"
  ON public.integrations FOR ALL TO authenticated
  USING (org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid()))
  WITH CHECK (org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid()));

CREATE POLICY "Reviewers view org integrations"
  ON public.integrations FOR SELECT TO authenticated
  USING (reviewer_has_org_access(auth.uid(), org_id));

-- Integration delivery audit log
CREATE TABLE public.integration_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  success boolean NOT NULL DEFAULT false,
  response_status integer,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_integration_deliveries_integration ON public.integration_deliveries(integration_id, created_at DESC);
CREATE INDEX idx_integration_deliveries_org ON public.integration_deliveries(org_id, created_at DESC);

ALTER TABLE public.integration_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all integration deliveries"
  ON public.integration_deliveries FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customers view own integration deliveries"
  ON public.integration_deliveries FOR SELECT TO authenticated
  USING (org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid()));

CREATE POLICY "Reviewers view org integration deliveries"
  ON public.integration_deliveries FOR SELECT TO authenticated
  USING (reviewer_has_org_access(auth.uid(), org_id));

CREATE POLICY "Service inserts integration deliveries"
  ON public.integration_deliveries FOR INSERT TO authenticated
  WITH CHECK (
    org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid())
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Auto-update updated_at on integrations
CREATE OR REPLACE FUNCTION public.touch_integrations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.touch_integrations_updated_at();