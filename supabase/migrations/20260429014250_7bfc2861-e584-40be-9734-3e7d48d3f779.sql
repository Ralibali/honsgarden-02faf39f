-- Cache for AI weather advice per user per day
CREATE TABLE public.weather_advice_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cache_date DATE NOT NULL DEFAULT CURRENT_DATE,
  latitude NUMERIC,
  longitude NUMERIC,
  city_name TEXT,
  weather_snapshot JSONB,
  today_advice TEXT,
  week_advice TEXT,
  history_insight TEXT,
  model TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, cache_date)
);

ALTER TABLE public.weather_advice_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own weather advice"
  ON public.weather_advice_cache FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weather advice"
  ON public.weather_advice_cache FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weather advice"
  ON public.weather_advice_cache FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_weather_advice_cache_updated_at
  BEFORE UPDATE ON public.weather_advice_cache
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_weather_advice_user_date ON public.weather_advice_cache (user_id, cache_date DESC);