CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_org_id uuid;
  user_role app_role;
BEGIN
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'customer');

  -- Auto-create organization for new customer signups
  IF user_role = 'customer' THEN
    INSERT INTO public.organizations (name, contact_email)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'company_name', NEW.raw_user_meta_data->>'name', 'My Organization'),
      COALESCE(NEW.email, '')
    )
    RETURNING id INTO new_org_id;
  END IF;

  INSERT INTO public.profiles (id, email, name, role, org_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    user_role,
    new_org_id
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);

  -- Notify admin of new signup (non-fatal: don't block signup if notification fails)
  BEGIN
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/notify-signup',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'email', COALESCE(NEW.email, ''),
        'name', COALESCE(NEW.raw_user_meta_data->>'name', ''),
        'company_name', COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
        'role', user_role::text,
        'signup_source', COALESCE(NEW.raw_user_meta_data->>'signup_source', 'direct'),
        'signup_timestamp', COALESCE(NEW.raw_user_meta_data->>'signup_timestamp', now()::text)
      )
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log but don't fail signup
    RAISE WARNING 'notify-signup failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$function$