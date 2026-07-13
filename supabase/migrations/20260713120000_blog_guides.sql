-- Blog guides: admin-managed long-form SEO articles
CREATE TABLE IF NOT EXISTS public.blog_guides (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  h1 TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  hero_subtitle TEXT NOT NULL,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_slugs TEXT[] NOT NULL DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blog_guides_published_idx ON public.blog_guides (published);

ALTER TABLE public.blog_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published blog guides"
  ON public.blog_guides FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can read all blog guides"
  ON public.blog_guides FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert blog guides"
  ON public.blog_guides FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update blog guides"
  ON public.blog_guides FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete blog guides"
  ON public.blog_guides FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_blog_guides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blog_guides_updated_at ON public.blog_guides;
CREATE TRIGGER blog_guides_updated_at
  BEFORE UPDATE ON public.blog_guides
  FOR EACH ROW EXECUTE FUNCTION public.set_blog_guides_updated_at();
