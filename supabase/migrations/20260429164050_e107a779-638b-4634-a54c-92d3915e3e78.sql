-- Add LinkedIn fields to leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS linkedin_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS linkedin_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS linkedin_message text DEFAULT '',
  ADD COLUMN IF NOT EXISTS linkedin_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS linkedin_headline text DEFAULT '',
  ADD COLUMN IF NOT EXISTS linkedin_last_error text DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_leads_linkedin_status ON public.leads(linkedin_status);

-- Templates
CREATE TABLE IF NOT EXISTS public.linkedin_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  body text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.linkedin_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage linkedin templates"
  ON public.linkedin_templates FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER touch_linkedin_templates_updated_at
  BEFORE UPDATE ON public.linkedin_templates
  FOR EACH ROW EXECUTE FUNCTION public.touch_leads_updated_at();

-- Session state per admin (daily caps + extension token)
CREATE TABLE IF NOT EXISTS public.linkedin_session_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL UNIQUE,
  extension_token text NOT NULL DEFAULT ('hflin_' || encode(extensions.gen_random_bytes(24), 'hex')),
  daily_cap int NOT NULL DEFAULT 15,
  sent_today int NOT NULL DEFAULT 0,
  last_reset_date date NOT NULL DEFAULT CURRENT_DATE,
  active boolean NOT NULL DEFAULT true,
  min_delay_seconds int NOT NULL DEFAULT 45,
  max_delay_seconds int NOT NULL DEFAULT 90,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.linkedin_session_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage own session state"
  ON public.linkedin_session_state FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) AND admin_id = auth.uid())
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND admin_id = auth.uid());

CREATE TRIGGER touch_linkedin_session_state_updated_at
  BEFORE UPDATE ON public.linkedin_session_state
  FOR EACH ROW EXECUTE FUNCTION public.touch_leads_updated_at();

-- Activity log
CREATE TABLE IF NOT EXISTS public.linkedin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid,
  lead_id uuid,
  action text NOT NULL,
  status text NOT NULL DEFAULT 'ok',
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.linkedin_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read all linkedin activity"
  ON public.linkedin_activity_log FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert linkedin activity"
  ON public.linkedin_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_linkedin_activity_lead ON public.linkedin_activity_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_activity_created ON public.linkedin_activity_log(created_at DESC);

-- Seed a default template
INSERT INTO public.linkedin_templates (name, body, is_default)
VALUES (
  'EU AI Act — default',
  'Hi {firstName}, saw you work on {function} at {company}. With EU AI Act enforcement landing Aug 2026, curious how {company} is approaching Article 14 human oversight. I built HFAI to make it audit-ready in 14 days — would value your perspective. Open to a quick chat?',
  true
)
ON CONFLICT DO NOTHING;