import React, { lazy, Suspense } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useSeo } from '@/hooks/useSeo';
import LandingNavbar from '@/components/LandingNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight, Check, MapPin, ShoppingBag, Megaphone, CalendarClock, CreditCard, Egg,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ORTER, getOrt } from '@/data/saljaAggOrter';

const LandingFooter = lazy(() => import('@/components/LandingFooter'));

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5, delay, ease: 'easeOut' as const },
});

const steps = [
  { icon: ShoppingBag, title: 'Skapa din säljsida', body: 'Lägg upp pris, antal kartor och hämtadress.' },
  { icon: Megaphone, title: 'Dela länken lokalt', body: 'Sprid den i lokala Facebook-grupper, på Blocket eller i bygdebrevet.' },
  { icon: CalendarClock, title: 'Köpare bokar själva', body: 'De väljer dag och antal – du får mejl och notis direkt.' },
  { icon: CreditCard, title: 'Få betalt med Swish', body: 'Pengarna går rakt till ditt konto utan mellanhand.' },
];

export default function SaljaAggOrt() {
  const { ort: ortSlug } = useParams<{ ort: string }>();
  const ort = ortSlug ? getOrt(ortSlug) : undefined;

  if (!ortSlug || !ort) {
    return <Navigate to="/salja-agg" replace />;
  }

  const title = `Sälja ägg i ${ort.name} – gratis säljsida med Swish | Hönsgården`;
  const description = `Sälj dina ägg lokalt i ${ort.name} (${ort.lan}). Skapa en gratis säljsida på 2 minuter, ta emot bokningar och få betalt direkt via Swish – utan avgifter eller mellanhand.`;

  const jsonLd = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Hönsgården', item: 'https://honsgarden.se/' },
        { '@type': 'ListItem', position: 2, name: 'Sälja ägg', item: 'https://honsgarden.se/salja-agg' },
        { '@type': 'ListItem', position: 3, name: ort.name, item: `https://honsgarden.se/salja-agg/${ort.slug}` },
      ],
    },
    {
      '@type': 'Service',
      name: `Sälja ägg i ${ort.name}`,
      areaServed: { '@type': 'City', name: ort.name, address: { '@type': 'PostalAddress', addressRegion: ort.lan, addressCountry: 'SE' } },
      provider: { '@type': 'Organization', name: 'Hönsgården', url: 'https://honsgarden.se' },
      description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'SEK' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `Hur säljer jag ägg lokalt i ${ort.name}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Med Hönsgården skapar du en gratis säljsida på 2 minuter. Du anger pris och hämtadress i ${ort.name} och delar länken med köpare. De bokar själva och betalar via Swish.`,
          },
        },
        {
          '@type': 'Question',
          name: `Vad får man för ägg i ${ort.name}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Priset varierar men ligger oftast mellan 35 och 60 kr per förpackning om sex ägg, beroende på efterfrågan i ${ort.name} och om hönsen är frigående. Du sätter själv ditt pris.`,
          },
        },
        {
          '@type': 'Question',
          name: 'Krävs det tillstånd för att sälja ägg?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'För småskalig försäljning direkt från gård i Sverige (under 350 höns) räcker det oftast att registrera primärproduktion hos Länsstyrelsen. Inga ytterligare tillstånd behövs för Hönsgårdens säljmodul.',
          },
        },
      ],
    },
  ];

  useSeo({
    title,
    description,
    path: `/salja-agg/${ort.slug}`,
    ogType: 'website',
    ogImage: '/og-image.jpg',
    ogImageAlt: `Sälja ägg lokalt i ${ort.name}`,
    jsonLd,
  });

  const narliggande = (ort.narliggande ?? [])
    .map((s) => getOrt(s))
    .filter((o): o is NonNullable<typeof o> => Boolean(o));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />

      <main className="flex-1">
        {/* Brödsmulor */}
        <nav aria-label="Brödsmulor" className="container max-w-6xl mx-auto px-5 sm:px-6 pt-6 text-xs text-muted-foreground">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li><Link to="/" className="hover:text-foreground">Hönsgården</Link></li>
            <li>/</li>
            <li><Link to="/salja-agg" className="hover:text-foreground">Sälja ägg</Link></li>
            <li>/</li>
            <li className="text-foreground">{ort.name}</li>
          </ol>
        </nav>

        {/* HERO */}
        <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 overflow-hidden noise-bg">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-warning/[0.04] to-transparent pointer-events-none" />
          <div className="container max-w-5xl mx-auto px-5 sm:px-6 relative">
            <motion.div {...fadeUp()} className="max-w-3xl">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-1.5">
                <MapPin className="h-3 w-3" /> {ort.lan}
              </Badge>
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-foreground leading-[1.05] mb-5">
                Sälja ägg i <span className="text-primary">{ort.name}</span> – gratis säljsida på 2 minuter
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-7 leading-relaxed max-w-2xl">
                Har du höns och fler ägg än ni hinner äta hemma? Skapa en lokal säljsida för {ort.name} och
                närliggande orter. Köpare bokar själva, betalar via Swish och du behåller hela försäljningen –
                inga avgifter, ingen mellanhand.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="h-12 px-8 text-base gap-2 shadow-[0_8px_30px_hsl(var(--primary)/0.3)]">
                  <Link to="/login?mode=register&utm_source=ort_page&utm_campaign=salja_agg&utm_content={ort.slug}">
                    Skapa min säljsida gratis <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-7 text-base">
                  <Link to="/salja-agg#ai-pitch">Testa AI-säljtext först</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Lokal kontext */}
        <section className="py-14 sm:py-20">
          <div className="container max-w-4xl mx-auto px-5 sm:px-6 prose-text">
            <motion.div {...fadeUp()} className="space-y-5 text-foreground">
              <h2 className="font-serif text-2xl sm:text-3xl">Varför säljer hönsägare i {ort.name} via Hönsgården?</h2>
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                Allt fler i {ort.name} ({ort.invanare ? `${ort.invanare} invånare` : ort.lan}) söker efter
                lokalt producerade ägg från frigående höns. Med en egen säljsida hittar köparna lätt till dig
                via Google, Facebook eller en QR-kod på vägen ut till tomten – utan att du behöver bygga en
                hemsida eller betala provision till en marknadsplats.
              </p>
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                Du sätter själv pris, antal förpackningar och hur ofta du har leverans. Hönsgården sköter
                bokningskalendern, lagerstatusen och påminnelserna åt dig. När köparen kommer hem till
                {' '}{ort.name} med kartongen så ligger pengarna redan på din Swish.
              </p>
            </motion.div>
          </div>
        </section>

        {/* 4 STEG */}
        <section className="py-14 sm:py-20 bg-muted/30 border-y border-border/40">
          <div className="container max-w-5xl mx-auto px-5 sm:px-6">
            <motion.div {...fadeUp()} className="text-center mb-10">
              <h2 className="font-serif text-2xl sm:text-3xl mb-3">Så funkar äggförsäljning i {ort.name}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
                Fyra enkla steg från första logginen till första bokningen.
              </p>
            </motion.div>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              {steps.map((s, i) => (
                <motion.div key={s.title} {...fadeUp(i * 0.05)}>
                  <Card className="h-full border-border/50 rounded-2xl bg-background">
                    <CardContent className="p-5 sm:p-6 flex gap-4">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <s.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg mb-1">{s.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Fördelar */}
        <section className="py-14 sm:py-20">
          <div className="container max-w-4xl mx-auto px-5 sm:px-6">
            <motion.div {...fadeUp()}>
              <h2 className="font-serif text-2xl sm:text-3xl mb-6">Det här får du med Hönsgården i {ort.name}</h2>
              <ul className="space-y-3">
                {[
                  `En egen säljsida som syns när någon i ${ort.name} googlar “sälja ägg ${ort.name.toLowerCase()}”.`,
                  `Bokningssystem så köpare väljer dag och antal kartor utan sms-pingla.`,
                  `Swish-betalning direkt till dig – ingen provision, inga dolda avgifter.`,
                  `Lager och kundlista så du vet exakt hur mycket du har att sälja just nu.`,
                  `Notiser och mejl när någon bokar, även om du är ute i hönsgården.`,
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-[15px] text-foreground">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Närliggande orter */}
        {narliggande.length > 0 && (
          <section className="py-12 sm:py-16 bg-muted/20 border-y border-border/40">
            <div className="container max-w-5xl mx-auto px-5 sm:px-6">
              <h2 className="font-serif text-xl sm:text-2xl mb-4">Säljer du ägg i området kring {ort.name}?</h2>
              <p className="text-sm text-muted-foreground mb-5 max-w-xl">
                Hönsgården funkar lika bra i hela {ort.lan}. Här är några närliggande orter där andra
                hönsägare redan tagit emot bokningar:
              </p>
              <div className="flex flex-wrap gap-2">
                {narliggande.map((n) => (
                  <Link
                    key={n.slug}
                    to={`/salja-agg/${n.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm rounded-full border border-border/60 bg-background hover:border-primary/40 hover:text-primary px-3.5 py-1.5 transition-colors"
                  >
                    <MapPin className="h-3.5 w-3.5" /> Sälja ägg i {n.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Slut-CTA */}
        <section className="py-16 sm:py-24">
          <div className="container max-w-3xl mx-auto px-5 sm:px-6 text-center">
            <Egg className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="font-serif text-2xl sm:text-3xl mb-3">
              Redo att sälja dina ägg i {ort.name}?
            </h2>
            <p className="text-muted-foreground mb-7 max-w-xl mx-auto">
              Skapa kontot på 30 sekunder, sätt pris och hämtadress – så är din säljsida igång inför nästa
              veckas leverans.
            </p>
            <Button asChild size="lg" className="h-12 px-8 text-base gap-2 shadow-[0_8px_30px_hsl(var(--primary)/0.3)]">
              <Link to="/login?mode=register&utm_source=ort_page_cta&utm_campaign=salja_agg">
                Kom igång gratis <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <p className="mt-5 text-xs text-muted-foreground">
              <Link to="/salja-agg" className="underline hover:text-foreground">
                Se hela funktionsöversikten på sälja-ägg-sidan →
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Suspense fallback={null}>
        <LandingFooter />
      </Suspense>
    </div>
  );
}

// Exportera ORTER så sitemap/build-script kan importera om vi vill prerendra senare
export { ORTER };
