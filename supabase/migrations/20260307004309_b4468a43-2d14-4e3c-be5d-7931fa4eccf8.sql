
-- Allow reviewers to update violations (e.g. set status to under_review/resolved)
CREATE POLICY "Reviewers update assigned violations"
ON public.violations
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'reviewer'::app_role))
WITH CHECK (has_role(auth.uid(), 'reviewer'::app_role));
