import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Egg, ArrowRight, BarChart3, Bird, Coins, Shield, Star, Check, Heart, Zap, Bell, TrendingUp, ChevronDown } from 'lucide-react';
import heroFarm from '@/assets/hero-farm.jpg';
import henPortrait from '@/assets/hen-portrait.jpg';
import eggsBasket from '@/assets/eggs-basket.jpg';

// Lightweight IntersectionObserver reveal (no framer-motion)
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-600 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const features = [
  { icon: Egg, title: 'Äggloggning', desc: 'Logga dagens ägg med ett tryck. Se statistik dag för dag.' },
  { icon: Bird, title: 'Hönsprofiler', desc: 'Ge varje höna ett namn. Se vem som värper bäst.' },
  { icon: Coins, title: 'Ekonomi', desc: 'Registrera kostnader och se om du går plus.' },
  { icon: BarChart3, title: 'Statistik', desc: 'Snygga grafer som visar hur det går.' },
];

const smartFeatures = [
  { icon: TrendingUp, title: 'Veckoprognos', desc: 'Se förväntade ägg kommande veckan.' },
  { icon: Bell, title: 'Varningar', desc: 'Få signal om en höna slutar värpa.' },
  { icon: Zap, title: 'Kostnad per ägg', desc: 'Se exakt vad varje ägg kostar.' },
  { icon: Heart, title: 'Hälsologg', desc: 'Vaccinationer och veterinärbesök.' },
];

