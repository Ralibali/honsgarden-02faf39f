import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Check, Bell, BarChart3, Shield, Download, TrendingUp, Zap, Star, Egg, Bird, Calculator, Syringe, Camera, ClipboardCheck, Baby, Loader2, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const PRICES = {
  monthly: 'price_1T3joGHzffTezY82dRQc7GTO',
  yearly: 'price_1T3jwRHzffTezY829aWQVXZr',
};

const freeFeatures = [
  'Upp till 10 hönor',
  'Grundläggande äggloggning',
  'Enkel statistik',
  '7 dagars historik',
];

const premiumFeatures = [
  'Obegränsat antal hönor',
  'Avancerad statistik & trender',
  'Smarta varningar & prognoser',
  'Vädervarningar & säsongstips',
  'Hälsologg & vaccinationer',
  'Foderspårning & kostnad/ägg',
  'Kläckningsräknare',
  'Dagliga uppgifter & påminnelser',
  'Fotoalbum för hönor',
  'Kundregister & försäljning',
  'Exportera data (PDF/CSV)',
  'Prioriterad support',
  'Alla framtida funktioner',
];

const highlights = [
  { icon: Calculator, title: 'Kostnad per ägg', desc: 'Se exakt vad varje ägg kostar att producera – foder, veterinär och allt.' },
  { icon: TrendingUp, title: 'Smarta prognoser', desc: 'Se hur många ägg du kan förvänta dig nästa vecka baserat på dina data.' },
  { icon: Bell, title: 'Aldrig missa avmaskning', desc: 'Automatiska påminnelser för vaccination, avmaskning och veterinärbesök.' },
  { icon: Baby, title: 'Kläckningsräknare', desc: '21-dagars nedräkning med milstolpar – perfekt för kläckmaskinen.' },
  { icon: ClipboardCheck, title: 'Dagliga uppgifter', desc: 'Checklista som återställs varje morgon – missa aldrig att stänga luckan.' },
  { icon: Camera, title: 'Fotoalbum', desc: 'Dokumentera dina hönor med bilder – se dem växa och utvecklas.' },
  { icon: BarChart3, title: 'Detaljerad statistik', desc: 'Jämför månader, se trender och hitta din bästa värpare.' },
  { icon: Download, title: 'Exportera rapporter', desc: 'Ladda ner dina rapporter som PDF eller CSV för bokföring.' },
];

const testimonials = [
  { name: 'Anna-Lena', location: 'Dalarna', text: 'Sedan jag uppgraderade har jag koll på exakt vad varje ägg kostar. Fantastiskt!' },
  { name: 'Per-Olof', location: 'Skåne', text: 'Kläckningsräknaren räddade min första kull – jag hade glömt sluta vända äggen utan den.' },
  { name: 'Margareta', location: 'Gotland', text: 'Dagliga uppgifterna gör att barnen kan hjälpa till. De älskar att bocka av!' },
];

export default function Premium() {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const isPremium = user?.subscription_status === 'premium';

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw new Error(error.message);
      if (data?.url) {
        window.open(data.url, '_blank');
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
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      toast({ title: 'Fel', description: err.message || 'Kunde inte starta checkout.', variant: 'destructive' });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center px-2">
        <div className="inline-flex items-center gap-2 bg-warning/10 text-warning px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <Crown className="h-4 w-4" />
          Premium
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif text-foreground mb-3">
          Din hönsgård förtjänar det bästa
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
          Lås upp alla verktyg och ta full kontroll över din hönsgård – från ägg till ekonomi.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Free */}
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <h3 className="font-serif text-xl text-foreground mb-1">Gratis</h3>
            <p className="text-muted-foreground text-sm mb-4">Kom igång utan kostnad</p>
            <p className="stat-number text-3xl text-foreground mb-6">0 kr<span className="text-sm text-muted-foreground font-normal">/mån</span></p>
            <ul className="space-y-3 mb-6">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-success shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" disabled>Nuvarande plan</Button>
          </CardContent>
        </Card>

        {/* Premium */}
        <Card className="bg-card border-primary/50 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
            Populärast
          </div>
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-serif text-xl text-foreground">Premium</h3>
              <Crown className="h-4 w-4 text-warning" />
            </div>
            <p className="text-muted-foreground text-sm mb-4">Allt du behöver – och lite till</p>
            
            <div className="mb-2">
              <p className="stat-number text-3xl text-foreground">19 kr<span className="text-sm text-muted-foreground font-normal">/mån</span></p>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <p className="text-sm text-muted-foreground">
                eller <span className="font-semibold text-foreground">149 kr/år</span>
              </p>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                Spara 35%
              </span>
            </div>

            <ul className="space-y-2.5 mb-6">
              {premiumFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="space-y-2">
              <Button 
                className="w-full h-11 active:scale-95 transition-transform text-base font-medium"
                onClick={() => handleCheckout(PRICES.yearly, 'yearly')}
                disabled={!!loadingPlan}
              >
                {loadingPlan === 'yearly' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Välj årsplan – 149 kr/år
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-10 text-sm"
                onClick={() => handleCheckout(PRICES.monthly, 'monthly')}
                disabled={!!loadingPlan}
              >
                {loadingPlan === 'monthly' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Välj månadsplan – 19 kr/mån
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social proof */}
      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-warning text-warning" />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">2 500+</span> nöjda hönsägare använder redan Hönsgården
        </p>
      </div>

      {/* Testimonials */}
      <div>
        <h2 className="font-serif text-xl sm:text-2xl text-foreground text-center mb-4">Vad säger våra användare?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="bg-card border-border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-1 mb-2">
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

      {/* Feature highlights */}
      <div>
        <h2 className="font-serif text-xl sm:text-2xl text-foreground text-center mb-6">
          Allt som ingår i Premium
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {highlights.map((f) => (
            <Card key={f.title} className="bg-card border-border shadow-sm">
              <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* No commitment */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-5 sm:p-6 text-center">
          <h3 className="font-serif text-lg text-foreground mb-2">Ingen bindningstid</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Du kan avbryta när som helst. Ingen uppsägningstid, inga dolda avgifter. 
            Dina data finns kvar även om du går tillbaka till gratisplanen.
          </p>
        </CardContent>
      </Card>

      {/* Manage subscription */}
      {isPremium && (
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5 sm:p-6 text-center space-y-3">
            <div className="inline-flex items-center gap-2 text-primary font-medium">
              <Crown className="h-5 w-5 text-warning" />
              Du har Premium!
            </div>
            <p className="text-sm text-muted-foreground">
              Hantera din prenumeration, byt betalmetod eller avsluta via kundportalen.
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
      <div className="text-center pb-4">
        {!isPremium && (
          <Button 
            size="lg" 
            className="h-12 px-8 text-base gap-2 active:scale-95 transition-transform shadow-[0_4px_14px_0_hsl(var(--primary)/0.3)]"
            onClick={() => handleCheckout(PRICES.yearly, 'yearly')}
            disabled={!!loadingPlan}
          >
            {loadingPlan === 'yearly' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
            Uppgradera till Premium
          </Button>
        )}
        <p className="text-xs text-muted-foreground mt-3">
          Frågor? Kontakta oss på <a href="mailto:support@honsgarden.se" className="text-primary hover:underline">support@honsgarden.se</a>
        </p>
      </div>
    </div>
  );
}
