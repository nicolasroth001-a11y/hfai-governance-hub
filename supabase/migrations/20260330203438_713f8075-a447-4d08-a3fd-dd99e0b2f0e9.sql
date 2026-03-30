
-- 1. Bias/Fairness Audits
CREATE TABLE public.bias_fairness_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_system_id uuid NOT NULL REFERENCES public.ai_systems(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  metric_type text NOT NULL DEFAULT 'demographic_parity',
  score numeric,
  threshold numeric DEFAULT 0.8,
  passed boolean DEFAULT false,
  dataset_description text DEFAULT '',
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.bias_fairness_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage all bias audits" ON public.bias_fairness_audits FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers manage own bias audits" ON public.bias_fairness_audits FOR ALL TO authenticated USING (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid())) WITH CHECK (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Reviewers view bias audits" ON public.bias_fairness_audits FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'reviewer'));

-- 2. AI System Versions (Model Version History)
CREATE TABLE public.ai_system_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_system_id uuid NOT NULL REFERENCES public.ai_systems(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  version_label text NOT NULL DEFAULT '',
  change_description text DEFAULT '',
  changed_by uuid,
  previous_values jsonb DEFAULT '{}'::jsonb,
  new_values jsonb DEFAULT '{}'::jsonb,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_system_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage all versions" ON public.ai_system_versions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers manage own versions" ON public.ai_system_versions FOR ALL TO authenticated USING (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid())) WITH CHECK (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Reviewers view versions" ON public.ai_system_versions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'reviewer'));

-- 3. Scheduled Audits
CREATE TABLE public.scheduled_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_system_id uuid NOT NULL REFERENCES public.ai_systems(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  audit_type text NOT NULL DEFAULT 'governance_review',
  frequency_days integer NOT NULL DEFAULT 90,
  next_due_at timestamptz NOT NULL DEFAULT (now() + interval '90 days'),
  last_completed_at timestamptz,
  status text NOT NULL DEFAULT 'active',
  assigned_to uuid,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.scheduled_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage all scheduled audits" ON public.scheduled_audits FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers manage own scheduled audits" ON public.scheduled_audits FOR ALL TO authenticated USING (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid())) WITH CHECK (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid()));

-- 4. Vendor Risk Assessments
CREATE TABLE public.vendor_risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_system_id uuid REFERENCES public.ai_systems(id) ON DELETE SET NULL,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  vendor_name text NOT NULL,
  vendor_contact text DEFAULT '',
  risk_score integer DEFAULT 0,
  assessment_date timestamptz DEFAULT now(),
  contract_terms text DEFAULT '',
  data_processing_agreement boolean DEFAULT false,
  security_review_passed boolean DEFAULT false,
  compliance_status text DEFAULT 'pending',
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.vendor_risk_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage all vendor assessments" ON public.vendor_risk_assessments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers manage own vendor assessments" ON public.vendor_risk_assessments FOR ALL TO authenticated USING (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid())) WITH CHECK (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid()));

-- 5. Data Lineage Records
CREATE TABLE public.data_lineage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_system_id uuid NOT NULL REFERENCES public.ai_systems(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  data_source_name text NOT NULL,
  data_source_type text NOT NULL DEFAULT 'api',
  data_description text DEFAULT '',
  collection_method text DEFAULT '',
  consent_basis text DEFAULT '',
  retention_period text DEFAULT '',
  geographic_origin text DEFAULT '',
  pii_detected boolean DEFAULT false,
  quality_score numeric,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.data_lineage_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage all lineage records" ON public.data_lineage_records FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers manage own lineage records" ON public.data_lineage_records FOR ALL TO authenticated USING (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid())) WITH CHECK (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Reviewers view lineage records" ON public.data_lineage_records FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'reviewer'));
