import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Egg, Bird, CalendarDays, Coins, Thermometer, Lightbulb,
  ArrowRight, BookOpen, Loader2, Plus, TrendingUp, Sparkles, Feather,
  Flame, Award, Heart, Sun, CloudRain, Snowflake, Wind, ChevronDown, ChevronUp, Settings2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { reverseGeocodeCity } from '@/lib/reverseGeocode';
import { DailySummaryModal } from '@/components/DailySummaryModal';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import Achievements from '@/components/Achievements';
import ShareCard from '@/components/ShareCard';
import ReferralCard from '@/components/ReferralCard';
import InstallAppCard from '@/components/InstallAppCard';
import OnboardingGuide, { useOnboardingVisible } from '@/components/OnboardingGuide';
import AchievementNudge from '@/components/AchievementNudge';
import TrialExpiryBanner from '@/components/TrialExpiryBanner';
import { motion } from 'framer-motion';
import { buildAchievements } from '@/components/Achievements';
import EggGoalsWidget from '@/components/EggGoalsWidget';
import DashboardAICoach from '@/components/DashboardAICoach';
import AIDeviationAlerts from '@/components/AIDeviationAlerts';
import DashboardCustomizeSheet, { type DashboardWidgetMeta } from '@/components/DashboardCustomizeSheet';
import { readScoped, writeScoped } from '@/lib/userScopedStorage';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';
import { Button as UIButton } from '@/components/ui/button';

function getGreeting() {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const timeValue = hour + minutes / 60;
  if (timeValue < 9) return 'God morgon';
  if (timeValue < 12) return 'God förmiddag';
  if (timeValue < 17.5) return 'God eftermiddag';
  return 'God kväll';
}

function getFormattedDate() {
  const days = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
  const months = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
  const now = new Date();
  return `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`;
}

function getMonthName(month: number) {
  const months = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];
  return months[month];
}

async function getUserCoords(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: 59.33, lon: 18.07 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve({ lat: 59.33, lon: 18.07 }),
      { timeout: 5000, maximumAge: 30 * 60 * 1000 }
    );
  });
}

