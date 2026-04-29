
CREATE TABLE public.pitch_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  phone TEXT,
  pitch TEXT,
  price TEXT,
  packs TEXT,
  location TEXT,
  source TEXT DEFAULT 'salja-agg-ai-pitch',
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pitch_leads ENABLE ROW LEVEL SECURITY;

-- Only admins can read leads
CREATE POLICY "Admins can view pitch leads"
ON public.pitch_leads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- No direct inserts from clients; edge function uses service role
CREATE POLICY "No public insert"
ON public.pitch_leads
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE INDEX idx_pitch_leads_created_at ON public.pitch_leads (created_at DESC);
