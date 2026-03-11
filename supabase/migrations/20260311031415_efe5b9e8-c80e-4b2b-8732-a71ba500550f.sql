
-- Notification preferences per organization
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email_enabled boolean NOT NULL DEFAULT true,
  email_recipients text[] NOT NULL DEFAULT '{}',
  notify_all_violations boolean NOT NULL DEFAULT true,
  notify_high_severity boolean NOT NULL DEFAULT true,
  notify_patterns boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(org_id)
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers manage own notification prefs"
ON public.notification_preferences FOR ALL
TO authenticated
USING (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid()))
WITH CHECK (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Admins manage all notification prefs"
ON public.notification_preferences FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Notification log for audit trail
CREATE TABLE public.notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  violation_id uuid REFERENCES public.violations(id) ON DELETE SET NULL,
  channel text NOT NULL DEFAULT 'email',
  recipients text[] NOT NULL DEFAULT '{}',
  subject text,
  status text NOT NULL DEFAULT 'sent',
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers see own notification logs"
ON public.notification_logs FOR SELECT
TO authenticated
USING (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Admins see all notification logs"
ON public.notification_logs FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service insert notification logs"
ON public.notification_logs FOR INSERT
TO authenticated
WITH CHECK (true);
