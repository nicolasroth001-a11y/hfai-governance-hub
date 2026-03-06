
-- 1. Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'reviewer', 'customer');

-- 2. Organizations
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_email TEXT,
  api_key TEXT UNIQUE DEFAULT ('hfai_' || encode(gen_random_bytes(24), 'hex')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 3. Profiles (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  role app_role NOT NULL DEFAULT 'customer',
  org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. User roles table (for RLS helper)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Security definer helper
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- 6. AI Systems
CREATE TABLE public.ai_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  model_type TEXT DEFAULT '',
  provider TEXT DEFAULT '',
  version TEXT DEFAULT '',
  risk_level TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_systems ENABLE ROW LEVEL SECURITY;

-- 7. Rules
CREATE TABLE public.rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'general',
  severity TEXT DEFAULT 'medium',
  condition TEXT DEFAULT '',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;

-- 8. AI Events
CREATE TABLE public.ai_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_events ENABLE ROW LEVEL SECURITY;

-- 9. Violations
CREATE TABLE public.violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ai_system_id UUID REFERENCES public.ai_systems(id) ON DELETE SET NULL,
  rule_id UUID REFERENCES public.rules(id) ON DELETE SET NULL,
  ai_event_id UUID REFERENCES public.ai_events(id) ON DELETE SET NULL,
  description TEXT DEFAULT '',
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;

-- 10. Human Reviews
CREATE TABLE public.human_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  violation_id UUID NOT NULL REFERENCES public.violations(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name TEXT DEFAULT '',
  decision TEXT DEFAULT 'pending',
  comments TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.human_reviews ENABLE ROW LEVEL SECURITY;

-- 11. Audit Logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT DEFAULT '',
  entity_id TEXT DEFAULT '',
  details TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 12. Auto-create profile + user_role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'customer')
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'customer')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ RLS POLICIES ============

-- Organizations: admins see all, customers see own
CREATE POLICY "Admins see all orgs" ON public.organizations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers see own org" ON public.organizations FOR SELECT TO authenticated
  USING (id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Admins manage orgs" ON public.organizations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Profiles: users see own, admins see all
CREATE POLICY "Users see own profile" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());
CREATE POLICY "Admins see all profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- User roles: admins manage, users see own
CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- AI Systems: scoped to org
CREATE POLICY "Admins see all ai_systems" ON public.ai_systems FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers see own ai_systems" ON public.ai_systems FOR SELECT TO authenticated
  USING (org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Customers manage own ai_systems" ON public.ai_systems FOR ALL TO authenticated
  USING (org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

-- Rules: org-scoped + global (null org_id)
CREATE POLICY "Admins see all rules" ON public.rules FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers see own or global rules" ON public.rules FOR SELECT TO authenticated
  USING (org_id IS NULL OR org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Admins manage rules" ON public.rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers manage own rules" ON public.rules FOR ALL TO authenticated
  USING (org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

-- AI Events: org-scoped
CREATE POLICY "Admins see all events" ON public.ai_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers see own events" ON public.ai_events FOR SELECT TO authenticated
  USING (org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Insert events via API" ON public.ai_events FOR INSERT TO authenticated
  WITH CHECK (org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

-- Violations: org-scoped, reviewers see all
CREATE POLICY "Admins see all violations" ON public.violations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Reviewers see all violations" ON public.violations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "Customers see own violations" ON public.violations FOR SELECT TO authenticated
  USING (org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Admins manage violations" ON public.violations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Human Reviews: reviewers + admins
CREATE POLICY "Admins see all reviews" ON public.human_reviews FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Reviewers see all reviews" ON public.human_reviews FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "Customers see own violation reviews" ON public.human_reviews FOR SELECT TO authenticated
  USING (violation_id IN (SELECT id FROM public.violations WHERE org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "Reviewers create reviews" ON public.human_reviews FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "Reviewers update own reviews" ON public.human_reviews FOR UPDATE TO authenticated
  USING (reviewer_id = auth.uid());

-- Audit Logs: org-scoped, admins see all
CREATE POLICY "Admins see all logs" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers see own logs" ON public.audit_logs FOR SELECT TO authenticated
  USING (org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Authenticated insert logs" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (true);
