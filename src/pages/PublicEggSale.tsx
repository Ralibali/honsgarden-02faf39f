import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Egg, MapPin, MessageCircle, Share2, Sparkles, Copy, ShieldCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

function getParam(params: URLSearchParams, key: string, fallback = '') {
  return params.get(key)?.trim() || fallback;
}

function copy(text: string) {
  navigator.clipboard?.writeText(text);
  toast({ title: 'Kopierat' });
}

export default function PublicEggSale() {
  const [params] = useSearchParams();

  const sale = useMemo(() => {
    const packs = getParam(params, 'packs', '6');
    const size = getParam(params, 'size', '12');
    const price = getParam(params, 'price', '60');
    const location = getParam(params, 'location', 'Lokalt område');
    const contact = getParam(params, 'contact', 'Kontakta säljaren för bokning');
    const title = getParam(params, 'title', 'Färska ägg till salu');
    const description = getParam(params, 'desc', 'Färska ägg från en lokal hönsgård.');
    return { packs, size, price, location, contact, title, description };
  }, [params]);

  const shareText = `${sale.title}\n\n${sale.description}\n\n${sale.size}-pack: ${sale.price} kr\nCirka ${sale.packs} kartor tillgängliga\nHämtas: ${sale.location}\n\n${sale.contact}`;

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: sale.title, text: shareText, url }).catch(() => undefined);
      return;
    }
    copy(`${shareText}\n\n${url}`);
  };

  return (
    <main className="min-h-screen noise-bg px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20">
            <Egg className="h-8 w-8 text-primary" />
          </div>
          <div>
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">Via Hönsgården</Badge>
            <h1 className="font-serif text-3xl sm:text-4xl text-foreground">{sale.title}</h1>
            <p className="mt-2 text-muted-foreground leading-relaxed">{sale.description}</p>
          </div>
        </div>

        <Card className="border-primary/20 shadow-sm bg-gradient-to-br from-primary/8 via-card to-accent/8 overflow-hidden">
          <CardContent className="p-5 sm:p-6 space-y-5">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-card/80 border border-border/50 p-4">
                <p className="text-2xl font-bold tabular-nums text-foreground">{sale.size}</p>
                <p className="data-label text-[10px] mt-1">ägg/karta</p>
              </div>
              <div className="rounded-2xl bg-card/80 border border-border/50 p-4">
                <p className="text-2xl font-bold tabular-nums text-foreground">{sale.price}</p>
                <p className="data-label text-[10px] mt-1">kr</p>
              </div>
              <div className="rounded-2xl bg-card/80 border border-border/50 p-4">
                <p className="text-2xl font-bold tabular-nums text-foreground">{sale.packs}</p>
                <p className="data-label text-[10px] mt-1">kartor</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/70 p-4 space-y-3">
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Hämtning</p>
                  <p className="text-sm text-muted-foreground">{sale.location}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Boka / kontakta</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{sale.contact}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button className="rounded-xl gap-2 h-11" onClick={() => copy(shareText)}>
                <Copy className="h-4 w-4" /> Kopiera bokningsinfo
              </Button>
              <Button variant="outline" className="rounded-xl gap-2 h-11" onClick={share}>
                <Share2 className="h-4 w-4" /> Dela sidan
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4 flex gap-3">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Tips till köpare</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Kontakta säljaren direkt för att bekräfta tillgång, hämtning och betalning. Den här sidan är skapad av en Hönsgården-användare.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Skapad med Hönsgården
        </div>
      </div>
    </main>
  );
}
