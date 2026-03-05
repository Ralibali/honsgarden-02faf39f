import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Egg, Bird, CalendarDays, Coins, Thermometer, Heart, Lightbulb, ArrowRight, Sun, BookOpen, Leaf, Loader2, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DailySummaryModal } from '@/components/DailySummaryModal';
import { PremiumUpsellBanner } from '@/components/AffiliateRecommendations';
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
  const days = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
  const months = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];
  const now = new Date();
  return `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`;
}

function getMonthName(month: number) {
  const months = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];
  return months[month];
}

function getSeasonTips(): { title: string; tips: string[] } {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) {
    return { title: '🌱 Vår-tips', tips: ['Hönsen börjar lägga fler ägg nu – se till att de har extra kalcium.', 'Rengör hönshuset ordentligt efter vintern.', 'Kolla efter kvalster som trivs i värmen.', 'Börja släppa ut hönsen längre stunder.'] };
  }
  if (month >= 5 && month <= 7) {
    return { title: '☀️ Sommar-tips', tips: ['Se till att hönsen har skugga och gott om vatten.', 'Samla ägg ofta så de inte går sönder.', 'Håll utkik efter rovdjur som rävar.', 'Ge vattenmelon som godis vid värmeböljor.'] };
  }
  if (month >= 8 && month <= 10) {
    return { title: '🍂 Höst-tips', tips: ['Många höns ruggar nu – ge extra protein.', 'Äggproduktionen minskar – helt normalt.', 'Börja förbereda hönshuset för vintern.', 'Kontrollera ventilationen.'] };
  }
  return { title: '❄️ Vinter-tips', tips: ['Se till att vattnet inte fryser.', 'Extra belysning kan hjälpa äggproduktionen.', 'Isolera hönshuset men behåll ventilationen.', 'Ge lite extra foder för värmen.'] };
}

