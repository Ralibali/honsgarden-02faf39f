import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';

const CONSENT_KEY = 'cookie-consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on load
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 left-2 right-2 sm:left-auto sm:right-6 z-[60] sm:max-w-sm animate-fade-in">
      <div className="bg-card border border-border rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-5">
        <div className="flex items-center sm:items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
          <Cookie className="h-4 w-4 text-primary shrink-0 sm:hidden" />
          <div className="hidden sm:flex w-9 h-9 rounded-xl bg-primary/10 items-center justify-center shrink-0">
            <Cookie className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-foreground">Vi använder cookies 🍪</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug sm:leading-relaxed mt-0.5">
              Bara nödvändiga cookies.{' '}
              <a href="/terms" className="text-primary hover:underline">Läs mer</a>
            </p>
          </div>
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          <Button onClick={accept} size="sm" className="flex-1 h-7 sm:h-9 text-xs sm:text-sm">
            Acceptera
          </Button>
          <Button onClick={decline} variant="outline" size="sm" className="flex-1 h-7 sm:h-9 text-xs sm:text-sm">
            Nödvändiga
          </Button>
        </div>
      </div>
    </div>
  );
}
