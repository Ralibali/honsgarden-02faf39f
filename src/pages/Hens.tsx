import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Bird, AlertTriangle, Egg, Camera, ChevronDown, ChevronUp, Loader2, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function Hens() {
  const queryClient = useQueryClient();
  const [showInactive, setShowInactive] = useState(false);
  const [tab, setTab] = useState('alla');
  const [expandedHen, setExpandedHen] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', breed: '', color: '', birth_date: '', notes: '' });

  const { data: hens = [], isLoading } = useQuery({
    queryKey: ['hens'],
    queryFn: () => api.getHens(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createHen(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hens'] });
      toast({ title: 'Höna tillagd! 🐔' });
      setDialogOpen(false);
      setForm({ name: '', breed: '', color: '', birth_date: '', notes: '' });
    },
    onError: (err: any) => toast({ title: 'Fel', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteHen(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hens'] });
      toast({ title: 'Höna borttagen' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    createMutation.mutate({
      name: form.name,
      breed: form.breed || null,
      color: form.color || null,
      birth_date: form.birth_date || null,
      notes: form.notes || null,
    });
  };

  const activeHens = hens.filter((h: any) => h.is_active);
  const filteredHens = showInactive ? hens : activeHens;
  const displayHens = tab === 'alla' ? filteredHens : filteredHens.filter((h: any) => !h.flock_id);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 animate-fade-in">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Mina Hönor 🐔</h1>
          <p className="text-sm text-muted-foreground mt-1">{activeHens.length} aktiva hönor</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto active:scale-95 transition-transform">
              <Plus className="h-4 w-4" />
              Lägg till höna
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">Ny höna</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <Label>Namn *</Label>
                <Input className="mt-1.5" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="T.ex. Greta" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Ras</Label>
                  <Input className="mt-1.5" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} placeholder="T.ex. Leghorn" />
                </div>
                <div>
                  <Label>Färg</Label>
                  <Input className="mt-1.5" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="T.ex. Brun" />
                </div>
              </div>
              <div>
                <Label>Födelsedatum</Label>
                <Input className="mt-1.5" type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
              </div>
              <div>
                <Label>Anteckningar</Label>
                <Input className="mt-1.5" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Valfria anteckningar" />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Lägg till höna
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="alla">Alla ({filteredHens.length})</TabsTrigger>
          <TabsTrigger value="utan">Utan flock ({filteredHens.filter((h: any) => !h.flock_id).length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        <Checkbox id="show-inactive" checked={showInactive} onCheckedChange={(checked) => setShowInactive(checked === true)} />
        <label htmlFor="show-inactive" className="text-sm text-muted-foreground cursor-pointer">Visa inaktiva (sålda/avlidna)</label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {displayHens.map((hen: any) => {
          const henId = hen.id;
          return (
            <Card key={henId} className={`bg-card shadow-sm transition-all duration-200 hover:shadow-md border-border ${!hen.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-2xl">
                    🐔
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-base text-foreground truncate">{hen.name}</h3>
                    <p className="text-xs text-muted-foreground">{hen.breed || 'Okänd ras'}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={() => deleteMutation.mutate(henId)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
                  {hen.color && <span>Färg: {hen.color}</span>}
                  {hen.birth_date && <span>Född: {new Date(hen.birth_date).toLocaleDateString('sv-SE')}</span>}
                  {!hen.color && !hen.birth_date && <span>Ingen extra info</span>}
                </div>

                {hen.notes && (
                  <p className="text-[10px] text-muted-foreground mt-2 italic">{hen.notes}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {displayHens.length === 0 && (
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-8 text-center">
            <Bird className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Inga hönor registrerade ännu</p>
            <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={() => setDialogOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Lägg till din första höna
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
