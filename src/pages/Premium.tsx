import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Check, Bell, BarChart3, Download, TrendingUp, Star, Calculator, Camera, ClipboardCheck, Baby, Loader2, Settings, Sparkles, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';

const PRICES = {
  monthly: 'price_1T3joGHzffTezY82dRQc7GTO',
  yearly: 'price_1T3jwRHzffTezY829aWQVXZr',
};

const premiumFeatures = [
  { text: 'Obegränsat antal hönor', icon: '🐔' },
  { text: 'Avancerad statistik & trender', icon: '📊' },
  { text: 'Smarta varningar & prognoser', icon: '🔔' },
  { text: 'Hälsologg & vaccinationer', icon: '💉' },
  { text: 'Foderspårning & kostnad/ägg', icon: '🌾' },
  { text: 'Kläckningsräknare', icon: '🐣' },
  { text: 'Dagliga uppgifter & påminnelser', icon: '✅' },
  { text: 'Exportera data (PDF/CSV)', icon: '📥' },
  { text: 'Prioriterad support', icon: '⭐' },
  { text: 'Alla framtida funktioner', icon: '🚀' },
];

const highlights = [
  { icon: Calculator, title: 'Kostnad per ägg', desc: 'Se exakt vad varje ägg kostar att producera.' },
  { icon: TrendingUp, title: 'Smarta prognoser', desc: 'Förväntat antal ägg baserat på dina data.' },
  { icon: Bell, title: 'Avmaskning & påminnelser', desc: 'Automatiska påminnelser för vaccination och veterinär.' },
  { icon: Baby, title: 'Kläckningsräknare', desc: '21-dagars nedräkning med milstolpar.' },
  { icon: ClipboardCheck, title: 'Dagliga uppgifter', desc: 'Checklista som återställs varje morgon.' },
  { icon: Camera, title: 'Fotoalbum', desc: 'Dokumentera dina hönor med bilder.' },
  { icon: BarChart3, title: 'Detaljerad statistik', desc: 'Jämför månader och hitta din bästa värpare.' },
  { icon: Download, title: 'Exportera rapporter', desc: 'PDF eller CSV för bokföring.' },
];

const testimonials = [
  { name: 'Anna-Lena', location: 'Dalarna', text: 'Sedan jag uppgraderade har jag koll på exakt vad varje ägg kostar. Fantastiskt!' },
  { name: 'Per-Olof', location: 'Skåne', text: 'Kläckningsräknaren räddade min första kull – jag hade glömt sluta vända äggen!' },
  { name: 'Margareta', location: 'Gotland', text: 'Dagliga uppgifterna gör att barnen kan hjälpa till. De älskar att bocka av!' },
];

