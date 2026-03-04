import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Bird, Heart, AlertTriangle, Egg, Camera, ChevronDown, ChevronUp } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const hens = [
  { id: 1, name: 'Orusthöna', breed: 'Orusthöna', status: 'warning', eggs_total: 42, lastSeen: null, avatar: '🐔', flock: null,
    layingHistory: [{ month: 'Jan', eggs: 12 }, { month: 'Feb', eggs: 15 }, { month: 'Mar', eggs: 15 }],
    photos: [] },
  { id: 2, name: 'Ölandshöna', breed: 'Ölandshöna', status: 'warning', eggs_total: 38, lastSeen: null, avatar: '🐔', flock: null,
    layingHistory: [{ month: 'Jan', eggs: 10 }, { month: 'Feb', eggs: 13 }, { month: 'Mar', eggs: 15 }],
    photos: [] },
  { id: 3, name: 'Ölandshöna #2', breed: 'Ölandshöna', status: 'warning', eggs_total: 35, lastSeen: null, avatar: '🐔', flock: null,
    layingHistory: [{ month: 'Jan', eggs: 9 }, { month: 'Feb', eggs: 12 }, { month: 'Mar', eggs: 14 }],
    photos: [] },
  { id: 4, name: 'Dvärghöna', breed: 'Gammalsvensk Dvärghöna', status: 'warning', eggs_total: 22, lastSeen: null, avatar: '🐔', flock: null,
    layingHistory: [{ month: 'Jan', eggs: 6 }, { month: 'Feb', eggs: 8 }, { month: 'Mar', eggs: 8 }],
    photos: [] },
  { id: 5, name: 'Ölandshöna #3', breed: 'Ölandshöna', status: 'ok', eggs_total: 51, lastSeen: '2026-03-04', avatar: '🐔', flock: null,
    layingHistory: [{ month: 'Jan', eggs: 15 }, { month: 'Feb', eggs: 18 }, { month: 'Mar', eggs: 18 }],
    photos: [] },
  { id: 6, name: 'Brun Isa', breed: 'Isa Brown', status: 'ok', eggs_total: 68, lastSeen: '2026-03-04', avatar: '🐔', flock: null,
    layingHistory: [{ month: 'Jan', eggs: 20 }, { month: 'Feb', eggs: 22 }, { month: 'Mar', eggs: 26 }],
    photos: [] },
];

export default function Hens() {
  const [showInactive, setShowInactive] = useState(false);
  const [tab, setTab] = useState('alla');
  const [expandedHen, setExpandedHen] = useState<number | null>(null);

  const filteredHens = tab === 'alla' ? hens : hens.filter(h => !h.flock);

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Mina Hönor 🐔</h1>
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
            className={`bg-card shadow-sm transition-all duration-200 hover:shadow-md ${
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
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-2xl relative group">
                  {hen.avatar}
                  <button className="absolute inset-0 bg-foreground/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="h-4 w-4 text-background" />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
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

              {/* Expandable laying history */}
              <button
                className="flex items-center gap-1 text-xs text-primary mt-2 w-full justify-center hover:underline"
                onClick={() => setExpandedHen(expandedHen === hen.id ? null : hen.id)}
              >
                Värphistorik
                {expandedHen === hen.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>

              {expandedHen === hen.id && (
                <div className="mt-2 pt-2 border-t border-border space-y-1.5 animate-fade-in">
                  {hen.layingHistory.map((m) => (
                    <div key={m.month} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{m.month}</span>
                      <div className="flex items-center gap-2 flex-1 mx-3">
                        <div className="flex-1 bg-secondary rounded-full h-1.5">
                          <div className="bg-primary rounded-full h-1.5" style={{ width: `${(m.eggs / 30) * 100}%` }} />
                        </div>
                      </div>
                      <span className="stat-number text-foreground">{m.eggs}</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-muted-foreground text-center pt-1">
                    Snitt: {(hen.layingHistory.reduce((s, m) => s + m.eggs, 0) / hen.layingHistory.length).toFixed(1)} ägg/mån
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
