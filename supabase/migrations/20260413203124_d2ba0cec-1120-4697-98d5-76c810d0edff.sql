
-- Allow admins to read analytics table
CREATE POLICY "Admins can read analytics"
ON public.analytics
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to read page_views table
CREATE POLICY "Admins can read page_views"
ON public.page_views
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to read email_send_log
CREATE POLICY "Admins can read email_send_log"
ON public.email_send_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to read newsletter_subscribers
CREATE POLICY "Admins can read newsletter_subscribers"
ON public.newsletter_subscribers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
