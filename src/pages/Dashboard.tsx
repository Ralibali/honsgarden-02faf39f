import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Egg, Bird, CalendarDays, Coins, Thermometer, Heart, Lightbulb, ArrowRight, Sun, ChevronLeft, ChevronRight, BookOpen, Leaf } from 'lucide-react';

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

function getMonthName(month: number) {
  const months = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];
  return months[month];
}

function getSeasonTips(): { title: string; tips: string[] } {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) {
    return {
      title: '🌱 Vår-tips',
      tips: [
        'Hönsen börjar lägga fler ägg nu – se till att de har extra kalcium.',
        'Rengör hönshuset ordentligt efter vintern.',
        'Kolla efter kvalster som trivs i värmen.',
        'Börja släppa ut hönsen längre stunder på dagarna.',
      ],
    };
  }
  if (month >= 5 && month <= 7) {
    return {
      title: '☀️ Sommar-tips',
      tips: [
        'Se till att hönsen har skugga och gott om vatten.',
        'Hög äggproduktion – samla ägg ofta så de inte går sönder.',
        'Håll utkik efter rovdjur som rävar på kvällarna.',
        'Ge gärna vattenmelon som godis vid värmeböljor.',
      ],
    };
  }
  if (month >= 8 && month <= 10) {
    return {
      title: '🍂 Höst-tips',
      tips: [
        'Många höns ruggar nu – ge extra protein.',
        'Äggproduktionen minskar – helt normalt.',
        'Börja förbereda hönshuset för vintern.',
        'Kontrollera ventilationen i hönshuset.',
      ],
    };
  }
  return {
    title: '❄️ Vinter-tips',
    tips: [
      'Se till att vattnet inte fryser – använd värmeslinga.',
      'Extra belysning kan hjälpa äggproduktionen.',
      'Isolera hönshuset men behåll ventilationen.',
      'Ge lite extra foder – hönsen behöver energi för att hålla värmen.',
    ],
  };
}

// Mock data for egg calendar
function getMockEggData() {
  const data: Record<number, number> = {};
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  for (let d = 1; d <= Math.min(now.getDate(), daysInMonth); d++) {
    data[d] = Math.floor(Math.random() * 8) + 1;
  }
  return data;
}

// Mock diary entries
const diaryEntries = [
  { date: '4 mars', text: 'Greta verkar piggare idag, äter bra.', emoji: '🐔' },
  { date: '3 mars', text: 'Lagt till extra halm i boet. Kallt ute.', emoji: '🏠' },
  { date: '1 mars', text: 'Astrid har börjat rugga. Inga ägg från henne.', emoji: '🪶' },
  { date: '27 feb', text: 'Ny höna! Saga, en Leghorn, har flyttat in.', emoji: '🎉' },
  { date: '25 feb', text: 'Rekorddagen – 8 ägg samlade!', emoji: '🥚' },
];

