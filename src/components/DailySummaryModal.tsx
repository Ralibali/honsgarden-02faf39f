import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Egg, Bird, TrendingUp, Heart, Sun, Loader2, Crown, ArrowRight, Sparkles, ExternalLink, ShoppingBag, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { AffiliateWidget } from '@/components/AffiliateRecommendations';
import { AFFILIATE_ENABLED } from '@/lib/featureFlags';

export function DailySummaryModal() {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'summary' | 'products'>('summary');
  const navigate = useNavigate();

  useEffect(() => {
    const lastShown = localStorage.getItem('daily-summary-date');
    const today = new Date().toDateString();
    if (lastShown !== today) {
      const timer = setTimeout(async () => {
        setLoading(true);
        try {
          const data = await api.getYesterdaySummary();
          setSummary(data);
        } catch {
          // Build fallback summary from local signals
          setSummary({
            date: 'Igår',
            eggs_collected: '–',
            avg_per_hen: '–',
            tip: 'Kom ihåg att samla ägg tidigt på morgonen för bäst kvalitet!',
          });
        } finally {
          setLoading(false);
          setOpen(true);
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('daily-summary-date', new Date().toDateString());
    setOpen(false);
    setStep('summary');
  };

  const getEmoji = () => {
    const eggs = Number(summary?.eggs_collected);
    if (isNaN(eggs) || eggs === 0) return '🌅';
    if (eggs >= 8) return '🎉';
    if (eggs >= 5) return '👏';
    return '🐔';
  };

  const getHeadline = () => {
    const eggs = Number(summary?.eggs_collected);
    if (isNaN(eggs) || eggs === 0) return 'God morgon!';
    if (eggs >= 8) return 'Fantastisk dag igår!';
    if (eggs >= 5) return 'Bra dag igår!';
    return 'Hur gick det igår?';
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogContent className="max-w-[360px] sm:max-w-sm mx-auto p-0 overflow-hidden border-primary/20 shadow-xl gap-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {step === 'summary' && (
              <div className="animate-fade-in">
                {/* Header gradient */}
                <div className="relative bg-gradient-to-br from-primary/15 via-accent/10 to-warning/10 px-5 pt-6 pb-4">
                  <button onClick={handleClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                  <div className="text-center">
                    <span className="text-3xl block mb-2">{getEmoji()}</span>
                    <h2 className="font-serif text-xl text-foreground">{getHeadline()}</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Sun className="h-3 w-3 inline mr-1 text-warning" />
                      {summary?.date || 'Igår'} – Dagrapport
                    </p>
                  </div>
                </div>

                <div className="px-5 py-4 space-y-4">
                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-primary/5 rounded-xl p-3 text-center">
                      <Egg className="h-4 w-4 text-primary mx-auto mb-1" />
                      <p className="stat-number text-2xl text-foreground">{summary?.eggs_collected ?? summary?.eggs ?? '–'}</p>
                      <p className="text-[10px] text-muted-foreground">ägg samlade</p>
                    </div>
                    <div className="bg-accent/5 rounded-xl p-3 text-center">
                      <Bird className="h-4 w-4 text-accent mx-auto mb-1" />
                      <p className="stat-number text-2xl text-foreground">{summary?.avg_per_hen ?? '–'}</p>
                      <p className="text-[10px] text-muted-foreground">ägg/höna snitt</p>
                    </div>
                  </div>

                  {/* Detail rows */}
                  <div className="space-y-2">
                    {summary?.top_hen && (
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-3.5 w-3.5 text-success shrink-0" />
                        <span className="text-foreground text-xs">Bästa värpare: <strong>{summary.top_hen}</strong></span>
                      </div>
                    )}
                    {summary?.health_score != null && (
                      <div className="flex items-center gap-2 text-sm">
                        <Heart className="h-3.5 w-3.5 text-success shrink-0" />
                        <span className="text-foreground text-xs">Hälsoscore: <strong>{summary.health_score}/100</strong></span>
                      </div>
                    )}
                    {summary?.tasks_completed != null && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-sm">✅</span>
                        <span className="text-foreground text-xs">Uppgifter: <strong>{summary.tasks_completed}/{summary.tasks_total || '?'}</strong> klara</span>
                      </div>
                    )}
                  </div>

                  {/* Tip */}
                  {summary?.tip && (
                    <div className="bg-warning/5 border border-warning/15 rounded-lg p-2.5">
                      <p className="text-[11px] text-foreground leading-relaxed">💡 {summary.tip}</p>
                    </div>
                  )}

                  {/* Premium upsell */}
                  <button
                    onClick={() => { handleClose(); navigate('/app/premium'); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/8 via-accent/8 to-warning/10 border border-primary/15 hover:border-primary/30 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-warning/15 flex items-center justify-center shrink-0">
                      <Crown className="h-4 w-4 text-warning" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[11px] font-semibold text-foreground">Få smartare insikter med Premium</p>
                      <p className="text-[10px] text-muted-foreground">Prognoser, avmaskningslarm & mer – 19 kr/mån</p>
                    </div>
                    <Sparkles className="h-3.5 w-3.5 text-warning group-hover:scale-110 transition-transform shrink-0" />
                  </button>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 h-10 text-sm font-medium gap-1.5"
                      onClick={() => setStep('products')}
                    >
                      Produkttips
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-10 text-sm"
                      onClick={handleClose}
                    >
                      Starta dagen 🐔
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === 'products' && (
              <div className="animate-fade-in">
                <div className="relative bg-gradient-to-r from-accent/10 to-primary/10 px-5 pt-5 pb-3">
                  <button onClick={handleClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-accent" />
                    <div>
                      <h2 className="font-serif text-lg text-foreground">Utvalt för din gård</h2>
                      <p className="text-[10px] text-muted-foreground">Baserat på årstid och dina behov</p>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 space-y-4">
                  <AffiliateWidget maxItems={3} />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => setStep('summary')}
                    >
                      ← Tillbaka
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={handleClose}
                    >
                      Starta dagen 🐔
                    </Button>
                  </div>

                  <p className="text-[9px] text-muted-foreground text-center">
                    * Affiliatelänkar – vi kan få ersättning vid köp
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
