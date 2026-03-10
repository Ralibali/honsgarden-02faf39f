import React, { useRef, useEffect, useState } from 'react';
import VisitorWelcomePopup from '@/components/VisitorWelcomePopup';
import { useSeo } from '@/hooks/useSeo';
import { Button } from '@/components/ui/button';
import { Egg, ArrowRight, BarChart3, Bird, Coins, Shield, Star, Check, Heart, Zap, Bell, TrendingUp, ChevronDown, ChevronRight, HelpCircle, Smartphone, Users, Clock } from 'lucide-react';
import heroFarm from '@/assets/hero-farm.jpg';
import henPortrait from '@/assets/hen-portrait.jpg';
import eggsBasket from '@/assets/eggs-basket.jpg';
import appDemoDashboard from '@/assets/app-demo-dashboard.png';
import appDemoHens from '@/assets/app-demo-hens.png';
import appDemoFinance from '@/assets/app-demo-finance.png';

// Lightweight IntersectionObserver reveal
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

// Animated counter
function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useInView(0.3);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 1500;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [visible, target]);

  return <span ref={ref}>{count.toLocaleString('sv-SE')}{suffix}</span>;
}

// FAQ Accordion
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="text-sm sm:text-base font-medium text-foreground pr-4">{q}</span>
        <ChevronRight className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-1">
          <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// Live activity ticker
