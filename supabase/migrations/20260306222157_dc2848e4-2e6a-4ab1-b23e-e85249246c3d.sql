
-- Add owner_team to ai_systems
ALTER TABLE public.ai_systems ADD COLUMN IF NOT EXISTS owner_team text DEFAULT '';
ALTER TABLE public.ai_systems ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add input_text and output_text to ai_events
ALTER TABLE public.ai_events ADD COLUMN IF NOT EXISTS input_text text DEFAULT '';
ALTER TABLE public.ai_events ADD COLUMN IF NOT EXISTS output_text text DEFAULT '';
ALTER TABLE public.ai_events ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.ai_events ADD COLUMN IF NOT EXISTS ai_system_id uuid REFERENCES public.ai_systems(id);

-- Add resolution_notes and detected_at to violations
ALTER TABLE public.violations ADD COLUMN IF NOT EXISTS resolution_notes text DEFAULT '';
ALTER TABLE public.violations ADD COLUMN IF NOT EXISTS detected_at timestamptz DEFAULT now();
