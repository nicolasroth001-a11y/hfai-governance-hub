-- Allow customers to update their own violations (for resolution workflow)
CREATE POLICY "Customers update own violations"
ON public.violations
FOR UPDATE
TO authenticated
USING (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid()))
WITH CHECK (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid()))