const testimonials = [
  {
    text: 'Äntligen en app som är enkel att förstå! Jag loggar äggen varje morgon. Skönt att se att mina Barnevelders verkligen levererar.',
    name: 'Inger M.',
    location: 'Småland • 8 hönor',
  },
  {
    text: 'Fick en varning att Greta inte hade värpt på länge. Visade sig att hon var sjuk. Tack vare appen kunde jag ta henne till veterinären i tid!',
    name: 'Lars-Erik S.',
    location: 'Dalarna • 12 hönor',
  },
  {
    text: 'Perfekt för oss som säljer lite ägg till grannarna. Nu ser jag exakt hur mycket vi tjänar och vad fodret kostar.',
    name: 'Birgitta K.',
    location: 'Skåne • 15 hönor',
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[90vh] flex items-center justify-center">
        <img
          src={heroFarm}
          alt="Svensk hönsgård i morgonljus"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/50 to-background" />

        {/* Top nav */}
        <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥚</span>
            <span className="font-serif text-lg text-primary-foreground drop-shadow-sm">Hönsgården</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10">
              <a href="/login?mode=login">Logga in</a>
            </Button>
            <Button asChild size="sm" className="shadow-lg">
              <a href="/login?mode=register">Kom igång gratis</a>
            </Button>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 text-center px-5 sm:px-6 max-w-3xl mx-auto">
          <FadeUp>
            <span className="inline-flex items-center gap-2 bg-primary-foreground/15 backdrop-blur-md text-primary-foreground px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-primary-foreground/20 mb-6">
              🌾 Appen för svenska hönsägare
            </span>
          </FadeUp>

          <FadeUp delay={100}>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-primary-foreground mb-4 sm:mb-5 leading-[1.1] drop-shadow-lg">
              Ha full koll på{' '}
              <span className="relative inline-block">
                din hönsgård
                <svg className="absolute -bottom-1 left-0 w-full h-3 text-primary" viewBox="0 0 200 12" fill="none">
                  <path d="M2 8 C50 2, 150 2, 198 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
          </FadeUp>

          <FadeUp delay={200}>
            <p className="text-base sm:text-xl text-primary-foreground/80 mb-8 max-w-lg mx-auto leading-relaxed">
              Logga ägg, följ flocken och håll koll på ekonomin – enkelt och smidigt, direkt i mobilen.
            </p>
          </FadeUp>

          <FadeUp delay={300}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Button asChild size="lg" className="h-13 px-10 text-base gap-2 shadow-[0_8px_30px_hsl(var(--primary)/0.4)] hover:shadow-[0_8px_40px_hsl(var(--primary)/0.5)] transition-shadow">
                <a href="/login?mode=register">
                  Skapa gratis konto
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </FadeUp>

          <FadeUp delay={400}>
            <div className="flex flex-wrap gap-x-6 gap-y-1 justify-center text-xs sm:text-sm text-primary-foreground/70">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Helt gratis att börja</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Ingen bindningstid</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> 100% svensk 🇸🇪</span>
            </div>
          </FadeUp>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <ChevronDown className="h-6 w-6 text-primary-foreground/40" />
        </div>
      </section>

      {/* ═══════ SOCIAL PROOF BAR ═══════ */}
      <section className="relative z-10 border-b border-border bg-card">
        <div className="container max-w-5xl mx-auto px-5">
          <div className="grid grid-cols-3 divide-x divide-border">
            {[
              { value: '50 000+', label: 'ägg loggade' },
              { value: '2 500+', label: 'hönsägare' },
              { value: '100%', label: 'svensk app 🇸🇪' },
            ].map((s, i) => (
              <FadeUp key={s.label} delay={i * 100} className="py-6 sm:py-8 text-center">
                <p className="stat-number text-xl sm:text-3xl text-foreground">{s.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{s.label}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="container max-w-5xl mx-auto px-5 sm:px-6">
          <FadeUp className="text-center mb-10 sm:mb-14">
            <h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-3">
              Allt du behöver – <span className="gradient-text">inget du inte behöver</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              Enkla verktyg som gör skillnad i vardagen.
            </p>
          </FadeUp>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {features.map((f, i) => (
              <FadeUp key={f.title} delay={i * 80}>
                <div className="group relative p-5 sm:p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 card-hover h-full">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-serif text-base sm:text-lg text-foreground mb-1">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SMART INSIGHTS + IMAGE ═══════ */}
      <section className="relative z-10 bg-card/50 border-y border-border py-16 sm:py-24">
        <div className="container max-w-5xl mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <FadeUp>
              <p className="data-label mb-3">Smarta insikter</p>
              <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-4">
                Appen som <span className="gradient-text">lär känna</span> dina hönor
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
                Ju mer du loggar, desto smartare blir Hönsgården. Få personliga tips och upptäck mönster du annars hade missat.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {smartFeatures.map((f, i) => (
                  <FadeUp key={f.title} delay={i * 80}>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-background border border-border">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <f.icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{f.title}</p>
                        <p className="text-[11px] text-muted-foreground">{f.desc}</p>
                      </div>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={200}>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border">
                  <img
                    src={henPortrait}
                    alt="Höna i mysigt hönshus"
                    className="w-full h-72 sm:h-80 lg:h-[420px] object-cover"
                    loading="lazy"
                  />
                </div>
                {/* Floating card */}
                <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-card border border-border rounded-xl p-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">+23% ägg</p>
                      <p className="text-[10px] text-muted-foreground">denna månad</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="container max-w-4xl mx-auto px-5 sm:px-6">
          <FadeUp className="text-center mb-10 sm:mb-14">
            <h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-3">Tre steg till full koll</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Du behöver ingen manual.</p>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            {[
              { num: '1', title: 'Skapa konto', desc: 'Gratis på några sekunder.' },
              { num: '2', title: 'Lägg in hönorna', desc: 'Ange antal eller namnge varje höna.' },
              { num: '3', title: 'Börja logga ägg', desc: 'Tryck in äggen – se statistiken växa!' },
            ].map((s, i) => (
              <FadeUp key={s.num} delay={i * 100} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-serif text-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                  {s.num}
                </div>
                <h3 className="font-serif text-lg text-foreground mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="relative z-10 bg-card/50 border-y border-border py-16 sm:py-24">
        <div className="container max-w-5xl mx-auto px-5 sm:px-6">
          <FadeUp className="text-center mb-10 sm:mb-14">
            <h2 className="font-serif text-2xl sm:text-4xl text-foreground">Älskad av hönsägare</h2>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <FadeUp key={t.name} delay={i * 100}>
                <div className="p-5 sm:p-6 rounded-2xl bg-background border border-border card-hover h-full">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.name}</p>
                      <p className="text-[11px] text-muted-foreground">{t.location}</p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PRICING TEASER ═══════ */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="container max-w-5xl mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <FadeUp delay={100} className="relative order-2 lg:order-1">
              <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border">
                <img
                  src={eggsBasket}
                  alt="Korg med färska ägg"
                  className="w-full h-64 sm:h-80 object-cover"
                  loading="lazy"
                />
              </div>
            </FadeUp>
            <FadeUp className="order-1 lg:order-2">
              <p className="data-label mb-3">Prisvärt</p>
              <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-4">
                Gratis att börja – <span className="gradient-text">Premium från 19 kr</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-5 leading-relaxed">
                Börja gratis med grundfunktionerna. Uppgradera till Premium för avancerad statistik och smarta varningar.
              </p>
              <ul className="space-y-2.5 mb-6">
                {['Obegränsat antal hönor', 'Avancerad statistik & prognoser', 'Smarta varningar', 'Exportera data'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="stat-number text-4xl text-foreground">99 kr</span>
                <span className="text-muted-foreground">/mån</span>
                <span className="text-muted-foreground mx-1">·</span>
                <span className="stat-number text-4xl text-foreground">799 kr</span>
                <span className="text-muted-foreground">/år</span>
                <span className="text-[10px] bg-success/10 text-success px-2 py-0.5 rounded-full font-semibold ml-2 uppercase tracking-wide">Spara 33%</span>
              </div>
              <Button asChild size="lg" className="h-12 px-8 text-base gap-2 shadow-[0_8px_30px_hsl(var(--primary)/0.3)]">
                <a href="/login?mode=register">
                  Prova 7 dagar gratis
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className="relative z-10 pb-16 sm:pb-24">
        <div className="container max-w-3xl mx-auto px-5 sm:px-6">
          <FadeUp>
            <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-warning/5 border border-primary/15 p-8 sm:p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-5">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-3">Redo att börja?</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
                Skapa ett konto gratis och börja logga ägg redan idag. Dina hönor förtjänar det!
              </p>
              <Button asChild size="lg" className="h-13 px-10 text-base gap-2 shadow-[0_8px_30px_hsl(var(--primary)/0.4)]">
                <a href="/login?mode=register">
                  Skapa gratis konto
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="relative z-10 border-t border-border py-8">
        <div className="container max-w-5xl mx-auto px-5 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-base">🥚</span>
              <span className="font-serif text-foreground">Hönsgården</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 honsgarden.se · <a href="mailto:support@honsgarden.se" className="text-primary hover:underline">support@honsgarden.se</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
