import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Check, Sparkles, Mail, BarChart3, Shield } from 'lucide-react';

const features = [
  { icon: BarChart3, title: 'Avancerad statistik', desc: 'Trendanalys, prognoser och detaljerade rapporter' },
  { icon: Mail, title: 'E-postpåminnelser', desc: 'Dagliga påminnelser och veckosummeringar' },
  { icon: Sparkles, title: 'AI-insikter', desc: 'Smarta tips baserat på din gårds data' },
  { icon: Shield, title: 'Prioriterad support', desc: 'Snabb hjälp via e-post och chatt' },
];

export default function Premium() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <Crown className="h-4 w-4" />
          Premium
        </div>
        <h1 className="text-4xl font-serif text-foreground mb-3">
          Uppgradera din hönsgård
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Få tillgång till avancerade verktyg och insikter som hjälper dig maximera din äggproduktion.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <h3 className="font-serif text-xl text-foreground mb-1">Gratis</h3>
            <p className="text-muted-foreground text-sm mb-4">Kom igång utan kostnad</p>
            <p className="stat-number text-3xl text-foreground mb-6">0 kr<span className="text-sm text-muted-foreground font-normal">/mån</span></p>
            <ul className="space-y-3 mb-6">
              {['Upp till 10 hönor', 'Grundläggande äggloggning', 'Enkel statistik', '7 dagars historik'].map((f) => (
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
        <Card className="bg-card border-primary/50 glow-amber relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
            Populärast
          </div>
          <CardContent className="p-6">
            <h3 className="font-serif text-xl text-foreground mb-1">Premium</h3>
            <p className="text-muted-foreground text-sm mb-4">Allt du behöver</p>
            <p className="stat-number text-3xl text-foreground mb-1">49 kr<span className="text-sm text-muted-foreground font-normal">/mån</span></p>
            <p className="text-xs text-primary mb-6">7 dagars gratis provperiod!</p>
            <ul className="space-y-3 mb-6">
              {['Obegränsat antal hönor', 'Avancerad statistik & trender', 'E-postpåminnelser', 'AI-insikter & tips', 'Prioriterad support', 'Exportera data'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button className="w-full shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] active:scale-95 transition-transform">
              Starta gratis provperiod
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((f) => (
          <Card key={f.title} className="bg-card border-border">
            <CardContent className="p-5 flex items-start gap-4">
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
  );
}
