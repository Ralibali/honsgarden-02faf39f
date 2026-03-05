import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Sun, Moon, Clock, Sparkles } from 'lucide-react';
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
    const choreId = chore.id;
    if (chore.completed) {
      uncompleteMutation.mutate(choreId);
    } else {
      completeMutation.mutate(choreId);
    }
  };

  const completedCount = chores.filter((c: any) => c.completed).length;
  const progress = chores.length > 0 ? Math.round((completedCount / chores.length) * 100) : 0;

  if (isLoading) {
    return <div className="max-w-5xl mx-auto space-y-4 animate-fade-in"><Skeleton className="h-10 w-48" /><Skeleton className="h-20" /><Skeleton className="h-40" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Dagliga uppgifter ✅</h1>
        <p className="text-sm text-muted-foreground mt-1">Din dagliga checklista – återställs varje morgon</p>
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

      {/* All tasks */}
      {chores.length > 0 && (
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {chores.map((chore: any) => {
                const isDone = chore.completed;
                return (
                  <button
                    key={chore.id}
                    onClick={() => toggleChore(chore)}
                    className="flex items-center gap-3 px-4 sm:px-6 py-3.5 w-full text-left hover:bg-secondary/50 transition-colors"
                  >
                    <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isDone ? 'bg-success/20 border-success' : 'border-border hover:border-primary'}`}>
                      {isDone && <Check className="h-3 w-3 text-success" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs sm:text-sm ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {chore.title}
                      </span>
                      {chore.description && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">{chore.description}</p>
                      )}
                    </div>
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
            Inga dagliga uppgifter konfigurerade ännu. Kontakta support för att lägga upp standarduppgifter.
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