function LiveTicker() {
  const activities = [
    'Anna i Värmland loggade 6 ägg 🥚',
    'Magnus i Halland la till 3 nya hönor 🐔',
    'Karin i Östergötland nådde 1 000 ägg totalt 🎉',
    'Per i Norrbotten skapade ett konto ✨',
    'Lena i Blekinge loggade sin första vecka 📊',
    'Erik i Gävleborg sparade 340 kr denna månad 💰',
  ];
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % activities.length);
        setFade(true);
      }, 300);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
      </span>
      <span className={`transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
        {activities[index]}
      </span>
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
    avatar: '👩‍🌾',
  },
  {
    text: 'Fick en varning att Greta inte hade värpt på länge. Visade sig att hon var sjuk. Tack vare appen kunde jag ta henne till veterinären i tid!',
    name: 'Lars-Erik S.',
    location: 'Dalarna • 12 hönor',
    avatar: '👨‍🌾',
  },
  {
    text: 'Perfekt för oss som säljer lite ägg till grannarna. Nu ser jag exakt hur mycket vi tjänar och vad fodret kostar.',
    name: 'Birgitta K.',
    location: 'Skåne • 15 hönor',
    avatar: '👩‍🌾',
  },
];

const faqs = [
  { q: 'Kostar det något?', a: 'Nej, grundversionen är helt gratis – för alltid. Du kan logga ägg, hantera hönor och se statistik utan att betala. Premium med extra funktioner kostar från 19 kr/mån.' },
  { q: 'Behöver jag ladda ner en app?', a: 'Nej! Hönsgården fungerar direkt i din webbläsare på mobilen. Du kan lägga till den på hemskärmen så känns det precis som en app.' },
  { q: 'Kan jag testa utan att skapa konto?', a: 'Registreringen tar bara 10 sekunder med e-post och lösenord. Vi behöver ett konto för att spara dina data säkert.' },
  { q: 'Är mina data säkra?', a: 'Absolut. All data lagras krypterat i EU. Vi följer GDPR och du kan när som helst radera ditt konto och all data.' },
  { q: 'Hur många hönor kan jag ha?', a: 'I gratisversionen kan du ha obegränsat antal hönor. Det finns inga begränsningar.' },
];

const demoScreens = [
  { img: appDemoDashboard, title: 'Dashboard', desc: 'Dagens ägg, statistik och trender – allt på ett ställe.' },
  { img: appDemoHens, title: 'Hönsprofiler', desc: 'Varje höna med namn, ras och hälsologg.' },
  { img: appDemoFinance, title: 'Ekonomi', desc: 'Se intäkter, kostnader och om du går plus.' },
];

export default function Index() {
  const [activeDemo, setActiveDemo] = useState(0);
  useSeo({
    title: 'Hönsgården – Äggloggare & hönsapp för hobbyuppfödare',
    description: 'Håll koll på ägg, höns, foder och ekonomi – dag för dag. Gratis verktyg för den moderna hönsbonden. Kom igång direkt!',
    path: '/',
    ogImage: 'https://honsgarden.se/blog-images/hens-garden.jpg',
    jsonLd: [
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'WebPage',
        '@id': 'https://honsgarden.se/#webpage',
        url: 'https://honsgarden.se',
        name: 'Hönsgården – Äggloggare & hönsapp för hobbyuppfödare',
        isPartOf: { '@id': 'https://honsgarden.se/#website' },
        about: { '@id': 'https://honsgarden.se/#organization' },
        description: 'Håll koll på ägg, höns, foder och ekonomi – dag för dag. Gratis verktyg för den moderna hönsbonden.',
        inLanguage: 'sv-SE',
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '.hero-description'],
        },
        review: testimonials.map(t => ({
          '@type': 'Review',
          reviewBody: t.text,
          author: { '@type': 'Person', name: t.name },
          reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        })),
      },
    ],
  });

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <VisitorWelcomePopup />

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[92vh] flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/hero-home.jpg"
            alt="Kvinna med höna på en svensk gård"
            className="w-full h-full object-cover object-[50%_45%] animate-hero-zoom scale-110"
            loading="eager"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/50 to-background" />

        {/* Top nav */}
        <nav aria-label="Huvudnavigation" className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥚</span>
            <span className="font-serif text-lg text-primary-foreground drop-shadow-sm">Hönsgården</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10">
              <a href="/login?mode=login">Logga in</a>
            </Button>
            <Button asChild size="sm" className="shadow-lg">
              <a href="/login?mode=register">Kom igång</a>
            </Button>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 text-center px-5 sm:px-6 max-w-3xl mx-auto">
          <FadeUp>
            <div className="inline-flex items-center gap-2 bg-primary-foreground/15 backdrop-blur-md text-primary-foreground px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-primary-foreground/20 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              347 hönsägare har redan gått med
            </div>
          </FadeUp>

          <FadeUp delay={100}>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-primary-foreground mb-4 sm:mb-5 leading-[1.1] drop-shadow-lg">
              Håll koll på{' '}
              <span className="relative inline-block">
                hela hönsgården
                <svg className="absolute -bottom-3 left-0 w-full h-3 text-primary" viewBox="0 0 200 12" fill="none">
                  <path d="M2 8 C50 2, 150 2, 198 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
          </FadeUp>

          <FadeUp delay={200}>
            <p className="text-base sm:text-xl text-primary-foreground/85 mb-8 max-w-lg mx-auto leading-relaxed">
              Logga ägg, följ flocken och kolla om hönsgården går plus – det tar bara <strong>10 sekunder om dagen</strong>.
            </p>
          </FadeUp>

          <FadeUp delay={300}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
              <Button asChild size="lg" className="h-14 px-12 text-lg gap-2 shadow-[0_8px_30px_hsl(var(--primary)/0.4)] hover:shadow-[0_8px_40px_hsl(var(--primary)/0.5)] hover:scale-[1.02] transition-all">
                <a href="/login?mode=register">
                  🥚 Kom igång nu
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
            </div>
            <p className="text-xs text-primary-foreground/60">Klart på 10 sekunder · Helt kostnadsfritt</p>
          </FadeUp>

          <FadeUp delay={400}>
            <div className="flex flex-wrap gap-x-6 gap-y-1 justify-center text-xs sm:text-sm text-primary-foreground/70 mt-6">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Helt gratis att börja</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Fungerar i mobilen</span>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
            {[
              { target: 4820, suffix: '+', label: 'ägg loggade', icon: Egg },
              { target: 347, suffix: '', label: 'hönsägare', icon: Users },
              { target: 4, suffix: ',8 ★', label: 'snittbetyg', icon: Star },
              { target: 10, suffix: 's', label: 'att skapa konto', icon: Clock },
            ].map((s, i) => (
              <FadeUp key={s.label} delay={i * 100} className="py-5 sm:py-7 text-center">
                <p className="stat-number text-lg sm:text-2xl text-foreground">
                  <AnimatedNumber target={s.target} suffix={s.suffix} />
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </FadeUp>
            ))}
          </div>
          {/* Live activity ticker */}
          <div className="border-t border-border py-3 flex justify-center">
            <LiveTicker />
          </div>
        </div>
      </section>

      {/* ═══════ APP DEMO SECTION ═══════ */}
      <section className="relative z-10 py-16 sm:py-24 overflow-hidden">
        <div className="container max-w-6xl mx-auto px-5 sm:px-6">
          <FadeUp className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium mb-4">
              <Smartphone className="h-3.5 w-3.5" /> Se appen i action
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-3">
              Så ser det ut <span className="gradient-text">i verkligheten</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              Enkelt, snyggt och direkt i mobilen. Ingen nedladdning behövs.
            </p>
          </FadeUp>

          {/* Demo tabs + screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: tabs */}
            <FadeUp>
              <div className="space-y-3">
                {demoScreens.map((screen, i) => (
                  <button
                    key={screen.title}
                    onClick={() => setActiveDemo(i)}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
                      activeDemo === i
                        ? 'bg-primary/5 border-primary/30 shadow-md'
                        : 'bg-card border-border hover:border-primary/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        activeDemo === i ? 'bg-primary/15' : 'bg-muted'
                      }`}>
                        {i === 0 && <Egg className={`h-5 w-5 ${activeDemo === i ? 'text-primary' : 'text-muted-foreground'}`} />}
                        {i === 1 && <Bird className={`h-5 w-5 ${activeDemo === i ? 'text-primary' : 'text-muted-foreground'}`} />}
                        {i === 2 && <Coins className={`h-5 w-5 ${activeDemo === i ? 'text-primary' : 'text-muted-foreground'}`} />}
                      </div>
                      <div>
                        <h3 className={`font-medium text-sm sm:text-base ${activeDemo === i ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {screen.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{screen.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-6">
                <Button asChild size="lg" className="h-12 px-8 text-base gap-2 shadow-[0_8px_30px_hsl(var(--primary)/0.3)]">
                  <a href="/login?mode=register">
                    Prova själv – helt gratis
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </FadeUp>

            {/* Right: phone mockup */}
            <FadeUp delay={200}>
              <div className="flex justify-center">
                <div className="relative w-[280px] sm:w-[320px]">
                  {demoScreens.map((screen, i) => (
                    <img
                      key={screen.title}
                      src={screen.img}
                      alt={`Hönsgården app – ${screen.title}`}
                      className={`w-full transition-all duration-500 ${
                        activeDemo === i
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-95 absolute inset-0'
                      }`}
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  ))}
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ═══════ "SÅ FUNKAR DET" – 3 STEPS ═══════ */}
      <section className="relative z-10 bg-card/50 border-y border-border py-16 sm:py-24">
        <div className="container max-w-4xl mx-auto px-5 sm:px-6">
          <FadeUp className="text-center mb-10 sm:mb-14">
            <h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-3">Kom igång på under en minut</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Ingen manual behövs. Så här enkelt är det:</p>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            {[
              { num: '1', title: 'Skapa konto', desc: 'Gratis på 10 sekunder. Bara e-post och lösenord.', emoji: '✉️' },
              { num: '2', title: 'Lägg till dina hönor', desc: 'Ange antal eller ge dem namn – du väljer!', emoji: '🐔' },
              { num: '3', title: 'Logga ägg varje dag', desc: 'Ett tryck per dag. Se statistiken växa!', emoji: '🥚' },
            ].map((s, i) => (
              <FadeUp key={s.num} delay={i * 100} className="text-center">
                <div className="text-4xl mb-3">{s.emoji}</div>
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center mx-auto mb-3">
                  {s.num}
                </div>
                <h3 className="font-serif text-lg text-foreground mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={400} className="text-center mt-10">
            <Button asChild size="lg" className="h-12 px-8 text-base gap-2 shadow-[0_8px_30px_hsl(var(--primary)/0.3)]">
              <a href="/login?mode=register">
                Testa själv
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </FadeUp>
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

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="container max-w-5xl mx-auto px-5 sm:px-6">
          <FadeUp className="text-center mb-10 sm:mb-14">
            <h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-2">Älskad av hönsägare i hela Sverige</h2>
            <p className="text-sm text-muted-foreground">Hör vad våra användare säger</p>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <FadeUp key={t.name} delay={i * 100}>
                <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border card-hover h-full">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                      {t.avatar}
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
          {/* CTA after testimonials */}
          <FadeUp delay={400} className="text-center mt-10">
            <p className="text-sm text-muted-foreground mb-4">Bli en av 2 500+ nöjda hönsägare</p>
            <Button asChild size="lg" className="h-12 px-8 text-base gap-2 shadow-[0_8px_30px_hsl(var(--primary)/0.3)]">
              <a href="/login?mode=register">
                Skapa konto
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </FadeUp>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="relative z-10 bg-card/50 border-y border-border py-16 sm:py-24">
        <div className="container max-w-2xl mx-auto px-5 sm:px-6">
          <FadeUp className="text-center mb-10 sm:mb-12">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-2">Vanliga frågor</h2>
          </FadeUp>
          <FadeUp delay={100}>
            <div className="space-y-2">
              {faqs.map((f, i) => (
                <FAQItem key={i} q={f.q} a={f.a} />
              ))}
            </div>
          </FadeUp>
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
                <span className="stat-number text-4xl text-foreground">19 kr</span>
                <span className="text-muted-foreground">/mån</span>
                <span className="text-muted-foreground mx-1">·</span>
                <span className="stat-number text-4xl text-foreground">149 kr</span>
                <span className="text-muted-foreground">/år</span>
                <span className="text-[10px] bg-success/10 text-success px-2 py-0.5 rounded-full font-semibold ml-2 uppercase tracking-wide">Spara 35%</span>
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
              <div className="text-5xl mb-4">🐔</div>
              <h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-3">Dina hönor förtjänar det bästa</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
                Gå med 2 500+ svenska hönsägare som redan har full koll. Skapa ett konto på 10 sekunder.
              </p>
              <Button asChild size="lg" className="h-14 px-10 text-lg gap-2 shadow-[0_8px_30px_hsl(var(--primary)/0.4)] hover:scale-[1.02] transition-all">
                <a href="/login?mode=register">
                  Kom igång nu
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
              <p className="text-xs text-muted-foreground mt-4">Helt kostnadsfritt · Avsluta när du vill</p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="relative z-10 border-t border-border py-8 mb-14 sm:mb-0">
        <div className="container max-w-5xl mx-auto px-5 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-base">🥚</span>
              <span className="font-serif text-foreground">Hönsgården</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a href="/blogg" className="hover:text-foreground transition-colors">Blogg</a>
              <span>·</span>
              <a href="/terms" className="hover:text-foreground transition-colors">Villkor & Integritet</a>
              <span>·</span>
              <a href="mailto:support@honsgarden.se" className="text-primary hover:underline">support@honsgarden.se</a>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 Hönsgården
            </p>
          </div>
        </div>
      </footer>

      {/* ═══════ STICKY MOBILE CTA ═══════ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-background/95 backdrop-blur-lg border-t border-border px-4 py-3">
        <Button asChild size="lg" className="w-full h-12 text-base gap-2">
          <a href="/login?mode=register">
            🥚 Kom igång nu
            <ArrowRight className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
