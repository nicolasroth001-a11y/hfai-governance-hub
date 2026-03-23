
-- Webhook endpoints table
CREATE TABLE public.webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT,
  events TEXT[] DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own org webhooks" ON public.webhook_endpoints
  FOR ALL TO authenticated
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

-- Webhook delivery logs
CREATE TABLE public.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_endpoint_id UUID REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB,
  response_status INTEGER,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org webhook deliveries" ON public.webhook_deliveries
  FOR SELECT TO authenticated
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

-- Onboarding progress table
CREATE TABLE public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  steps_completed TEXT[] DEFAULT '{}',
  current_step TEXT DEFAULT 'connect',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own org onboarding" ON public.onboarding_progress
  FOR ALL TO authenticated
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));
