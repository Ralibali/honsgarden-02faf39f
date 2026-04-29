import React, { lazy, Suspense } from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import { useSeo } from '@/hooks/useSeo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  BarChart3,
  Bird,
  Bot,
  CalendarDays,
  Camera,
  Check,
  ClipboardCheck,
  Download,
  Egg,
  Link as LinkIcon,
  ReceiptText,
  ShieldCheck,
  ShoppingBasket,
  Star,
  Users,
  Wallet,
  Wheat,
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import appMockup from '@/assets/app-mockup-hero.png';

const StickyMobileCTA = lazy(() => import('@/components/StickyMobileCTA'));
const LandingFooter = lazy(() => import('@/components/LandingFooter'));
const ActivityPulse = lazy(() => import('@/components/ActivityPulse'));

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

const staggerContainer = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const staggerItem = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const features = [
  { icon: Egg, title: 'Äggloggning', desc: 'Logga dagens ägg på några sekunder och se hur värpningen förändras över tid.', href: '/agglogg' },
  { icon: Bird, title: 'Flock och hönsprofiler', desc: 'Samla namn, ras, bild, anteckningar och historik för varje höna i flocken.', href: '/app-for-honsagare' },
  { icon: ReceiptText, title: 'Agda-säljgenerator', desc: 'Skapa egna säljsidor för ägg med bild, Swish, bokningsförfrågningar, lager och delningslänk.', href: '/login?mode=register', badge: 'NYHET' },
  { icon: BarChart3, title: 'Statistik och insikter', desc: 'Följ trender, topplistor, snitt per höna och utveckling över tid.', href: '/login?mode=register' },
  { icon: CalendarDays, title: 'Hönskalender', desc: 'Håll koll på rutiner, rengöring, kvalsterkontroll, ruggning och säsong.', href: '/honskalender' },
  { icon: Wheat, title: 'Foderkostnad', desc: 'Registrera foderinköp och förstå vad dina ägg faktiskt kostar att producera.', href: '/foderkostnad-hons' },
  { icon: Egg, title: 'Kläckningskalender', desc: 'Följ dag 1 till 21 med milstolpar för lysning, vändning och kläckning.', href: '/klackningskalender' },
  { icon: Bot, title: 'Agda AI', desc: 'Få hjälp, säljtexter och vardagstips baserat på din egen hönsgård och logghistorik.', href: '/login?mode=register', badge: 'PLUS' },
];

const agdaFeatures = [
  { icon: LinkIcon, title: 'Egen försäljningslänk', desc: 'Skapa en enkel länk som honsgarden.se/s/bergs-agg och dela den i Facebookgrupper, SMS eller på gården.' },
  { icon: Camera, title: 'Bild på det du säljer', desc: 'Ta en ny bild eller välj från galleri. Bilden visas som banner på säljsidan.' },
  { icon: Wallet, title: 'Swish och prislista', desc: 'Visa Swishnummer, Swish-meddelande, pris per karta och tydlig prislista.' },
  { icon: ShoppingBasket, title: 'Bokningsförfrågningar', desc: 'Köpare kan skicka namn, kontakt, antal kartor och meddelande direkt via säljsidan.' },
  { icon: ClipboardCheck, title: 'Ordervy i appen', desc: 'Se bokningar, summa, säljlista, kundkontakt och markera betald eller hämtad.' },
  { icon: Download, title: 'Export och kundlista', desc: 'Kopiera kundlista eller exportera bokningar som CSV för Excel eller Google Sheets.' },
];

const agdaSteps = [
  { step: '1', title: 'Skapa säljlista', desc: 'Fyll i rubrik, bild, pris, plats, hämtning och Swish.' },
  { step: '2', title: 'Dela länken', desc: 'Skicka länken i SMS, Messenger eller lokal Facebookgrupp.' },
  { step: '3', title: 'Ta emot förfrågningar', desc: 'Köparen skickar namn, kontakt och antal kartor via säljsidan.' },
  { step: '4', title: 'Följ upp i appen', desc: 'Markera betald, hämtad eller exportera kundlistan.' },
];

