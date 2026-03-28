import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, X, Bird, Egg } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ONBOARDING_KEY = 'honsgarden-onboarding-done';
const getOnboardingKey = (userId: string) => `${ONBOARDING_KEY}-${userId}`;

export default function OnboardingGuide() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [henName, setHenName] = useState('');
  const [henBreed, setHenBreed] = useState('');
  const [henBirthDate, setHenBirthDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [createdHenName, setCreatedHenName] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return;

    const scopedKey = getOnboardingKey(user.id);

    // Legacy fallback
    if (localStorage.getItem(ONBOARDING_KEY)) {
      localStorage.setItem(scopedKey, '1');
      return;
    }

    const localDone = localStorage.getItem(scopedKey);
    if (localDone) return;

    let isCancelled = false;
    let timer: number | null = null;

    void (async () => {
      // Check profile preferences
      const { data: profileData } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('user_id', user.id)
        .maybeSingle();

      if (isCancelled) return;
      const prefs = (profileData?.preferences as Record<string, any>) ?? {};
      if (prefs.onboarding_done) {
        localStorage.setItem(scopedKey, '1');
        return;
      }

      // Check if user already has hens
      const { count } = await supabase
        .from('hens')
        .select('id', { count: 'exact', head: true });

      if (isCancelled) return;
      if (count && count > 0) {
        // Has hens, mark onboarding done
        localStorage.setItem(scopedKey, '1');
        await supabase
          .from('profiles')
          .update({ preferences: { ...prefs, onboarding_done: true } })
          .eq('user_id', user.id);
        return;
      }

      timer = window.setTimeout(() => {
        if (!isCancelled) {
          setStep(0);
          setOpen(true);
        }
      }, 800);
    })();

    return () => {
      isCancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [user?.id]);

  const markDone = async () => {
    if (!user?.id) return;
    const scopedKey = getOnboardingKey(user.id);
    localStorage.setItem(scopedKey, '1');
    localStorage.removeItem(ONBOARDING_KEY);
    const { data } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('user_id', user.id)
      .maybeSingle();
    const prefs = (data?.preferences as Record<string, any>) ?? {};
    await supabase
      .from('profiles')
      .update({ preferences: { ...prefs, onboarding_done: true } })
      .eq('user_id', user.id);
  };

  const finish = () => {
    setOpen(false);
    markDone();
  };

  const skipAndClose = () => {
    setOpen(false);
    markDone();
  };

  const addHen = async () => {
    if (!henName.trim() || !user?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('hens').insert({
        name: henName.trim(),
        breed: henBreed.trim() || null,
        birth_date: henBirthDate || null,
        user_id: user.id,
        hen_type: 'hen',
        is_active: true,
      });
      if (error) throw error;
      setCreatedHenName(henName.trim());
      setStep(2);
      await markDone();
    } catch (err: any) {
      toast({ title: 'Fel', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Confetti CSS animation
  const confettiEmojis = ['🎉', '🥚', '🐔', '✨', '💚', '🌟'];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) skipAndClose(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-border/60 gap-0 [&>button]:hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Step 0: Welcome */}
            {step === 0 && (
              <>
                <div className="relative h-36 bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center">
                  <motion.span
                    className="text-6xl"
                    initial={{ scale: 0.5, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    🐔
                  </motion.span>
                  <button
                    onClick={skipAndClose}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-foreground/10 text-foreground/50 hover:bg-foreground/15 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="px-6 pt-4 pb-6">
                  <h2 className="font-serif text-xl text-foreground mb-1">Välkommen till Hönsgården!</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    Låt oss sätta upp din flock. Det tar bara en minut.
                  </p>
                  <div className="flex items-center justify-between">
                    <ProgressDots current={0} total={3} />
                    <Button size="sm" className="h-9 px-5 text-xs rounded-xl gap-1.5" onClick={() => setStep(1)}>
                      Kom igång <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <button onClick={skipAndClose} className="w-full text-center text-[11px] text-muted-foreground/60 mt-3 hover:text-muted-foreground transition-colors">
                    Hoppa över
                  </button>
                </div>
              </>
            )}

            {/* Step 1: Add hen */}
            {step === 1 && (
              <>
                <div className="relative h-28 bg-gradient-to-br from-primary/10 to-success/10 flex items-center justify-center">
                  <Bird className="h-12 w-12 text-primary/60" />
                  <button
                    onClick={skipAndClose}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-foreground/10 text-foreground/50 hover:bg-foreground/15 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="px-6 pt-4 pb-6">
                  <h2 className="font-serif text-xl text-foreground mb-1">Lägg till din första höna</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Ge henne ett namn så är du igång!
                  </p>
                  <div className="space-y-3 mb-5">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Namn *</label>
                      <Input
                        placeholder="T.ex. Greta"
                        value={henName}
                        onChange={(e) => setHenName(e.target.value)}
                        className="rounded-xl"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Ras <span className="text-muted-foreground">(valfritt)</span></label>
                      <Input
                        placeholder="T.ex. Barnevelder"
                        value={henBreed}
                        onChange={(e) => setHenBreed(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Kläckdatum <span className="text-muted-foreground">(valfritt)</span></label>
                      <Input
                        type="date"
                        value={henBirthDate}
                        onChange={(e) => setHenBirthDate(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <ProgressDots current={1} total={3} />
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-9 px-3 text-xs rounded-xl text-muted-foreground" onClick={() => setStep(0)}>
                        Tillbaka
                      </Button>
                      <Button
                        size="sm"
                        className="h-9 px-5 text-xs rounded-xl gap-1.5"
                        onClick={addHen}
                        disabled={!henName.trim() || saving}
                      >
                        {saving ? 'Sparar...' : 'Lägg till hönan'}
                      </Button>
                    </div>
                  </div>
                  <button onClick={skipAndClose} className="w-full text-center text-[11px] text-muted-foreground/60 mt-3 hover:text-muted-foreground transition-colors">
                    Hoppa över för nu
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Done */}
            {step === 2 && (
              <>
                <div className="relative h-36 bg-gradient-to-br from-success/15 to-warning/10 flex items-center justify-center overflow-hidden">
                  {/* Simple confetti */}
                  {confettiEmojis.map((emoji, i) => (
                    <motion.span
                      key={i}
                      className="absolute text-2xl"
                      initial={{ opacity: 0, y: 60, x: (i - 2.5) * 40 }}
                      animate={{
                        opacity: [0, 1, 1, 0],
                        y: [60, -20, -40, -60],
                        rotate: [0, (i % 2 === 0 ? 1 : -1) * 30],
                      }}
                      transition={{ duration: 1.5, delay: i * 0.1, ease: 'easeOut' }}
                    >
                      {emoji}
                    </motion.span>
                  ))}
                  <motion.span
                    className="text-6xl relative z-10"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
                  >
                    ✅
                  </motion.span>
                </div>
                <div className="px-6 pt-4 pb-6">
                  <h2 className="font-serif text-xl text-foreground mb-1">{createdHenName} är tillagd!</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    Nu kan du börja logga ägg, spåra hälsa och mycket mer.
                  </p>
                  <div className="flex items-center justify-between">
                    <ProgressDots current={2} total={3} />
                    <Button
                      size="sm"
                      className="h-9 px-5 text-xs rounded-xl gap-1.5"
                      onClick={() => { finish(); navigate('/app/eggs'); }}
                    >
                      <Egg className="h-3.5 w-3.5" /> Logga första ägget →
                    </Button>
                  </div>
                  <button
                    onClick={() => { finish(); navigate('/app'); }}
                    className="w-full text-center text-[11px] text-muted-foreground/60 mt-3 hover:text-muted-foreground transition-colors"
                  >
                    Utforska appen
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current ? 'w-6 bg-primary' : 'w-1.5 bg-border'
          }`}
        />
      ))}
    </div>
  );
}
