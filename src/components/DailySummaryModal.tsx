import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Egg, Bird, TrendingUp, Heart, Sun, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export function DailySummaryModal() {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const lastShown = localStorage.getItem('daily-summary-date');
    const today = new Date().toDateString();
    if (lastShown !== today) {
      const timer = setTimeout(async () => {
        setLoading(true);
        try {
          const data = await api.getYesterdaySummary();
          setSummary(data);
          setOpen(true);
        } catch {
          // silently skip if endpoint fails
        } finally {
          setLoading(false);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('daily-summary-date', new Date().toDateString());
    setOpen(false);
  };

  if (!summary) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-center text-lg">
            <Sun className="h-5 w-5 text-warning inline mr-2" />
            Gårdens dagrapport
          </DialogTitle>
          <p className="text-xs text-muted-foreground text-center">{summary.date || 'Igår'}</p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary/5 rounded-xl p-3 text-center">
              <Egg className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="stat-number text-2xl text-foreground">{summary.eggs_collected ?? summary.eggs ?? '–'}</p>
              <p className="text-[10px] text-muted-foreground">ägg samlade</p>
            </div>
            <div className="bg-accent/5 rounded-xl p-3 text-center">
              <Bird className="h-5 w-5 text-accent mx-auto mb-1" />
              <p className="stat-number text-2xl text-foreground">{summary.avg_per_hen ?? '–'}</p>
              <p className="text-[10px] text-muted-foreground">ägg/höna snitt</p>
            </div>
          </div>

          <div className="space-y-2">
            {summary.top_hen && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-foreground">Bästa värpare: <strong>{summary.top_hen}</strong></span>
              </div>
            )}
            {summary.health_score != null && (
              <div className="flex items-center gap-2 text-sm">
                <Heart className="h-4 w-4 text-success" />
                <span className="text-foreground">Hälsoscore: <strong>{summary.health_score}/100</strong></span>
              </div>
            )}
            {summary.tasks_completed != null && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-base">✅</span>
                <span className="text-foreground">Uppgifter: <strong>{summary.tasks_completed}/{summary.tasks_total || '?'}</strong> klara</span>
              </div>
            )}
          </div>

          {summary.tip && (
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
              <p className="text-xs text-foreground">💡 {summary.tip}</p>
            </div>
          )}

          <Button className="w-full" onClick={handleClose}>
            Starta dagens arbete 🐔
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
