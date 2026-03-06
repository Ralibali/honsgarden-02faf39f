import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Egg, Bird, BarChart3, Coins, CheckSquare, ArrowRight, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import eggsBasket from '@/assets/eggs-basket.jpg';
import heroCoop from '@/assets/hero-coop.jpg';
import henPortrait from '@/assets/hen-portrait.jpg';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const ONBOARDING_KEY = 'honsgarden-onboarding-done';

const steps = [
  {
    image: heroCoop,
    emoji: '👋',
    title: 'Välkommen till Hönsgården!',
    subtitle: 'Din smarta kompanjon för hönsägande',
    description: 'Här får du full koll på ägg, hönor, foder och ekonomi – allt samlat på ett ställe. Låt oss visa dig runt!',
    color: 'from-primary/20 to-accent/10',
  },
  {
    image: eggsBasket,
    emoji: '🥚',
    title: 'Logga ägg enkelt',
    subtitle: 'Med ett tryck registrerar du dagens skörd',
    description: 'Tryck snabbt in antal ägg direkt från startsidan. Se statistik dag för dag och spåra vilken höna som värper bäst.',
    features: [
      { icon: Egg, text: 'Snabb äggloggning' },
      { icon: BarChart3, text: 'Statistik & trender' },
    ],
    color: 'from-warning/15 to-primary/10',
  },
  {
    image: henPortrait,
    emoji: '🐔',
    title: 'Känn dina hönor',
    subtitle: 'Ge varje höna en profil',
    description: 'Skapa profiler med namn, ras och födelsedag. Följ hälsa, vaccination och äggproduktion per höna.',
    features: [
      { icon: Bird, text: 'Hönsprofiler' },
      { icon: CheckSquare, text: 'Dagliga uppgifter' },
    ],
    color: 'from-primary/15 to-success/10',
  },
  {
    image: null,
    emoji: '✨',
    title: 'Allt redo!',
    subtitle: 'Börja logga dina första ägg',
    description: 'Du har allt du behöver. Logga ägg, följ flocken och ha full koll. Tips: Lägg appen på hemskärmen för snabb åtkomst!',
    highlights: [
      { icon: Egg, text: 'Logga ägg varje dag', desc: 'Bygg en streak!' },
      { icon: Coins, text: 'Följ ekonomin', desc: 'Se om du går plus' },
      { icon: Sparkles, text: 'Få smarta tips', desc: 'AI-drivna insikter' },
      { icon: Bird, text: 'Bjud in en vän', desc: 'Få 7 dagars premium' },
    ],
    color: 'from-success/15 to-warning/10',
  },
];

export default function OnboardingGuide() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Check localStorage first (fast), then DB as source of truth
    const localDone = localStorage.getItem(ONBOARDING_KEY);
    if (localDone) return;

    // Check DB preference
    supabase
      .from('profiles')
      .select('preferences')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        const prefs = (data?.preferences as Record<string, any>) ?? {};
        if (prefs.onboarding_done) {
          localStorage.setItem(ONBOARDING_KEY, '1');
          return;
        }
        // First time – show onboarding
        setTimeout(() => setOpen(true), 800);
      });
  }, [user?.id]);

  const finish = () => {
    setOpen(false);
    localStorage.setItem(ONBOARDING_KEY, '1');
    // Persist to DB so it never shows again, even on new devices
    if (user?.id) {
      supabase
        .from('profiles')
        .select('preferences')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          const prefs = (data?.preferences as Record<string, any>) ?? {};
          void supabase
            .from('profiles')
            .update({ preferences: { ...prefs, onboarding_done: true } })
            .eq('user_id', user.id);
        });
    }
  };

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else finish();
  };

  const current = steps[step];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) finish(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-border/60 gap-0 [&>button]:hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Image or gradient header */}
            {current.image ? (
              <div className="relative h-44 overflow-hidden">
                <img
                  src={current.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                <div className="absolute bottom-4 left-5">
                  <span className="text-3xl">{current.emoji}</span>
                </div>
                <button
                  onClick={finish}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-foreground/20 backdrop-blur-md text-primary-foreground/80 hover:bg-foreground/30 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className={`relative h-36 bg-gradient-to-br ${current.color} flex items-center justify-center`}>
                <motion.span
                  className="text-6xl"
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  {current.emoji}
                </motion.span>
                <button
                  onClick={finish}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-foreground/10 text-foreground/50 hover:bg-foreground/15 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="px-6 pt-4 pb-6">
              <h2 className="font-serif text-xl text-foreground mb-1">{current.title}</h2>
              <p className="text-xs text-primary font-medium mb-2">{current.subtitle}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{current.description}</p>

              {/* Features list */}
              {current.features && (
                <div className="flex gap-3 mb-5">
                  {current.features.map((f) => (
                    <div key={f.text} className="flex items-center gap-2 bg-muted/40 rounded-xl px-3 py-2 flex-1">
                      <f.icon className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-xs font-medium text-foreground">{f.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Final step highlights */}
              {current.highlights && (
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {current.highlights.map((h) => (
                    <div key={h.text} className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/30 border border-border/40">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <h.icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-foreground leading-tight">{h.text}</p>
                        <p className="text-[10px] text-muted-foreground">{h.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                {/* Dots */}
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStep(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === step ? 'w-6 bg-primary' : 'w-1.5 bg-border hover:bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {step > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-3 text-xs rounded-xl text-muted-foreground"
                      onClick={() => setStep(step - 1)}
                    >
                      Tillbaka
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="h-9 px-5 text-xs rounded-xl gap-1.5"
                    onClick={next}
                  >
                    {step === steps.length - 1 ? 'Kom igång!' : 'Nästa'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {step === 0 && (
                <button onClick={finish} className="w-full text-center text-[11px] text-muted-foreground/60 mt-3 hover:text-muted-foreground transition-colors">
                  Hoppa över
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
