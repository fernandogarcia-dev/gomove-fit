
-- Enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Exercises table
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT,
  body_region TEXT NOT NULL,
  exercise_type TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'iniciante',
  equipment TEXT[] DEFAULT '{}',
  instructions TEXT,
  sets_reps TEXT,
  duration_minutes INTEGER,
  benefits TEXT,
  contraindications TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Saved plans
CREATE TABLE public.saved_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Meu Plano',
  plan_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_plans ENABLE ROW LEVEL SECURITY;

-- Exercise tracking
CREATE TABLE public.exercise_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.saved_plans(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL,
  completed_at TIMESTAMPTZ,
  week_start DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exercise_tracking ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies

-- user_roles: public read, admin manages
CREATE POLICY "Anyone can read roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- profiles
CREATE POLICY "Public profiles readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- exercises: public read, admin CRUD
CREATE POLICY "Exercises publicly readable" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "Admins manage exercises" ON public.exercises FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update exercises" ON public.exercises FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete exercises" ON public.exercises FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- saved_plans: owner CRUD
CREATE POLICY "Users read own plans" ON public.saved_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own plans" ON public.saved_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own plans" ON public.saved_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own plans" ON public.saved_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- exercise_tracking: owner CRUD
CREATE POLICY "Users read own tracking" ON public.exercise_tracking FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own tracking" ON public.exercise_tracking FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own tracking" ON public.exercise_tracking FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own tracking" ON public.exercise_tracking FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Storage bucket for exercise images
INSERT INTO storage.buckets (id, name, public) VALUES ('exercise-images', 'exercise-images', true);

CREATE POLICY "Exercise images publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'exercise-images');
CREATE POLICY "Admins upload exercise images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'exercise-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update exercise images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'exercise-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete exercise images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'exercise-images' AND public.has_role(auth.uid(), 'admin'));
