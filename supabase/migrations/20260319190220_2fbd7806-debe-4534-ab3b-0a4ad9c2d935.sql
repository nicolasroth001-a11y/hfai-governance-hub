
CREATE TABLE public.connected_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'openai',
  api_key_encrypted text NOT NULL,
  base_url text DEFAULT 'https://api.openai.com/v1',
  proxy_token text NOT NULL DEFAULT ('hfproxy_' || encode(extensions.gen_random_bytes(24), 'hex')),
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(org_id, provider)
);

ALTER TABLE public.connected_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers manage own providers" ON public.connected_providers
  FOR ALL TO authenticated
  USING (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid()))
  WITH CHECK (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Admins manage all providers" ON public.connected_providers
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
