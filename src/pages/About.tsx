import React from 'react';
import { useSeo } from '@/hooks/useSeo';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Egg, Mail, MapPin, Shield, Heart, BookOpen, ArrowRight, Users, Award } from 'lucide-react';
import VisitorWelcomePopup from '@/components/VisitorWelcomePopup';

const team = [
  {
    name: 'Hönsgården-teamet',
    role: 'Grundare & redaktion',
    bio: 'Vi är ett litet team av hönsälskare, tekniknördar och skribenter som brinner för att göra hönslivet enklare för alla – oavsett om du har 3 eller 30 hönor.',
    avatar: '🐔',
  },
];

const values = [
  { icon: Heart, title: 'Av hönsägare, för hönsägare', desc: 'Vi äger själva höns och vet hur det är. Allt vi bygger utgår från verkliga behov.' },
  { icon: Shield, title: 'Din data är din', desc: 'All data lagras krypterat inom EU. Vi säljer aldrig dina uppgifter. GDPR-kompatibelt.' },
  { icon: BookOpen, title: 'Kunskap för alla', desc: 'Vår blogg och våra guider är fritt tillgängliga. Vi vill att fler ska lyckas med höns.' },
  { icon: Users, title: 'Community', desc: 'Vi bygger verktyg som förenar hönsägare i hela Sverige. Tillsammans lär vi oss mer.' },
];

export default function About() {
  useSeo({
    title: 'Om Hönsgården – Vilka vi är & varför vi finns',
    description: 'Hönsgården skapades av hönsälskare för hönsälskare. Lär känna teamet bakom Sveriges digitala äggloggare och hönsverktyg.',
    path: '/om-oss',
    ogImage: '/blog-images/hens-garden.jpg',
    jsonLd: [
      {
        '@type': 'AboutPage',
        '@id': 'https://honsgarden.se/om-oss',
        name: 'Om Hönsgården',
        description: 'Hönsgården skapades av hönsälskare för hönsälskare.',
        url: 'https://honsgarden.se/om-oss',
        isPartOf: { '@id': 'https://honsgarden.se/#website' },
        inLanguage: 'sv-SE',
      },
      {
        '@type': 'Organization',
        '@id': 'https://honsgarden.se/#organization',
        name: 'Hönsgården',
        url: 'https://honsgarden.se',
        logo: { '@type': 'ImageObject', url: 'https://honsgarden.se/favicon.ico', width: 512, height: 512 },
        description: 'Hönsgården hjälper hobbyuppfödare att hålla koll på ägg, höns, foder och ekonomi – helt digitalt.',
        email: 'info@auroramedia.se',
        foundingDate: '2024',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'SE',
        },
        sameAs: [],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Hem', item: 'https://honsgarden.se' },
          { '@type': 'ListItem', position: 2, name: 'Om oss', item: 'https://honsgarden.se/om-oss' },
        ],
      },
    ],
  });

  return (
    <div className="min-h-screen bg-background">
      <VisitorWelcomePopup />

      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl">🐔</span>
            <span className="font-serif text-lg text-foreground">Hönsgården</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/blogg" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Blogg</Link>
            <Link to="/login">
              <Button size="sm" className="rounded-xl text-xs gap-1">
                <Egg className="h-3 w-3" /> Kom igång
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
        {/* Hero */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-medium mb-4">
            <Heart className="h-3.5 w-3.5" /> Om oss
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-foreground mb-4">
            Vi gör hönslivet enklare
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Hönsgården skapades 2024 med en enkel vision: att ge svenska hönsägare ett modernt, lättanvänt verktyg för att hålla koll på allt som rör hönsgården – ägg, foder, hälsa och ekonomi.
          </p>
        </div>

        {/* Vår historia */}
        <section className="mb-14 sm:mb-20">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-10">
            <h2 className="font-serif text-xl sm:text-2xl text-foreground mb-4 flex items-center gap-2">
              <span className="text-2xl">📖</span> Vår historia
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p>
                Det hela började med en enkel frustration: att logga ägg i ett kalkylark var opraktiskt, och att komma ihåg vilken höna som behövde extra koll var nästan omöjligt.
              </p>
              <p>
                Så vi byggde Hönsgården – en digital äggloggare och gårdsverktyg som gör det enkelt att ha full kontroll. Idag använder tusentals svenska hönsägare appen varje dag.
              </p>
              <p>
                Vår blogg delar expertkunskap om hönsraser, foder, hälsa och hönshusbygge – allt baserat på erfarenhet och research. Vi strävar efter att vara den mest trovärdiga källan för hönskunskap i Sverige.
              </p>
            </div>
          </div>
        </section>

        {/* Våra värderingar */}
        <section className="mb-14 sm:mb-20">
          <h2 className="font-serif text-xl sm:text-2xl text-foreground mb-6 text-center">Vad vi tror på</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((v) => (
              <div key={v.title} className="p-5 rounded-2xl bg-card border border-border">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <v.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-serif text-base text-foreground mb-1">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Teamet */}
        <section className="mb-14 sm:mb-20">
          <h2 className="font-serif text-xl sm:text-2xl text-foreground mb-6 text-center">Teamet</h2>
          <div className="max-w-md mx-auto">
            {team.map((member) => (
              <div key={member.name} className="p-6 rounded-2xl bg-card border border-border text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl mx-auto mb-4">
                  {member.avatar}
                </div>
                <h3 className="font-serif text-lg text-foreground">{member.name}</h3>
                <p className="text-xs text-primary font-medium mb-3">{member.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Kontakt */}
        <section className="mb-14 sm:mb-20">
          <h2 className="font-serif text-xl sm:text-2xl text-foreground mb-6 text-center">Kontakta oss</h2>
          <div className="max-w-md mx-auto bg-card border border-border rounded-2xl p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">E-post</p>
                  <a href="mailto:info@auroramedia.se" className="text-sm text-primary hover:underline">info@auroramedia.se</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Land</p>
                  <p className="text-sm text-foreground">Sverige 🇸🇪</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Award className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Grundat</p>
                  <p className="text-sm text-foreground">2024</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-gradient-to-br from-primary/5 via-card to-accent/5 rounded-2xl p-8 sm:p-12 border border-border/30">
          <span className="text-3xl mb-3 block">🥚</span>
          <h2 className="font-serif text-xl sm:text-2xl text-foreground mb-2">
            Redo att testa?
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
            Skapa ett konto på 10 sekunder – helt gratis. Ingen kreditkort behövs.
          </p>
          <Link to="/login?mode=register">
            <Button size="lg" className="rounded-xl gap-2">
              <Egg className="h-4 w-4" /> Kom igång nu <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Hönsgården</span>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-foreground transition-colors">Startsidan</Link>
            <Link to="/blogg" className="hover:text-foreground transition-colors">Blogg</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Villkor</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
