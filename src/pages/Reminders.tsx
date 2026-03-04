import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Syringe, Bug, Stethoscope, Calendar, Check, Bell, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Reminder {
  id: number;
  title: string;
  type: 'vaccination' | 'deworming' | 'vet' | 'other';
  date: string;
  done: boolean;
  hen?: string;
}

const initialReminders: Reminder[] = [
  { id: 1, title: 'Avmaskning – alla hönor', type: 'deworming', date: '2026-03-15', done: false },
  { id: 2, title: 'Vaccination Marek', type: 'vaccination', date: '2026-04-01', done: false, hen: 'Alla' },
  { id: 3, title: 'Veterinärbesök – Freja', type: 'vet', date: '2026-03-20', done: false, hen: 'Freja' },
  { id: 4, title: 'Kvalsterkontroll', type: 'other', date: '2026-03-10', done: false },
  { id: 5, title: 'Avmaskning – alla', type: 'deworming', date: '2026-01-15', done: true },
  { id: 6, title: 'Vaccination Newcastle', type: 'vaccination', date: '2025-12-01', done: true },
];

const typeConfig = {
  vaccination: { icon: Syringe, label: 'Vaccination', color: 'text-primary' },
  deworming: { icon: Bug, label: 'Avmaskning', color: 'text-warning' },
  vet: { icon: Stethoscope, label: 'Veterinär', color: 'text-destructive' },
  other: { icon: Bell, label: 'Övrigt', color: 'text-muted-foreground' },
};

function daysUntil(dateStr: string) {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function Reminders() {
  const [reminders, setReminders] = useState(initialReminders);
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<string>('vaccination');
  const [newDate, setNewDate] = useState('');

  const upcoming = reminders.filter(r => !r.done).sort((a, b) => a.date.localeCompare(b.date));
  const completed = reminders.filter(r => r.done);

  const toggleDone = (id: number) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, done: !r.done } : r));
  };

  const handleAdd = () => {
    if (!newTitle || !newDate) return;
    setReminders([
      ...reminders,
      { id: Date.now(), title: newTitle, type: newType as Reminder['type'], date: newDate, done: false },
    ]);
    setNewTitle('');
    setNewDate('');
    setOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Påminnelser 💉</h1>
          <p className="text-sm text-muted-foreground mt-1">Håll koll på avmaskning, vaccination och veterinärbesök</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Ny påminnelse
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">Ny påminnelse</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="Titel (t.ex. Avmaskning)" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vaccination">💉 Vaccination</SelectItem>
                  <SelectItem value="deworming">🐛 Avmaskning</SelectItem>
                  <SelectItem value="vet">🩺 Veterinär</SelectItem>
                  <SelectItem value="other">🔔 Övrigt</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
              <Button className="w-full" onClick={handleAdd}>Spara påminnelse</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Urgent alerts */}
      {upcoming.filter(r => daysUntil(r.date) <= 3 && daysUntil(r.date) >= 0).length > 0 && (
        <Card className="bg-destructive/5 border-destructive/30 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="font-serif text-sm text-destructive">Snart!</span>
            </div>
            {upcoming.filter(r => daysUntil(r.date) <= 3 && daysUntil(r.date) >= 0).map(r => (
              <p key={r.id} className="text-sm text-foreground">
                <strong>{r.title}</strong> – {r.date} ({daysUntil(r.date) === 0 ? 'IDAG' : `om ${daysUntil(r.date)} dagar`})
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upcoming */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="font-serif text-base sm:text-lg">Kommande ({upcoming.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {upcoming.map((r) => {
              const config = typeConfig[r.type];
              const days = daysUntil(r.date);
              return (
                <div key={r.id} className="flex items-center gap-3 px-4 sm:px-6 py-3 hover:bg-secondary/50 transition-colors">
                  <button onClick={() => toggleDone(r.id)} className="shrink-0 w-6 h-6 rounded-full border-2 border-border hover:border-primary flex items-center justify-center transition-colors">
                  </button>
                  <config.icon className={`h-4 w-4 shrink-0 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground truncate">{r.title}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{r.date} {r.hen && `· ${r.hen}`}</p>
                  </div>
                  <Badge variant={days <= 3 ? 'destructive' : days <= 7 ? 'default' : 'secondary'} className="text-[10px] shrink-0">
                    {days < 0 ? 'Försenad' : days === 0 ? 'Idag' : `${days} dagar`}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Completed */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="font-serif text-base sm:text-lg text-muted-foreground">Avklarade ({completed.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {completed.map((r) => {
              const config = typeConfig[r.type];
              return (
                <div key={r.id} className="flex items-center gap-3 px-4 sm:px-6 py-3 opacity-60">
                  <button onClick={() => toggleDone(r.id)} className="shrink-0 w-6 h-6 rounded-full bg-success/20 border-2 border-success flex items-center justify-center">
                    <Check className="h-3 w-3 text-success" />
                  </button>
                  <config.icon className={`h-4 w-4 shrink-0 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground line-through truncate">{r.title}</p>
                    <p className="text-[10px] text-muted-foreground">{r.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
