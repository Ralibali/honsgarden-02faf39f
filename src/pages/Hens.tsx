import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Bird, Heart, TrendingUp } from 'lucide-react';

const hens = [
  { id: 1, name: 'Greta', breed: 'Barnevelder', age: '2 år', eggs_total: 412, eggs_month: 18, health: 'Frisk', avatar: '🐔' },
  { id: 2, name: 'Astrid', breed: 'Sussex', age: '1.5 år', eggs_total: 380, eggs_month: 22, health: 'Frisk', avatar: '🐓' },
  { id: 3, name: 'Saga', breed: 'Leghorn', age: '3 år', eggs_total: 520, eggs_month: 15, health: 'Frisk', avatar: '🐔' },
  { id: 4, name: 'Freja', breed: 'Orpington', age: '1 år', eggs_total: 180, eggs_month: 20, health: 'Ruggning', avatar: '🐔' },
  { id: 5, name: 'Sigrid', breed: 'Marans', age: '2.5 år', eggs_total: 340, eggs_month: 12, health: 'Frisk', avatar: '🐔' },
  { id: 6, name: 'Elin', breed: 'Araucana', age: '1 år', eggs_total: 150, eggs_month: 19, health: 'Frisk', avatar: '🐔' },
];

export default function Hens() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Mina hönor 🐔</h1>
          <p className="text-muted-foreground mt-1">{hens.length} hönor i flocken</p>
        </div>
        <Button className="gap-2 active:scale-95 transition-transform">
          <Plus className="h-4 w-4" />
          Lägg till höna
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {hens.map((hen) => (
          <Card key={hen.id} className="bg-card border-border hover:border-surface-highlight hover:glow-amber transition-all duration-300 cursor-pointer group">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {hen.avatar}
                </div>
                <div>
                  <h3 className="font-serif text-lg text-foreground">{hen.name}</h3>
                  <p className="text-sm text-muted-foreground">{hen.breed} · {hen.age}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="data-label">Denna månad</span>
                  </div>
                  <p className="stat-number text-lg text-foreground">{hen.eggs_month} ägg</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Heart className="h-3 w-3 text-success" />
                    <span className="data-label">Hälsa</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{hen.health}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Totalt: {hen.eggs_total} ägg</span>
                <Bird className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
