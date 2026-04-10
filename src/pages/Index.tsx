import React from 'react';
import StickyMobileCTA from '@/components/StickyMobileCTA';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import { useSeo } from '@/hooks/useSeo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Egg, ArrowRight, ChartBar as BarChart2, Bird, Heart, Star, Check, Bot, Smartphone, Wheat, ChevronDown, Calculator } from 'lucide-react';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import appMockup from '@/assets/app-mockup-hero.png';
import ActivityPulse from '@/components/ActivityPulse';

/* ─── Animation helpers ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
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
  { q: 'Behöver jag kreditkort för att prova Plus?', a: 'Nej. Sju dagars gratis provperiod utan kort.' },
];

const freeFeatures = ['Äggloggning', 'Upp till 10 hönor', 'Hälsologg', 'Grundstatistik', 'Dagbok', 'Fungerar offline'];
const plusFeatures = ['Allt i Gratis', 'Obegränsat antal hönor', 'AI-karaktären Agda', 'Avancerad statistik', 'Smarta prognoser', 'Automatiska påminnelser', 'Prioriterad support'];

export default function Index() {
  useSeo({
    title: 'Hönsgården – Äggloggare & App för Hobbyuppfödare av Höns',
    description: 'Logga ägg, spåra hälsa och räkna ut din foderkostnad. Gratis app för Sveriges 21 000+ hobbyhönsägare. Fungerar offline. Kom igång på 2 minuter.',
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
    <main id="main-content" className="min-h-screen bg-background overflow-x-hidden">
      <StickyMobileCTA />
      <LandingNavbar />

      {/* ═══════ HERO ═══════ */}
      <section className="relative flex flex-col justify-center pt-24 pb-10 sm:min-h-screen sm:pt-16 sm:pb-8"
        style={{ background: 'linear-gradient(135deg, #f5f0e8 0%, #eef5ec 50%, #f5f0e8 100%)' }}
      >

        <div className="container max-w-6xl mx-auto px-5 sm:px-6 relative z-10">
          <div className="max-w-2xl mx-auto text-center lg:text-left lg:mx-0 lg:max-w-3xl">
              <motion.div {...fadeUp(0)} className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1">
                  ✅ Gratis – ingen bindningstid
                </Badge>
              </motion.div>

              <motion.h1
                {...fadeUp(0.05)}
                className="font-serif text-[2rem] sm:text-5xl md:text-6xl text-foreground leading-[1.08] mb-3 sm:mb-5"
              >
                Ha koll på din flock – <span className="text-primary">från ägg till ekonomi</span>
              </motion.h1>

              <motion.p
                {...fadeUp(0.08)}
                className="text-sm sm:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed mb-4 sm:mb-6"
              >
                Logga ägg, spåra hälsa och räkna foderkostnad. På 5 sekunder – direkt i hönshuset.
              </motion.p>

              <motion.div {...fadeUp(0.12)} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-4">
                <Button asChild size="lg" className="h-12 sm:h-13 px-8 text-base gap-2 shadow-[0_8px_30px_hsl(var(--primary)/0.3)]">
                  <a href="/login?mode=register">
                    Skapa konto gratis
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 sm:h-13 px-8 text-base border-primary/30 text-primary hover:bg-primary/5">
                  <a href="#sa-funkar-det">Se hur det fungerar</a>
                </Button>
              </motion.div>

              <motion.div {...fadeUp(0.15)} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-3 w-3 fill-warning text-warning" />
                  ))}
                  <span className="ml-1 font-medium text-foreground">4.9/5</span>
                </span>
                <span className="hidden sm:inline">·</span>
                <span>Inget kreditkort · Konto på 10 sekunder</span>
              </motion.div>

              <motion.div {...fadeUp(0.18)} className="mt-3 flex justify-center lg:justify-start">
                <ActivityPulse />
              </motion.div>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 animate-bounce hidden sm:block">
          <ChevronDown className="h-6 w-6 text-muted-foreground/40" />
        </div>
      </section>

      {/* ═══════ HOW IT WORKS (3 steps) ═══════ */}
      <section id="sa-funkar-det" className="relative z-10 py-16 sm:py-20"
        style={{ background: 'linear-gradient(180deg, #f5f0e8 0%, #eef5ec 40%, hsl(var(--background)) 100%)' }}
      >
        <div className="container max-w-4xl mx-auto px-5 sm:px-6">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-2">Så enkelt kommer du igång</h2>
            <p className="text-sm text-muted-foreground">Tre steg – ingen app-nedladdning behövs</p>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="mb-10 sm:mb-12 flex justify-center">
            <img
              src={appMockup}
              alt="Hönsgården app – dashboard med äggloggning, statistik och väder"
              width={500}
              height={640}
              className="w-full max-w-[320px] sm:max-w-[380px]"
              loading="lazy"
            />
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5"
          >
            {[
              { step: '1', emoji: '📝', title: 'Skapa konto', desc: 'E-post och lösenord – klart på 10 sekunder.' },
              { step: '2', emoji: '🥚', title: 'Logga ditt första ägg', desc: 'Tryck på "+"-knappen och ange antal. Klart!' },
              { step: '3', emoji: '📊', title: 'Följ trender', desc: 'Se statistik, kostnader och hälsa – allt på ett ställe.' },
            ].map((s) => (
              <motion.div key={s.step} variants={staggerItem} className="text-center p-6 rounded-2xl bg-background border border-border shadow-sm">
                <span className="text-3xl mb-3 block">{s.emoji}</span>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold mb-2">{s.step}</span>
                <h3 className="font-serif text-base text-foreground mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div {...fadeUp(0.3)} className="text-center mt-8">
            <Button asChild size="lg" className="h-12 px-8 text-base gap-2">
              <a href="/login?mode=register">
                Prova nu – det är gratis
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section id="funktioner" className="relative z-10 py-20 sm:py-28"
        style={{ background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--secondary)/0.3) 100%)' }}
      >
        <div className="container max-w-6xl mx-auto px-5 sm:px-6">
          <motion.div {...fadeUp()} className="text-center mb-12 sm:mb-16">
            <h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-3">
              Allt du behöver för din hönsgård
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Från äggloggning till foderkostnad – sex kraftfulla verktyg i en app.
            </p>
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
                className="relative p-6 rounded-2xl bg-card border border-border shadow-sm transition-all duration-200"
              >
                {f.badge && (
                  <Badge className="absolute top-4 right-4 bg-warning/20 text-warning-foreground border-warning/30 text-[10px] font-bold">
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

          {/* CTA after features */}
          <motion.div {...fadeUp(0.3)} className="text-center mt-10">
            <p className="text-sm text-muted-foreground mb-4">Alla dessa verktyg – helt gratis att börja med</p>
            <Button asChild size="lg" className="h-12 px-8 text-base gap-2">
              <a href="/login?mode=register">
                Logga ditt första ägg – gratis
                <Egg className="h-4 w-4" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS (moved BEFORE pricing) ═══════ */}
      <section className="relative z-10 py-20 sm:py-28 bg-secondary/50">
        <div className="container max-w-5xl mx-auto px-5 sm:px-6">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-2">Vad hönsägare säger</h2>
            <p className="text-sm text-muted-foreground">Omdömen från riktiga användare</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                {...fadeUp(i * 0.1)}
                className="p-6 rounded-2xl bg-card border border-border shadow-sm"
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.meta}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PRICING (now with free tier) ═══════ */}
      <section id="priser" className="relative z-10 py-20 sm:py-28 bg-card/50">
        <div className="container max-w-5xl mx-auto px-5 sm:px-6">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-3">Välj den plan som passar dig</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Börja gratis – uppgradera när du vill ha mer.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Gratis */}
            <motion.div
              {...fadeUp(0.1)}
              className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-sm"
            >
              <h3 className="font-serif text-xl text-foreground mb-1">Gratis</h3>
              <p className="text-muted-foreground text-sm mb-6">Allt du behöver för att börja</p>
              <p className="text-4xl font-bold text-foreground mb-1">0 kr</p>
              <p className="text-xs text-muted-foreground mb-6">Ingen tidsgräns</p>
              <ul className="space-y-3 mb-8">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="w-full h-11">
                <a href="/login?mode=register">Skapa konto gratis</a>
              </Button>
            </motion.div>

            {/* Månadsplan */}
            <motion.div
              {...fadeUp(0.15)}
              className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-sm"
            >
              <h3 className="font-serif text-xl text-foreground mb-1">Plus – Månad</h3>
              <p className="text-muted-foreground text-sm mb-6">Flexibelt, ingen bindningstid</p>
              <p className="text-4xl font-bold text-foreground mb-1">19 kr<span className="text-sm font-normal text-muted-foreground">/mån</span></p>
              <p className="text-xs text-primary font-medium mb-6">🎁 Sju dagars gratis provperiod – starta idag</p>
              <ul className="space-y-3 mb-8">
                {plusFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="w-full h-11">
                <a href="/login?mode=register">Prova 7 dagar gratis</a>
              </Button>
            </motion.div>

            {/* Årsplan */}
            <motion.div
              {...fadeUp(0.2)}
              className="relative p-6 sm:p-8 rounded-2xl border-2 border-primary shadow-md bg-primary/5"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground animate-pulse text-xs px-3 py-1">
                  Spara 35%
                </Badge>
              </div>
              <h3 className="font-serif text-xl text-foreground mb-1">Plus – År</h3>
              <p className="text-muted-foreground text-sm mb-6">Bästa värdet – bara 12 kr/mån</p>
              <p className="text-4xl font-bold text-foreground mb-1">
                149 kr
                <span className="text-sm font-normal text-muted-foreground">/år</span>
              </p>
              <p className="text-xs text-muted-foreground mb-6">228 kr → du sparar 79 kr per år</p>
              <ul className="space-y-3 mb-8">
                {plusFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full h-11 text-sm shadow-[0_8px_30px_hsl(var(--primary)/0.3)]">
                <a href="/login?mode=register">Välj årsplan – 149 kr</a>
              </Button>
            </motion.div>
          </div>
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
              Börja logga ägg, håll koll på flocken och se om du går plus eller minus. Helt gratis.
            </p>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Button asChild size="lg" className="h-14 px-10 text-lg gap-2 shadow-[0_8px_30px_hsl(var(--primary)/0.4)]">
                <a href="/login?mode=register">
                  Skapa konto på 10 sekunder
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
            </motion.div>
            <p className="text-xs text-muted-foreground mt-4">Helt kostnadsfritt · Avsluta när du vill</p>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
