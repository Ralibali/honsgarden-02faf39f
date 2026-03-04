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
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Mina hönor 🐔</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">{hens.length} hönor i flocken</p>
        </div>
        <Button className="gap-2 active:scale-95 transition-transform w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Lägg till höna
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {hens.map((hen) => (
          <Card key={hen.id} className="bg-card border-border hover:border-primary/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all duration-300 cursor-pointer group">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                  {hen.avatar}
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif text-base sm:text-lg text-foreground">{hen.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{hen.breed} · {hen.age}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-secondary/50 rounded-lg p-2.5 sm:p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="data-label text-[9px] sm:text-xs">Denna månad</span>
                  </div>
                  <p className="stat-number text-base sm:text-lg text-foreground">{hen.eggs_month} ägg</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-2.5 sm:p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Heart className={`h-3 w-3 ${hen.health === 'Frisk' ? 'text-success' : 'text-warning'}`} />
                    <span className="data-label text-[9px] sm:text-xs">Hälsa</span>
                  </div>
                  <p className={`text-xs sm:text-sm font-medium ${hen.health === 'Frisk' ? 'text-foreground' : 'text-warning'}`}>{hen.health}</p>
                </div>
              </div>

              <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[10px] sm:text-xs text-muted-foreground">Totalt: {hen.eggs_total} ägg</span>
                <Bird className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
