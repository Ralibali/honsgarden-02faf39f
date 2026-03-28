import React from 'react';
import { Bird } from 'lucide-react';

const columns = [
  {
    title: 'Produkt',
    links: [
      { label: 'Funktioner', href: '#funktioner' },
      { label: 'Priser', href: '#priser' },
      { label: 'Ladda ner app', href: '/login?mode=register' },
      { label: 'Nyheter', href: '/blogg' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Hjälp', href: 'mailto:support@honsgarden.se' },
      { label: 'Kontakt', href: 'mailto:support@honsgarden.se' },
      { label: 'Integritetspolicy', href: '/terms' },
      { label: 'Villkor', href: '/terms' },
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
    <footer className="relative z-10 bg-[#1c2e1a] text-white/80">
      <div className="container max-w-6xl mx-auto px-5 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bird className="h-5 w-5 text-[#7cb36b]" />
              <span className="font-serif text-lg text-white">Hönsgården</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              Digital äggloggare för moderna hönsägare
            </p>
            <p className="text-xs text-white/40">© 2025 Hönsgården</p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-serif text-sm text-white mb-3">{col.title}</h3>
              <nav className="space-y-2">
                {col.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-white/60 hover:text-white transition-colors"
                    {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
