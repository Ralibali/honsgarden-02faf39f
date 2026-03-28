import React, { useState } from 'react';
import VisitorWelcomePopup from '@/components/VisitorWelcomePopup';
import StickyMobileCTA from '@/components/StickyMobileCTA';
import NewsletterSignup from '@/components/NewsletterSignup';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import { useSeo } from '@/hooks/useSeo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Egg, ArrowRight, BarChart2, Bird, Heart, Star, Check, Bot,
  Smartphone, Wheat, ChevronDown,
} from 'lucide-react';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { motion } from 'framer-motion';

/* ─── Animation helpers ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
});

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

/* ─── Data ─── */
const features = [
  { icon: Egg, title: 'Äggloggning', desc: 'Logga dagens ägg på 5 sekunder. Se trender per höna, per vecka, per år.' },
  { icon: Heart, title: 'Hälsoövervakning', desc: 'Spåra symptom, behandlingar och veterinärbesök. Fånga problem tidigt.' },
  { icon: Wheat, title: 'Foderökonomi', desc: 'Håll koll på foderkostnader och beräkna kostnaden per ägg automatiskt.' },
  { icon: Bot, title: 'AI-karaktären Agda', desc: 'Ställ frågor om dina höns. Agda svarar baserat på din egna logghistorik.', badge: 'PLUS' },
  { icon: BarChart2, title: 'Statistik & rapporter', desc: 'Visualisera äggproduktion, hälsohistorik och ekonomi i tydliga diagram.' },
  { icon: Smartphone, title: 'Fungerar offline', desc: 'Installera som app. Logga direkt i hönshuset utan internetuppkoppling.' },
];

const testimonials = [
  { text: 'Äntligen vet jag vilken höna som slutat värpa. Tre månaders data – och svaret stod klart.', name: 'Karin S.', meta: '8 hönor, Dalarna' },
  { text: 'Agda svarade på min fråga om fjädertapp på 10 sekunder. Bättre än att googla i en timme.', name: 'Lars M.', meta: '14 hönor, Skåne' },
  { text: 'Jag beräknade att mina ägg kostar 1,80 kr styck att producera. Det visste jag aldrig förut.', name: 'Anna W.', meta: '6 hönor, Uppland' },
];

const faqs = [
  { q: 'Är Hönsgården verkligen gratis?', a: 'Ja, grundversionen är gratis utan tidsgräns. Du kan logga ägg, spåra hälsa och hantera upp till 10 hönor helt kostnadsfritt.' },
  { q: 'Hur många hönor kan jag ha i gratisversionen?', a: 'Upp till 10 hönor. Plus ger obegränsat antal.' },
  { q: 'Vad är AI-karaktären Agda?', a: 'Agda är din digitala hönskonsult som svarar på frågor baserade på din logghistorik – tillgänglig för Plus-medlemmar.' },
  { q: 'Fungerar appen offline?', a: 'Ja. Installera som PWA och logga direkt i hönshuset utan internet.' },
  { q: 'Behöver jag kreditkort för att prova Plus?', a: 'Nej. 14 dagars gratis provperiod utan kort.' },
];

const freeFeatures = ['Äggloggning', 'Upp till 10 hönor', 'Hälsologg', 'Grundstatistik'];
const plusFeatures = ['Allt i gratis', 'Obegränsat antal hönor', 'AI-karaktären Agda', 'Avancerad ekonomirapport', 'Export till CSV', 'Prioriterad support'];

