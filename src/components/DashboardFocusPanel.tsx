import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Egg, Bird, ArrowRight, Bell, Package, TrendingUp, CalendarCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

function todayString() {
  return new Date().toISOString().split('T')[0];
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function sumEggsSince(eggs: any[], start: Date) {
  return eggs
    .filter((egg) => new Date(egg.date) >= start)
    .reduce((sum, egg) => sum + (egg.count || 0), 0);
}

function getWeekInsight(eggs: any[]) {
  const thisWeekStart = daysAgo(7);
  const lastWeekStart = daysAgo(14);
  const lastWeekEnd = daysAgo(7);

  const thisWeek = sumEggsSince(eggs, thisWeekStart);
  const lastWeek = eggs
    .filter((egg) => {
      const date = new Date(egg.date);
      return date >= lastWeekStart && date < lastWeekEnd;
    })
    .reduce((sum, egg) => sum + (egg.count || 0), 0);

  const diff = thisWeek - lastWeek;

  if (eggs.length === 0) return 'Logga ägg i några dagar så kan vi visa tydligare trender.';
  if (lastWeek === 0) return `Den här veckan har du loggat ${thisWeek} ägg.`;
  if (diff > 0) return `Den här veckan har du loggat ${thisWeek} ägg, ${diff} fler än förra veckan.`;
  if (diff < 0) return `Den här veckan har du loggat ${thisWeek} ägg, ${Math.abs(diff)} färre än förra veckan.`;
  return `Den här veckan har du loggat ${thisWeek} ägg, samma som förra veckan.`;
}

export default function DashboardFocusPanel() {
  const navigate = useNavigate();
  const today = todayString();

  const { data: eggs = [] } = useQuery({ queryKey: ['eggs'], queryFn: () => api.getEggs(), staleTime: 60_000 });
  const { data: hens = [] } = useQuery({ queryKey: ['hens'], queryFn: () => api.getHens(), staleTime: 60_000 });
  const { data: feedRecords = [] } = useQuery({ queryKey: ['feed-records'], queryFn: () => api.getFeedRecords(), staleTime: 60_000 });
  const { data: transactions = [] } = useQuery({ queryKey: ['transactions'], queryFn: () => api.getTransactions(), staleTime: 60_000 });
  const { data: chores = [] } = useQuery({ queryKey: ['daily-chores'], queryFn: () => api.getDailyChores(), staleTime: 60_000 });

  const todayEggs = useMemo(() => {
    return (eggs as any[])
      .filter((egg) => egg.date === today)
      .reduce((sum, egg) => sum + (egg.count || 0), 0);
  }, [eggs, today]);

  const activeHens = useMemo(() => {
    return (hens as any[]).filter((hen) => hen.is_active && hen.hen_type !== 'rooster');
  }, [hens]);

  const importantChores = useMemo(() => {
    const now = new Date();
    const withinThreeDays = new Date();
    withinThreeDays.setDate(withinThreeDays.getDate() + 3);
    return (chores as any[])
      .filter((chore) => chore.next_due_at && !chore.completed && new Date(chore.next_due_at) <= withinThreeDays)
      .sort((a, b) => new Date(a.next_due_at).getTime() - new Date(b.next_due_at).getTime())
      .slice(0, 2)
      .map((chore) => ({ ...chore, isLate: new Date(chore.next_due_at) < now }));
  }, [chores]);

  const nextActions = useMemo(() => {
    const actions: { title: string; text: string; button: string; path: string; icon: any }[] = [];

    if (activeHens.length === 0) {
      actions.push({
        title: 'Lägg till din första höna',
        text: 'Börja med flocken så kan Hönsgården hjälpa dig följa ägg, hälsa och historik.',
        button: 'Lägg till höna',
        path: '/app/hens',
        icon: Bird,
      });
    }

    if (activeHens.length > 0 && todayEggs === 0) {
      actions.push({
        title: 'Logga dagens ägg',
        text: 'Det tar bara några sekunder och gör statistiken mycket mer användbar.',
        button: 'Logga ägg',
        path: '/app/eggs',
        icon: Egg,
      });
    }

    if ((feedRecords as any[]).length === 0) {
      actions.push({
        title: 'Lägg till foderkostnad',
        text: 'Då kan appen räkna ut ungefärlig kostnad per ägg.',
        button: 'Lägg till foder',
        path: '/app/feed',
        icon: Package,
      });
    }

    if ((chores as any[]).length === 0) {
      actions.push({
        title: 'Skapa en enkel rutin',
        text: 'Till exempel vatten, foder eller rengöring – skönt att slippa komma ihåg allt själv.',
        button: 'Skapa uppgift',
        path: '/app/tasks',
        icon: CalendarCheck,
      });
    }

    if ((transactions as any[]).length === 0 && activeHens.length > 0) {
      actions.push({
        title: 'Följ ekonomin enkelt',
        text: 'Lägg in en kostnad eller intäkt så får du bättre koll på hönsgårdens ekonomi.',
        button: 'Öppna ekonomi',
        path: '/app/finance',
        icon: TrendingUp,
      });
    }

    return actions.slice(0, 2);
  }, [activeHens.length, todayEggs, feedRecords, chores, transactions]);

  const weekInsight = getWeekInsight(eggs as any[]);
  const hasLoggedToday = todayEggs > 0;

  return (
    <section className="max-w-2xl mx-auto mb-5 space-y-3" aria-label="Dagens översikt">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/8 to-accent/5 shadow-sm overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="data-label mb-1">Dagens hönsgård</p>
              <h2 className="font-serif text-xl sm:text-2xl text-foreground">
                {hasLoggedToday ? `${todayEggs} ägg loggade idag 🥚` : 'Inga ägg loggade idag ännu'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {hasLoggedToday ? 'Snyggt! Du har koll på dagens värpning.' : 'Logga dagens ägg snabbt så håller statistiken sig levande.'}
              </p>
            </div>
            <Button size="lg" className="rounded-2xl gap-2 h-12 px-5 active:scale-95" onClick={() => navigate('/app/eggs')}>
              <Egg className="h-5 w-5" />
              Logga ägg
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            <div className="rounded-xl bg-background/70 border border-border/40 p-3">
              <p className="text-lg font-bold text-foreground tabular-nums">{todayEggs}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Idag</p>
            </div>
            <div className="rounded-xl bg-background/70 border border-border/40 p-3">
              <p className="text-lg font-bold text-foreground tabular-nums">{sumEggsSince(eggs as any[], daysAgo(7))}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">7 dagar</p>
            </div>
            <div className="rounded-xl bg-background/70 border border-border/40 p-3">
              <p className="text-lg font-bold text-foreground tabular-nums">{activeHens.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Hönor</p>
            </div>
            <div className="rounded-xl bg-background/70 border border-border/40 p-3">
              <p className="text-lg font-bold text-foreground tabular-nums">{importantChores.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Viktigt</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-serif text-base text-foreground">Veckosammanfattning</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{weekInsight}</p>
            </div>
          </div>

          {importantChores.length > 0 && (
            <div className="rounded-xl bg-warning/5 border border-warning/20 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Bell className="h-4 w-4 text-warning" />
                <p className="text-sm font-medium text-foreground">Viktiga påminnelser</p>
              </div>
              <div className="space-y-1">
                {importantChores.map((chore) => (
                  <p key={chore.id} className="text-xs text-muted-foreground">
                    {chore.isLate ? 'Försenad: ' : 'Snart: '}{chore.title}
                  </p>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {nextActions.length > 0 && (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <p className="font-serif text-base text-foreground mb-3">Nästa bästa steg</p>
            <div className="space-y-2">
              {nextActions.map((action) => (
                <button
                  key={action.title}
                  onClick={() => navigate(action.path)}
                  className="w-full text-left rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 p-3 flex items-center gap-3 transition-colors active:scale-[0.99]"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <action.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{action.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{action.text}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
