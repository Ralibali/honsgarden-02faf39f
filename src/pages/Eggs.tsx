import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Calendar, Egg as EggIcon } from 'lucide-react';

const eggLog = [
  { id: 1, date: '2026-03-04', count: 6, hens: ['Greta', 'Astrid', 'Saga'] },
  { id: 2, date: '2026-03-03', count: 5, hens: ['Greta', 'Astrid'] },
  { id: 3, date: '2026-03-02', count: 7, hens: ['Greta', 'Saga', 'Freja'] },
  { id: 4, date: '2026-03-01', count: 4, hens: ['Astrid'] },
  { id: 5, date: '2026-02-28', count: 8, hens: ['Greta', 'Astrid', 'Saga', 'Freja'] },
];

export default function Eggs() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Äggloggning 🥚</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Registrera och följ din äggproduktion</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 active:scale-95 transition-transform w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Ny registrering
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card border-border border-l-4 border-l-primary animate-fade-in">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <h3 className="font-serif text-base sm:text-lg text-foreground">Registrera ägg</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="data-label mb-1.5 block">Datum</label>
                <Input type="date" defaultValue="2026-03-04" className="h-11" />
              </div>
              <div>
                <label className="data-label mb-1.5 block">Antal ägg</label>
                <Input type="number" placeholder="0" className="h-11" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="active:scale-95 transition-transform">Spara</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Avbryt</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Idag', value: '6' },
          { label: 'Denna vecka', value: '39' },
          { label: 'Denna månad', value: '142' },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="stat-number text-xl sm:text-2xl text-foreground">{s.value}</p>
              <p className="data-label mt-1 text-[10px] sm:text-xs">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Log list */}
      <Card className="bg-card border-border">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg font-serif">Senaste registreringar</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {eggLog.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <EggIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                      <p className="text-xs sm:text-sm text-muted-foreground">{entry.date}</p>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                      {entry.hens.join(', ')}
                    </p>
                  </div>
                </div>
                <span className="stat-number text-lg sm:text-xl text-foreground ml-2">{entry.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
