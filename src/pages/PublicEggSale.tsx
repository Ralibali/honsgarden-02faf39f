import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Egg, MapPin, MessageCircle, Share2, Sparkles, Copy, ShieldCheck, Wallet, Package, ExternalLink } from 'lucide-react';
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
    const pickup = getParam(params, 'pickup', 'Hämtning efter överenskommelse');
    const contact = getParam(params, 'contact', 'Kontakta säljaren för bokning');
    const title = getParam(params, 'title', 'Färska ägg till salu');
    const description = getParam(params, 'desc', 'Färska ägg från en lokal hönsgård.');
    const swish = getParam(params, 'swish', '');
    const swishName = getParam(params, 'swishName', '');
    const swishMsg = getParam(params, 'swishMsg', 'Ägg');
    const p6 = getParam(params, 'p6', '');
    const p12 = getParam(params, 'p12', price);
    const p30 = getParam(params, 'p30', '');
    return { packs, size, price, location, pickup, contact, title, description, swish, swishName, swishMsg, p6, p12, p30 };
  }, [params]);

  const swishText = sale.swish
    ? `Swish: ${sale.swish}${sale.swishName ? ` (${sale.swishName})` : ''}\nMeddelande: ${sale.swishMsg}`
    : 'Swishuppgifter saknas. Kontakta säljaren för betalning.';

  const shareText = `${sale.title}\n\n${sale.description}\n\n${sale.size}-pack: ${sale.price} kr\nCirka ${sale.packs} kartor tillgängliga\nHämtas: ${sale.location}\n${sale.pickup}\n\n${sale.contact}\n${sale.swish ? `\n${swishText}` : ''}`;

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: sale.title, text: shareText, url }).catch(() => undefined);
      return;
    }
    copy(`${shareText}\n\n${url}`);
  };

  const packageRows = [
    sale.p6 ? { label: '6-pack', price: sale.p6 } : null,
    { label: `${sale.size}-pack`, price: sale.p12 || sale.price },
    sale.p30 ? { label: '30-pack', price: sale.p30 } : null,
  ].filter(Boolean) as { label: string; price: string }[];

  return (
    <main className="min-h-screen noise-bg px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20">
            <Egg className="h-8 w-8 text-primary" />
          </div>
          <div>
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">Lokal äggförsäljning</Badge>
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
                <Package className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Prislista</p>
                  <div className="mt-2 space-y-1">
                    {packageRows.map((row) => (
                      <div key={row.label} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-semibold text-foreground">{row.price} kr</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 border-t border-border/40 pt-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Hämtning</p>
                  <p className="text-sm text-muted-foreground">{sale.location}</p>
                  <p className="text-xs text-muted-foreground mt-1">{sale.pickup}</p>
                </div>
              </div>
              <div className="flex gap-3 border-t border-border/40 pt-3">
                <MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Boka / kontakta</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{sale.contact}</p>
                </div>
              </div>
            </div>

            <Card className="border-primary/20 bg-primary/5 shadow-none">
              <CardContent className="p-4 space-y-3">
                <div className="flex gap-3">
                  <Wallet className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Betala med Swish</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{swishText}</p>
                  </div>
                </div>
                {sale.swish && (
                  <Button variant="outline" className="w-full rounded-xl gap-2" onClick={() => copy(swishText)}>
                    <Copy className="h-4 w-4" /> Kopiera Swishuppgifter
                  </Button>
                )}
              </CardContent>
            </Card>

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
                Kontakta säljaren direkt för att bekräfta tillgång, hämtning och betalning innan du Swishar.
              </p>
            </div>
          </CardContent>
        </Card>

        <details className="group rounded-2xl border border-border/50 bg-card/60 p-4 text-center">
          <summary className="cursor-pointer list-none text-xs text-muted-foreground hover:text-foreground transition-colors">
            Skapad med <span className="font-semibold text-foreground">Hönsgården.se</span>
          </summary>
          <div className="pt-4 space-y-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Vill du också sälja ägg enklare?</p>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
              Med Hönsgården kan du logga ägg, följa foderkostnader, skapa säljannonser, dela försäljningssidor och hålla koll på betalningar.
            </p>
            <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => window.open('https://honsgarden.se', '_blank')}>
              <ExternalLink className="h-3.5 w-3.5" /> Besök Hönsgården.se
            </Button>
          </div>
        </details>
      </div>
    </main>
  );
}
