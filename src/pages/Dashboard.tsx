import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Egg, Bird, CalendarDays, Coins, Thermometer, Lightbulb,
  ArrowRight, BookOpen, Loader2, Plus, TrendingUp, Sparkles, Feather,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DailySummaryModal } from '@/components/DailySummaryModal';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PremiumNudge } from '@/components/PremiumGate';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'God natt';
  if (hour < 10) return 'God morgon';
  if (hour < 13) return 'God förmiddag';
  if (hour < 17) return 'God eftermiddag';
  if (hour < 21) return 'God kväll';
  return 'God natt';
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

async function fetchWeather() {
  const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=59.33&longitude=18.07&current=temperature_2m,weathercode&timezone=Europe%2FStockholm');
  if (!res.ok) throw new Error('Weather fetch failed');
  return res.json();
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

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [diaryOpen, setDiaryOpen] = useState(false);
  const [diaryText, setDiaryText] = useState('');
  const [customEggCount, setCustomEggCount] = useState('');
  const [selectedHenId, setSelectedHenId] = useState<string>('all');
  const now = new Date();

  const { data: eggs = [] } = useQuery({ queryKey: ['eggs'], queryFn: () => api.getEggs(), staleTime: 60_000 });
  const { data: hens = [] } = useQuery({ queryKey: ['hens'], queryFn: () => api.getHens(), staleTime: 60_000 });
  const { data: healthLogs = [] } = useQuery({ queryKey: ['health-logs'], queryFn: () => api.getHealthLogs(), staleTime: 60_000 });
  const { data: transactions = [] } = useQuery({ queryKey: ['transactions'], queryFn: () => api.getTransactions(), staleTime: 60_000 });
  const { data: weatherData, isLoading: weatherLoading } = useQuery({ queryKey: ['weather'], queryFn: fetchWeather, staleTime: 30 * 60 * 1000, retry: 2 });
  const { data: aiTip } = useQuery({ queryKey: ['daily-tip'], queryFn: () => api.getDailyTip(), staleTime: 60 * 60 * 1000, retry: 1 });

  const activeHensList = (hens as any[]).filter((h: any) => h.is_active && h.hen_type !== 'rooster');

  const eggMutation = useMutation({
    mutationFn: ({ count, hen_id }: { count: number; hen_id?: string }) =>
      api.createEggRecord({ date: now.toISOString().split('T')[0], count, hen_id: hen_id || undefined }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['eggs'] }); toast({ title: '🥚 Ägg registrerade!' }); },
    onError: (err: any) => toast({ title: 'Fel', description: err.message, variant: 'destructive' }),
  });

  const diaryMutation = useMutation({
    mutationFn: (text: string) => api.createHealthLog({ date: now.toISOString().split('T')[0], type: 'diary', description: text }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['health-logs'] }); toast({ title: '📝 Dagboksinlägg sparat!' }); setDiaryOpen(false); setDiaryText(''); },
    onError: (err: any) => toast({ title: 'Fel', description: err.message, variant: 'destructive' }),
  });

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

  const diaryEntries = (healthLogs as any[])
    .filter((l: any) => l.type === 'diary' && l.description)
    .slice(0, 4)
    .map((l: any) => ({
      date: new Date(l.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' }),
      text: l.description,
    }));

  const addEggs = (count: number) => {
    const hen_id = selectedHenId !== 'all' ? selectedHenId : undefined;
    eggMutation.mutate({ count, hen_id });
  };

  const stats = [
    { icon: Egg, value: yesterdayEggs, label: 'igår', color: 'text-accent', bg: 'bg-accent/8' },
    { icon: Bird, value: activeHens, label: 'hönor', color: 'text-primary', bg: 'bg-primary/8' },
    { icon: TrendingUp, value: weekEggs, label: 'veckan', color: 'text-muted-foreground', bg: 'bg-muted/60' },
    { icon: Coins, value: `${monthProfit >= 0 ? '+' : ''}${Math.round(monthProfit)}`, label: 'kr/mån', color: monthProfit >= 0 ? 'text-success' : 'text-destructive', bg: monthProfit >= 0 ? 'bg-success/8' : 'bg-destructive/8' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in pb-8">
      <DailySummaryModal />

      {/* Hero header */}
      <div className="flex items-end justify-between gap-4 pt-1">
        <div>
          <p className="data-label mb-1.5">{getFormattedDate()}</p>
          <h1 className="text-2xl sm:text-3xl font-serif gradient-text leading-snug">
            {getGreeting()}!
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border/60 rounded-2xl px-3.5 py-2 shadow-sm shrink-0">
          {weatherLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          ) : (
            <>
              <span className="text-sm">{getWeatherIcon(weatherCode)}</span>
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {currentTemp != null ? `${Math.round(currentTemp)}°` : '–'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-2.5 stagger-children">
        {stats.map(({ icon: Icon, value, label, color, bg }, i) => (
          <Card key={i} className="border-border/50 shadow-sm card-hover overflow-hidden">
            <CardContent className="p-3.5 text-center relative">
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="stat-number text-xl text-foreground leading-none">{value}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Premium nudge */}
      <PremiumNudge />

      {/* Egg quick-add */}
      <Card className="border-primary/15 overflow-hidden shadow-sm">
        <div className="h-1 bg-gradient-to-r from-primary/40 via-primary/20 to-accent/30" />
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Egg className="h-4 w-4 text-primary" />
              </div>
              <span className="font-serif text-sm text-foreground">Registrera ägg</span>
            </div>
            <span className="text-xs bg-primary/8 text-primary px-3 py-1 rounded-full font-medium tabular-nums border border-primary/10">
              {todayEggs} idag
            </span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((n) => (
              <Button
                key={n}
                variant="outline"
                size="sm"
                className="w-12 h-10 text-sm font-bold bg-card border-primary/15 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 rounded-xl"
                onClick={() => addEggs(n)}
                disabled={eggMutation.isPending}
              >
                +{n}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-12 h-10 text-sm font-bold border-border/60 text-muted-foreground hover:bg-secondary rounded-xl"
              onClick={() => {
                const custom = prompt('Antal ägg:');
                if (custom && !isNaN(Number(custom)) && Number(custom) > 0) addEggs(Number(custom));
              }}
              disabled={eggMutation.isPending}
            >
              ···
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two-column: Weather tip + AI tip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="border-border/50 shadow-sm card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-destructive/8 flex items-center justify-center">
                <Thermometer className="h-3.5 w-3.5 text-destructive/70" />
              </div>
              <span className="data-label">Vädertips</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {currentTemp != null ? getWeatherTip(currentTemp, weatherCode) : 'Laddar väderdata...'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-warning/15 shadow-sm card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-warning" />
              </div>
              <span className="data-label">Dagens tips</span>
            </div>
            {aiTip?.tip_text ? (
              <p className="text-sm text-foreground leading-relaxed">{aiTip.tip_text}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Laddar dagens tips...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Egg calendar */}
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

      {/* Navigate to eggs */}
      <Card
        className="border-primary/10 cursor-pointer hover:bg-primary/4 transition-all duration-200 shadow-sm card-hover group"
        onClick={() => navigate('/app/eggs')}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/12 transition-colors">
              <Egg className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Alla äggregistreringar</p>
              <p className="text-[11px] text-muted-foreground">{todayEggs} ägg idag · se historik →</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-primary/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </CardContent>
      </Card>

      {/* Diary */}
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
    </div>
  );
}
