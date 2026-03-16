import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EggFormProps {
  activeHens: any[];
  flocks: any[];
  isPending: boolean;
  onSubmit: (data: { date: string; count: number; hen_id?: string; flock_id?: string }) => void;
  onCancel: () => void;
}

export function EggForm({ activeHens, flocks, isPending, onSubmit, onCancel }: EggFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [count, setCount] = useState('');
  const [selectedHenId, setSelectedHenId] = useState<string>('all');

  const handleSubmit = () => {
    if (!count || Number(count) <= 0) return;
    const isFlockSelection = selectedHenId.startsWith('flock:');
    const hen_id = !isFlockSelection && selectedHenId !== 'all' ? selectedHenId : undefined;
    const flock_id = isFlockSelection ? selectedHenId.replace('flock:', '') : undefined;
    onSubmit({ date, count: Number(count), hen_id, flock_id });
    setCount('');
    setSelectedHenId('all');
  };

  return (
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
        {(activeHens.length > 0 || flocks.length > 0) && (
          <div>
            <label className="data-label mb-1.5 block">Flock / höna (valfritt)</label>
            <Select value={selectedHenId} onValueChange={setSelectedHenId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Alla (generellt)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🥚 Alla (generellt)</SelectItem>
                {flocks.map((flock: any) => {
                  const flockHens = activeHens.filter((h: any) => h.flock_id === flock.id);
                  return (
                    <SelectItem key={`flock:${flock.id}`} value={`flock:${flock.id}`}>
                      <span className="font-semibold">👥 {flock.name}</span>
                      <span className="text-muted-foreground ml-1 text-[10px]">({flockHens.length} höns)</span>
                    </SelectItem>
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
          </div>
        )}
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={isPending} className="active:scale-95 transition-transform">
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Spara
          </Button>
          <Button variant="outline" onClick={onCancel}>Avbryt</Button>
        </div>
      </CardContent>
    </Card>
  );
}
