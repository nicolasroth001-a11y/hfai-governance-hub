
-- 1. Create security definer function to check reviewer org access
CREATE OR REPLACE FUNCTION public.reviewer_has_org_access(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- In-house reviewer: profile org_id matches
    SELECT 1 FROM profiles WHERE id = _user_id AND role = 'reviewer' AND org_id = _org_id
  ) OR EXISTS (
    -- HFAI expert: has reviewer_permissions entry for this org
    SELECT 1 FROM reviewer_permissions WHERE reviewer_id = _user_id AND org_id = _org_id
  )
$$;

-- 2. Add unique constraint on reviewer_permissions for upsert support
ALTER TABLE public.reviewer_permissions
  ADD CONSTRAINT reviewer_permissions_org_reviewer_unique UNIQUE (org_id, reviewer_id);

-- 3. Update ai_system_versions reviewer policy
DROP POLICY IF EXISTS "Reviewers view versions" ON public.ai_system_versions;
CREATE POLICY "Reviewers view org versions"
  ON public.ai_system_versions FOR SELECT TO authenticated
  USING (reviewer_has_org_access(auth.uid(), org_id));

-- 4. Update bias_fairness_audits reviewer policy
DROP POLICY IF EXISTS "Reviewers view bias audits" ON public.bias_fairness_audits;
CREATE POLICY "Reviewers view org bias audits"
  ON public.bias_fairness_audits FOR SELECT TO authenticated
  USING (reviewer_has_org_access(auth.uid(), org_id));

-- 5. Update data_lineage_records reviewer policy
DROP POLICY IF EXISTS "Reviewers view lineage records" ON public.data_lineage_records;
CREATE POLICY "Reviewers view org lineage records"
  ON public.data_lineage_records FOR SELECT TO authenticated
  USING (reviewer_has_org_access(auth.uid(), org_id));

-- 6. Update deployment_readiness reviewer policy
DROP POLICY IF EXISTS "Reviewers view readiness" ON public.deployment_readiness;
CREATE POLICY "Reviewers view org readiness"
  ON public.deployment_readiness FOR SELECT TO authenticated
  USING (reviewer_has_org_access(auth.uid(), org_id));

-- 7. Update human_reviews reviewer policies
DROP POLICY IF EXISTS "Reviewers see all reviews" ON public.human_reviews;
CREATE POLICY "Reviewers see org reviews"
  ON public.human_reviews FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'reviewer'::app_role) AND
    (violation_id IN (
      SELECT v.id FROM violations v WHERE reviewer_has_org_access(auth.uid(), v.org_id)
    ))
  );

DROP POLICY IF EXISTS "Reviewers create reviews" ON public.human_reviews;
CREATE POLICY "Reviewers create org reviews"
  ON public.human_reviews FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'reviewer'::app_role) AND
    (violation_id IN (
      SELECT v.id FROM violations v WHERE reviewer_has_org_access(auth.uid(), v.org_id)
    ))
  );

-- 8. Update remediation_actions reviewer policy
DROP POLICY IF EXISTS "Reviewers see all remediations" ON public.remediation_actions;
CREATE POLICY "Reviewers see org remediations"
  ON public.remediation_actions FOR SELECT TO authenticated
  USING (reviewer_has_org_access(auth.uid(), org_id));

-- 9. Update root_cause_analyses reviewer policy
DROP POLICY IF EXISTS "Reviewers see all RCAs" ON public.root_cause_analyses;
CREATE POLICY "Reviewers see org RCAs"
  ON public.root_cause_analyses FOR SELECT TO authenticated
  USING (reviewer_has_org_access(auth.uid(), org_id));

-- 10. Update violation_patterns reviewer policy
DROP POLICY IF EXISTS "Reviewers see all patterns" ON public.violation_patterns;
CREATE POLICY "Reviewers see org patterns"
  ON public.violation_patterns FOR SELECT TO authenticated
  USING (reviewer_has_org_access(auth.uid(), org_id));

-- 11. Add reviewer access to ai_systems
CREATE POLICY "Reviewers see org ai_systems"
  ON public.ai_systems FOR SELECT TO authenticated
  USING (reviewer_has_org_access(auth.uid(), org_id));

-- 12. Add reviewer access to ai_events
CREATE POLICY "Reviewers see org events"
  ON public.ai_events FOR SELECT TO authenticated
  USING (reviewer_has_org_access(auth.uid(), org_id));

-- 13. Add reviewer access to rules
CREATE POLICY "Reviewers see org rules"
  ON public.rules FOR SELECT TO authenticated
  USING (reviewer_has_org_access(auth.uid(), org_id));

-- 14. Add reviewer access to violations (if not already present)
CREATE POLICY "Reviewers see org violations"
  ON public.violations FOR SELECT TO authenticated
  USING (reviewer_has_org_access(auth.uid(), org_id));

-- 15. Allow reviewers to update violations they have access to (for flagging/status changes)
CREATE POLICY "Reviewers update org violations"
  ON public.violations FOR UPDATE TO authenticated
  USING (reviewer_has_org_access(auth.uid(), org_id))
  WITH CHECK (reviewer_has_org_access(auth.uid(), org_id));