async function fetchWeather() {
  const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=59.33&longitude=18.07&current=temperature_2m,weathercode&timezone=Europe%2FStockholm');
  if (!res.ok) throw new Error('Weather fetch failed');
  return res.json();
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
  const season = getSeasonTips();

  // Fetch real data
  const { data: farmData } = useQuery({
    queryKey: ['farm-today'],
    queryFn: () => api.getFarmToday(),
    staleTime: 60_000,
  });

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

  // Egg quick-add mutation
  const eggMutation = useMutation({
    mutationFn: (count: number) => api.createEggRecord({ date: now.toISOString().split('T')[0], count }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eggs'] });
      queryClient.invalidateQueries({ queryKey: ['farm-today'] });
      toast({ title: '🥚 Ägg registrerade!' });
    },
    onError: (err: any) => toast({ title: 'Fel', description: err.message, variant: 'destructive' }),
  });

  // Diary entry mutation (uses health_logs with type 'diary')
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

  // Build egg calendar from real data
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
    if (count === 0) return 'bg-muted text-muted-foreground';
    if (count <= 3) return 'bg-primary/10 text-primary';
    if (count <= 6) return 'bg-primary/20 text-primary font-semibold';
    return 'bg-primary/30 text-primary font-bold';
  };

  // Diary entries from health_logs
  const diaryEntries = (healthLogs as any[])
    .filter((l: any) => l.type === 'diary' && l.description)
    .slice(0, 5)
    .map((l: any) => ({
      date: new Date(l.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' }),
      text: l.description,
      emoji: '📝',
    }));

  const addEggs = (count: number) => {
    eggMutation.mutate(count);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-fade-in">
      <DailySummaryModal />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs sm:text-sm uppercase tracking-widest text-muted-foreground font-semibold">{getGreeting()}</p>
          <h1 className="text-2xl sm:text-4xl font-serif text-foreground mt-1">Min Hönsgård</h1>
          <p className="text-sm text-muted-foreground mt-1">{getFormattedDate()}</p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-full px-3 py-1.5 shadow-sm">
          <Sun className="h-4 w-4 text-warning" />
          {weatherLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <span className="text-sm font-medium text-foreground">
              {currentTemp != null ? `${Math.round(currentTemp)}°` : '–'}
            </span>
          )}
        </div>
      </div>

      {/* Stats bar – REAL data */}
      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
            <div className="flex items-center gap-2 py-3 sm:py-4 px-3 justify-center">
              <Egg className="h-4 w-4 text-accent shrink-0" />
              <span className="font-bold text-foreground">{yesterdayEggs}</span>
              <span className="text-xs text-muted-foreground">igår</span>
            </div>
            <div className="flex items-center gap-2 py-3 sm:py-4 px-3 justify-center">
              <Bird className="h-4 w-4 text-primary shrink-0" />
              <span className="font-bold text-foreground">{activeHens}</span>
              <span className="text-xs text-muted-foreground">hönor</span>
            </div>
            <div className="flex items-center gap-2 py-3 sm:py-4 px-3 justify-center">
              <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-bold text-foreground">{weekEggs}</span>
              <span className="text-xs text-muted-foreground">veckan</span>
            </div>
            <div className="flex items-center gap-2 py-3 sm:py-4 px-3 justify-center">
              <Coins className="h-4 w-4 text-accent shrink-0" />
              <span className="font-bold text-foreground">{monthProfit >= 0 ? '+' : ''}{Math.round(monthProfit)}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">kr/mån</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Din hönsgård idag */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🐔</span>
          <h2 className="text-lg font-serif text-primary">Din hönsgård idag</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Card className="border border-primary/20 bg-primary/5 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center min-h-[100px]">
              <Egg className="h-5 w-5 text-primary/60 mb-1" />
              <p className="text-xl font-bold text-foreground">{todayEggs}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">ägg idag</p>
            </CardContent>
          </Card>
          <Card className="border border-border bg-secondary/30 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center min-h-[100px]">
              <Thermometer className="h-5 w-5 text-destructive/70 mb-1" />
              {weatherLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <p className="text-xl font-bold text-foreground">
                  {currentTemp != null ? `${Math.round(currentTemp)}°` : '–'}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground mt-0.5">temperatur</p>
            </CardContent>
          </Card>
          <Card className="border border-warning/20 bg-warning/5 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center min-h-[100px]">
              <Heart className="h-5 w-5 text-success mb-1" />
              <p className="text-xl font-bold text-success">{activeHens > 0 ? '100' : '–'}/100</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">hälsoscore</p>
            </CardContent>
          </Card>
          <Card className="border border-accent/20 bg-accent/5 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center min-h-[100px]">
              <Lightbulb className="h-5 w-5 text-warning mb-1" />
              <p className="text-[11px] text-foreground font-medium leading-snug">
                {currentTemp != null ? getWeatherTip(currentTemp, weatherCode) : 'Bra väder för dina höns idag!'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Registrera ägg – quick add (saves to DB) */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Egg className="h-5 w-5 text-accent" />
              <span className="font-serif text-primary font-medium">Snabbregistrera ägg</span>
            </div>
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{todayEggs} idag</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            {[1, 2, 3].map((n) => (
              <Button
                key={n}
                variant="outline"
                size="lg"
                className="w-14 h-10 text-base font-bold bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                onClick={() => addEggs(n)}
                disabled={eggMutation.isPending}
              >
                +{n}
              </Button>
            ))}
            <Button
              variant="outline"
              size="lg"
              className="w-14 h-10 text-base font-bold border-border text-muted-foreground hover:bg-secondary"
              onClick={() => {
                const custom = prompt('Antal ägg:');
                if (custom && !isNaN(Number(custom)) && Number(custom) > 0) addEggs(Number(custom));
              }}
              disabled={eggMutation.isPending}
            >
              ...
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Go to eggs page */}
      <Card
        className="bg-primary/10 border-primary/20 cursor-pointer hover:bg-primary/15 transition-colors shadow-sm"
        onClick={() => navigate('/app/eggs')}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Egg className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Se alla äggregistreringar</p>
              <p className="text-xs text-muted-foreground">{todayEggs} ägg idag</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-primary" />
        </CardContent>
      </Card>

      {/* Äggkalender – compact */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-sm text-primary font-medium">Äggkalender – {getMonthName(now.getMonth())}</h2>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {['M', 'T', 'O', 'T', 'F', 'L', 'S'].map((d, i) => (
              <div key={`${d}-${i}`} className="text-[9px] text-center text-muted-foreground font-medium py-0.5">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
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
                  className={`rounded text-center py-0.5 text-[10px] transition-colors
                    ${isFuture ? 'bg-muted/30 text-muted-foreground/40' : getEggColor(eggCount)}
                    ${isToday ? 'ring-1 ring-primary ring-offset-1 ring-offset-background' : ''}
                  `}
                >
                  <span className="leading-none">{day}</span>
                  {!isFuture && eggCount > 0 && (
                    <span className="block text-[8px] leading-none">{eggCount}</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Totalt: <strong className="text-foreground">{Object.values(eggCalendarData).reduce((a, b) => a + b, 0)} ägg</strong> i {getMonthName(now.getMonth()).toLowerCase()}
          </p>
        </CardContent>
      </Card>

      {/* Hönornas dagbok – real data */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-accent" />
            <h2 className="font-serif text-sm text-accent font-medium">Hönornas dagbok</h2>
          </div>
          {diaryEntries.length > 0 ? (
            <div className="space-y-2">
              {diaryEntries.map((entry, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <span className="text-base mt-0.5">{entry.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{entry.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{entry.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Inga dagboksinlägg ännu. Börja skriva om dina höns!</p>
          )}
          <Button variant="outline" size="sm" className="w-full mt-3 text-muted-foreground gap-1.5" onClick={() => setDiaryOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Skriv i dagboken
          </Button>
        </CardContent>
      </Card>

      {/* Diary dialog */}
      <Dialog open={diaryOpen} onOpenChange={setDiaryOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif">📝 Skriv i dagboken</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Vad hände idag med hönsen?"
              value={diaryText}
              onChange={(e) => setDiaryText(e.target.value)}
              className="h-11"
              onKeyDown={(e) => { if (e.key === 'Enter' && diaryText.trim()) diaryMutation.mutate(diaryText.trim()); }}
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

      {/* Säsongsguide */}
      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-sm text-primary font-medium">{season.title}</h2>
          </div>
          <ul className="space-y-1.5">
            {season.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 items-start text-xs text-foreground">
                <span className="text-primary mt-0.5 shrink-0">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Premium upsell */}
      <PremiumUpsellBanner variant="full" />
    </div>
  );
}
