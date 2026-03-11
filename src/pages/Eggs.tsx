import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Calendar, Egg as EggIcon, Loader2, Trash2, Download, Users } from 'lucide-react';
import { downloadCSV, downloadPDF } from '@/lib/exportUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function Eggs() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [count, setCount] = useState('');
  const [selectedHenId, setSelectedHenId] = useState<string>('all');

  const { data: eggs = [], isLoading } = useQuery({
    queryKey: ['eggs'],
    queryFn: () => api.getEggs(),
  });

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

  const createMutation = useMutation({
    mutationFn: (data: { date: string; count: number; hen_id?: string; flock_id?: string }) => api.createEggRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eggs'] });
      toast({ title: '🥚 Ägg registrerade!' });
      setShowForm(false);
      setCount('');
      setSelectedHenId('all');
    },
    onError: (err: any) => toast({ title: 'Fel', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteEggRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eggs'] });
      toast({ title: 'Registrering borttagen' });
    },
  });

  const handleSubmit = () => {
    if (!count || Number(count) <= 0) return;
    const isFlockSelection = selectedHenId.startsWith('flock:');
    const hen_id = !isFlockSelection && selectedHenId !== 'all' ? selectedHenId : undefined;
    const flock_id = isFlockSelection ? selectedHenId.replace('flock:', '') : undefined;
    createMutation.mutate({ date, count: Number(count), hen_id, flock_id });
  };

  const todayEggs = eggs.filter((e: any) => e.date === new Date().toISOString().split('T')[0]).reduce((s: number, e: any) => s + (e.count || 0), 0);
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const weekEggs = eggs.filter((e: any) => new Date(e.date) >= weekAgo).reduce((s: number, e: any) => s + (e.count || 0), 0);
  const monthEggs = eggs.filter((e: any) => new Date(e.date).getMonth() === new Date().getMonth()).reduce((s: number, e: any) => s + (e.count || 0), 0);

  // Build hen & flock name lookups
  const henNameMap: Record<string, string> = {};
  (hens as any[]).forEach((h: any) => { henNameMap[h.id] = h.name; });
  const flockNameMap: Record<string, string> = {};
  (flocks as any[]).forEach((f: any) => { flockNameMap[f.id] = f.name; });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-3 gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div>
        <Skeleton className="h-60" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Äggloggning 🥚</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Registrera och följ din äggproduktion</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
            const rows = eggs.map((e: any) => ({
              Datum: e.date,
              Antal: e.count,
              Höna: e.hen_id ? henNameMap[e.hen_id] || '' : '',
              Anteckningar: e.notes || '',
            }));
            downloadCSV(rows, `agglogg-${new Date().toISOString().split('T')[0]}`);
          }}>
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
            downloadPDF(
              'Ägglogg',
              ['Datum', 'Antal', 'Höna', 'Anteckningar'],
              eggs.map((e: any) => [e.date, String(e.count), e.hen_id ? henNameMap[e.hen_id] || '' : '', e.notes || '']),
              'agglogg'
            );
          }}>
            <Download className="h-3.5 w-3.5" /> PDF
          </Button>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2 active:scale-95 transition-transform flex-1 sm:flex-initial">
            <Plus className="h-4 w-4" />
            Ny registrering
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="bg-card border-border border-l-4 border-l-primary animate-fade-in shadow-sm">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <h3 className="font-serif text-base sm:text-lg text-foreground">Registrera ägg</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="data-label mb-1.5 block">Datum</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11" />
              </div>
              <div>
                <label className="data-label mb-1.5 block">Antal ägg</label>
                <Input type="number" placeholder="0" value={count} onChange={(e) => setCount(e.target.value)} className="h-11" />
              </div>
            </div>
            {(activeHens.length > 0 || (flocks as any[]).length > 0) && (
              <div>
                <label className="data-label mb-1.5 block">Flock / höna (valfritt)</label>
                <Select value={selectedHenId} onValueChange={setSelectedHenId}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Alla (generellt)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alla (generellt)</SelectItem>
                    {(flocks as any[]).length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Flockar</div>
                        {(flocks as any[]).map((flock: any) => (
                          <SelectItem key={`flock:${flock.id}`} value={`flock:${flock.id}`}>👥 {flock.name}</SelectItem>
                        ))}
                      </>
                    )}
                    {activeHens.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Enskilda höns</div>
                        {activeHens.map((hen: any) => (
                          <SelectItem key={hen.id} value={hen.id}>🐔 {hen.name}</SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={createMutation.isPending} className="active:scale-95 transition-transform">
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Spara
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Avbryt</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Idag', value: todayEggs },
          { label: 'Denna vecka', value: weekEggs },
          { label: 'Denna månad', value: monthEggs },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border shadow-sm">
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="stat-number text-xl sm:text-2xl text-foreground">{s.value}</p>
              <p className="data-label mt-1 text-[10px] sm:text-xs">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg font-serif">Senaste registreringar</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {eggs.slice(0, 20).map((entry: any) => {
              const entryId = entry._id || entry.id;
              const henName = entry.hen_id ? henNameMap[entry.hen_id] : null;
              const flockName = entry.flock_id ? flockNameMap[entry.flock_id] : null;
              return (
                <div key={entryId} className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <EggIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                        <p className="text-xs sm:text-sm text-muted-foreground">{entry.date}</p>
                        {flockName && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-medium">👥 {flockName}</span>
                        )}
                        {henName && (
                          <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-md font-medium">🐔 {henName}</span>
                        )}
                      </div>
                      {entry.notes && <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{entry.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="stat-number text-lg sm:text-xl text-foreground">{entry.count}</span>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground" onClick={() => deleteMutation.mutate(entryId)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {eggs.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">Inga ägg registrerade ännu</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
