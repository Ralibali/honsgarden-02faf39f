import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, HeartPulse, ClipboardCheck, Egg, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export default function FlockHealthLight({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const { data: eggs = [] } = useQuery({ queryKey: ['eggs'], queryFn: () => api.getEggs().catch(() => []) });
  const { data: hens = [] } = useQuery({ queryKey: ['hens'], queryFn: () => api.getHens().catch(() => []) });
  const { data: chores = [] } = useQuery({ queryKey: ['daily-chores'], queryFn: () => api.getDailyChores().catch(() => []) });

  const state = useMemo(() => {
    const list = eggs as any[];
    const activeHens = (hens as any[]).filter((h) => h.is_active && h.hen_type !== 'rooster');
    const currentStart = daysAgo(7);
    const previousStart = daysAgo(14);
    const previousEnd = daysAgo(7);
    const current = list.filter((e) => new Date(e.date) >= currentStart).reduce((sum, e) => sum + (e.count || 0), 0);
    const previous = list.filter((e) => {
      const date = new Date(e.date);
      return date >= previousStart && date < previousEnd;
    }).reduce((sum, e) => sum + (e.count || 0), 0);
    const lateChores = (chores as any[]).filter((c) => c.next_due_at && !c.completed && new Date(c.next_due_at) < new Date());
    const dropPct = previous > 0 ? ((previous - current) / previous) * 100 : 0;

    if (activeHens.length === 0) {
      return {
        level: 'info' as const,
        title: 'Flockhälsan väntar på hönor',
        text: 'Lägg till dina hönor så kan Hönsgården börja hålla lätt koll på flockens rytm.',
        icon: HeartPulse,
        cta: 'Lägg till hönor',
        path: '/app/hens',
        bullets: ['Inga aktiva hönor registrerade ännu'],
      };
    }

    if (lateChores.length > 0 || dropPct >= 25) {
      const bullets = [];
      if (dropPct >= 25) bullets.push(`Äggproduktionen är cirka ${Math.round(dropPct)}% lägre än förra veckan`);
      if (lateChores.length > 0) bullets.push(`${lateChores.length} rutin${lateChores.length > 1 ? 'er' : ''} är försenad`);
      return {
        level: 'watch' as const,
        title: 'Håll lite extra koll',
        text: 'Det behöver inte vara något farligt, men det är värt att observera flocken lite extra idag.',
        icon: AlertCircle,
        cta: 'Se uppgifter',
        path: lateChores.length > 0 ? '/app/tasks' : '/app/statistics',
        bullets,
      };
    }

    if (current === 0) {
      return {
        level: 'info' as const,
        title: 'Behöver dagens ägglogg',
        text: 'När du loggar äggen blir flockhälsan mer träffsäker över tid.',
        icon: Egg,
        cta: 'Logga ägg',
        path: '/app/eggs',
        bullets: ['Ingen äggloggning hittad för den senaste perioden'],
      };
    }

    return {
      level: 'good' as const,
      title: 'Flocken ser stabil ut',
      text: 'Baserat på äggloggning och rutiner ser inget tydligt avvikande ut just nu.',
      icon: CheckCircle2,
      cta: 'Se statistik',
      path: '/app/statistics',
      bullets: ['Fortsätt logga ägg och rutiner för bättre koll'],
    };
  }, [eggs, hens, chores]);

  const Icon = state.icon;
  const toneClass = state.level === 'good'
    ? 'border-success/20 bg-success/5'
    : state.level === 'watch'
      ? 'border-warning/25 bg-warning/5'
      : 'border-primary/20 bg-primary/5';

  return (
    <Card className={`shadow-sm ${toneClass}`}>
      <CardContent className={compact ? 'p-4' : 'p-4 sm:p-5'}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-background/70 border border-border/40 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="data-label mb-1">Flockhälsa-light</p>
            <h2 className="font-serif text-lg text-foreground">{state.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1">{state.text}</p>
            {!compact && (
              <ul className="mt-3 space-y-1">
                {state.bullets.map((bullet) => (
                  <li key={bullet} className="text-xs text-muted-foreground flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <Button size="sm" variant="outline" className="rounded-xl gap-1.5" onClick={() => navigate(state.path)}>
                {state.cta}<ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" className="rounded-xl gap-1.5" onClick={() => navigate('/app/hens')}>
                <ClipboardCheck className="h-3.5 w-3.5" />
                Lägg hälsonotering
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 border-t border-border/40 pt-3">
              Detta är en enkel observationshjälp och ersätter inte veterinärbedömning vid sjukdom eller oro.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
