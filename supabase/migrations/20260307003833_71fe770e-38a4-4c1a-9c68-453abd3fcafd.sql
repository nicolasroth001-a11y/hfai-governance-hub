-- Add assigned_reviewer_id to violations for reviewer assignment queue
ALTER TABLE public.violations ADD COLUMN assigned_reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Allow customers to insert reviews on their own org's violations
CREATE POLICY "Customers review own violations"
ON public.human_reviews
FOR INSERT
TO authenticated
WITH CHECK (
  violation_id IN (
    SELECT v.id FROM violations v
    WHERE v.org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid())
  )
);

-- Allow customers to see reviews they created
CREATE POLICY "Customers see own created reviews"
ON public.human_reviews
FOR SELECT
TO authenticated
USING (reviewer_id = auth.uid())