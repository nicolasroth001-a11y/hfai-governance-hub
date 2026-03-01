
-- Simple page view analytics
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Allow anonymous inserts (no auth needed for tracking)
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views"
ON public.page_views
FOR INSERT
WITH CHECK (true);

-- No SELECT policy for public - only viewable via admin/direct DB access
