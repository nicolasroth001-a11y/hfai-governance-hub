
-- Root Cause Analyses table
CREATE TABLE public.root_cause_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  violation_id uuid NOT NULL REFERENCES public.violations(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ai_diagnosis text DEFAULT '',
  ai_recommendations text DEFAULT '',
  ai_suggested_rules jsonb DEFAULT '[]'::jsonb,
  human_diagnosis text DEFAULT '',
  human_notes text DEFAULT '',
  status text DEFAULT 'pending',
  analyzed_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.root_cause_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins see all RCAs" ON public.root_cause_analyses FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage RCAs" ON public.root_cause_analyses FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Customers see own RCAs" ON public.root_cause_analyses FOR SELECT TO authenticated USING (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Customers update own RCAs" ON public.root_cause_analyses FOR UPDATE TO authenticated USING (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Reviewers see all RCAs" ON public.root_cause_analyses FOR SELECT TO authenticated USING (has_role(auth.uid(), 'reviewer'::app_role));
CREATE POLICY "Service role inserts RCAs" ON public.root_cause_analyses FOR INSERT TO authenticated WITH CHECK (true);

-- Remediation Actions table
CREATE TABLE public.remediation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rca_id uuid NOT NULL REFERENCES public.root_cause_analyses(id) ON DELETE CASCADE,
  violation_id uuid NOT NULL REFERENCES public.violations(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'pending',
  assigned_to uuid REFERENCES auth.users(id),
  due_date timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.remediation_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins see all remediations" ON public.remediation_actions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage remediations" ON public.remediation_actions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Customers see own remediations" ON public.remediation_actions FOR SELECT TO authenticated USING (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Customers manage own remediations" ON public.remediation_actions FOR ALL TO authenticated USING (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Reviewers see all remediations" ON public.remediation_actions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'reviewer'::app_role));

-- Violation Patterns table
CREATE TABLE public.violation_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  pattern_name text NOT NULL,
  description text DEFAULT '',
  violation_ids uuid[] DEFAULT '{}',
  rule_ids uuid[] DEFAULT '{}',
  frequency integer DEFAULT 1,
  first_seen timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  status text DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.violation_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins see all patterns" ON public.violation_patterns FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage patterns" ON public.violation_patterns FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Customers see own patterns" ON public.violation_patterns FOR SELECT TO authenticated USING (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Reviewers see all patterns" ON public.violation_patterns FOR SELECT TO authenticated USING (has_role(auth.uid(), 'reviewer'::app_role));
CREATE POLICY "Service role inserts patterns" ON public.violation_patterns FOR INSERT TO authenticated WITH CHECK (true);
