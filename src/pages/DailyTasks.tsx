import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, RotateCcw, Sun, Moon, Clock, Sparkles } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const timeConfig: Record<string, { icon: any; label: string; color: string }> = {
  morning: { icon: Sun, label: 'Morgon', color: 'text-warning' },
  evening: { icon: Moon, label: 'Kväll', color: 'text-primary' },
  anytime: { icon: Clock, label: 'Under dagen', color: 'text-accent' },
};

export default function DailyTasks() {
  const queryClient = useQueryClient();

  const { data: chores = [], isLoading } = useQuery({
    queryKey: ['daily-chores'],
    queryFn: () => api.getDailyChores(),
  });

  const completeMutation = useMutation({
    mutationFn: (choreId: string) => api.completeChore(choreId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['daily-chores'] }),
  });

  const uncompleteMutation = useMutation({
    mutationFn: (choreId: string) => api.uncompleteChore(choreId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['daily-chores'] }),
  });

  const toggleChore = (chore: any) => {
    const choreId = chore._id || chore.id;
    if (chore.completed_today || chore.done) {
      uncompleteMutation.mutate(choreId);
    } else {
      completeMutation.mutate(choreId);
    }
  };

  const completedCount = chores.filter((c: any) => c.completed_today || c.done).length;
  const progress = chores.length > 0 ? Math.round((completedCount / chores.length) * 100) : 0;

  // Group by time_of_day
  const grouped = {
    morning: chores.filter((c: any) => (c.time_of_day || c.time || 'anytime') === 'morning'),
    anytime: chores.filter((c: any) => (c.time_of_day || c.time || 'anytime') === 'anytime'),
    evening: chores.filter((c: any) => (c.time_of_day || c.time || 'anytime') === 'evening'),
  };

  if (isLoading) {
    return <div className="max-w-5xl mx-auto space-y-4 animate-fade-in"><Skeleton className="h-10 w-48" /><Skeleton className="h-20" /><Skeleton className="h-40" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Dagliga uppgifter ✅</h1>
          <p className="text-sm text-muted-foreground mt-1">Din dagliga checklista – återställs varje morgon</p>
        </div>
      </div>

      {/* Progress */}
      <Card className={`shadow-sm transition-colors ${progress === 100 ? 'bg-success/5 border-success/30' : 'bg-card border-border'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              {progress === 100 ? '🎉 Alla uppgifter klara!' : `${completedCount} av ${chores.length} klara`}
            </span>
            <span className="stat-number text-sm text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2.5">
            <div className={`h-2.5 rounded-full transition-all duration-500 ${progress === 100 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${progress}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Task groups */}
      {(['morning', 'anytime', 'evening'] as const).map((time) => {
        const config = timeConfig[time] || timeConfig.anytime;
        const groupTasks = grouped[time];
        if (groupTasks.length === 0) return null;
        const Icon = config.icon;
        return (
          <Card key={time} className="bg-card border-border shadow-sm">
            <CardHeader className="px-4 sm:px-6 pb-2">
              <CardTitle className="font-serif text-base flex items-center gap-2">
                <Icon className={`h-4 w-4 ${config.color}`} />
                {config.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {groupTasks.map((chore: any) => {
                  const isDone = chore.completed_today || chore.done;
                  return (
                    <button
                      key={chore._id || chore.id}
                      onClick={() => toggleChore(chore)}
                      className="flex items-center gap-3 px-4 sm:px-6 py-3 w-full text-left hover:bg-secondary/50 transition-colors"
                    >
                      <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isDone ? 'bg-success/20 border-success' : 'border-border hover:border-primary'}`}>
                        {isDone && <Check className="h-3 w-3 text-success" />}
                      </div>
                      <span className={`text-xs sm:text-sm ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {chore.title || chore.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* If no groups matched, show flat list */}
      {chores.length > 0 && Object.values(grouped).every(g => g.length === 0) && (
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {chores.map((chore: any) => {
                const isDone = chore.completed_today || chore.done;
                return (
                  <button
                    key={chore._id || chore.id}
                    onClick={() => toggleChore(chore)}
                    className="flex items-center gap-3 px-4 sm:px-6 py-3 w-full text-left hover:bg-secondary/50 transition-colors"
                  >
                    <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isDone ? 'bg-success/20 border-success' : 'border-border hover:border-primary'}`}>
                      {isDone && <Check className="h-3 w-3 text-success" />}
                    </div>
                    <span className={`text-xs sm:text-sm ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {chore.title || chore.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {chores.length === 0 && (
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-8 text-center text-muted-foreground text-sm">
            Inga dagliga uppgifter konfigurerade. Lägg till dem i inställningarna.
          </CardContent>
        </Card>
      )}

      <Card className="bg-primary/5 border-primary/20 shadow-sm">
        <CardContent className="p-4 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-warning shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Premium: Automatiska påminnelser</p>
            <p className="text-xs text-muted-foreground">Få push-notiser när det är dags att stänga luckan</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
