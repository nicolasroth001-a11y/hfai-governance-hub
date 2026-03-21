ALTER TABLE public.ai_systems ADD COLUMN IF NOT EXISTS eu_risk_tier text DEFAULT 'not_classified';
ALTER TABLE public.ai_systems ADD COLUMN IF NOT EXISTS data_governance_notes text DEFAULT '';
ALTER TABLE public.ai_systems ADD COLUMN IF NOT EXISTS transparency_uri text DEFAULT '';

COMMENT ON COLUMN public.ai_systems.eu_risk_tier IS 'EU AI Act risk tier: unacceptable, high_risk, limited_risk, minimal_risk, not_classified';
COMMENT ON COLUMN public.ai_systems.data_governance_notes IS 'Documentation of training data sources, bias testing, and data representativeness';
COMMENT ON COLUMN public.ai_systems.transparency_uri IS 'URL where end-users are informed they are interacting with AI';