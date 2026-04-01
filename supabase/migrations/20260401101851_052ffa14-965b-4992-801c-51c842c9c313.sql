ALTER TABLE public.human_reviews
  ADD COLUMN hash_sequence bigint,
  ADD COLUMN integrity_hash text;

CREATE SEQUENCE IF NOT EXISTS human_reviews_hash_seq;

CREATE OR REPLACE FUNCTION public.compute_review_integrity_hash()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  prev_hash text;
  payload text;
  seq_val bigint;
BEGIN
  seq_val := nextval('human_reviews_hash_seq');
  NEW.hash_sequence := seq_val;

  SELECT integrity_hash INTO prev_hash
  FROM public.human_reviews
  WHERE hash_sequence IS NOT NULL
  ORDER BY hash_sequence DESC
  LIMIT 1;

  IF prev_hash IS NULL THEN
    prev_hash := 'GENESIS_0000000000000000000000000000000000000000000000000000000000000000';
  END IF;

  payload := concat_ws('|',
    prev_hash,
    seq_val::text,
    NEW.id::text,
    NEW.violation_id::text,
    COALESCE(NEW.reviewer_id::text, 'null'),
    COALESCE(NEW.reviewer_name, ''),
    COALESCE(NEW.decision, ''),
    COALESCE(NEW.comments, ''),
    NEW.created_at::text
  );

  NEW.integrity_hash := encode(extensions.digest(payload, 'sha256'), 'hex');

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_review_integrity_hash
  BEFORE INSERT ON public.human_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_review_integrity_hash();