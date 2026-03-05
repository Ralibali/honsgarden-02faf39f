import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Egg, Bird, CalendarDays, Coins, Thermometer, Heart, Lightbulb,
  ArrowRight, Sun, BookOpen, Leaf, Loader2, Plus, TrendingUp, Sparkles,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DailySummaryModal } from '@/components/DailySummaryModal';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const now = new Date();

  // Fetch real data
  const { data: eggs = [] } = useQuery({
    queryKey: ['eggs'],
    queryFn: () => api.getEggs(),
    staleTime: 60_000,
  });

  const { data: hens = [] } = useQuery({
    queryKey: ['hens'],
    queryFn: () => api.getHens(),
    staleTime: 60_000,
  });

  const { data: healthLogs = [] } = useQuery({
    queryKey: ['health-logs'],
    queryFn: () => api.getHealthLogs(),
    staleTime: 60_000,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => api.getTransactions(),
    staleTime: 60_000,
  });

  const { data: weatherData, isLoading: weatherLoading } = useQuery({
    queryKey: ['weather'],
    queryFn: fetchWeather,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  const { data: aiTip } = useQuery({
    queryKey: ['daily-tip'],
    queryFn: () => api.getDailyTip(),
    staleTime: 60 * 60 * 1000, // 1 hour cache on client
    retry: 1,
  });

  // Egg quick-add mutation
  const eggMutation = useMutation({
    mutationFn: (count: number) => api.createEggRecord({ date: now.toISOString().split('T')[0], count }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eggs'] });
      toast({ title: '🥚 Ägg registrerade!' });
    },
    onError: (err: any) => toast({ title: 'Fel', description: err.message, variant: 'destructive' }),
  });

  // Diary entry mutation
  const diaryMutation = useMutation({
    mutationFn: (text: string) => api.createHealthLog({ date: now.toISOString().split('T')[0], type: 'diary', description: text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-logs'] });
      toast({ title: '📝 Dagboksinlägg sparat!' });
      setDiaryOpen(false);
      setDiaryText('');
    },
    onError: (err: any) => toast({ title: 'Fel', description: err.message, variant: 'destructive' }),
  });

  const currentTemp = weatherData?.current?.temperature_2m;
  const weatherCode = weatherData?.current?.weathercode ?? 0;

  // Compute real stats
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

  // Build egg calendar
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
    if (count === 0) return 'bg-muted/50 text-muted-foreground';
    if (count <= 2) return 'bg-primary/10 text-primary';
    if (count <= 5) return 'bg-primary/20 text-primary font-semibold';
    return 'bg-primary/30 text-primary font-bold';
  };

  // Diary entries
  const diaryEntries = (healthLogs as any[])
    .filter((l: any) => l.type === 'diary' && l.description)
    .slice(0, 4)
    .map((l: any) => ({
      date: new Date(l.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' }),
      text: l.description,
    }));

  const addEggs = (count: number) => eggMutation.mutate(count);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-8">
      <DailySummaryModal />

      {/* Hero header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="data-label mb-1">{getFormattedDate()}</p>
          <h1 className="text-2xl sm:text-3xl font-serif gradient-text leading-snug">
            {getGreeting()}!
          </h1>
        </div>
        {/* Weather pill */}
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1.5 shadow-sm shrink-0">
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
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Egg, value: yesterdayEggs, label: 'igår', color: 'text-accent' },
          { icon: Bird, value: activeHens, label: 'hönor', color: 'text-primary' },
          { icon: TrendingUp, value: weekEggs, label: 'veckan', color: 'text-muted-foreground' },
          { icon: Coins, value: `${monthProfit >= 0 ? '+' : ''}${Math.round(monthProfit)}`, label: 'kr/mån', color: monthProfit >= 0 ? 'text-success' : 'text-destructive' },
        ].map(({ icon: Icon, value, label, color }, i) => (
          <Card key={i} className="border-border shadow-sm card-hover">
            <CardContent className="p-3 text-center">
              <Icon className={`h-4 w-4 mx-auto mb-1 ${color}`} />
              <p className="stat-number text-lg text-foreground">{value}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Egg quick-add */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Egg className="h-4 w-4 text-primary" />
              <span className="font-serif text-sm text-primary">Registrera ägg</span>
            </div>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium tabular-nums">
              {todayEggs} idag
            </span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((n) => (
              <Button
                key={n}
                variant="outline"
                size="sm"
                className="w-11 h-9 text-sm font-bold bg-card border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                onClick={() => addEggs(n)}
                disabled={eggMutation.isPending}
              >
                +{n}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-11 h-9 text-sm font-bold border-border text-muted-foreground hover:bg-secondary"
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
        {/* Weather tip */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="h-4 w-4 text-destructive/70" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Vädertips</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {currentTemp != null ? getWeatherTip(currentTemp, weatherCode) : 'Laddar väderdata...'}
            </p>
          </CardContent>
        </Card>

        {/* AI daily tip */}
        <Card className="border-warning/20 bg-warning/5 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-warning" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dagens tips</span>
            </div>
            {aiTip?.tip_text ? (
              <p className="text-sm text-foreground leading-relaxed">{aiTip.tip_text}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Laddar dagens tips...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Egg calendar – compact */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <h2 className="font-serif text-sm text-primary">{getMonthName(now.getMonth())}</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {Object.values(eggCalendarData).reduce((a, b) => a + b, 0)} ägg totalt
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['M', 'T', 'O', 'T', 'F', 'L', 'S'].map((d, i) => (
              <div key={`${d}-${i}`} className="text-[9px] text-center text-muted-foreground font-medium">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const eggCount = eggCalendarData[day] || 0;
              const isToday = day === now.getDate();
              const isFuture = day > now.getDate();
              return (
                <div
                  key={day}
                  className={`rounded-md text-center py-1 text-[10px] transition-colors
                    ${isFuture ? 'bg-muted/20 text-muted-foreground/30' : getEggColor(eggCount)}
                    ${isToday ? 'ring-1.5 ring-primary ring-offset-1 ring-offset-background' : ''}
                  `}
                >
                  <span className="leading-none">{day}</span>
                  {!isFuture && eggCount > 0 && (
                    <span className="block text-[8px] leading-none opacity-80">{eggCount}</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigate to eggs */}
      <Card
        className="border-primary/15 cursor-pointer hover:bg-primary/5 transition-colors shadow-sm card-hover"
        onClick={() => navigate('/app/eggs')}
      >
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Egg className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Alla äggregistreringar</p>
              <p className="text-[10px] text-muted-foreground">{todayEggs} ägg idag</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-primary" />
        </CardContent>
      </Card>

      {/* Diary */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-accent" />
              <h2 className="font-serif text-sm text-accent">Dagbok</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-primary hover:text-primary"
              onClick={() => setDiaryOpen(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Skriv
            </Button>
          </div>
          {diaryEntries.length > 0 ? (
            <div className="space-y-2">
              {diaryEntries.map((entry, i) => (
                <div key={i} className="flex gap-3 items-start p-2 rounded-lg bg-muted/30">
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5 font-medium">{entry.date}</span>
                  <p className="text-sm text-foreground leading-relaxed">{entry.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <BookOpen className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Inga inlägg ännu</p>
              <p className="text-xs text-muted-foreground/70">Skriv om vad som händer med dina höns</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diary dialog */}
      <Dialog open={diaryOpen} onOpenChange={setDiaryOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif">Skriv i dagboken</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              placeholder="Vad hände idag med hönsen?"
              value={diaryText}
              onChange={(e) => setDiaryText(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={!diaryText.trim() || diaryMutation.isPending}
                onClick={() => diaryMutation.mutate(diaryText.trim())}
              >
                {diaryMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Spara
              </Button>
              <Button variant="outline" onClick={() => setDiaryOpen(false)}>Avbryt</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
