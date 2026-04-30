
-- Add Guard signup flag to organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS signup_via_guard boolean NOT NULL DEFAULT false;

-- Devices table: one row per browser install of the Guard extension
CREATE TABLE IF NOT EXISTS public.guard_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  device_token text NOT NULL UNIQUE,
  email text,
  user_agent text,
  browser text,
  install_source text,
  installed_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guard_devices_org_id ON public.guard_devices(org_id);
CREATE INDEX IF NOT EXISTS idx_guard_devices_token ON public.guard_devices(device_token);

ALTER TABLE public.guard_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's guard devices"
  ON public.guard_devices FOR SELECT
  USING (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- Daily block stats cache for the free dashboard
CREATE TABLE IF NOT EXISTS public.guard_block_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  stat_date date NOT NULL,
  category text NOT NULL,
  block_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, stat_date, category)
);

CREATE INDEX IF NOT EXISTS idx_guard_block_stats_org_date ON public.guard_block_stats(org_id, stat_date DESC);

ALTER TABLE public.guard_block_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's block stats"
  ON public.guard_block_stats FOR SELECT
  USING (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- Atomic increment helper (used by ingest-event for Guard-tagged events)
CREATE OR REPLACE FUNCTION public.increment_guard_block_stat(_org_id uuid, _category text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.guard_block_stats (org_id, stat_date, category, block_count)
  VALUES (_org_id, CURRENT_DATE, _category, 1)
  ON CONFLICT (org_id, stat_date, category)
  DO UPDATE SET block_count = guard_block_stats.block_count + 1, updated_at = now();
END;
$$;
