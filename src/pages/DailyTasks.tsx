import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Plus, Trash2, Sparkles, ChevronRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTED_CHORES = [
  { title: 'Samla ägg', description: 'Kolla boet och plocka dagens ägg' },
  { title: 'Fyll på vatten', description: 'Se till att vattenskålarna är fulla och rena' },
  { title: 'Fyll på foder', description: 'Kontrollera foderbehållarna' },
  { title: 'Stäng luckan', description: 'Stäng hönsluckan på kvällen för säkerheten' },
  { title: 'Öppna luckan', description: 'Öppna luckan på morgonen så hönsen kommer ut' },
  { title: 'Kontrollera hälsa', description: 'Snabb koll att alla hönor mår bra' },
  { title: 'Rengör hönshuset', description: 'Byt strö och rengör ströbädden' },
  { title: 'Kontrollera stängslet', description: 'Se till att inhägnaden är hel och säker' },
];

export default function DailyTasks() {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  const createMutation = useMutation({
    mutationFn: ({ title, description }: { title: string; description?: string }) =>
      api.createChore(title, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-chores'] });
      toast({ title: '✅ Uppgift tillagd!' });
      setNewTitle('');
    },
    onError: (err: any) => toast({ title: 'Fel', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (choreId: string) => api.deleteChore(choreId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-chores'] });
      toast({ title: '🗑️ Uppgift borttagen' });
    },
  });

  const toggleChore = (chore: any) => {
    if (chore.completed) {
      uncompleteMutation.mutate(chore.id);
    } else {
      completeMutation.mutate(chore.id);
    }
  };

  const addSuggested = (s: typeof SUGGESTED_CHORES[0]) => {
    const alreadyExists = chores.some((c: any) => c.title.toLowerCase() === s.title.toLowerCase());
    if (alreadyExists) {
      toast({ title: 'Uppgiften finns redan' });
      return;
    }
    createMutation.mutate({ title: s.title, description: s.description });
  };

  const completedCount = chores.filter((c: any) => c.completed).length;
  const progress = chores.length > 0 ? Math.round((completedCount / chores.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-20" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-5xl mx-auto space-y-4 sm:space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Dagliga uppgifter ✅</h1>
        <p className="text-sm text-muted-foreground mt-1">Din dagliga checklista – återställs varje morgon</p>
      </div>

      {/* Progress */}
      <motion.div layout>
        <Card className={`shadow-sm transition-colors ${progress === 100 ? 'bg-success/5 border-success/30' : 'bg-card border-border'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                {progress === 100 ? '🎉 Alla uppgifter klara!' : `${completedCount} av ${chores.length} klara`}
              </span>
              <span className="stat-number text-sm text-primary">{progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
              <motion.div
                className={`h-2.5 rounded-full ${progress === 100 ? 'bg-success' : 'bg-primary'}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add custom task */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Lägg till ny uppgift..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTitle.trim()) {
                  createMutation.mutate({ title: newTitle.trim() });
                }
              }}
              className="flex-1 h-10 rounded-xl border-border/60"
            />
            <Button
              size="sm"
              className="h-10 px-4 rounded-xl gap-1.5"
              disabled={!newTitle.trim() || createMutation.isPending}
              onClick={() => newTitle.trim() && createMutation.mutate({ title: newTitle.trim() })}
            >
              <Plus className="h-4 w-4" />
              Lägg till
            </Button>
          </div>

          {/* Suggestions toggle */}
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="flex items-center gap-1.5 mt-3 text-xs text-primary font-medium hover:underline"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {showSuggestions ? 'Dölj förslag' : 'Visa förslag på uppgifter'}
            <ChevronRight className={`h-3 w-3 transition-transform ${showSuggestions ? 'rotate-90' : ''}`} />
          </button>

          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {SUGGESTED_CHORES.map((s) => {
                    const exists = chores.some((c: any) => c.title.toLowerCase() === s.title.toLowerCase());
                    return (
                      <button
                        key={s.title}
                        onClick={() => !exists && addSuggested(s)}
                        disabled={exists || createMutation.isPending}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          exists
                            ? 'bg-muted/40 border-border/30 opacity-50 cursor-not-allowed'
                            : 'bg-muted/20 border-border/40 hover:border-primary/30 hover:bg-primary/5 cursor-pointer'
                        }`}
                      >
                        <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                          {exists && <Check className="h-3 w-3 text-success" />}
                          {s.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{s.description}</p>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Task list */}
      {chores.length > 0 && (
        <Card className="bg-card border-border shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <AnimatePresence>
                {chores.map((chore: any) => {
                  const isDone = chore.completed;
                  return (
                    <motion.div
                      key={chore.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-3 px-4 sm:px-6 py-3.5 hover:bg-secondary/50 transition-colors"
                    >
                      <button
                        onClick={() => toggleChore(chore)}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <motion.div
                          className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isDone ? 'bg-success/20 border-success' : 'border-border hover:border-primary'}`}
                          whileTap={{ scale: 0.85 }}
                        >
                          <AnimatePresence>
                            {isDone && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              >
                                <Check className="h-3 w-3 text-success" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs sm:text-sm transition-all ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {chore.title}
                          </span>
                          {chore.description && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">{chore.description}</p>
                          )}
                        </div>
                      </button>
                      {!chore.is_default && (
                        <button
                          onClick={() => deleteMutation.mutate(chore.id)}
                          className="shrink-0 p-1.5 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {chores.length === 0 && !showSuggestions && (
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground text-sm mb-3">Inga uppgifter ännu.</p>
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={() => setShowSuggestions(true)}>
              <Sparkles className="h-3.5 w-3.5" />
              Visa förslag
            </Button>
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
    </motion.div>
  );
}
