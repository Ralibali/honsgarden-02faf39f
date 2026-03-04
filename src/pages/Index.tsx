import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Egg, ArrowRight, BarChart3, Bird, Coins, Shield } from 'lucide-react';
import heroImage from '@/assets/hero-coop.jpg';

const features = [
  { icon: Egg, title: 'Äggloggning', desc: 'Registrera ägg enkelt varje dag och se vilken höna som producerar mest.' },
  { icon: Bird, title: 'Hönsprofiler', desc: 'Döp dina hönor, följ hälsa och produktion för varje individ.' },
  { icon: BarChart3, title: 'Statistik', desc: 'Trender, diagram och topplista – allt i ett snyggt dashboard.' },
  { icon: Coins, title: 'Ekonomi', desc: 'Håll koll på kostnader, försäljning och netto – dag för dag.' },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background noise-bg">
      {/* Hero */}
      <div className="relative min-h-[80vh] flex items-center">
        <img
          src={heroImage}
          alt="Svensk hönsgård"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="relative z-10 container max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <Egg className="h-3.5 w-3.5" />
              Din digitala hönsgård
            </div>

            <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-4 leading-tight">
              Hönsgården
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Håll koll på ägg, hönor och ekonomi – dag för dag. Professionella verktyg för den moderna hönsbonden.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="h-12 px-8 text-base gap-2 shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] active:scale-95 transition-transform">
                <Link to="/login">
                  Kom igång gratis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                <Link to="/login">Logga in</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="relative z-10 container max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl text-foreground mb-3">Allt du behöver</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Från äggloggning till ekonomisk överblick – allt samlat på ett ställe.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-xl bg-card border border-border hover:border-surface-highlight hover:glow-amber transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-serif text-lg text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 container max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-2xl bg-card border border-border p-8 md:p-12 text-center">
          <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="font-serif text-3xl text-foreground mb-3">Redo att börja?</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Skapa ett konto gratis och börja logga ägg redan idag. Uppgradera till Premium när du vill.
          </p>
          <Button asChild size="lg" className="h-12 px-8 text-base gap-2 shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] active:scale-95 transition-transform">
            <Link to="/login">
              Skapa gratis konto
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8">
        <div className="container max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Egg className="h-4 w-4 text-primary" />
            <span className="font-serif text-foreground">Hönsgården</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 Hönsgården. Alla rättigheter förbehållna.
          </p>
        </div>
      </footer>
    </div>
  );
}