export default function Premium() {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [searchParams] = useSearchParams();
  const isPremium = user?.subscription_status === 'premium';

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast({ title: '🎉 Välkommen till Premium!', description: 'Din uppgradering är klar. Njut av alla funktioner!' });
    }
  }, [searchParams]);

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast({ title: 'Fel', description: err.message || 'Kunde inte öppna kundportalen.', variant: 'destructive' });
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleCheckout = async (priceId: string, planName: string) => {
    if (!user) {
      toast({ title: 'Logga in först', description: 'Du behöver vara inloggad för att uppgradera.', variant: 'destructive' });
      return;
    }
    setLoadingPlan(planName);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('Ingen checkout-URL returnerades');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast({ title: 'Kunde inte starta betalning', description: err.message || 'Något gick fel.', variant: 'destructive' });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 sm:p-10 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.08),transparent_70%)]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-primary/15 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="h-4 w-4" />
            Premium
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-foreground mb-3">
            Uppgradera din hönsgård
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto">
            Få full kontroll med avancerad statistik, smarta prognoser och automatiska påminnelser.
          </p>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Monthly */}
        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <h3 className="font-serif text-lg text-foreground mb-1">Månadsplan</h3>
            <p className="text-muted-foreground text-sm mb-5">Flexibelt, ingen bindningstid</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">19</span>
              <span className="text-lg text-muted-foreground ml-1">kr/mån</span>
            </div>
            <Button 
              variant="outline"
              className="w-full h-11 gap-2 active:scale-95 transition-transform"
              onClick={() => handleCheckout(PRICES.monthly, 'monthly')}
              disabled={!!loadingPlan || isPremium}
            >
              {loadingPlan === 'monthly' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {isPremium ? 'Du har redan Premium' : 'Välj månadsplan'}
            </Button>
          </CardContent>
        </Card>

        {/* Yearly - highlighted */}
        <Card className="bg-card border-2 border-primary shadow-lg relative overflow-hidden hover:shadow-xl transition-shadow">
          <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-xs font-semibold py-1.5 text-center tracking-wide uppercase">
            Spara 35% – populärast
          </div>
          <CardContent className="p-6 pt-10">
            <h3 className="font-serif text-lg text-foreground mb-1">Årsplan</h3>
            <p className="text-muted-foreground text-sm mb-5">Bästa värdet – bara 12 kr/mån</p>
            <div className="mb-2">
              <span className="text-4xl font-bold text-foreground">149</span>
              <span className="text-lg text-muted-foreground ml-1">kr/år</span>
            </div>
            <p className="text-xs text-muted-foreground mb-5">
              <span className="line-through">228 kr</span> → du sparar 79 kr per år
            </p>
            <Button 
              className="w-full h-12 gap-2 active:scale-95 transition-transform text-base font-semibold shadow-[0_4px_14px_0_hsl(var(--primary)/0.3)]"
              onClick={() => handleCheckout(PRICES.yearly, 'yearly')}
              disabled={!!loadingPlan || isPremium}
            >
              {loadingPlan === 'yearly' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
              {isPremium ? 'Du har redan Premium' : 'Välj årsplan – 149 kr'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* What's included */}
      <div>
        <h2 className="font-serif text-xl sm:text-2xl text-foreground text-center mb-5">
          Allt som ingår
        </h2>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {premiumFeatures.map((f) => (
                <div key={f.text} className="flex items-center gap-3 py-1.5">
                  <span className="text-base shrink-0">{f.icon}</span>
                  <span className="text-sm text-foreground">{f.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {highlights.map((f) => (
          <Card key={f.title} className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <f.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Testimonials */}
      <div>
        <h2 className="font-serif text-xl text-foreground text-center mb-4">Vad säger våra användare?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="bg-card border-border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-xs text-foreground italic mb-2">"{t.text}"</p>
                <p className="text-[10px] text-muted-foreground font-medium">{t.name}, {t.location}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* No commitment */}
      <Card className="bg-primary/5 border-primary/15">
        <CardContent className="p-5 sm:p-6 text-center">
          <h3 className="font-serif text-lg text-foreground mb-2">Ingen bindningstid</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Avbryt när du vill. Inga dolda avgifter. Dina data finns kvar om du går tillbaka till gratis.
          </p>
        </CardContent>
      </Card>

      {/* Manage subscription (premium users) */}
      {isPremium && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-sm">
          <CardContent className="p-5 sm:p-6 text-center space-y-3">
            <div className="inline-flex items-center gap-2 text-foreground font-semibold text-lg">
              <Crown className="h-5 w-5 text-warning" />
              Du har Premium!
            </div>
            <p className="text-sm text-muted-foreground">
              Hantera din prenumeration, byt betalmetod eller avsluta.
            </p>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleManageSubscription}
              disabled={loadingPortal}
            >
              {loadingPortal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
              Hantera prenumeration
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bottom CTA */}
      {!isPremium && (
        <div className="text-center pb-4">
          <Button 
            size="lg" 
            className="h-12 px-10 text-base gap-2 active:scale-95 transition-transform shadow-[0_4px_14px_0_hsl(var(--primary)/0.3)]"
            onClick={() => handleCheckout(PRICES.yearly, 'yearly')}
            disabled={!!loadingPlan}
          >
            {loadingPlan === 'yearly' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
            Uppgradera nu – 149 kr/år
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Frågor? <a href="mailto:support@honsgarden.se" className="text-primary hover:underline">support@honsgarden.se</a>
          </p>
        </div>
      )}
    </div>
  );
}
