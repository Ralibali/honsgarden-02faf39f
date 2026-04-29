import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Cloud, Crown, Loader2, RefreshCw, Sparkles, Thermometer, Wind, Droplets, CalendarDays, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

const WEATHER_ICONS: Record<string, string> = {
  '0': '☀️', '1': '🌤️', '2': '⛅', '3': '☁️',
  '45': '🌫️', '48': '🌫️',
  '51': '🌦️', '53': '🌦️', '55': '🌦️',
  '61': '🌧️', '63': '🌧️', '65': '🌧️',
  '71': '🌨️', '73': '🌨️', '75': '❄️',
  '80': '🌧️', '81': '🌧️', '82': '⛈️',
  '95': '⛈️', '96': '⛈️', '99': '⛈️',
};

function getIcon(code: number) {
  return WEATHER_ICONS[String(code)] ?? '🌤️';
}

function getCoords(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({ lat: 59.33, lon: 18.07 });
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => resolve({ lat: 59.33, lon: 18.07 }),
      { timeout: 5000, maximumAge: 30 * 60 * 1000 },
    );
  });
}

async function fetchWeatherFull() {
  const { lat, lon } = await getCoords();
  const [wRes, gRes] = await Promise.all([
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=10`,
    ),
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=sv`,
    ).catch(() => null),
  ]);
  if (!wRes.ok) throw new Error('Väderhämtning misslyckades');
  const weather = await wRes.json();
  let city: string | null = null;
  if (gRes?.ok) {
    const g = await gRes.json();
    city =
      g.address?.city ||
      g.address?.town ||
      g.address?.village ||
      g.address?.municipality ||
      null;
  }
  return { lat, lon, city, weather };
}

function dayName(dateStr: string, idx: number) {
  if (idx === 0) return 'Idag';
  if (idx === 1) return 'Imorgon';
  return new Date(dateStr).toLocaleDateString('sv-SE', { weekday: 'short' });
}

export default function Weather() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [advice, setAdvice] = useState<{
    today_advice: string;
    week_advice: string;
    history_insight: string;
    cached?: boolean;
  } | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);

  const isPremium = user?.subscription_status === 'premium';

  const { data: w, isLoading } = useQuery({
    queryKey: ['weather-full'],
    queryFn: fetchWeatherFull,
    staleTime: 30 * 60 * 1000,
    enabled: !!isPremium,
  });

  async function loadAdvice(force = false) {
    if (!w) return;
    setAdviceLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('weather-advice', {
        body: {
          latitude: w.lat,
          longitude: w.lon,
          city_name: w.city,
          force,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setAdvice(data as any);
      if (force) toast.success('AI-råd uppdaterade');
    } catch (e: any) {
      toast.error(e?.message ?? 'Kunde inte hämta AI-råd');
    } finally {
      setAdviceLoading(false);
    }
  }

  useEffect(() => {
    if (w && isPremium && !advice) loadAdvice(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, isPremium]);

  if (!isPremium) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Tillbaka
        </button>
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-8 text-center space-y-4">
            <Crown className="h-12 w-12 text-warning mx-auto" />
            <h1 className="text-2xl font-serif">Väder & AI-råd är en Plus-funktion</h1>
            <p className="text-sm text-muted-foreground">
              Få 10-dagars prognos, personliga AI-råd för dina höns baserat på vädret idag, och säsongstips inför kommande vecka.
            </p>
            <Button asChild className="rounded-2xl">
              <Link to="/app/premium">Uppgradera till Plus</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const current = w?.weather?.current;
  const daily = w?.weather?.daily;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Tillbaka
      </button>

      {/* Header */}
      <div className="space-y-1">
        <p className="data-label">Väder & säsongsråd</p>
        <h1 className="text-3xl font-serif gradient-text leading-tight">
          Vädret för din hönsgård
        </h1>
        {w?.city && (
          <p className="text-sm text-muted-foreground">{w.city}</p>
        )}
      </div>

      {isLoading || !w ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Current weather card */}
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                    Just nu
                  </p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl">{getIcon(current?.weathercode ?? 0)}</span>
                    <span className="text-5xl font-serif tabular-nums">
                      {Math.round(current?.temperature_2m ?? 0)}°
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-1.5 text-right">
                  <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                    <Droplets className="h-3.5 w-3.5" />
                    {current?.relative_humidity_2m ?? '–'}% luftfukt.
                  </div>
                  <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                    <Wind className="h-3.5 w-3.5" />
                    {current?.wind_speed_10m ?? '–'} m/s vind
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI advice */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h2 className="font-serif text-lg">AI-råd från Agda</h2>
                  {advice?.cached && (
                    <Badge variant="secondary" className="text-[10px]">Dagens råd</Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5"
                  disabled={adviceLoading}
                  onClick={() => loadAdvice(true)}
                >
                  {adviceLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  Uppdatera
                </Button>
              </div>

              {adviceLoading && !advice ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Agda analyserar vädret...
                </div>
              ) : advice ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
                      <Thermometer className="h-3 w-3" /> För dina höns idag
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">{advice.today_advice}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
                      <CalendarDays className="h-3 w-3" /> Kommande veckan
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">{advice.week_advice}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
                      <Lightbulb className="h-3 w-3" /> Säsong & produktion
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">{advice.history_insight}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Inga råd ännu.</p>
              )}
            </CardContent>
          </Card>

          {/* 10-day forecast */}
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Cloud className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-serif text-lg">10-dagars prognos</h2>
              </div>
              <div className="space-y-1">
                {daily?.time?.slice(0, 10).map((d: string, i: number) => (
                  <div
                    key={d}
                    className="grid grid-cols-[80px_40px_1fr_60px_60px] items-center gap-3 py-2 border-b border-border/40 last:border-0 text-sm"
                  >
                    <span className="text-muted-foreground capitalize">{dayName(d, i)}</span>
                    <span className="text-xl text-center">{getIcon(daily.weathercode[i])}</span>
                    <span className="text-xs text-muted-foreground">
                      {daily.precipitation_sum[i] > 0 && `${daily.precipitation_sum[i].toFixed(1)} mm`}
                      {daily.wind_speed_10m_max[i] > 8 && (
                        <span className="ml-2">💨 {Math.round(daily.wind_speed_10m_max[i])} m/s</span>
                      )}
                    </span>
                    <span className="text-right text-muted-foreground tabular-nums">
                      {Math.round(daily.temperature_2m_min[i])}°
                    </span>
                    <span className="text-right font-medium tabular-nums">
                      {Math.round(daily.temperature_2m_max[i])}°
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <p className="text-[10px] text-muted-foreground text-center">
            Väderdata från Open-Meteo • AI-råd genereras dagligen av Agda
          </p>
        </>
      )}
    </div>
  );
}
