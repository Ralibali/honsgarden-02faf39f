import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Bird, Heart, AlertTriangle, Egg } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const hens = [
  { id: 1, name: 'Orusthöna', breed: 'Orusthöna', status: 'warning', eggs_total: 0, lastSeen: null, avatar: '🐔', flock: null },
  { id: 2, name: 'Ölandshöna', breed: 'Ölandshöna', status: 'warning', eggs_total: 0, lastSeen: null, avatar: '🐔', flock: null },
  { id: 3, name: 'Ölandshöna', breed: 'Ölandshöna', status: 'warning', eggs_total: 0, lastSeen: null, avatar: '🐔', flock: null },
  { id: 4, name: 'Gammalsvensk dvärghöna', breed: 'Gammalsvensk Dvärghöna', status: 'warning', eggs_total: 0, lastSeen: null, avatar: '🐔', flock: null },
  { id: 5, name: 'Ölandshöna', breed: 'Ölandshöna', status: 'warning', eggs_total: 0, lastSeen: null, avatar: '🐔', flock: null },
  { id: 6, name: 'brown', breed: 'brown', status: 'ok', eggs_total: 0, lastSeen: '2026-03-04', avatar: '🐔', flock: null },
];

export default function Hens() {
  const [showInactive, setShowInactive] = useState(false);
  const [tab, setTab] = useState('alla');

  const filteredHens = tab === 'alla' ? hens : hens.filter(h => !h.flock);

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Mina Hönor</h1>
        <p className="text-sm text-muted-foreground mt-1">{hens.length} hönor registrerade</p>
      </div>

      {/* Flockar */}
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
          <TabsTrigger value="utan">Utan flock ({hens.filter(h => !h.flock).length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Visa inaktiva */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="show-inactive"
          checked={showInactive}
          onCheckedChange={(checked) => setShowInactive(checked === true)}
        />
        <label htmlFor="show-inactive" className="text-sm text-muted-foreground cursor-pointer">
          Visa inaktiva (sålda/avlidna)
        </label>
      </div>

      {/* Add hen button */}
      <Button className="w-full h-12 text-base gap-2">
        <Plus className="h-4 w-4" />
        Lägg till höna
      </Button>

      {/* Hen cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredHens.map((hen) => (
          <Card
            key={hen.id}
            className={`bg-card shadow-sm cursor-pointer group transition-all duration-200 hover:shadow-md ${
              hen.status === 'warning' ? 'border-warning/50' : 'border-border'
            }`}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-3">
                {hen.status === 'warning' && (
                  <div className="flex items-center gap-1 bg-warning/10 text-warning px-2 py-1 rounded text-[10px] font-medium">
                    <AlertTriangle className="h-3 w-3" />
                    Ej sedd på länge
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {hen.avatar}
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif text-base text-foreground truncate">{hen.name}</h3>
                  <p className="text-xs text-muted-foreground">{hen.breed}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Egg className="h-3 w-3" />
                  <span>{hen.eggs_total} ägg totalt</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {hen.lastSeen ? `Sedd: ${hen.lastSeen}` : 'Aldrig sedd'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
