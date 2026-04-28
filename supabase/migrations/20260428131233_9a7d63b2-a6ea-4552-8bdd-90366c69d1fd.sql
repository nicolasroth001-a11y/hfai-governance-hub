ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'unverified';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS verification_notes text NOT NULL DEFAULT '';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS verified_at timestamptz;
CREATE INDEX IF NOT EXISTS leads_verification_status_idx ON public.leads(verification_status);