
-- Preferences
CREATE TABLE public.weather_alert_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  city_name TEXT,
  heat_threshold_c NUMERIC NOT NULL DEFAULT 28,
  cold_threshold_c NUMERIC NOT NULL DEFAULT -10,
  rain_threshold_mm NUMERIC NOT NULL DEFAULT 15,
  wind_threshold_ms NUMERIC NOT NULL DEFAULT 12,
  notify_email BOOLEAN NOT NULL DEFAULT true,
  notify_in_app BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.weather_alert_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own weather prefs"
  ON public.weather_alert_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own weather prefs"
  ON public.weather_alert_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own weather prefs"
  ON public.weather_alert_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own weather prefs"
  ON public.weather_alert_preferences FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER set_weather_alert_prefs_updated_at
  BEFORE UPDATE ON public.weather_alert_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sent log
CREATE TABLE public.weather_alerts_sent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  alert_date DATE NOT NULL,
  forecast_date DATE NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, alert_type, forecast_date)
);

ALTER TABLE public.weather_alerts_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own alert log"
  ON public.weather_alerts_sent FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_weather_alerts_sent_user_date ON public.weather_alerts_sent(user_id, alert_date);
