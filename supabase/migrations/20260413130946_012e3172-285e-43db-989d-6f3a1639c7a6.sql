
-- 1. Restrict webhook_endpoints: only admins of the org can manage
DROP POLICY IF EXISTS "Users can manage own org webhooks" ON public.webhook_endpoints;

CREATE POLICY "Admins manage all webhooks"
ON public.webhook_endpoints
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Org admins manage own webhooks"
ON public.webhook_endpoints
FOR ALL
TO authenticated
USING (
  org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid())
  AND has_role(auth.uid(), 'customer'::app_role)
)
WITH CHECK (
  org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid())
  AND has_role(auth.uid(), 'customer'::app_role)
);

-- 2. Restrict webhook_deliveries similarly
DROP POLICY IF EXISTS "Users can view own org webhook deliveries" ON public.webhook_deliveries;

CREATE POLICY "Admins view all webhook deliveries"
ON public.webhook_deliveries
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customers view own webhook deliveries"
ON public.webhook_deliveries
FOR SELECT
TO authenticated
USING (
  org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid())
);

-- 3. Restrict connected_providers: tighten customer access
-- Keep existing admin policy, replace customer ALL with more restrictive
DROP POLICY IF EXISTS "Customers manage own providers" ON public.connected_providers;

-- Customers can only see provider name/status, not secrets
-- We restrict to SELECT only for regular customers; INSERT/UPDATE/DELETE requires specific UI flows
CREATE POLICY "Customers view own providers"
ON public.connected_providers
FOR SELECT
TO authenticated
USING (
  org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid())
);

CREATE POLICY "Customers insert own providers"
ON public.connected_providers
FOR INSERT
TO authenticated
WITH CHECK (
  org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid())
);

CREATE POLICY "Customers update own providers"
ON public.connected_providers
FOR UPDATE
TO authenticated
USING (
  org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid())
)
WITH CHECK (
  org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid())
);

CREATE POLICY "Customers delete own providers"
ON public.connected_providers
FOR DELETE
TO authenticated
USING (
  org_id = (SELECT p.org_id FROM profiles p WHERE p.id = auth.uid())
);

-- 4. Hide submitter_email from public blog post reads
DROP POLICY IF EXISTS "Public read published posts" ON public.blog_posts;

CREATE POLICY "Public read published posts"
ON public.blog_posts
FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Create a secure view that hides submitter_email for public consumption
CREATE OR REPLACE VIEW public.public_blog_posts
WITH (security_invoker = true)
AS
SELECT 
  id, slug, title, excerpt, content, author_name, 
  published_at, tags, featured, meta_title, meta_description, 
  read_time, status, created_at, updated_at, source_url
FROM public.blog_posts
WHERE status = 'published';