/* ─── Decorative hen SVG ─── */
function HenIllustration() {
  return (
    <svg viewBox="0 0 200 200" fill="none" className="w-64 h-64 hidden lg:block opacity-25" aria-hidden="true">
      <path d="M100 30c-8 0-14 6-14 14 0 5 3 9 7 12l-3 8c-20 4-35 20-35 40 0 22 20 40 45 40s45-18 45-40c0-20-15-36-35-40l-3-8c4-3 7-7 7-12 0-8-6-14-14-14z" stroke="#3a6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="93" cy="40" r="2" fill="#3a6b35" />
      <path d="M105 38c3-3 8-2 8 2s-5 6-8 4" stroke="#3a6b35" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M70 104c-10 8-15 20-10 28s18 8 25 2" stroke="#3a6b35" strokeWidth="2" strokeLinecap="round" />
      <path d="M130 104c10 8 15 20 10 28s-18 8-25 2" stroke="#3a6b35" strokeWidth="2" strokeLinecap="round" />
      <path d="M85 144v20M100 144v24M115 144v20" stroke="#3a6b35" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Index() {
  const [billingYearly, setBillingYearly] = useState(true);

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
    ],
  });

  return (
    <div id="main-content" className="min-h-screen bg-background overflow-x-hidden">
      <VisitorWelcomePopup />
      <StickyMobileCTA />
      <LandingNavbar />

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-screen flex items-center pt-16"
        style={{ background: 'linear-gradient(135deg, #f5f0e8 0%, #eef5ec 50%, #f5f0e8 100%)' }}
      >
        {/* Subtle hero image texture */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.08] pointer-events-none"
          style={{ backgroundImage: 'url(/hero-home.jpg)' }}
          aria-hidden="true"
        />

        <div className="container max-w-6xl mx-auto px-5 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.h1
                {...fadeUp(0)}
                className="font-serif text-4xl sm:text-5xl md:text-7xl text-foreground leading-[1.08] mb-5"
              >
                Din hönsgård – loggad, dag för dag
              </motion.h1>

              <motion.p
                {...fadeUp(0.2)}
                className="text-base sm:text-xl text-muted-foreground max-w-lg leading-relaxed mb-6"
              >
                Håll koll på ägg, hönor, foder och ekonomi. Gratis för alltid – uppgradera när du vill.
              </motion.p>

              <motion.div {...fadeUp(0.35)} className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                <span>🐓</span>
                <span>Används av hönsägare över hela Sverige</span>
              </motion.div>

              <motion.div {...fadeUp(0.5)} className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="h-13 px-8 text-base gap-2 shadow-[0_8px_30px_hsl(var(--primary)/0.3)]">
                  <a href="/login?mode=register">
                    Kom igång gratis
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-13 px-8 text-base border-primary/30 text-primary hover:bg-primary/5">
                  <a href="#funktioner">Se hur det fungerar</a>
                </Button>
              </motion.div>
            </div>

            {/* Decorative hen illustration (desktop only) */}
            <motion.div {...fadeUp(0.4)} className="flex justify-center">
              <HenIllustration />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <ChevronDown className="h-6 w-6 text-muted-foreground/40" />
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section id="funktioner" className="relative z-10 py-20 sm:py-28">
        <div className="container max-w-6xl mx-auto px-5 sm:px-6">
          <motion.div {...fadeUp()} className="text-center mb-12 sm:mb-16">
            <h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-3">
              Allt du behöver för att sköta din hönsgård smartare
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={staggerItem}
                whileHover={{ scale: 1.01, boxShadow: '0 10px 30px -8px rgba(0,0,0,0.1)' }}
                className="relative p-6 rounded-2xl bg-white dark:bg-card border border-border shadow-sm transition-all duration-200"
              >
                {f.badge && (
                  <Badge className="absolute top-4 right-4 bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold">
                    {f.badge}
                  </Badge>
                )}
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-serif text-lg text-foreground mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ PRICING ═══════ */}
      <section id="priser" className="relative z-10 py-20 sm:py-28 bg-card/50">
        <div className="container max-w-4xl mx-auto px-5 sm:px-6">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-3">Enkel prissättning</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Börja gratis. Uppgradera när du vill.</p>
          </motion.div>

          {/* Billing toggle */}
          <motion.div {...fadeUp(0.1)} className="flex items-center justify-center gap-3 mb-10">
            <span className={`text-sm ${!billingYearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>Månadsvis</span>
            <button
              onClick={() => setBillingYearly(!billingYearly)}
              className={`relative w-12 h-6 rounded-full transition-colors ${billingYearly ? 'bg-primary' : 'bg-muted'}`}
              aria-label="Växla mellan månads- och årsbetalning"
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${billingYearly ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
            <span className={`text-sm ${billingYearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Årsvis <span className="text-xs text-success font-semibold">Spara 35%</span>
            </span>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Free */}
            <motion.div
              {...fadeUp(0.15)}
              whileInView={{ scale: 1 }}
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-card border border-border shadow-sm"
            >
              <h3 className="font-serif text-xl text-foreground mb-1">Gratis</h3>
              <p className="text-muted-foreground text-sm mb-6">Perfekt för att komma igång</p>
              <p className="text-4xl font-bold text-foreground mb-6">0 kr<span className="text-sm font-normal text-muted-foreground">/mån</span></p>
              <ul className="space-y-3 mb-8">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="w-full h-11">
                <a href="/login?mode=register">Kom igång gratis</a>
              </Button>
            </motion.div>

            {/* Plus */}
            <motion.div
              {...fadeUp(0.2)}
              whileInView={{ scale: 1 }}
              className="relative p-6 sm:p-8 rounded-2xl border-2 border-primary shadow-md"
              style={{ background: '#f0f7ee' }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground animate-pulse text-xs px-3 py-1">
                  Mest populär
                </Badge>
              </div>
              <h3 className="font-serif text-xl text-foreground mb-1">Plus</h3>
              <p className="text-muted-foreground text-sm mb-6">För den seriösa hönsägaren</p>
              <p className="text-4xl font-bold text-foreground mb-1">
                {billingYearly ? '699 kr' : '89 kr'}
                <span className="text-sm font-normal text-muted-foreground">/{billingYearly ? 'år' : 'mån'}</span>
              </p>
              {billingYearly && <p className="text-xs text-muted-foreground mb-6">Motsvarar 58 kr/mån</p>}
              {!billingYearly && <p className="text-xs text-muted-foreground mb-6">&nbsp;</p>}
              <ul className="space-y-3 mb-8">
                {plusFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full h-11 shadow-[0_8px_30px_hsl(var(--primary)/0.3)]">
                <a href="/login?mode=register">Prova Plus 14 dagar gratis</a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="relative z-10 py-20 sm:py-28" style={{ background: '#f5f0e8' }}>
        <div className="container max-w-5xl mx-auto px-5 sm:px-6">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-2">Vad svenska hönsägare säger</h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={staggerItem}
                className="p-6 rounded-2xl bg-white dark:bg-card border border-border shadow-sm"
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.meta}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="relative z-10 py-20 sm:py-28">
        <div className="container max-w-2xl mx-auto px-5 sm:px-6">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-2">Vanliga frågor</h2>
          </motion.div>

          <motion.div {...fadeUp(0.1)}>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl overflow-hidden px-1">
                  <AccordionTrigger className="text-sm sm:text-base font-medium text-foreground hover:no-underline px-4">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground px-4 pb-4">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* ═══════ NEWSLETTER ═══════ */}
      <section className="relative z-10 py-16">
        <div className="container max-w-3xl mx-auto px-5 sm:px-6">
          <NewsletterSignup />
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className="relative z-10 pb-20">
        <div className="container max-w-3xl mx-auto px-5 sm:px-6">
          <motion.div
            {...fadeUp()}
            className="rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-warning/5 border border-primary/15 p-8 sm:p-12 text-center"
          >
            <div className="text-5xl mb-4">🐔</div>
            <h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-3">Dina hönor förtjänar det bästa</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
              Gå med tusentals svenska hönsägare som redan har full koll. Skapa ett konto på 10 sekunder.
            </p>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Button asChild size="lg" className="h-14 px-10 text-lg gap-2 shadow-[0_8px_30px_hsl(var(--primary)/0.4)]">
                <a href="/login?mode=register">
                  Kom igång nu
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
            </motion.div>
            <p className="text-xs text-muted-foreground mt-4">Helt kostnadsfritt · Avsluta när du vill</p>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
