
-- Create a function to call the notify-violation edge function via pg_net
CREATE OR REPLACE FUNCTION public.notify_on_violation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  trigger_type text := 'new_violation';
BEGIN
  -- Determine trigger type based on severity
  IF NEW.severity IN ('high', 'critical') THEN
    trigger_type := 'high_severity';
  END IF;

  -- Call the edge function via pg_net
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/notify-violation',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'violation_id', NEW.id,
      'trigger_type', trigger_type
    )
  );

  RETURN NEW;
END;
$$;

-- Create the trigger on violations table
CREATE TRIGGER trigger_notify_violation
AFTER INSERT ON public.violations
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_violation();
