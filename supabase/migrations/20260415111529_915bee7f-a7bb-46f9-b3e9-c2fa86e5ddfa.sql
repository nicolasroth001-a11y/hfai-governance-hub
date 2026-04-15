
-- Create reviewer_type enum (if not exists)
DO $$ BEGIN
  CREATE TYPE public.reviewer_type AS ENUM ('company_assigned', 'hfai_appointed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create reviewer_permissions table
CREATE TABLE IF NOT EXISTS public.reviewer_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL,
  reviewer_type public.reviewer_type NOT NULL DEFAULT 'company_assigned',
  is_backup_reviewer boolean NOT NULL DEFAULT false,
  can_review_violations boolean NOT NULL DEFAULT true,
  can_manage_rules boolean NOT NULL DEFAULT false,
  can_manage_systems boolean NOT NULL DEFAULT false,
  can_approve_deployments boolean NOT NULL DEFAULT false,
  can_override_decisions boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (org_id, reviewer_id)
);

ALTER TABLE public.reviewer_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all reviewer permissions"
  ON public.reviewer_permissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Customers manage own reviewer permissions"
  ON public.reviewer_permissions FOR ALL TO authenticated
  USING (org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid()))
  WITH CHECK (org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid()));

CREATE POLICY "Reviewers see own permissions"
  ON public.reviewer_permissions FOR SELECT TO authenticated
  USING (reviewer_id = auth.uid());

-- Create reviewer_overrides table
CREATE TABLE IF NOT EXISTS public.reviewer_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  violation_id uuid NOT NULL REFERENCES public.violations(id) ON DELETE CASCADE,
  original_review_id uuid NOT NULL REFERENCES public.human_reviews(id) ON DELETE CASCADE,
  override_reviewer_id uuid NOT NULL,
  original_decision text,
  override_decision text NOT NULL,
  override_reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reviewer_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all overrides"
  ON public.reviewer_overrides FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Customers see own overrides"
  ON public.reviewer_overrides FOR SELECT TO authenticated
  USING (org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid()));

CREATE POLICY "Reviewers see own overrides"
  ON public.reviewer_overrides FOR SELECT TO authenticated
  USING (override_reviewer_id = auth.uid());

CREATE POLICY "HFAI reviewers can create overrides"
  ON public.reviewer_overrides FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reviewer_permissions rp
      WHERE rp.reviewer_id = auth.uid()
        AND rp.can_override_decisions = true
    )
  );
