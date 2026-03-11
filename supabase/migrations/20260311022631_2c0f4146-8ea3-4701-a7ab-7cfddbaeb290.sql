
-- Fix overly permissive INSERT policies
DROP POLICY "Service role inserts RCAs" ON public.root_cause_analyses;
CREATE POLICY "Authenticated insert RCAs" ON public.root_cause_analyses FOR INSERT TO authenticated
  WITH CHECK (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY "Service role inserts patterns" ON public.violation_patterns;
CREATE POLICY "Authenticated insert patterns" ON public.violation_patterns FOR INSERT TO authenticated
  WITH CHECK (org_id = (SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));