const audience = [
  { icon: Bird, title: 'Hobbyhönsägaren', desc: 'För dig som vill logga ägg, följa hönor, hålla koll på hälsa och se tydliga trender.' },
  { icon: ReceiptText, title: 'Du som säljer ägg lokalt', desc: 'För dig som säljer till grannar, kollegor eller lokala grupper och vill ha länk, Swish och bokningar samlat.' },
  { icon: Wheat, title: 'Du som vill förstå kostnaden', desc: 'För dig som vill räkna foderkostnad, se kostnad per ägg och få bättre grepp om ekonomin.' },
];

const trustItems = ['Byggt för svenska hönsägare', 'Fungerar på mobil, iPad och dator', 'Ingen appinstallation krävs', 'Du kan börja gratis', 'Export till CSV', 'Dina data sparas i ditt konto'];

const faqs = [
  { q: 'Vad är Hönsgården?', a: 'Hönsgården är en svensk app för hobbyhönsägare. Du kan logga ägg, följa hönor och flockar, skapa rutiner, räkna foderkostnad, sälja ägg via Agda-säljgeneratorn och få bättre koll på hönsgårdens vardag.' },
  { q: 'Vad är Agda-säljgeneratorn?', a: 'Agda-säljgeneratorn hjälper dig skapa en egen försäljningssida för ägg. Du kan lägga upp bild, pris, Swish, hämtinformation och låta köpare skicka bokningsförfrågningar via en enkel länk.' },
  { q: 'Kan jag se vem som beställt ägg?', a: 'Ja. Bokningsförfrågningar visas inne i appen under Agda sälj. Du ser kundnamn, kontakt, antal kartor, säljlista, summa, status och kan markera betald, hämtad eller avbokad.' },
  { q: 'Kan jag exportera beställningar?', a: 'Ja. Du kan kopiera kundlista och exportera bokningar som CSV, så att de kan öppnas i Excel eller Google Sheets.' },
  { q: 'Fungerar appen i mobilen och på dator?', a: 'Ja. Hönsgården är byggd för mobil, tablet och dator. Du kan logga ute vid hönshuset och hantera säljlistor eller export på större skärm.' },
];

const freeFeatures = ['Äggloggning', 'Upp till 10 hönor', 'Hälsologg', 'Grundstatistik', 'Dagbok', 'Community-forum', 'Agdas Bod – sälj ägg lokalt', 'Fungerar i mobilen'];
const plusFeatures = ['Allt i Gratis', 'Obegränsat antal hönor', 'Agda AI-konsult', 'Väder & AI-råd', 'Foderspårning & kostnad/ägg', 'Ekonomi, intäkter & export', 'Avancerad statistik & trender', 'Kläckningskalender', 'Anpassad dashboard', 'Smarta påminnelser & veckorapport'];

