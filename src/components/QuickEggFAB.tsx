import React, { useState } from 'react';
import { Egg, Plus, Minus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function QuickEggFAB() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(1);
  const [selectedHenId, setSelectedHenId] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: hens = [] } = useQuery({
    queryKey: ['hens'],
    queryFn: () => api.getHens(),
    staleTime: 60_000,
  });

  const { data: flocks = [] } = useQuery({
    queryKey: ['flocks'],
    queryFn: () => api.getFlocks(),
    staleTime: 60_000,
  });

  const activeHens = (hens as any[]).filter((h: any) => h.is_active && h.hen_type !== 'rooster');

  const mutation = useMutation({
    mutationFn: ({ count, hen_id, flock_id }: { count: number; hen_id?: string; flock_id?: string }) =>
      api.createEggRecord({
        date: new Date().toISOString().split('T')[0],
        count,
        hen_id: hen_id || undefined,
        flock_id: flock_id || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eggs'] });
      toast({ title: `🥚 ${count} ägg registrerade!` });
      setOpen(false);
      setCount(1);
      setSelectedHenId('all');
    },
    onError: (err: any) =>
      toast({ title: 'Fel', description: err.message, variant: 'destructive' }),
  });

  const handleSave = () => {
    const isFlockSelection = selectedHenId.startsWith('flock:');
    const hen_id = !isFlockSelection && selectedHenId !== 'all' ? selectedHenId : undefined;
    const flock_id = isFlockSelection ? selectedHenId.replace('flock:', '') : undefined;
    mutation.mutate({ count, hen_id, flock_id });
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom drawer */}
      {open && (
        <div className="fixed bottom-20 md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:w-80 z-[70] animate-fade-in">
          <div className="bg-card border border-border/60 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Egg className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-serif text-sm text-foreground">Snabbregistrering</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Counter */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setCount(Math.max(1, count - 1))}
                className="w-12 h-12 rounded-full border-2 border-border hover:border-primary flex items-center justify-center transition-colors active:scale-95"
              >
                <Minus className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className="text-center min-w-[80px]">
                <p className="text-4xl font-bold text-foreground tabular-nums">{count}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">ägg</p>
              </div>
              <button
                onClick={() => setCount(count + 1)}
                className="w-12 h-12 rounded-full border-2 border-border hover:border-primary flex items-center justify-center transition-colors active:scale-95"
              >
                <Plus className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Quick presets */}
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 5, 8].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`w-9 h-9 rounded-full text-xs font-semibold transition-all active:scale-90 ${
                    count === n
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            {/* Flock / Hen selector */}
            {(activeHens.length > 0 || (flocks as any[]).length > 0) && (
              <Select value={selectedHenId} onValueChange={setSelectedHenId}>
                <SelectTrigger className="h-9 text-xs rounded-xl border-border/50">
                  <SelectValue placeholder="Alla (generellt)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🥚 Alla (generellt)</SelectItem>
                  {(flocks as any[]).map((flock: any) => {
                    const flockHens = activeHens.filter((h: any) => h.flock_id === flock.id);
                    return (
                      <React.Fragment key={flock.id}>
                        <SelectItem value={`flock:${flock.id}`}>
                          <span className="font-semibold">👥 {flock.name}</span>
                          <span className="text-muted-foreground ml-1 text-[10px]">({flockHens.length} höns)</span>
                        </SelectItem>
                      </React.Fragment>
                    );
                  })}
                  {activeHens.filter((h: any) => !h.flock_id).length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-t border-border/30 mt-1 pt-2">Utan flock</div>
                      {activeHens.filter((h: any) => !h.flock_id).map((hen: any) => (
                        <SelectItem key={hen.id} value={hen.id}>🐔 {hen.name}</SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            )}

            {/* Save */}
            <Button
              className="w-full h-11 text-sm font-semibold gap-2 rounded-xl"
              onClick={handleSave}
              disabled={mutation.isPending}
            >
              <Check className="h-4 w-4" />
              Registrera {count} ägg
            </Button>
          </div>
        </div>
      )}

      {/* FAB button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[35] w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 animate-fade-in"
          aria-label="Registrera ägg"
        >
          <div className="relative">
            <Egg className="h-6 w-6" />
            <Plus className="h-3 w-3 absolute -top-1 -right-1.5 bg-primary-foreground text-primary rounded-full" />
          </div>
        </button>
      )}
    </>
  );
}
