import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Egg, Bird, Coins, Heart, TrendingUp, Sun } from 'lucide-react';

interface SummaryData {
  date: string;
  eggsCollected: number;
  avgPerHen: number;
  topHen: string;
  revenue: number;
  healthScore: number;
  tasksCompleted: number;
  tasksTotal: number;
  tip: string;
}

function getYesterdaySummary(): SummaryData {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const days = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
  const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  
  return {
    date: `${days[yesterday.getDay()]} ${yesterday.getDate()} ${months[yesterday.getMonth()]}`,
    eggsCollected: 7,
    avgPerHen: 1.2,
    topHen: 'Astrid',
    revenue: 0,
    healthScore: 100,
    tasksCompleted: 7,
    tasksTotal: 8,
    tip: 'Äggen var lite färre igår – kolla om hönsen har tillräckligt med kalcium.',
  };
}

export function DailySummaryModal() {
  const [open, setOpen] = useState(false);
  const summary = getYesterdaySummary();

  useEffect(() => {
    const lastShown = localStorage.getItem('daily-summary-date');
    const today = new Date().toDateString();
    if (lastShown !== today) {
      // Show after a brief delay
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('daily-summary-date', new Date().toDateString());
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-center text-lg">
            <Sun className="h-5 w-5 text-warning inline mr-2" />
            Gårdens dagrapport
          </DialogTitle>
          <p className="text-xs text-muted-foreground text-center">{summary.date}</p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Egg stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary/5 rounded-xl p-3 text-center">
              <Egg className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="stat-number text-2xl text-foreground">{summary.eggsCollected}</p>
              <p className="text-[10px] text-muted-foreground">ägg samlade</p>
            </div>
            <div className="bg-accent/5 rounded-xl p-3 text-center">
              <Bird className="h-5 w-5 text-accent mx-auto mb-1" />
              <p className="stat-number text-2xl text-foreground">{summary.avgPerHen}</p>
              <p className="text-[10px] text-muted-foreground">ägg/höna snitt</p>
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-foreground">Bästa värpare: <strong>{summary.topHen}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4 text-success" />
              <span className="text-foreground">Hälsoscore: <strong>{summary.healthScore}/100</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-base">✅</span>
              <span className="text-foreground">Uppgifter: <strong>{summary.tasksCompleted}/{summary.tasksTotal}</strong> klara</span>
            </div>
          </div>

          {/* Daily tip */}
          <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
            <p className="text-xs text-foreground">💡 {summary.tip}</p>
          </div>

          <Button className="w-full" onClick={handleClose}>
            Starta dagens arbete 🐔
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
