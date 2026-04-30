-- Add claim tracking to guard_devices
ALTER TABLE public.guard_devices
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz,
  ADD COLUMN IF NOT EXISTS claimed_by_user_id uuid;

CREATE INDEX IF NOT EXISTS idx_guard_devices_token ON public.guard_devices(device_token);

-- RPC: claim a Guard device for the authenticated user.
-- Strategy:
--  • If user has no org_id → assign them to the guard-provisioned org as 'customer'.
--  • If user already has an org_id → reassign the device + its block stats to user's existing org,
--    then mark the orphan guard org for cleanup (we just leave it; cheap).
CREATE OR REPLACE FUNCTION public.claim_guard_device(_device_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_user_org uuid;
  v_device_id uuid;
  v_guard_org uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _device_token IS NULL OR length(_device_token) < 16 THEN
    RAISE EXCEPTION 'Invalid device token';
  END IF;

  SELECT id, org_id INTO v_device_id, v_guard_org
  FROM public.guard_devices WHERE device_token = _device_token;

  IF v_device_id IS NULL THEN
    RAISE EXCEPTION 'Device not found';
  END IF;

  SELECT org_id INTO v_user_org FROM public.profiles WHERE id = v_user;

  IF v_user_org IS NULL THEN
    -- Adopt the guard org as the user's org
    UPDATE public.profiles SET org_id = v_guard_org WHERE id = v_user;
    UPDATE public.guard_devices
      SET claimed_at = now(), claimed_by_user_id = v_user
      WHERE id = v_device_id;
    RETURN jsonb_build_object('org_id', v_guard_org, 'mode', 'adopted');
  ELSE
    -- Move the device + its stats to the user's existing org
    UPDATE public.guard_block_stats SET org_id = v_user_org WHERE org_id = v_guard_org;
    UPDATE public.guard_devices
      SET org_id = v_user_org, claimed_at = now(), claimed_by_user_id = v_user
      WHERE id = v_device_id;
    RETURN jsonb_build_object('org_id', v_user_org, 'mode', 'merged');
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_guard_device(text) TO authenticated;