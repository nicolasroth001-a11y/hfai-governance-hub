
-- ============================================================
-- FIX 4: Cross-org override prevention on reviewer_overrides
-- ============================================================
DROP POLICY IF EXISTS "HFAI reviewers can create overrides" ON public.reviewer_overrides;

CREATE POLICY "HFAI reviewers can create overrides"
ON public.reviewer_overrides
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM reviewer_permissions rp
    WHERE rp.reviewer_id = auth.uid()
      AND rp.can_override_decisions = true
      AND rp.org_id = reviewer_overrides.org_id
  )
  AND public.reviewer_has_org_access(auth.uid(), reviewer_overrides.org_id)
  AND EXISTS (
    SELECT 1 FROM violations v
    WHERE v.id = reviewer_overrides.violation_id
      AND v.org_id = reviewer_overrides.org_id
  )
);

-- ============================================================
-- FIX 5: Realtime channel authorization (org-scoped)
-- ============================================================
-- realtime.messages controls who can subscribe to which channel topics.
-- We require channels to be named like "org:<org_id>:..." and only allow
-- subscribers whose profile.org_id matches, or admins.

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org-scoped realtime read" ON realtime.messages;
DROP POLICY IF EXISTS "Org-scoped realtime write" ON realtime.messages;

CREATE POLICY "Org-scoped realtime read"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR (
    realtime.topic() LIKE 'org:%'
    AND split_part(realtime.topic(), ':', 2)::uuid = (
      SELECT org_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Org-scoped realtime write"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR (
    realtime.topic() LIKE 'org:%'
    AND split_part(realtime.topic(), ':', 2)::uuid = (
      SELECT org_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);
