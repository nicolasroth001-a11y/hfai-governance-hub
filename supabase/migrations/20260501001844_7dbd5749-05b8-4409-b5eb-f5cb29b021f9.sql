-- Allow admins to insert human reviews on any violation
CREATE POLICY "Admins create any review"
ON public.human_reviews
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any review
CREATE POLICY "Admins update any review"
ON public.human_reviews
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));