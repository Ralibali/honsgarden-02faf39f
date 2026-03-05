import React from 'react';
import { Button } from '@/components/ui/button';
import { Egg, ArrowRight, BarChart3, Bird, Coins, Shield, Star, Check, Heart, Zap, Bell, TrendingUp } from 'lucide-react';
import heroFarm from '@/assets/hero-farm.jpg';
import henPortrait from '@/assets/hen-portrait.jpg';
import eggsBasket from '@/assets/eggs-basket.jpg';

const features = [
  { icon: Egg, title: 'Enkel äggloggning', desc: 'Logga dagens ägg med ett tryck. Se statistik dag för dag, vecka för vecka.' },
  { icon: Bird, title: 'Hönsprofiler', desc: 'Ge varje höna ett namn, notera ras och ålder. Håll koll på vem som värper bäst.' },
  { icon: Coins, title: 'Ekonomi & översikt', desc: 'Registrera kostnader och försäljning. Se om du går plus eller minus.' },
  { icon: BarChart3, title: 'Tydlig statistik', desc: 'Snygga grafer som visar hur det går. Perfekt att följa utvecklingen.' },
];

const smartFeatures = [
  { icon: TrendingUp, title: 'Veckoprognos', desc: 'Se hur många ägg du kan förvänta dig.' },
  { icon: Bell, title: 'Tidiga varningar', desc: 'Få signal om en höna slutar värpa.' },
  { icon: Zap, title: 'Kostnad per ägg', desc: 'Se exakt vad varje ägg kostar dig.' },
  { icon: Heart, title: 'Hälsologg', desc: 'Notera vaccinationer och veterinärbesök.' },
];

const testimonials = [
  {
    text: 'Äntligen en app som är enkel att förstå! Jag loggar äggen varje morgon efter frukost. Skönt att se att mina Barnevelders verkligen levererar.',
    name: 'Inger M.',
    location: 'Småland • 8 hönor',
  },
  {
    text: 'Fick en varning att Greta inte hade värpt på länge. Visade sig att hon var sjuk. Tack vare appen kunde jag ta henne till veterinären i tid!',
    name: 'Lars-Erik S.',
    location: 'Dalarna • 12 hönor',
  },
  {
    text: 'Perfekt för oss som säljer lite ägg till grannarna. Nu ser jag exakt hur mycket vi tjänar och vad fodret kostar. Ovärderligt!',
    name: 'Birgitta K.',
    location: 'Skåne • 15 hönor',
  },
];

