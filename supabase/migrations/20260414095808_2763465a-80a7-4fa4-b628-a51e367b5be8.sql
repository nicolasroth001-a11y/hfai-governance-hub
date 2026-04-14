CREATE TABLE public.assessment_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  company_name TEXT,
  assessment_type TEXT NOT NULL DEFAULT 'readiness',
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 14,
  score_percentage NUMERIC GENERATED ALWAYS AS (CASE WHEN max_score > 0 THEN ROUND((score::numeric / max_score::numeric) * 100, 1) ELSE 0 END) STORED,
  answers JSONB DEFAULT '{}'::jsonb,
  category_scores JSONB DEFAULT '{}'::jsonb,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all assessment results"
ON public.assessment_results
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert assessment results"
ON public.assessment_results
FOR INSERT
TO public
WITH CHECK (true);

CREATE INDEX idx_assessment_results_type ON public.assessment_results(assessment_type);
CREATE INDEX idx_assessment_results_created ON public.assessment_results(created_at DESC);
CREATE INDEX idx_assessment_results_email ON public.assessment_results(email);