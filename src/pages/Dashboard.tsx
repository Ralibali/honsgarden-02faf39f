import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Egg, Bird, CalendarDays, Coins, Thermometer, Heart, Lightbulb, ArrowRight, Sun } from 'lucide-react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'God natt';
  if (hour < 10) return 'God morgon';
  if (hour < 13) return 'God förmiddag';
  if (hour < 17) return 'God eftermiddag';
  if (hour < 21) return 'God kväll';
  return 'God natt';
}

function getFormattedDate() {
  const days = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
  const months = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];
  const now = new Date();
  return `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`;
}

export default function Dashboard() {
  const [eggsToday, setEggsToday] = useState(0);

  const addEggs = (count: number) => {
    setEggsToday((prev) => prev + count);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs sm:text-sm uppercase tracking-widest text-muted-foreground font-semibold">{getGreeting()}</p>
          <h1 className="text-2xl sm:text-4xl font-serif text-foreground mt-1">Min Hönsgård</h1>
          <p className="text-sm text-muted-foreground mt-1">{getFormattedDate()}</p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-full px-3 py-1.5">
          <Sun className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">5°</span>
        </div>
      </div>

      {/* Stats bar */}
      <Card className="bg-card/60 border-border backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-around divide-x divide-border">
            <div className="flex items-center gap-2 py-4 px-3 flex-1 justify-center">
              <Egg className="h-4 w-4 text-muted-foreground" />
              <span className="font-bold text-foreground">28</span>
              <span className="text-xs text-muted-foreground">igår</span>
            </div>
            <div className="flex items-center gap-2 py-4 px-3 flex-1 justify-center">
              <Bird className="h-4 w-4 text-primary" />
              <span className="font-bold text-foreground">6</span>
              <span className="text-xs text-muted-foreground">hönor</span>
            </div>
            <div className="flex items-center gap-2 py-4 px-3 flex-1 justify-center">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="font-bold text-foreground">30</span>
              <span className="text-xs text-muted-foreground">veckan</span>
            </div>
            <div className="flex items-center gap-2 py-4 px-3 flex-1 justify-center">
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-bold text-foreground">+1200</span>
              <span className="text-xs text-muted-foreground">kr/mån</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Din hönsgård idag */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🐔</span>
          <h2 className="text-lg font-serif text-primary">Din hönsgård idag</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Ägg/dag prognos - green */}
          <Card className="border-0 bg-emerald-200/20 dark:bg-emerald-900/20" style={{ background: 'linear-gradient(135deg, hsla(142, 60%, 80%, 0.15), hsla(142, 60%, 70%, 0.08))' }}>
            <CardContent className="p-5 sm:p-6 flex flex-col items-center justify-center text-center">
              <Egg className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-2xl sm:text-3xl font-bold text-foreground">7.1</p>
              <p className="text-xs text-muted-foreground mt-1">ägg/dag prognos</p>
            </CardContent>
          </Card>

          {/* Temperatur - blue */}
          <Card className="border-0" style={{ background: 'linear-gradient(135deg, hsla(200, 60%, 80%, 0.15), hsla(200, 60%, 70%, 0.08))' }}>
            <CardContent className="p-5 sm:p-6 flex flex-col items-center justify-center text-center">
              <Thermometer className="h-8 w-8 text-destructive mb-2" />
              <p className="text-2xl sm:text-3xl font-bold text-foreground">10°</p>
              <p className="text-xs text-muted-foreground mt-1">temperatur</p>
            </CardContent>
          </Card>

          {/* Hälsoscore - warm */}
          <Card className="border-0" style={{ background: 'linear-gradient(135deg, hsla(38, 60%, 80%, 0.15), hsla(38, 60%, 70%, 0.08))' }}>
            <CardContent className="p-5 sm:p-6 flex flex-col items-center justify-center text-center">
              <Heart className="h-8 w-8 text-success mb-2" />
              <p className="text-2xl sm:text-3xl font-bold text-success">100/100</p>
              <p className="text-xs text-muted-foreground mt-1">hälsoscore</p>
            </CardContent>
          </Card>

          {/* Väder-tips - purple */}
          <Card className="border-0" style={{ background: 'linear-gradient(135deg, hsla(280, 40%, 80%, 0.15), hsla(280, 40%, 70%, 0.08))' }}>
            <CardContent className="p-5 sm:p-6 flex flex-col items-center justify-center text-center">
              <Lightbulb className="h-8 w-8 text-warning mb-2" />
              <p className="text-sm text-foreground font-medium">Bra väder för dina höns idag!</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Registrera ägg - quick add */}
      <Card className="border-border bg-card">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Egg className="h-5 w-5 text-muted-foreground" />
              <span className="font-serif text-primary font-medium">Registrera ägg</span>
            </div>
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{eggsToday} idag</span>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <Button
              variant="outline"
              size="lg"
              className="w-16 h-12 text-lg font-bold bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
              onClick={() => addEggs(1)}
            >
              +1
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-16 h-12 text-lg font-bold bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
              onClick={() => addEggs(2)}
            >
              +2
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-16 h-12 text-lg font-bold bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
              onClick={() => addEggs(3)}
            >
              +3
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-16 h-12 text-lg font-bold border-border text-muted-foreground hover:bg-secondary"
              onClick={() => {
                const custom = prompt('Antal ägg:');
                if (custom && !isNaN(Number(custom))) addEggs(Number(custom));
              }}
            >
              ...
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Registrera ägg - bottom bar */}
      <Card className="bg-success/20 border-success/30 cursor-pointer hover:bg-success/25 transition-colors">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Egg className="h-5 w-5 text-foreground" />
            <div>
              <p className="font-medium text-foreground">Registrera ägg</p>
              <p className="text-xs text-muted-foreground">{eggsToday} ägg idag</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-foreground" />
        </CardContent>
      </Card>
    </div>
  );
}
