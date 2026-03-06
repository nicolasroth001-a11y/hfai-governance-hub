
-- Tighten audit_logs insert: only allow inserting logs for own user_id
DROP POLICY "Authenticated insert logs" ON public.audit_logs;
CREATE POLICY "Users insert own logs" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
