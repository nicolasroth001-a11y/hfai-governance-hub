
-- ============================================================
-- FIX 1: Protect organizations.api_key from member exposure
-- ============================================================
-- Drop overly permissive customer SELECT (currently exposes api_key)
DROP POLICY IF EXISTS "Customers see own org" ON public.organizations;

-- Replace with column-aware policy: members can SELECT the row,
-- but we'll create a safe view + revoke api_key column access.
-- Simplest portable approach: keep row policy but revoke column SELECT on api_key.
CREATE POLICY "Members see own org"
ON public.organizations
FOR SELECT
TO authenticated
USING (id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid()));

-- Revoke api_key column from authenticated; only service_role + admins via RPC may read it
REVOKE SELECT (api_key) ON public.organizations FROM authenticated;
REVOKE SELECT (api_key) ON public.organizations FROM anon;

-- Secure RPC for admins / org owner to fetch the api_key explicitly
CREATE OR REPLACE FUNCTION public.get_org_api_key(_org_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key text;
  v_caller_org uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT org_id INTO v_caller_org FROM profiles WHERE id = auth.uid();

  IF NOT (public.has_role(auth.uid(), 'admin') OR v_caller_org = _org_id) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT api_key INTO v_key FROM organizations WHERE id = _org_id;
  RETURN v_key;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_org_api_key(uuid) TO authenticated;

-- ============================================================
-- FIX 2: Protect connected_providers proxy_token + api_key_encrypted
-- ============================================================
REVOKE SELECT (api_key_encrypted, proxy_token) ON public.connected_providers FROM authenticated;
REVOKE SELECT (api_key_encrypted, proxy_token) ON public.connected_providers FROM anon;

-- Secure RPC for org members / admins to fetch their proxy token
CREATE OR REPLACE FUNCTION public.get_provider_proxy_token(_provider_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token text;
  v_caller_org uuid;
  v_provider_org uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT org_id INTO v_caller_org FROM profiles WHERE id = auth.uid();
  SELECT org_id INTO v_provider_org FROM connected_providers WHERE id = _provider_id;

  IF NOT (public.has_role(auth.uid(), 'admin') OR v_caller_org = v_provider_org) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT proxy_token INTO v_token FROM connected_providers WHERE id = _provider_id;
  RETURN v_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_provider_proxy_token(uuid) TO authenticated;

-- ============================================================
-- FIX 3: Prevent privilege escalation on reviewer_permissions
-- ============================================================
-- Currently "Customers manage own reviewer permissions" lets a customer
-- set can_override_decisions = true on themselves or their reviewers.
-- Replace with policies that block override flag changes for non-admins.

DROP POLICY IF EXISTS "Customers manage own reviewer permissions" ON public.reviewer_permissions;

-- Customers can SELECT permissions for their org's reviewers
CREATE POLICY "Customers view own reviewer permissions"
ON public.reviewer_permissions
FOR SELECT
TO authenticated
USING (org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid()));

-- Customers can INSERT permissions but NOT with override or hfai_appointed type
CREATE POLICY "Customers insert own reviewer permissions"
ON public.reviewer_permissions
FOR INSERT
TO authenticated
WITH CHECK (
  org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid())
  AND can_override_decisions = false
  AND reviewer_type = 'company_assigned'::reviewer_type
);

-- Customers can UPDATE permissions but cannot enable override or change to hfai_appointed
CREATE POLICY "Customers update own reviewer permissions"
ON public.reviewer_permissions
FOR UPDATE
TO authenticated
USING (org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid()))
WITH CHECK (
  org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid())
  AND can_override_decisions = false
  AND reviewer_type = 'company_assigned'::reviewer_type
);

-- Customers can DELETE their org's reviewer permissions
CREATE POLICY "Customers delete own reviewer permissions"
ON public.reviewer_permissions
FOR DELETE
TO authenticated
USING (org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid()));
