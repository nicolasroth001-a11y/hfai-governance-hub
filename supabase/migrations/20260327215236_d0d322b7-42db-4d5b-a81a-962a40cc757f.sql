CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  gdpr_consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON public.newsletter_subscribers
  FOR ALL TO service_role USING (true) WITH CHECK (true);