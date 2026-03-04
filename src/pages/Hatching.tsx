import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Egg, Thermometer, Droplets, RotateCcw, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const milestones = [
  { day: 1, label: 'Start', emoji: '🥚' },
  { day: 7, label: 'Lysning', emoji: '🔦' },
  { day: 14, label: 'Lysning 2', emoji: '🔦' },
  { day: 18, label: 'Sluta vända', emoji: '🔄' },
  { day: 19, label: 'Öka fukt', emoji: '💧' },
  { day: 21, label: 'Kläckning!', emoji: '🐣' },
];

function getDayInfo(startDate: string, duration: number = 21) {
  const start = new Date(startDate);
  const now = new Date();
  const elapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const remaining = Math.max(0, duration - elapsed);
  const progress = Math.min(100, (elapsed / duration) * 100);
  const done = elapsed >= duration;
  return { elapsed, remaining, progress, done };
}

export default function Hatching() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newCount, setNewCount] = useState('');

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ['hatching'],
    queryFn: () => api.getHatchings(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createHatching(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hatching'] });
      toast({ title: 'Kläckning startad!' });
      setOpen(false);
      setNewName(''); setNewDate(''); setNewCount('');
    },
    onError: (err: any) => toast({ title: 'Fel', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteHatching(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hatching'] });
      toast({ title: 'Kläckning borttagen' });
    },
  });

  const handleAdd = () => {
    if (!newName || !newDate) return;
    createMutation.mutate({
      name: newName,
      start_date: newDate,
      egg_count: Number(newCount) || 1,
    });
  };

  if (isLoading) {
    return <div className="max-w-5xl mx-auto space-y-4 animate-fade-in"><Skeleton className="h-10 w-48" /><Skeleton className="h-40" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Kläckning 🐣</h1>
          <p className="text-sm text-muted-foreground mt-1">Följ dina ruvningar med 21-dagars nedräkning</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto"><Plus className="h-4 w-4" />Ny kläckning</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif">Starta ny kläckning</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="Namn (t.ex. Vår-kull 2026)" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
              <Input placeholder="Antal ägg" type="number" value={newCount} onChange={(e) => setNewCount(e.target.value)} />
              <Button className="w-full" onClick={handleAdd} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Starta kläckning
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-warning/5 border-warning/20 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><Thermometer className="h-5 w-5 text-destructive mx-auto mb-1" /><p className="text-xs font-medium text-foreground">37.5°C</p><p className="text-[10px] text-muted-foreground">Temperatur</p></div>
            <div><Droplets className="h-5 w-5 text-primary mx-auto mb-1" /><p className="text-xs font-medium text-foreground">55-65%</p><p className="text-[10px] text-muted-foreground">Luftfuktighet</p></div>
            <div><RotateCcw className="h-5 w-5 text-accent mx-auto mb-1" /><p className="text-xs font-medium text-foreground">3-5x/dag</p><p className="text-[10px] text-muted-foreground">Vändning</p></div>
          </div>
        </CardContent>
      </Card>

      {batches.length === 0 && (
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-8 text-center">
            <Egg className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Inga aktiva kläckningar</p>
          </CardContent>
        </Card>
      )}

      {batches.map((batch: any) => {
        const batchId = batch._id || batch.id;
        const startDate = batch.start_date || batch.startDate;
        const duration = batch.duration || 21;
        const { elapsed, remaining, progress, done } = getDayInfo(startDate, duration);
        return (
          <Card key={batchId} className={`bg-card border-border shadow-sm ${done ? 'border-success/50' : ''}`}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-serif text-base text-foreground flex items-center gap-2">
                    {done ? '🐣' : '🥚'} {batch.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{batch.egg_count || batch.eggCount} ägg · Startade {startDate}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground h-8 w-8 p-0" onClick={() => deleteMutation.mutate(batchId)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Dag {Math.min(elapsed, duration)} av {duration}</span>
                  <span className={`font-medium ${done ? 'text-success' : 'text-primary'}`}>
                    {done ? 'Kläckt! 🎉' : `${remaining} dagar kvar`}
                  </span>
                </div>
                <Progress value={progress} className="h-2.5" />
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {milestones.map((m) => {
                  const reached = elapsed >= m.day;
                  const isCurrent = elapsed >= m.day - 1 && elapsed < m.day;
                  return (
                    <div key={m.day} className={`text-center p-1.5 rounded-lg text-[10px] transition-colors ${reached ? 'bg-success/10 text-success' : isCurrent ? 'bg-primary/10 text-primary ring-1 ring-primary/30' : 'bg-muted/50 text-muted-foreground'}`}>
                      <span className="text-sm">{reached ? '✅' : m.emoji}</span>
                      <p className="mt-0.5 leading-tight">Dag {m.day}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
