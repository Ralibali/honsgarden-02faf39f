import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Bird, AlertTriangle, Egg, Camera, ChevronDown, ChevronUp } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function Hens() {
  const [showInactive, setShowInactive] = useState(false);
  const [tab, setTab] = useState('alla');
  const [expandedHen, setExpandedHen] = useState<string | null>(null);

  const { data: hens = [], isLoading } = useQuery({
    queryKey: ['hens'],
    queryFn: () => api.getHens(),
  });

  const filteredHens = tab === 'alla' ? hens : hens.filter((h: any) => !h.flock_id);

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
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Mina Hönor 🐔</h1>
        <p className="text-sm text-muted-foreground mt-1">{hens.length} hönor registrerade</p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-serif text-foreground">Flockar</h2>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus className="h-3.5 w-3.5" />
          Ny flock
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="alla">Alla ({hens.length})</TabsTrigger>
          <TabsTrigger value="utan">Utan flock ({hens.filter((h: any) => !h.flock_id).length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        <Checkbox id="show-inactive" checked={showInactive} onCheckedChange={(checked) => setShowInactive(checked === true)} />
        <label htmlFor="show-inactive" className="text-sm text-muted-foreground cursor-pointer">Visa inaktiva (sålda/avlidna)</label>
      </div>

      <Button className="w-full h-12 text-base gap-2">
        <Plus className="h-4 w-4" />
        Lägg till höna
      </Button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredHens.map((hen: any) => {
          const henId = hen._id || hen.id;
          const isWarning = hen.status === 'warning' || hen.productivity_status === 'warning';
          return (
            <Card key={henId} className={`bg-card shadow-sm transition-all duration-200 hover:shadow-md ${isWarning ? 'border-warning/50' : 'border-border'}`}>
              <CardContent className="p-4 sm:p-5">
                {isWarning && (
                  <div className="flex items-center gap-1 bg-warning/10 text-warning px-2 py-1 rounded text-[10px] font-medium mb-3">
                    <AlertTriangle className="h-3 w-3" />
                    Ej sedd på länge
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-2xl relative group">
                    {hen.avatar || '🐔'}
                    <button className="absolute inset-0 bg-foreground/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="h-4 w-4 text-background" />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-base text-foreground truncate">{hen.name}</h3>
                    <p className="text-xs text-muted-foreground">{hen.breed || hen.race}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Egg className="h-3 w-3" />
                    <span>{hen.eggs_total || hen.total_eggs || 0} ägg totalt</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {hen.last_seen ? `Sedd: ${new Date(hen.last_seen).toLocaleDateString('sv-SE')}` : 'Aldrig sedd'}
                  </div>
                </div>

                <button
                  className="flex items-center gap-1 text-xs text-primary mt-2 w-full justify-center hover:underline"
                  onClick={() => setExpandedHen(expandedHen === henId ? null : henId)}
                >
                  Värphistorik
                  {expandedHen === henId ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>

                {expandedHen === henId && hen.laying_history && (
                  <div className="mt-2 pt-2 border-t border-border space-y-1.5 animate-fade-in">
                    {hen.laying_history.map((m: any) => (
                      <div key={m.month || m.period} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{m.month || m.period}</span>
                        <div className="flex items-center gap-2 flex-1 mx-3">
                          <div className="flex-1 bg-secondary rounded-full h-1.5">
                            <div className="bg-primary rounded-full h-1.5" style={{ width: `${Math.min(100, (m.eggs / 30) * 100)}%` }} />
                          </div>
                        </div>
                        <span className="stat-number text-foreground">{m.eggs}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {hens.length === 0 && (
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-8 text-center">
            <Bird className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Inga hönor registrerade ännu</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