export default function Dashboard() {
  const [eggsToday, setEggsToday] = useState(0);
  const eggCalendarData = getMockEggData();
  const season = getSeasonTips();
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  // Adjust to Monday start (0=Mon...6=Sun)
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const addEggs = (count: number) => {
    setEggsToday((prev) => prev + count);
  };

  const getEggColor = (count: number) => {
    if (count === 0) return 'bg-muted text-muted-foreground';
    if (count <= 3) return 'bg-primary/10 text-primary';
    if (count <= 6) return 'bg-primary/20 text-primary font-semibold';
    return 'bg-primary/30 text-primary font-bold';
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
        <div className="flex items-center gap-2 bg-card border border-border rounded-full px-3 py-1.5 shadow-sm">
          <Sun className="h-4 w-4 text-warning" />
          <span className="text-sm font-medium text-foreground">5°</span>
        </div>
      </div>

      {/* Stats bar */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-around divide-x divide-border">
            <div className="flex items-center gap-2 py-4 px-3 flex-1 justify-center">
              <Egg className="h-4 w-4 text-accent" />
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
              <Coins className="h-4 w-4 text-accent" />
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
          <Card className="border border-primary/20 bg-primary/5 shadow-sm">
            <CardContent className="p-5 sm:p-6 flex flex-col items-center justify-center text-center">
              <Egg className="h-8 w-8 text-primary/60 mb-2" />
              <p className="text-2xl sm:text-3xl font-bold text-foreground">7.1</p>
              <p className="text-xs text-muted-foreground mt-1">ägg/dag prognos</p>
            </CardContent>
          </Card>

          <Card className="border border-ring/20 bg-ring/5 shadow-sm">
            <CardContent className="p-5 sm:p-6 flex flex-col items-center justify-center text-center">
              <Thermometer className="h-8 w-8 text-destructive/70 mb-2" />
              <p className="text-2xl sm:text-3xl font-bold text-foreground">10°</p>
              <p className="text-xs text-muted-foreground mt-1">temperatur</p>
            </CardContent>
          </Card>

          <Card className="border border-warning/20 bg-warning/5 shadow-sm">
            <CardContent className="p-5 sm:p-6 flex flex-col items-center justify-center text-center">
              <Heart className="h-8 w-8 text-success mb-2" />
              <p className="text-2xl sm:text-3xl font-bold text-success">100/100</p>
              <p className="text-xs text-muted-foreground mt-1">hälsoscore</p>
            </CardContent>
          </Card>

          <Card className="border border-purple-200 bg-purple-50/50 shadow-sm">
            <CardContent className="p-5 sm:p-6 flex flex-col items-center justify-center text-center">
              <Lightbulb className="h-8 w-8 text-warning mb-2" />
              <p className="text-sm text-foreground font-medium">Bra väder för dina höns idag!</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Registrera ägg - quick add */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Egg className="h-5 w-5 text-accent" />
              <span className="font-serif text-primary font-medium">Registrera ägg</span>
            </div>
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{eggsToday} idag</span>
          </div>
          <div className="flex items-center gap-3 justify-center">
            {[1, 2, 3].map((n) => (
              <Button
                key={n}
                variant="outline"
                size="lg"
                className="w-16 h-12 text-lg font-bold bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                onClick={() => addEggs(n)}
              >
                +{n}
              </Button>
            ))}
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
      <Card className="bg-primary/10 border-primary/20 cursor-pointer hover:bg-primary/15 transition-colors shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Egg className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Registrera ägg</p>
              <p className="text-xs text-muted-foreground">{eggsToday} ägg idag</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-primary" />
        </CardContent>
      </Card>

      {/* Äggkalender */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <h2 className="font-serif text-primary font-medium">Äggkalender – {getMonthName(now.getMonth())}</h2>
            </div>
          </div>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'].map((d) => (
              <div key={d} className="text-[10px] text-center text-muted-foreground font-medium py-1">{d}</div>
            ))}
          </div>
          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const eggs = eggCalendarData[day];
              const isToday = day === now.getDate();
              const isFuture = day > now.getDate();
              return (
                <div
                  key={day}
                  className={`aspect-square rounded-md flex flex-col items-center justify-center text-xs transition-colors
                    ${isFuture ? 'bg-muted/30 text-muted-foreground/40' : getEggColor(eggs || 0)}
                    ${isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
                  `}
                >
                  <span className="text-[10px] leading-none">{day}</span>
                  {!isFuture && eggs !== undefined && (
                    <span className="text-[9px] leading-none mt-0.5">{eggs}🥚</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Totalt i {getMonthName(now.getMonth()).toLowerCase()}: <strong className="text-foreground">{Object.values(eggCalendarData).reduce((a, b) => a + b, 0)} ägg</strong>
          </p>
        </CardContent>
      </Card>

      {/* Hönornas dagbok */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-accent" />
            <h2 className="font-serif text-accent font-medium">Hönornas dagbok</h2>
          </div>
          <div className="space-y-3">
            {diaryEntries.map((entry, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-lg mt-0.5">{entry.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{entry.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{entry.date}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4 text-muted-foreground">
            + Skriv i dagboken
          </Button>
        </CardContent>
      </Card>

      {/* Säsongsguide */}
      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="h-5 w-5 text-primary" />
            <h2 className="font-serif text-primary font-medium">{season.title}</h2>
          </div>
          <ul className="space-y-2">
            {season.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 items-start text-sm text-foreground">
                <span className="text-primary mt-1 shrink-0">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
