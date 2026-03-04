import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Check, Bell, BarChart3, Shield, Download, Bird, TrendingUp, Zap, Star } from 'lucide-react';

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
  'Exportera data (PDF/CSV)',
  'Prioriterad support',
  'Alla framtida funktioner',
];

const highlights = [
  { icon: TrendingUp, title: 'Smarta prognoser', desc: 'Se hur många ägg du kan förvänta dig nästa vecka baserat på dina data.' },
  { icon: Bell, title: 'Tidiga varningar', desc: 'Få en signal direkt om en höna plötsligt slutar värpa.' },
  { icon: BarChart3, title: 'Detaljerad statistik', desc: 'Jämför månader, se trender och hitta din bästa värpare.' },
  { icon: Download, title: 'Exportera rapporter', desc: 'Ladda ner dina rapporter som PDF eller CSV för bokföring.' },
  { icon: Shield, title: 'Prioriterad support', desc: 'Snabb hjälp via e-post – vi svarar alltid på svenska.' },
  { icon: Zap, title: 'Alla framtida funktioner', desc: 'Som Premium-medlem får du tillgång till allt nytt vi bygger.' },
];

export default function Premium() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center px-2">
        <div className="inline-flex items-center gap-2 bg-warning/10 text-warning px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <Crown className="h-4 w-4" />
          Premium
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif text-foreground mb-3">
          Få ut det mesta av din hönsgård
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
          Uppgradera till Premium och lås upp smarta verktyg som hjälper dig maximera äggproduktionen och spara tid.
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
            
            {/* Monthly price */}
            <div className="mb-2">
              <p className="stat-number text-3xl text-foreground">19 kr<span className="text-sm text-muted-foreground font-normal">/mån</span></p>
            </div>

            {/* Yearly price with savings */}
            <div className="flex items-center gap-2 mb-6">
              <p className="text-sm text-muted-foreground">
                eller <span className="font-semibold text-foreground">149 kr/år</span>
              </p>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                Spara 35%
              </span>
            </div>

            <ul className="space-y-3 mb-6">
              {premiumFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {/* Two CTA buttons */}
            <div className="space-y-2">
              <Button className="w-full h-11 active:scale-95 transition-transform text-base font-medium">
                Välj årsplan – 149 kr/år
              </Button>
              <Button variant="outline" className="w-full h-10 text-sm">
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

      {/* Feature highlights */}
      <div>
        <h2 className="font-serif text-xl sm:text-2xl text-foreground text-center mb-6">
          Vad ingår i Premium?
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

      {/* FAQ-style reassurance */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-5 sm:p-6 text-center">
          <h3 className="font-serif text-lg text-foreground mb-2">Ingen bindningstid</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Du kan avbryta när som helst. Ingen uppsägningstid, inga dolda avgifter. 
            Dina data finns kvar även om du går tillbaka till gratisplanen.
          </p>
        </CardContent>
      </Card>

      {/* Bottom CTA */}
      <div className="text-center pb-4">
        <Button size="lg" className="h-12 px-8 text-base gap-2 active:scale-95 transition-transform shadow-[0_4px_14px_0_hsl(var(--primary)/0.3)]">
          <Crown className="h-4 w-4" />
          Uppgradera till Premium
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          Frågor? Kontakta oss på <a href="mailto:support@honsgarden.se" className="text-primary hover:underline">support@honsgarden.se</a>
        </p>
      </div>
    </div>
  );
}