export default function IndexUpdated() {
  useSeo({
    title: 'Hönsgården – ägglogg, hönskalender och Agda-säljgenerator',
    description: 'Hönsgården är en svensk app för hönsägare. Logga ägg, följ flocken, räkna foderkostnad och sälj ägg med Agda-säljgeneratorn.',
    path: '/',
    ogImage: 'https://honsgarden.se/blog-images/hens-garden.jpg',
    jsonLd: [
      { '@type': 'SoftwareApplication', name: 'Hönsgården', applicationCategory: 'LifestyleApplication', operatingSystem: 'Web, iOS, Android', description: 'Svensk app för hönsägare med ägglogg, hönsprofiler, hönskalender, foderkostnad, statistik och Agda-säljgenerator.', offers: { '@type': 'Offer', price: '0', priceCurrency: 'SEK' } },
      { '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
  });

  return (
    <main id="main-content" className="min-h-screen bg-background overflow-x-hidden">
      <Suspense fallback={null}><StickyMobileCTA /></Suspense>
      <LandingNavbar />

      <section className="relative flex flex-col justify-center pt-24 pb-12 sm:min-h-screen sm:pt-16 sm:pb-10" style={{ background: 'linear-gradient(135deg, #f5f0e8 0%, #eef5ec 50%, #f5f0e8 100%)' }}>
        <div className="container max-w-6xl mx-auto px-5 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-10 lg:gap-14 items-center">
            <div className="text-center lg:text-left">
              <motion.div {...fadeUp(0)} className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1">Svensk app för hobbyhönsägare</Badge>
                <Badge variant="secondary" className="bg-warning/15 text-warning-foreground border-warning/30 text-xs px-3 py-1">Nyhet: Agda-säljgenerator</Badge>
                <Badge variant="secondary" className="bg-background/70 text-foreground border-border text-xs px-3 py-1">Gratis att börja</Badge>
              </motion.div>
              <motion.h1 {...fadeUp(0.05)} className="font-serif text-[2rem] sm:text-5xl md:text-6xl text-foreground leading-[1.08] mb-4 sm:mb-5">
                Få riktig koll på dina hönor – <span className="text-primary">och sälj ägg enklare</span>
              </motion.h1>
              <motion.p {...fadeUp(0.08)} className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-5 sm:mb-6">
                Hönsgården hjälper dig logga ägg, följa flocken, räkna foderkostnad och hantera vardagen i hönshuset. Med Agda-säljgeneratorn kan du skapa egna säljsidor med bild, Swish, bokningsförfrågningar och lagerkoll.
              </motion.p>
              <motion.div {...fadeUp(0.12)} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-5">
                <Button asChild size="lg" className="h-12 sm:h-13 px-8 text-base gap-2 shadow-[0_8px_30px_hsl(var(--primary)/0.3)]"><a href="/login?mode=register">Skapa konto gratis <ArrowRight className="h-4 w-4" /></a></Button>
                <Button asChild variant="outline" size="lg" className="h-12 sm:h-13 px-8 text-base border-primary/30 text-primary hover:bg-primary/5"><a href="/login?mode=register">Testa Agda sälj</a></Button>
              </motion.div>
              <motion.div {...fadeUp(0.15)} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-2xl mx-auto lg:mx-0">
                {['Ägglogg på sekunder', 'Säljsida med Swish', 'Bokningar och export'].map((item) => <div key={item} className="flex items-center justify-center lg:justify-start gap-2 rounded-xl bg-background/70 border border-border/50 px-3 py-2 text-sm text-foreground"><Check className="h-4 w-4 text-primary shrink-0" />{item}</div>)}
              </motion.div>
              <motion.div {...fadeUp(0.18)} className="mt-4 flex justify-center lg:justify-start"><Suspense fallback={null}><ActivityPulse /></Suspense></motion.div>
            </div>
            <motion.div {...fadeUp(0.12)} className="flex justify-center lg:justify-end">
              <div className="relative"><div className="absolute -inset-6 rounded-[3rem] bg-primary/10 blur-3xl" /><div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-background max-w-[280px] sm:max-w-[340px] border border-border/50"><img src={appMockup} alt="Hönsgården app" width={500} height={640} className="w-full" loading="eager" decoding="async" /></div></div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-background">
        <div className="container max-w-6xl mx-auto px-5 sm:px-6">
          <motion.div {...fadeUp()} className="text-center max-w-3xl mx-auto mb-10"><h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-3">Vad löser Hönsgården?</h2><p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Efter ett tag med höns är det inte själva äggen som är svåra. Det svåra är att komma ihåg allt runt omkring: vem värper, vad fodret kostar, när du gjorde rent och hur du smidigast säljer överskottet.</p></motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {['Du minns inte exakt när äggproduktionen började gå ner.', 'Du vet inte vad fodret faktiskt kostar per ägg.', 'Du har hälsoanteckningar i mobilen, lappar och huvudet samtidigt.', 'Du vill sälja ägg men saknar en enkel sida för pris, Swish, bild och bokningar.'].map((problem) => <Card key={problem} className="border-border shadow-sm bg-card"><CardContent className="p-5 flex gap-3 items-start"><span className="text-xl">🤔</span><p className="text-sm sm:text-base text-foreground leading-relaxed">{problem}</p></CardContent></Card>)}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-secondary/20">
        <div className="container max-w-6xl mx-auto px-5 sm:px-6">
          <motion.div {...fadeUp()} className="text-center max-w-3xl mx-auto mb-12"><Badge className="mb-3 bg-primary/10 text-primary border-primary/20">Nyhet</Badge><h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-3">Agda-säljgeneratorn gör äggförsäljning enklare</h2><p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Skapa en egen säljsida för dina ägg, dela länken i en lokal grupp och samla bokningsförfrågningar direkt i Hönsgården.</p></motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {agdaFeatures.map((f) => <motion.div key={f.title} variants={staggerItem} className="p-6 rounded-2xl bg-card border border-border shadow-sm"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><f.icon className="h-5 w-5 text-primary" /></div><h3 className="font-serif text-lg text-foreground mb-1.5">{f.title}</h3><p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p></motion.div>)}
          </motion.div>
          <motion.div {...fadeUp(0.1)} className="mt-10 rounded-3xl bg-background border border-primary/15 p-6 sm:p-8 text-center shadow-sm"><p className="text-sm text-muted-foreground mb-2">Exempel på länk</p><p className="font-mono text-sm sm:text-base text-foreground break-all bg-muted/40 rounded-xl px-4 py-3 mb-5">https://honsgarden.se/s/bergs-agg</p><Button asChild size="lg" className="gap-2"><a href="/login?mode=register">Skapa din första säljsida <ArrowRight className="h-4 w-4" /></a></Button></motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-background">
        <div className="container max-w-6xl mx-auto px-5 sm:px-6">
          <motion.div {...fadeUp()} className="text-center max-w-3xl mx-auto mb-12"><h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-3">Så fungerar Agda i praktiken</h2><p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Från första säljlistan till uppföljning av betalning och hämtning.</p></motion.div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {agdaSteps.map((s) => <Card key={s.step} className="border-primary/15 shadow-sm"><CardContent className="p-5 text-center"><span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold mb-3">{s.step}</span><h3 className="font-serif text-base text-foreground mb-2">{s.title}</h3><p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p></CardContent></Card>)}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-secondary/20">
        <div className="container max-w-6xl mx-auto px-5 sm:px-6">
          <motion.div {...fadeUp()} className="text-center max-w-3xl mx-auto mb-12"><h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-3">För vem passar Hönsgården?</h2><p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Oavsett om du har några få hönor eller säljer ägg lokalt får du bättre ordning.</p></motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {audience.map((a) => <Card key={a.title} className="shadow-sm"><CardContent className="p-6"><div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center mb-4"><a.icon className="h-5 w-5 text-primary" /></div><h3 className="font-serif text-lg text-foreground mb-2">{a.title}</h3><p className="text-sm text-muted-foreground leading-relaxed">{a.desc}</p></CardContent></Card>)}
          </div>
        </div>
      </section>

      <section id="funktioner" className="relative z-10 py-20 sm:py-28 bg-background">
        <div className="container max-w-6xl mx-auto px-5 sm:px-6">
          <motion.div {...fadeUp()} className="text-center mb-12 sm:mb-16"><h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-3">Funktioner som hönsägare faktiskt använder</h2><p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">Hönsgården är byggd för den riktiga hönsvardagen: loggning, flock, foder, ekonomi, påminnelser, AI och försäljning.</p></motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {features.map((f) => <motion.a key={f.title} href={f.href} variants={staggerItem} className="relative p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">{f.badge && <Badge className="absolute top-4 right-4 bg-warning/20 text-warning-foreground border-warning/30 text-[10px] font-bold">{f.badge}</Badge>}<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><f.icon className="h-5 w-5 text-primary" /></div><h3 className="font-serif text-lg text-foreground mb-1.5">{f.title}</h3><p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p></motion.a>)}
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-secondary/20">
        <div className="container max-w-5xl mx-auto px-5 sm:px-6">
          <motion.div {...fadeUp()} className="text-center mb-10"><h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-3">Tryggt och enkelt att komma igång</h2></motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {trustItems.map((item) => <div key={item} className="rounded-2xl bg-card border border-border px-4 py-3 flex items-center gap-2 text-sm text-foreground"><ShieldCheck className="h-4 w-4 text-primary shrink-0" />{item}</div>)}
          </div>
        </div>
      </section>

      <section id="priser" className="relative z-10 py-20 sm:py-28 bg-background">
        <div className="container max-w-5xl mx-auto px-5 sm:px-6">
          <motion.div {...fadeUp()} className="text-center mb-10"><h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-3">Börja gratis – uppgradera när flocken växer</h2><p className="text-muted-foreground text-sm sm:text-base">Det ska vara enkelt att börja få ordning på hönsgården.</p></motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <PricingCard title="Gratis" price="0 kr" desc="För att komma igång ordentligt" features={freeFeatures} cta="Skapa konto gratis" />
            <PricingCard title="Plus – Månad" price="19 kr/mån" desc="För mer statistik och smartare stöd" features={plusFeatures} cta="Prova Plus gratis" />
            <PricingCard highlighted title="Plus – År" price="149 kr/år" desc="Bästa värdet för aktiva hönsägare" features={plusFeatures} cta="Välj årsplan" />
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 sm:py-28" style={{ background: 'linear-gradient(180deg, hsl(var(--background)) 0%, #f5f0e8 50%, hsl(var(--background)) 100%)' }}>
        <div className="container max-w-2xl mx-auto px-5 sm:px-6"><motion.div {...fadeUp()} className="text-center mb-10"><h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-2">Vanliga frågor</h2></motion.div><motion.div {...fadeUp(0.1)}><Accordion type="single" collapsible className="space-y-2">{faqs.map((f, i) => <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl overflow-hidden px-1"><AccordionTrigger className="text-sm sm:text-base font-medium text-foreground hover:no-underline px-4 text-left">{f.q}</AccordionTrigger><AccordionContent className="text-sm text-muted-foreground px-4 pb-4 leading-relaxed">{f.a}</AccordionContent></AccordionItem>)}</Accordion></motion.div></div>
      </section>

      <section className="relative z-10 pb-10 sm:pb-16">
        <div className="container max-w-3xl mx-auto px-5 sm:px-6"><motion.div {...fadeUp()} className="rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-warning/5 border border-primary/15 p-8 sm:p-12 text-center"><div className="text-5xl mb-4">🐔</div><h2 className="font-serif text-2xl sm:text-4xl text-foreground mb-3">Flocken berättar mer än man tror</h2><p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">När du loggar ägg, foder, hälsa, försäljning och rutiner får du till slut något mycket bättre än magkänsla: du får riktig erfarenhet sparad över tid.</p><Button asChild size="lg" className="h-14 px-10 text-lg gap-2 shadow-[0_8px_30px_hsl(var(--primary)/0.4)] hover:scale-[1.02] transition-transform"><a href="/login?mode=register">Skapa konto gratis <ArrowRight className="h-5 w-5" /></a></Button><p className="text-xs text-muted-foreground mt-4">Börja gratis · Mobilvänligt · Byggt för svenska hönsägare</p></motion.div></div>
      </section>

      <Suspense fallback={null}><LandingFooter /></Suspense>
    </main>
  );
}

function PricingCard({ title, price, desc, features, cta, highlighted = false }: { title: string; price: string; desc: string; features: string[]; cta: string; highlighted?: boolean }) {
  return (
    <motion.div {...fadeUp(highlighted ? 0.2 : 0.1)} className={`relative p-6 sm:p-8 rounded-2xl shadow-sm ${highlighted ? 'border-2 border-primary bg-primary/5' : 'bg-card border border-border'}`}>
      {highlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge className="bg-primary text-primary-foreground text-xs px-3 py-1">Spara 35%</Badge></div>}
      <h3 className="font-serif text-xl text-foreground mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm mb-6">{desc}</p>
      <p className="text-4xl font-bold text-foreground mb-6">{price}</p>
      <ul className="space-y-3 mb-8">{features.map((f) => <li key={f} className="flex items-center gap-2.5 text-sm text-foreground"><Check className="h-4 w-4 text-primary shrink-0" />{f}</li>)}</ul>
      <Button asChild variant={highlighted ? 'default' : 'outline'} className="w-full h-11"><a href="/login?mode=register">{cta}</a></Button>
    </motion.div>
  );
}
