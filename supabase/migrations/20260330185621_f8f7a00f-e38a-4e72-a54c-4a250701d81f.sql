
-- Deployment readiness assessments table
CREATE TABLE public.deployment_readiness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_system_id uuid NOT NULL REFERENCES public.ai_systems(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft',
  
  -- Checklist items (boolean flags)
  operating_model_defined boolean NOT NULL DEFAULT false,
  operating_model_notes text DEFAULT '',
  risk_classified boolean NOT NULL DEFAULT false,
  risk_classification_notes text DEFAULT '',
  rule_coverage_verified boolean NOT NULL DEFAULT false,
  rule_coverage_notes text DEFAULT '',
  oversight_assigned boolean NOT NULL DEFAULT false,
  oversight_notes text DEFAULT '',
  data_governance_reviewed boolean NOT NULL DEFAULT false,
  data_governance_notes text DEFAULT '',
  transparency_documented boolean NOT NULL DEFAULT false,
  transparency_notes text DEFAULT '',
  
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(ai_system_id)
);

ALTER TABLE public.deployment_readiness ENABLE ROW LEVEL SECURITY;

-- Customers manage their own assessments
CREATE POLICY "Customers manage own readiness"
  ON public.deployment_readiness FOR ALL
  TO authenticated
  USING (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid()))
  WITH CHECK (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid()));

-- Admins see all
CREATE POLICY "Admins manage all readiness"
  ON public.deployment_readiness FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Reviewers can view
CREATE POLICY "Reviewers view readiness"
  ON public.deployment_readiness FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'reviewer'::app_role));
