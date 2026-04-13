-- Fix privilege escalation: prevent users from changing their own role via profile update
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid())
  AND role = (SELECT p.role FROM profiles p WHERE p.id = auth.uid())
);