import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Egg, MapPin, MessageCircle, Share2, Sparkles, Copy, ShieldCheck, Wallet, Package, ExternalLink, Loader2, ShoppingBasket, CheckCircle2 } from 'lucide-react';

function getParam(params: URLSearchParams, key: string, fallback = '') {
  return params.get(key)?.trim() || fallback;
}

function copy(text: string) {
  navigator.clipboard?.writeText(text);
  toast({ title: 'Kopierat' });
}

function asCurrency(value: unknown, fallback = '') {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? `${Math.round(n)} kr` : fallback;
}

export default function PublicEggSaleV2() {
  const [params] = useSearchParams();
  const { slug } = useParams<{ slug?: string }>();
  const queryClient = useQueryClient();
  const shouldLoadSlug = Boolean(slug && slug !== 'agg');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');
  const [packsToBook, setPacksToBook] = useState('1');

  const { data: listing, isLoading } = useQuery({
    queryKey: ['public-egg-sale-listing', slug],
    enabled: shouldLoadSlug,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('public_egg_sale_listings')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['public-egg-sale-bookings-public', listing?.id],
    enabled: Boolean(listing?.id),
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('public_egg_sale_bookings')
        .select('packs,status')
        .eq('listing_id', listing.id);
      if (error) return [];
      return data || [];
    },
    staleTime: 15_000,
  });

  const sale = useMemo(() => {
    if (listing) {
      return {
        id: listing.id,
        sellerUserId: listing.user_id,
        packs: Number(listing.packs_available ?? 1),
        size: String(listing.eggs_per_pack ?? 12),
        price: String(Math.round(Number(listing.price_per_pack ?? 60))),
        location: listing.location || 'Lokalt område',
        pickup: listing.pickup_info || 'Hämtning efter överenskommelse',
        contact: listing.contact_info || 'Kontakta säljaren för bokning',
        title: listing.title || 'Färska ägg till salu',
        description: listing.description || 'Färska ägg från en lokal hönsgård.',
        imageUrl: listing.image_url || '',
        swish: listing.swish_number || '',
        swishName: listing.swish_name || '',
        swishMsg: listing.swish_message || 'Ägg',
        p6: asCurrency(listing.p6_price),
        p12: asCurrency(listing.p12_price, asCurrency(listing.price_per_pack)),
        p30: asCurrency(listing.p30_price),
        soldOutManually: Boolean(listing.sold_out_manually),
      };
    }

    const price = getParam(params, 'price', '60');
    return {
      id: null,
      sellerUserId: null,
      packs: Number(getParam(params, 'packs', '6')) || 6,
      size: getParam(params, 'size', '12'),
      price,
      location: getParam(params, 'location', 'Lokalt område'),
      pickup: getParam(params, 'pickup', 'Hämtning efter överenskommelse'),
      contact: getParam(params, 'contact', 'Kontakta säljaren för bokning'),
      title: getParam(params, 'title', 'Färska ägg till salu'),
      description: getParam(params, 'desc', 'Färska ägg från en lokal hönsgård.'),
      imageUrl: getParam(params, 'image', ''),
      swish: getParam(params, 'swish', ''),
      swishName: getParam(params, 'swishName', ''),
      swishMsg: getParam(params, 'swishMsg', 'Ägg'),
      p6: getParam(params, 'p6', ''),
      p12: getParam(params, 'p12', price),
      p30: getParam(params, 'p30', ''),
      soldOutManually: false,
    };
  }, [listing, params]);

  const bookedPacks = (bookings as any[])
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (Number(b.packs) || 0), 0);
  const remainingPacks = Math.max(0, sale.packs - bookedPacks);
  const isSoldOut = sale.soldOutManually || remainingPacks <= 0;

  const swishText = sale.swish
    ? `Swish: ${sale.swish}${sale.swishName ? ` (${sale.swishName})` : ''}\nMeddelande: ${sale.swishMsg}`
    : 'Swishuppgifter saknas. Kontakta säljaren för betalning.';

  const shareText = `${sale.title}\n\n${sale.description}\n\n${sale.size}-pack: ${sale.price} kr\n${remainingPacks} kartor kvar\nHämtas: ${sale.location}\n${sale.pickup}\n\n${sale.contact}\n${sale.swish ? `\n${swishText}` : ''}`;

  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!listing?.id || !listing?.user_id) throw new Error('Säljlistan kan inte ta emot bokningar ännu.');
      const packs = Math.max(1, Number(packsToBook) || 1);
      if (!customerName.trim()) throw new Error('Skriv ditt namn.');
      if (packs > remainingPacks) throw new Error(`Det finns bara ${remainingPacks} kartor kvar.`);
      const { error } = await (supabase as any).from('public_egg_sale_bookings').insert({
        listing_id: listing.id,
        seller_user_id: listing.user_id,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim() || null,
        customer_message: customerMessage.trim() || null,
        packs,
        status: 'reserved',
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerMessage('');
      setPacksToBook('1');
      await queryClient.invalidateQueries({ queryKey: ['public-egg-sale-bookings-public', listing?.id] });
      toast({ title: 'Bokningen är skickad 🥚', description: 'Kontakta gärna säljaren om du vill bekräfta hämtning och Swish.' });
    },
    onError: (err: any) => toast({ title: 'Kunde inte boka', description: err?.message || 'Försök igen.', variant: 'destructive' }),
  });

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
    { label: `${sale.size}-pack`, price: sale.p12 || `${sale.price} kr` },
    sale.p30 ? { label: '30-pack', price: sale.p30 } : null,
  ].filter(Boolean) as { label: string; price: string }[];

  if (isLoading) {
    return <main className="min-h-screen noise-bg px-4 py-8 flex items-center justify-center"><div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Laddar säljlistan...</div></main>;
  }

  if (shouldLoadSlug && !listing) {
    return (
      <main className="min-h-screen noise-bg px-4 py-8 flex items-center justify-center">
        <Card className="max-w-md border-border/50 shadow-sm"><CardContent className="p-6 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"><Egg className="h-7 w-7 text-muted-foreground" /></div>
          <h1 className="font-serif text-2xl text-foreground">Säljlistan hittades inte</h1>
          <p className="text-sm text-muted-foreground">Den kan ha tagits bort eller så är länken felstavad.</p>
          <Button variant="outline" className="rounded-xl" onClick={() => window.open('https://honsgarden.se', '_blank')}>Till Hönsgården.se</Button>
        </CardContent></Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen noise-bg px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="text-center space-y-3">
          {sale.imageUrl ? (
            <img src={sale.imageUrl} alt={sale.title} className="mx-auto h-52 w-full max-w-xl rounded-3xl object-cover border border-border/50 shadow-sm" />
          ) : (
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20"><Egg className="h-8 w-8 text-primary" /></div>
          )}
          <div>
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">Lokal äggförsäljning</Badge>
            <h1 className="font-serif text-3xl sm:text-4xl text-foreground">{sale.title}</h1>
            <p className="mt-2 text-muted-foreground leading-relaxed">{sale.description}</p>
          </div>
        </div>

        <Card className="border-primary/20 shadow-sm bg-gradient-to-br from-primary/8 via-card to-accent/8 overflow-hidden">
          <CardContent className="p-5 sm:p-6 space-y-5">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-card/80 border border-border/50 p-4"><p className="text-2xl font-bold tabular-nums text-foreground">{sale.size}</p><p className="data-label text-[10px] mt-1">ägg/karta</p></div>
              <div className="rounded-2xl bg-card/80 border border-border/50 p-4"><p className="text-2xl font-bold tabular-nums text-foreground">{sale.price}</p><p className="data-label text-[10px] mt-1">kr</p></div>
              <div className={`rounded-2xl border p-4 ${isSoldOut ? 'bg-destructive/5 border-destructive/20' : 'bg-card/80 border-border/50'}`}><p className="text-2xl font-bold tabular-nums text-foreground">{isSoldOut ? 0 : remainingPacks}</p><p className="data-label text-[10px] mt-1">kartor kvar</p></div>
            </div>

            {isSoldOut && <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-center"><p className="font-serif text-lg text-foreground">Slutsålt just nu</p><p className="text-sm text-muted-foreground mt-1">Kontakta säljaren för att fråga om nästa omgång.</p></div>}

            <div className="rounded-2xl border border-border/60 bg-card/70 p-4 space-y-3">
              <div className="flex gap-3"><Package className="h-5 w-5 text-primary shrink-0 mt-0.5" /><div className="flex-1"><p className="text-sm font-medium text-foreground">Prislista</p><div className="mt-2 space-y-1">{packageRows.map((row) => <div key={row.label} className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{row.label}</span><span className="font-semibold text-foreground">{row.price}</span></div>)}</div></div></div>
              <div className="flex gap-3 border-t border-border/40 pt-3"><MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" /><div><p className="text-sm font-medium text-foreground">Hämtning</p><p className="text-sm text-muted-foreground">{sale.location}</p><p className="text-xs text-muted-foreground mt-1">{sale.pickup}</p></div></div>
              <div className="flex gap-3 border-t border-border/40 pt-3"><MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" /><div><p className="text-sm font-medium text-foreground">Boka / kontakta</p><p className="text-sm text-muted-foreground whitespace-pre-wrap">{sale.contact}</p></div></div>
            </div>

            <Card className="border-primary/20 bg-primary/5 shadow-none"><CardContent className="p-4 space-y-3"><div className="flex gap-3"><Wallet className="h-5 w-5 text-primary shrink-0 mt-0.5" /><div><p className="text-sm font-medium text-foreground">Betala med Swish</p><p className="text-sm text-muted-foreground whitespace-pre-wrap">{swishText}</p></div></div>{sale.swish && <Button variant="outline" className="w-full rounded-xl gap-2" onClick={() => copy(swishText)}><Copy className="h-4 w-4" /> Kopiera Swishuppgifter</Button>}</CardContent></Card>

            {listing?.id && (
              <Card className="border-border/50 bg-card/80 shadow-none"><CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2"><ShoppingBasket className="h-4 w-4 text-primary" /><p className="font-serif text-sm text-foreground">Boka ägg</p></div>
                {isSoldOut ? <p className="text-sm text-muted-foreground">Det går inte att boka eftersom säljlistan är slutsåld.</p> : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2"><Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Namn *" className="rounded-xl" /><Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Telefon / kontakt" className="rounded-xl" /></div>
                    <Input type="number" min="1" max={remainingPacks} value={packsToBook} onChange={(e) => setPacksToBook(e.target.value)} placeholder="Antal kartor" className="rounded-xl" />
                    <Textarea value={customerMessage} onChange={(e) => setCustomerMessage(e.target.value)} placeholder="Meddelande, t.ex. när du vill hämta" className="rounded-xl min-h-[80px]" />
                    <Button onClick={() => bookingMutation.mutate()} disabled={bookingMutation.isPending} className="w-full rounded-xl gap-2"><CheckCircle2 className="h-4 w-4" /> {bookingMutation.isPending ? 'Bokar...' : 'Boka ägg'}</Button>
                  </>
                )}
              </CardContent></Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Button className="rounded-xl gap-2 h-11" onClick={() => copy(shareText)}><Copy className="h-4 w-4" /> Kopiera bokningsinfo</Button><Button variant="outline" className="rounded-xl gap-2 h-11" onClick={share}><Share2 className="h-4 w-4" /> Dela sidan</Button></div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm"><CardContent className="p-4 flex gap-3"><ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" /><div><p className="text-sm font-medium text-foreground">Tips till köpare</p><p className="text-sm text-muted-foreground leading-relaxed">Kontakta säljaren direkt för att bekräfta tillgång, hämtning och betalning innan du Swishar.</p></div></CardContent></Card>

        <details className="group rounded-2xl border border-border/50 bg-card/60 p-4 text-center"><summary className="cursor-pointer list-none text-xs text-muted-foreground hover:text-foreground transition-colors">Skapad med <span className="font-semibold text-foreground">Hönsgården.se</span></summary><div className="pt-4 space-y-3"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10"><Sparkles className="h-5 w-5 text-primary" /></div><p className="text-sm font-medium text-foreground">Vill du också sälja ägg enklare?</p><p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">Med Hönsgården kan du logga ägg, följa foderkostnader, skapa säljannonser, dela försäljningssidor och hålla koll på betalningar.</p><Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => window.open('https://honsgarden.se', '_blank')}><ExternalLink className="h-3.5 w-3.5" /> Besök Hönsgården.se</Button></div></details>
      </div>
    </main>
  );
}
