ALTER TABLE public.weather_advice_cache
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS production_forecast text;