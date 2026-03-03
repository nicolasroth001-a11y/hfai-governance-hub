
-- Create the analytics table
CREATE TABLE public.analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route text NOT NULL,
  user_id text,
  session_id text NOT NULL,
  referrer text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous tracking)
CREATE POLICY "Anyone can insert analytics"
  ON public.analytics FOR INSERT
  WITH CHECK (true);

-- No public SELECT - only service role (edge functions) can read
-- We'll query via edge function for the admin dashboard
