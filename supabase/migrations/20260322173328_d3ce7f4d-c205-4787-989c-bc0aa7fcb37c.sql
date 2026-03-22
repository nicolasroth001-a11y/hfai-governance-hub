CREATE POLICY "Anyone can submit blog posts for review"
ON public.blog_posts
FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending_review');