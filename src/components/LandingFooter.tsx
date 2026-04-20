import React from 'react';
import { Bird } from 'lucide-react';
import NewsletterSignup from '@/components/NewsletterSignup';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Produkt',
    links: [
      { label: 'Funktioner', href: '#funktioner' },
      { label: 'Priser', href: '#priser' },
      { label: 'Äggkalkylator', href: '/kalkylator' },
      { label: 'Höns & ägg-guider', href: '/blogg' },
      { label: 'Hur många ägg lägger en höna?', href: '/blogg/hur-manga-agg-lagger-en-hona' },
      { label: 'Nybörjarguide – skaffa höns', href: '/blogg/hobbyhons-nyborjarguide' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Hjälp', href: 'mailto:info@auroramedia.se' },
      { label: 'Kontakt', href: 'mailto:info@auroramedia.se' },
      { label: 'Integritetspolicy & GDPR', href: '/terms' },
      { label: 'Villkor & ansvarsfriskrivning', href: '/terms' },
    ],
  },
  {
    title: 'Följ oss',
    links: [
      { label: 'Instagram', href: 'https://www.instagram.com/honsgarden', external: true },
      { label: 'Facebook', href: 'https://www.facebook.com/honsgarden', external: true },
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer className="relative z-10 bg-primary text-primary-foreground/80">
      <div className="container max-w-6xl mx-auto px-5 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bird className="h-5 w-5 text-primary-foreground/70" aria-hidden="true" />
              <span className="font-serif text-lg text-primary-foreground">Hönsgården</span>
            </div>
              <p className="text-sm text-primary-foreground/60 leading-relaxed mb-4">
              Digital äggloggare för moderna hönsägare
            </p>
            <p className="text-xs text-primary-foreground/60">© {new Date().getFullYear()} Hönsgården</p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-serif text-sm text-primary-foreground mb-3">{col.title}</h3>
              <nav className="space-y-2">
                {col.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                    {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Newsletter moved to footer */}
        <div className="mt-10 pt-8 border-t border-primary-foreground/10">
          <div className="max-w-md">
            <NewsletterSignup variant="inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}
