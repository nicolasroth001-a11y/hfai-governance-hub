REVOKE EXECUTE ON FUNCTION public.increment_guard_block_stat(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_guard_block_stat(uuid, text) TO service_role;