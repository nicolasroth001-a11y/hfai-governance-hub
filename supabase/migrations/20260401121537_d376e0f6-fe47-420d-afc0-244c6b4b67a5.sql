
-- 1. CRITICAL: Prevent users from changing their own org_id (privilege escalation)
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND org_id = ( SELECT p.org_id FROM public.profiles p WHERE p.id = auth.uid() ));

-- 2. Fix function search_path on functions missing it
CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
  RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $function$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN
  RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
  RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $function$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$function$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer)
  RETURNS TABLE(msg_id bigint, read_ct integer, message jsonb)
  LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.message FROM pgmq.read(queue_name, vt, batch_size) r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN;
END;
$function$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)
  RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $function$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
EXCEPTION WHEN undefined_table THEN
  BEGIN
    PERFORM pgmq.create(dlq_name);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  BEGIN
    PERFORM pgmq.delete(source_queue, message_id);
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  RETURN new_id;
END;
$function$;

-- 3. Tighten notification_logs INSERT policy
DROP POLICY IF EXISTS "Service insert notification logs" ON public.notification_logs;
CREATE POLICY "Service insert notification logs"
  ON public.notification_logs FOR INSERT TO authenticated
  WITH CHECK (
    org_id = ( SELECT profiles.org_id FROM profiles WHERE profiles.id = auth.uid() )
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- 4. Tighten email_send_log policies to service_role only
DROP POLICY IF EXISTS "Service role can insert send log" ON public.email_send_log;
CREATE POLICY "Service role can insert send log"
  ON public.email_send_log FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can read send log" ON public.email_send_log;
CREATE POLICY "Service role can read send log"
  ON public.email_send_log FOR SELECT TO service_role
  USING (true);

DROP POLICY IF EXISTS "Service role can update send log" ON public.email_send_log;
CREATE POLICY "Service role can update send log"
  ON public.email_send_log FOR UPDATE TO service_role
  USING (true) WITH CHECK (true);

-- 5. Tighten email_unsubscribe_tokens policies to service_role only
DROP POLICY IF EXISTS "Service role can insert tokens" ON public.email_unsubscribe_tokens;
CREATE POLICY "Service role can insert tokens"
  ON public.email_unsubscribe_tokens FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can mark tokens as used" ON public.email_unsubscribe_tokens;
CREATE POLICY "Service role can mark tokens as used"
  ON public.email_unsubscribe_tokens FOR UPDATE TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can read tokens" ON public.email_unsubscribe_tokens;
CREATE POLICY "Service role can read tokens"
  ON public.email_unsubscribe_tokens FOR SELECT TO service_role
  USING (true);

-- 6. Tighten suppressed_emails policies to service_role only
DROP POLICY IF EXISTS "Service role can insert suppressed emails" ON public.suppressed_emails;
CREATE POLICY "Service role can insert suppressed emails"
  ON public.suppressed_emails FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can read suppressed emails" ON public.suppressed_emails;
CREATE POLICY "Service role can read suppressed emails"
  ON public.suppressed_emails FOR SELECT TO service_role
  USING (true);

-- 7. Tighten newsletter_subscribers to service_role only
DROP POLICY IF EXISTS "Service role full access" ON public.newsletter_subscribers;
CREATE POLICY "Service role full access"
  ON public.newsletter_subscribers FOR ALL TO service_role
  USING (true) WITH CHECK (true);
