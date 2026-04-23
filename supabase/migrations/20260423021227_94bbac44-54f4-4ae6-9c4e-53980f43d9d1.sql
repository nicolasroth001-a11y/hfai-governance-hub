-- Remove broken notify_on_violation trigger that fails because
-- app.settings.supabase_url is not configured. The ingest-event edge function
-- already invokes notify-violation directly, so this trigger is redundant
-- and was causing every violation insert to roll back.

DROP TRIGGER IF EXISTS notify_violation_trigger ON public.violations;
DROP TRIGGER IF EXISTS trg_notify_on_violation ON public.violations;
DROP TRIGGER IF EXISTS notify_on_violation_trigger ON public.violations;

-- Also drop the function itself since nothing else uses it
DROP FUNCTION IF EXISTS public.notify_on_violation() CASCADE;

-- Replace ingest-event direct call: add explicit notify trigger via edge function
-- (The edge function already handles webhook delivery; admin email notifications
-- can be added back via a separate, working mechanism if needed)