async function fetchWeather() {
  const { lat, lon } = await getUserCoords();
  const [weatherRes, cityName] = await Promise.all([
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=5`),
    reverseGeocodeCity(lat, lon),
  ]);
  if (!weatherRes.ok) throw new Error('Weather fetch failed');
  const weather = await weatherRes.json();
  return { ...weather, cityName };
}

function getWeatherIcon(code: number) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '🌨️';
  if (code <= 82) return '🌦️';
  return '⛈️';
}

function getWeatherTip(temp: number, code: number): string {
  if (temp < 0) return 'Kontrollera att vattnet inte fryser i hönshuset!';
  if (temp < 5) return 'Kallt ute – se till att hönshuset är välisolerat.';
  if (code >= 60 && code <= 67) return 'Regnigt väder – hönsen kanske stannar inne.';
  if (code >= 70 && code <= 77) return 'Snöfall – håll ingången fri.';
  if (temp > 25) return 'Varmt – extra vatten och skugga är viktigt!';
  if (temp >= 10 && temp <= 20) return 'Bra väder för dina höns idag!';
  return 'Lagom väder – bra dag för hönsen att vara ute.';
}

function getSeasonalTip(): { text: string; emoji: string } {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return { text: 'Vårens ökade dagsljus stimulerar värpningen – förvänta fler ägg!', emoji: '🌱' };
  if (month >= 5 && month <= 7) return { text: 'Sommarens värme kan minska aptiten. Erbjud fryst frukt som godis.', emoji: '☀️' };
  if (month >= 8 && month <= 10) return { text: 'Höstens ruggning pågår – extra protein i fodret hjälper fjädertillväxten.', emoji: '🍂' };
  return { text: 'Kort dagsljus minskar värpningen. Överväg belysning i hönshuset.', emoji: '❄️' };
}

function calculateStreak(eggs: any[]): number {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const hasEggs = eggs.some((e: any) => e.date === dateStr && e.count > 0);
    if (hasEggs) streak++;
    else if (i > 0) break;
    else continue;
  }
  return streak;
}

function getTopHen(eggs: any[], hens: any[]): { name: string; count: number } | null {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekEggs = eggs.filter((e: any) => e.hen_id && new Date(e.date) >= weekAgo);
  const henCounts: Record<string, number> = {};
  weekEggs.forEach((e: any) => { henCounts[e.hen_id] = (henCounts[e.hen_id] || 0) + e.count; });
  const topId = Object.entries(henCounts).sort(([, a], [, b]) => b - a)[0];
  if (!topId) return null;
  const hen = hens.find((h: any) => h.id === topId[0]);
  return hen ? { name: hen.name, count: topId[1] } : null;
}

function getDayName(dateStr: string): string {
  const days = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
  return days[new Date(dateStr).getDay()];
}

/** Prioritized daily tip: weather warning > AI tip > seasonal */
function getDailyTipCard(currentTemp: number | null, weatherCode: number, aiTip: any, seasonal: { text: string; emoji: string }) {
  // Weather warning takes priority for extreme conditions
  if (currentTemp != null && (currentTemp < 0 || currentTemp > 25 || (weatherCode >= 60 && weatherCode <= 77))) {
    return {
      emoji: currentTemp < 0 ? '🥶' : currentTemp > 25 ? '🥵' : '🌧️',
      label: 'Vädervarning',
      text: getWeatherTip(currentTemp, weatherCode),
      color: 'warning',
    };
  }
  // AI tip next
  if (aiTip?.tip_text) {
    return {
      emoji: '✨',
      label: 'Dagens tips',
      text: aiTip.tip_text,
      color: 'warning',
    };
  }
  // Seasonal fallback
  return {
    emoji: seasonal.emoji,
    label: 'Säsongens tips',
    text: seasonal.text,
    color: 'accent',
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [diaryOpen, setDiaryOpen] = useState(false);
  const [diaryText, setDiaryText] = useState('');
  const [weatherExpanded, setWeatherExpanded] = useState(false);
  const [showMoreSection, setShowMoreSection] = useState(false);
  const [tipSheetOpen, setTipSheetOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const now = new Date();
  const onboardingVisible = useOnboardingVisible();

  const { data: eggs = [] } = useQuery({ queryKey: ['eggs'], queryFn: () => api.getEggs(), staleTime: 60_000 });
  const { data: hens = [] } = useQuery({ queryKey: ['hens'], queryFn: () => api.getHens(), staleTime: 60_000 });
  const { data: healthLogs = [] } = useQuery({ queryKey: ['health-logs'], queryFn: () => api.getHealthLogs(), staleTime: 60_000 });
  const { data: transactions = [] } = useQuery({ queryKey: ['transactions'], queryFn: () => api.getTransactions(), staleTime: 60_000 });
  const { data: feedRecords = [] } = useQuery({ queryKey: ['feed-records'], queryFn: () => api.getFeedRecords(), staleTime: 60_000 });
  const { data: weatherData, isLoading: weatherLoading } = useQuery({ queryKey: ['weather'], queryFn: fetchWeather, staleTime: 30 * 60 * 1000, retry: 2 });
  const { data: aiTip } = useQuery({ queryKey: ['daily-tip'], queryFn: () => api.getDailyTip(), staleTime: 60 * 60 * 1000, retry: 1 });
  const { data: chores = [] } = useQuery({ queryKey: ['daily-chores'], queryFn: () => api.getDailyChores(), staleTime: 60_000 });

  const currentTemp = weatherData?.current?.temperature_2m;
  const weatherCode = weatherData?.current?.weathercode ?? 0;

  const todayStr = now.toISOString().split('T')[0];
  const todayEggs = eggs.filter((e: any) => e.date === todayStr).reduce((s: number, e: any) => s + (e.count || 0), 0);

  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
  const yesterdayEggs = eggs.filter((e: any) => e.date === yesterdayStr).reduce((s: number, e: any) => s + (e.count || 0), 0);

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekEggs = eggs.filter((e: any) => new Date(e.date) >= weekAgo).reduce((s: number, e: any) => s + (e.count || 0), 0);

  const activeHens = (hens as any[]).filter((h: any) => h.is_active).length;

  const monthIncome = (transactions as any[]).filter((t: any) => t.type === 'income' && new Date(t.date).getMonth() === now.getMonth()).reduce((s: number, t: any) => s + t.amount, 0);
  const monthExpense = (transactions as any[]).filter((t: any) => t.type === 'expense' && new Date(t.date).getMonth() === now.getMonth()).reduce((s: number, t: any) => s + t.amount, 0);
  const monthProfit = monthIncome - monthExpense;

  const streak = calculateStreak(eggs);
  const topHen = getTopHen(eggs, hens as any[]);
  const seasonal = getSeasonalTip();

  // Shared achievements calculation (used by both AchievementNudge and Achievements)
  const achievements = useMemo(
    () => buildAchievements(eggs, hens as any[], streak, feedRecords as any[], transactions as any[], chores as any[]),
    [eggs, hens, streak, feedRecords, transactions, chores]
  );

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const eggCalendarData: Record<number, number> = {};
  eggs.forEach((e: any) => {
    const d = new Date(e.date);
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      const day = d.getDate();
      eggCalendarData[day] = (eggCalendarData[day] || 0) + (e.count || 0);
    }
  });

  const getEggColor = (count: number) => {
    if (count === 0) return 'bg-muted/40 text-muted-foreground';
    if (count <= 2) return 'bg-primary/10 text-primary';
    if (count <= 5) return 'bg-primary/20 text-primary font-semibold';
    return 'bg-primary/30 text-primary font-bold';
  };

  const diaryMutation = useMutation({
    mutationFn: (text: string) => api.createHealthLog({ date: now.toISOString().split('T')[0], type: 'diary', description: text }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['health-logs'] }); toast({ title: '📝 Dagboksinlägg sparat!' }); setDiaryOpen(false); setDiaryText(''); },
    onError: (err: any) => toast({ title: 'Fel', description: err.message, variant: 'destructive' }),
  });

  const diaryEntries = (healthLogs as any[])
    .filter((l: any) => l.type === 'diary' && l.description)
    .slice(0, 4)
    .map((l: any) => ({
      date: new Date(l.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' }),
      text: l.description,
    }));

  const stats = [
    { icon: Egg, value: todayEggs, label: 'idag', color: 'text-primary', bg: 'bg-primary/8' },
    { icon: Egg, value: yesterdayEggs, label: 'igår', color: 'text-accent', bg: 'bg-accent/8' },
    { icon: TrendingUp, value: weekEggs, label: 'veckan', color: 'text-muted-foreground', bg: 'bg-muted/60' },
    { icon: Bird, value: activeHens, label: 'hönor', color: 'text-primary', bg: 'bg-primary/8' },
  ];

  const forecast = weatherData?.daily;

  // Adaptive visibility - use egg data to determine user maturity instead of created_at
  const firstEggDate = eggs.length > 0 ? new Date(Math.min(...eggs.map((e: any) => new Date(e.date).getTime()))) : null;
  const daysSinceFirstEgg = firstEggDate ? Math.floor((Date.now() - firstEggDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const hasImported = readScoped(user?.id, 'honsgarden-imported') === '1';
  const showImportCard = !hasImported && daysSinceFirstEgg < 7;
  const hasFeedRecords = (feedRecords as any[]).length > 0;
  const hasTransactions = (transactions as any[]).length > 0;
  const [feedNudgeDismissed, setFeedNudgeDismissed] = useState(() => readScoped(user?.id, 'dashboard-feed-nudge-dismissed') === '1');
  const [financeNudgeDismissed, setFinanceNudgeDismissed] = useState(() => readScoped(user?.id, 'dashboard-finance-nudge-dismissed') === '1');
  const showFeedNudge = !hasFeedRecords && !feedNudgeDismissed;
  const showFinanceNudge = !hasTransactions && !financeNudgeDismissed;
  const showDiary = daysSinceFirstEgg >= 7 || (healthLogs as any[]).some((l: any) => l.type === 'diary');
  const showCalendar = eggs.length > 0;

  // Unified tip card
  const tipCard = getDailyTipCard(currentTemp ?? null, weatherCode, aiTip, seasonal);

  // Premium upsell: only show TrialExpiryBanner (not PremiumNudge duplicated)
  // TrialExpiryBanner handles its own visibility logic

  // Chores widget
  const upcomingChores = useMemo(() => {
    const now24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return (chores as any[]).filter((c: any) => {
      if (!c.next_due_at || c.completed) return false;
      return new Date(c.next_due_at) <= now24h;
    });
  }, [chores]);
  const pastDueChores = upcomingChores.filter((c: any) => new Date(c.next_due_at) < new Date());

  // ─── Customizable widgets (Plus only) ───
  const isPlus = !!user?.is_premium;
  const widgetMeta: DashboardWidgetMeta[] = [
    { id: 'egg-goals', label: 'Veckomål för ägg', description: 'Progressring mot ditt mål' },
    { id: 'ai-coach', label: 'AI-coach', description: 'Hönsgården tolkar dina data' },
    { id: 'ai-alerts', label: 'Avvikelsevarningar', description: 'AI flaggar ovanliga mönster' },
    { id: 'streak-tophen', label: 'Streak & topphöna', description: 'Loggningssvit och veckans bästa' },
    { id: 'chores', label: 'Förfallande sysslor', description: 'Visas när något är på väg' },
    { id: 'daily-tip', label: 'Dagens tips', description: 'Väder, AI eller säsong' },
    { id: 'calendar', label: 'Äggkalender', description: 'Månadsvy med dina ägg' },
    { id: 'diary', label: 'Dagbok', description: 'Senaste anteckningarna' },
    { id: 'more', label: '"Visa mer"-sektion', description: 'Achievements, dela, referral' },
  ];
  const widgetIds = widgetMeta.map((w) => w.id);
  const { layout, isHidden, setOrder, toggleHidden, reset } = useDashboardLayout(widgetIds);

  return (
    <motion.div
      className="max-w-2xl mx-auto space-y-5 pb-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Priority 0: Trial banner (max 1 premium upsell) */}
      <TrialExpiryBanner />

      {/* Onboarding (new users only) */}
      <OnboardingGuide />

      {/* DailySummaryModal: only if not day-1 and onboarding not visible */}
      {!onboardingVisible && eggs.length > 0 && <DailySummaryModal />}

      {/* ─── 1. Greeting + Weather pill ─── */}
      <div className="flex items-end justify-between gap-4 pt-1">
        <div>
          <p className="data-label mb-1.5">{getFormattedDate()}</p>
          <h1 className="text-2xl sm:text-3xl font-serif gradient-text leading-snug">
            {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
          </h1>
        </div>
        <button
          onClick={() => {
            if (user?.subscription_status === 'premium') {
              navigate('/app/weather');
            } else {
              setWeatherExpanded(!weatherExpanded);
            }
          }}
          className="flex items-center gap-2 bg-card border border-border/60 rounded-2xl px-3.5 py-2 shadow-sm shrink-0 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.97] transition-transform"
          aria-label={user?.subscription_status === 'premium' ? 'Öppna väder & AI-råd' : 'Visa väderprognos'}
        >
          {weatherLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          ) : (
            <>
              <span className="text-sm">{getWeatherIcon(weatherCode)}</span>
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {currentTemp != null ? `${Math.round(currentTemp)}°` : '–'}
              </span>
              {weatherData?.cityName && (
                <span className="text-xs text-muted-foreground hidden sm:inline">{weatherData.cityName}</span>
              )}
              {user?.subscription_status === 'premium' && (
                <span className="text-[9px] text-primary/70 font-medium uppercase tracking-wider hidden sm:inline">Mer →</span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Weather tip shown directly (not hidden behind click) */}
      {currentTemp != null && (
        <p className="text-xs text-muted-foreground -mt-2 flex items-center gap-1.5">
          <Thermometer className="h-3 w-3 text-destructive/60" />
          {getWeatherTip(currentTemp, weatherCode)}
        </p>
      )}

      {/* Expandable weather forecast */}
      {weatherExpanded && forecast && (
        <Card className="border-border/50 shadow-sm animate-fade-in overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Thermometer className="h-4 w-4 text-destructive/70" />
              <span className="font-serif text-sm text-foreground">5-dagars prognos</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {forecast.time?.slice(0, 5).map((date: string, i: number) => (
                <div key={date} className="text-center p-2 rounded-xl bg-muted/30 border border-border/20">
                  <p className="text-[10px] text-muted-foreground font-medium mb-1">
                    {i === 0 ? 'Idag' : getDayName(date)}
                  </p>
                  <span className="text-lg">{getWeatherIcon(forecast.weathercode?.[i] ?? 0)}</span>
                  <p className="text-xs font-semibold text-foreground mt-1">
                    {Math.round(forecast.temperature_2m_max?.[i])}°
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {Math.round(forecast.temperature_2m_min?.[i])}°
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* (Dagens hönsgård + 4-stats renderas av DashboardFocusPanel via portal — undviker dubblerade siffror) */}

      {/* ─── Customize entry (Plus only) ─── */}
      {isPlus && (
        <div className="flex justify-end -mb-2">
          <UIButton
            variant="ghost"
            size="sm"
            onClick={() => setCustomizeOpen(true)}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-xl"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Anpassa
          </UIButton>
        </div>
      )}

      {/* ─── Customizable widgets ─── */}
      {(() => {
        const widgetNodes: Record<string, React.ReactNode> = {
          'egg-goals': <EggGoalsWidget eggs={eggs} />,
          'ai-coach': <DashboardAICoach />,
          'ai-alerts': <AIDeviationAlerts variant="card" />,
          'streak-tophen': (
            <div className={`grid grid-cols-1 ${topHen ? 'sm:grid-cols-2' : ''} gap-3`}>
              <Card className="border-border/50 shadow-sm card-hover active:scale-[0.98] transition-transform">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                    <Flame className={`h-5 w-5 ${streak >= 7 ? 'text-warning' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground tabular-nums leading-none">
                      {streak} <span className="text-sm font-normal text-muted-foreground">dagar</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {streak === 0 ? 'Logga ägg för att starta din streak!' : streak >= 7 ? '🔥 Fantastisk streak!' : 'Loggningssvit i rad'}
                    </p>
                  </div>
                </CardContent>
              </Card>
              {topHen && (
                <Card className="border-border/50 shadow-sm card-hover active:scale-[0.98] transition-transform">
                  <CardContent className="p-4 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">🏆 {topHen.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{topHen.count} ägg denna vecka</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ),
          'chores': upcomingChores.length > 0 ? (
            <Card className={`border-warning/25 shadow-sm active:scale-[0.98] transition-transform ${pastDueChores.length > 0 ? 'bg-destructive/3' : 'bg-warning/3'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-lg">📋</span>
                  <p className="text-sm font-semibold text-foreground">
                    {upcomingChores.length} uppgift{upcomingChores.length > 1 ? 'er' : ''} förfaller snart
                  </p>
                </div>
                <div className="space-y-1.5">
                  {upcomingChores.slice(0, 3).map((chore: any) => {
                    const isPast = new Date(chore.next_due_at) < new Date();
                    return (
                      <div key={chore.id} className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isPast ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
                          {isPast ? '⚠️ Försenad' : '📌 Idag'}
                        </span>
                        <span className="text-xs text-foreground">{chore.title}</span>
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => navigate('/app/tasks')} className="text-xs text-warning hover:underline mt-2.5 font-medium">
                  Se alla uppgifter →
                </button>
              </CardContent>
            </Card>
          ) : null,
          'daily-tip': (() => {
            const tipHtml = tipCard.text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            const isLong = tipCard.text.length > 140;
            return (
              <Card className="border-border/50 shadow-sm card-hover active:scale-[0.98] transition-transform">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className={`w-7 h-7 rounded-lg bg-${tipCard.color}/10 flex items-center justify-center`}>
                      <span className="text-sm">{tipCard.emoji}</span>
                    </div>
                    <span className="data-label">{tipCard.label}</span>
                  </div>
                  <p
                    className="text-sm text-foreground leading-relaxed line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: tipHtml }}
                  />
                  {isLong && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTipSheetOpen(true)}
                      className="mt-2 h-9 px-3 rounded-xl text-xs font-medium text-primary hover:bg-primary/8"
                    >
                      Läs hela tipset
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })(),
          'calendar': showCalendar ? (
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center">
                      <CalendarDays className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="font-serif text-sm text-foreground">{getMonthName(now.getMonth())}</h2>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {Object.values(eggCalendarData).reduce((a, b) => a + b, 0)} ägg totalt
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 mb-2">
                  {['M', 'T', 'O', 'T', 'F', 'L', 'S'].map((d, i) => (
                    <div key={`${d}-${i}`} className={`text-[10px] text-center font-medium ${i >= 5 ? 'text-accent/60' : 'text-muted-foreground'}`}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const eggCount = eggCalendarData[day] || 0;
                    const isToday = day === now.getDate();
                    const isFuture = day > now.getDate();
                    return (
                      <div
                        key={day}
                        className={`rounded-lg text-center py-1.5 text-[11px] transition-all
                          ${isFuture ? 'bg-muted/20 text-muted-foreground/25' : getEggColor(eggCount)}
                          ${isToday ? 'ring-2 ring-primary/50 ring-offset-1 ring-offset-background shadow-sm' : ''}
                        `}
                      >
                        <span className="leading-none">{day}</span>
                        {!isFuture && eggCount > 0 && (
                          <span className="block text-[8px] leading-none opacity-70 mt-0.5">{eggCount}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : null,
          'diary': showDiary ? (
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-accent/8 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-accent" />
                    </div>
                    <h2 className="font-serif text-sm text-foreground">Dagbok</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs text-primary hover:text-primary hover:bg-primary/8 rounded-xl gap-1.5"
                    onClick={() => setDiaryOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Skriv
                  </Button>
                </div>
                {diaryEntries.length > 0 ? (
                  <div className="space-y-2">
                    {diaryEntries.map((entry, i) => (
                      <div key={i} className="flex gap-3 items-start p-3 rounded-xl bg-muted/30 border border-border/30">
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5 font-medium bg-muted/60 px-2 py-0.5 rounded-md">{entry.date}</span>
                        <p className="text-sm text-foreground leading-relaxed">{entry.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 card-inset rounded-xl">
                    <Feather className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2.5" />
                    <p className="text-sm text-muted-foreground font-medium">Inga inlägg ännu</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">Skriv om vad som händer med dina höns</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null,
          'more': (
            <>
              <button
                onClick={() => setShowMoreSection(!showMoreSection)}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors active:scale-[0.98]"
              >
                {showMoreSection ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {showMoreSection ? 'Visa mindre' : 'Visa mer'}
              </button>

              {showMoreSection && (
                <div className="space-y-5 animate-fade-in mt-3">
                  <div className="block md:hidden">
                    <InstallAppCard />
                  </div>
                  <AchievementNudge achievements={achievements} />
                  {showImportCard && (
                    <Card className="border-border/50 shadow-sm card-hover cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate('/app/import')}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                            <Plus className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">Importera data</p>
                            <p className="text-[11px] text-muted-foreground">Läs in hönor & ägg från fil eller Google Sheets</p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  )}
                  {showFeedNudge && (
                    <Card className="border-warning/20 bg-warning/3 shadow-sm">
                      <CardContent className="p-4 flex items-center gap-3.5">
                        <span className="text-2xl shrink-0">🌾</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">Spåra foderkostnader</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Vet du vad varje ägg kostar dig? Börja logga foder idag.</p>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <Button size="sm" variant="outline" className="border-warning/40 text-warning hover:bg-warning/10 rounded-xl text-xs" onClick={() => navigate('/app/feed')}>
                            Prova →
                          </Button>
                          <button className="text-[10px] text-muted-foreground hover:text-foreground" onClick={() => { writeScoped(user?.id, 'dashboard-feed-nudge-dismissed', '1'); setFeedNudgeDismissed(true); }}>
                            Göm
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {showFinanceNudge && (
                    <Card className="border-success/20 bg-success/3 shadow-sm">
                      <CardContent className="p-4 flex items-center gap-3.5">
                        <span className="text-2xl shrink-0">💰</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">Håll koll på ekonomin</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Logga äggförsäljning och utgifter – se om hönsen går med vinst.</p>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <Button size="sm" variant="outline" className="border-success/40 text-success hover:bg-success/10 rounded-xl text-xs" onClick={() => navigate('/app/finance')}>
                            Prova →
                          </Button>
                          <button className="text-[10px] text-muted-foreground hover:text-foreground" onClick={() => { writeScoped(user?.id, 'dashboard-finance-nudge-dismissed', '1'); setFinanceNudgeDismissed(true); }}>
                            Göm
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <Card
                      className="border-primary/10 cursor-pointer hover:bg-primary/4 transition-all duration-200 shadow-sm card-hover group active:scale-[0.97] transition-transform"
                      onClick={() => navigate('/app/eggs')}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/12 transition-colors shrink-0">
                          <Egg className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">Ägghistorik</p>
                          <p className="text-[10px] text-muted-foreground">{todayEggs} idag</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card
                      className="border-accent/10 cursor-pointer hover:bg-accent/4 transition-all duration-200 shadow-sm card-hover group active:scale-[0.97] transition-transform"
                      onClick={() => navigate('/app/hens')}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-accent/8 flex items-center justify-center group-hover:bg-accent/12 transition-colors shrink-0">
                          <Bird className="h-4.5 w-4.5 text-accent" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">Mina hönor</p>
                          <p className="text-[10px] text-muted-foreground">{activeHens} aktiva</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <Achievements achievements={achievements} eggs={eggs} hens={hens as any[]} streak={streak} />
                  <ShareCard
                    weekEggs={weekEggs}
                    totalEggs={eggs.reduce((s: number, e: any) => s + (e.count || 0), 0)}
                    henCount={activeHens}
                    streak={streak}
                    userName={user?.name?.split(' ')[0]}
                  />
                  <ReferralCard />
                </div>
              )}
            </>
          ),
        };

        return layout.order
          .filter((id) => !isHidden(id))
          .map((id) => {
            const node = widgetNodes[id];
            if (!node) return null;
            return <React.Fragment key={id}>{node}</React.Fragment>;
          });
      })()}

      {/* Customize sheet */}
      {isPlus && (
        <DashboardCustomizeSheet
          open={customizeOpen}
          onOpenChange={setCustomizeOpen}
          widgets={widgetMeta}
          order={layout.order}
          hiddenIds={layout.hidden}
          onReorder={setOrder}
          onToggleHidden={toggleHidden}
          onReset={reset}
        />
      )}

      {/* Daily tip sheet */}
      <Sheet open={tipSheetOpen} onOpenChange={setTipSheetOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 sm:max-w-lg sm:mx-auto"
        >
          <SheetHeader className="text-left mb-4">
            <SheetTitle className="font-serif text-xl flex items-center gap-2">
              <span className="text-2xl">{tipCard.emoji}</span>
              {tipCard.label}
            </SheetTitle>
            <SheetDescription className="sr-only">Hela tipset</SheetDescription>
          </SheetHeader>
          <div
            className="text-sm text-foreground leading-relaxed pb-6"
            dangerouslySetInnerHTML={{ __html: tipCard.text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}
          />
        </SheetContent>
      </Sheet>

      {/* Diary dialog */}
      <Dialog open={diaryOpen} onOpenChange={setDiaryOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Skriv i dagboken</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Vad hände idag med hönsen?"
              value={diaryText}
              onChange={(e) => setDiaryText(e.target.value)}
              className="min-h-[120px] resize-none rounded-xl border-border/60 focus:border-primary/40"
            />
            <div className="flex gap-2">
              <Button
                className="flex-1 rounded-xl h-10"
                disabled={!diaryText.trim() || diaryMutation.isPending}
                onClick={() => diaryText.trim() && diaryMutation.mutate(diaryText.trim())}
              >
                {diaryMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Spara'}
              </Button>
              <Button variant="outline" className="rounded-xl h-10" onClick={() => setDiaryOpen(false)}>
                Avbryt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