const steps = [
  { num: '1', title: 'Skapa konto', desc: 'Registrera dig gratis på några sekunder.' },
  { num: '2', title: 'Lägg in dina hönor', desc: 'Skriv in antal eller ge dem namn.' },
  { num: '3', title: 'Börja logga ägg', desc: 'Klicka in dagens ägg och se statistiken växa!' },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background noise-bg">
      {/* Hero */}
      <div className="relative min-h-[75vh] sm:min-h-[85vh] flex items-center">
        <img
          src={heroFarm}
          alt="Svensk hönsgård med höns i morgonljus"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-background/75 sm:bg-transparent" />
        <div className="absolute inset-0 hidden sm:block bg-gradient-to-r from-background via-background/80 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="relative z-10 container max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 backdrop-blur-sm border border-primary/20">
              <span>🌾</span>
              Appen för dig som älskar dina hönor
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-foreground mb-3 sm:mb-4 leading-tight">
              Ha <span className="text-primary">full koll</span> på din hönsgård
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed max-w-md">
              Logga ägg, håll ordning på flocken och följ ekonomin – enkelt och smidigt. Byggd av hönsägare, för hönsägare.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Button asChild size="lg" className="h-12 px-8 text-base gap-2 shadow-[0_4px_14px_0_hsl(var(--primary)/0.3)] active:scale-95 transition-transform">
                <a href="/login?mode=register">
                  Kom igång gratis
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base backdrop-blur-sm">
                <a href="/login?mode=login">Logga in</a>
              </Button>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Gratis att börja</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Svensk support</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Enkel att använda</span>
            </div>
          </div>
        </div>
      </div>

      {/* Social proof stats */}
      <section className="relative z-10 border-y border-border bg-card/80 backdrop-blur-sm">
        <div className="container max-w-7xl mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-3 divide-x divide-border">
            {[
              { value: '50 000+', label: 'ägg loggade' },
              { value: '2 500+', label: 'nöjda hönsägare' },
              { value: '100%', label: 'svensk app 🇸🇪' },
            ].map((s) => (
              <div key={s.label} className="py-5 sm:py-8 text-center">
                <p className="stat-number text-xl sm:text-2xl text-foreground">{s.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 container max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <p className="data-label mb-2">🌟 Funktioner</p>
          <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-2 sm:mb-3">Allt du behöver för din hönsgård</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            Hönsgården hjälper dig hålla koll på ägg, hönor och ekonomi – utan krångel.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-5 sm:p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <h3 className="font-serif text-base sm:text-lg text-foreground mb-1">{f.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Smart insights with image */}
      <section className="relative z-10 bg-card/50 border-y border-border">
        <div className="container max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <p className="data-label mb-2">💡 Smarta insikter</p>
              <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-3">
                Appen som lär känna dina hönor
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">
                Ju mer du loggar, desto smartare blir Hönsgården. Få personliga tips och se mönster du annars hade missat.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {smartFeatures.map((f) => (
                  <div key={f.title} className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border">
                    <f.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{f.title}</p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img
                src={henPortrait}
                alt="Höna i mysigt hönshus"
                className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 container max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <p className="data-label mb-2">🚀 Kom igång</p>
          <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-2">Enkelt som en plätt</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Du behöver ingen manual. Skapa konto, lägg in dina hönor och börja logga!</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.num} className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-serif text-xl flex items-center justify-center mx-auto mb-4">
                {s.num}
              </div>
              <h3 className="font-serif text-lg text-foreground mb-1">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 bg-card/50 border-y border-border">
        <div className="container max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
          <div className="text-center mb-8 sm:mb-12">
            <p className="data-label mb-2">💬 Vad andra säger</p>
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground">Älskad av hönsägare</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="p-5 sm:p-6 rounded-xl bg-background border border-border">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="relative z-10 container max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            <img
              src={eggsBasket}
              alt="Korg med färska ägg"
              className="w-full h-64 sm:h-80 object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <p className="data-label mb-2">💰 Prisvärt</p>
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-3">
              Gratis att börja – Premium från 99 kr/mån
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              Börja gratis med grundfunktionerna. Uppgradera till Premium för avancerad statistik, smarta varningar och obegränsade hönor.
            </p>
            <ul className="space-y-2 mb-6">
              {['Obegränsat antal hönor', 'Avancerad statistik & prognoser', 'Smarta varningar', 'Exportera data'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="stat-number text-3xl text-foreground">99 kr</span>
              <span className="text-muted-foreground text-sm">/mån</span>
              <span className="text-muted-foreground text-sm mx-1">eller</span>
              <span className="stat-number text-3xl text-foreground">799 kr</span>
              <span className="text-muted-foreground text-sm">/år</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium ml-2">Spara 33%</span>
            </div>
            <Button asChild size="lg" className="h-12 px-8 text-base gap-2 active:scale-95 transition-transform">
              <a href="/login?mode=register">
                Prova gratis i 7 dagar
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 container max-w-7xl mx-auto px-5 sm:px-6 pb-14 sm:pb-20">
        <div className="rounded-2xl bg-primary/5 border border-primary/20 p-6 sm:p-8 md:p-12 text-center">
          <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-3 sm:mb-4" />
          <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-2 sm:mb-3">Redo att testa?</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-5 sm:mb-6">
            Skapa ett konto gratis och börja logga ägg redan idag. Dina hönor förtjänar det!
          </p>
          <Button asChild size="lg" className="h-12 px-8 text-base gap-2 shadow-[0_4px_14px_0_hsl(var(--primary)/0.3)] active:scale-95 transition-transform">
            <a href="/login?mode=register">
              Skapa gratis konto
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* Contact */}
      <section className="relative z-10 container max-w-7xl mx-auto px-5 sm:px-6 pb-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Har du frågor? Vi svarar alltid på svenska!</p>
          <a href="mailto:support@honsgarden.se" className="text-sm text-primary hover:underline">
            📧 support@honsgarden.se
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-6 sm:py-8">
        <div className="container max-w-7xl mx-auto px-5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <Egg className="h-4 w-4 text-primary" />
            <span className="font-serif text-foreground">Hönsgården</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 honsgarden.se. Alla rättigheter förbehållna.
          </p>
        </div>
      </footer>
    </div>
  );
}
