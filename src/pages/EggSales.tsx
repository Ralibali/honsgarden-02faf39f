import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { createSyncedEggSale, deleteSyncedEggSale, getSyncedEggSales, updateSyncedEggSale } from '@/lib/syncedProductState';
import type { EggSale } from '@/lib/localProductState';
import { api } from '@/lib/api';
import {
  Coins, Plus, Trash2, CheckCircle2, Clock, Users, ReceiptText, Sparkles,
  Loader2, RefreshCw, Copy, Mail, MessageCircle, Megaphone, Printer,
  Wand2, Calculator, QrCode, Share2,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

function todayString() {
  return new Date().toISOString().split('T')[0];
}

function kr(value: number) {
  return `${value.toFixed(0)} kr`;
}

function safeNumber(value: string, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function monthKey(date: string) {
  return date.slice(0, 7);
}

function copyText(text: string, label = 'Texten') {
  navigator.clipboard?.writeText(text);
  toast({ title: `${label} är kopierad` });
}

export default function EggSales() {
  const queryClient = useQueryClient();
  const [customer, setCustomer] = useState('');
  const [eggs, setEggs] = useState('12');
  const [amount, setAmount] = useState('40');
  const [date, setDate] = useState(todayString());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [salePacks, setSalePacks] = useState('6');
  const [packSize, setPackSize] = useState('12');
  const [pricePerPack, setPricePerPack] = useState('60');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('Skicka meddelande vid intresse');
  const [tone, setTone] = useState<'mysig' | 'kort' | 'proffsig' | 'humor'>('mysig');
  const [sellingPoint, setSellingPoint] = useState('färska ägg från vår lilla hönsgård');

  const { data: sales = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['egg-sales'],
    queryFn: getSyncedEggSales,
    staleTime: 30_000,
  });

  const { data: eggLogs = [] } = useQuery({
    queryKey: ['eggs'],
    queryFn: () => api.getEggs(),
    staleTime: 60_000,
  });

  const { data: feedRecords = [] } = useQuery({
    queryKey: ['feed-records'],
    queryFn: () => api.getFeedRecords(),
    staleTime: 60_000,
  });

  const stats = useMemo(() => {
    const totalAmount = sales.reduce((sum, s) => sum + (s.amount || 0), 0);
    const paidAmount = sales.filter((s) => s.paid).reduce((sum, s) => sum + (s.amount || 0), 0);
    const unpaidAmount = totalAmount - paidAmount;
    const totalEggs = sales.reduce((sum, s) => sum + (s.eggs || 0), 0);
    const customers = new Set(sales.map((s) => s.customer.trim()).filter(Boolean)).size;
    return { totalAmount, paidAmount, unpaidAmount, totalEggs, customers };
  }, [sales]);

  const priceInsights = useMemo(() => {
    const currentMonth = monthKey(todayString());
    const monthEggs = (eggLogs as any[])
      .filter((e) => typeof e.date === 'string' && monthKey(e.date) === currentMonth)
      .reduce((sum, e) => sum + (e.count || 0), 0);

    const monthFeedCost = (feedRecords as any[])
      .filter((r) => typeof r.date === 'string' && monthKey(r.date) === currentMonth)
      .reduce((sum, r) => sum + (Number(r.cost) || Number(r.total_cost) || Number(r.amount) || 0), 0);

    const costPerEgg = monthEggs > 0 && monthFeedCost > 0 ? monthFeedCost / monthEggs : 0;
    const selectedPackSize = Math.max(1, safeNumber(packSize, 12));
    const selectedPrice = Math.max(1, safeNumber(pricePerPack, 60));
    const currentPerEgg = selectedPrice / selectedPackSize;
    const suggestedLow = costPerEgg > 0 ? Math.ceil((costPerEgg * selectedPackSize * 1.5) / 5) * 5 : 50;
    const suggestedHigh = costPerEgg > 0 ? Math.ceil((costPerEgg * selectedPackSize * 2.1) / 5) * 5 : 75;

    return { monthEggs, monthFeedCost, costPerEgg, currentPerEgg, suggestedLow, suggestedHigh };
  }, [eggLogs, feedRecords, packSize, pricePerPack]);

  const marketingTexts = useMemo(() => {
    const packs = Math.max(1, safeNumber(salePacks, 1));
    const size = Math.max(1, safeNumber(packSize, 12));
    const price = Math.max(1, safeNumber(pricePerPack, 60));
    const place = location.trim() || 'lokalt i området';
    const contactLine = contact.trim() || 'Skicka meddelande vid intresse';
    const value = sellingPoint.trim() || 'färska ägg från vår lilla hönsgård';
    const scarcity = packs <= 3 ? 'Det finns bara några få kartor, så det är först till kvarn.' : `Just nu finns cirka ${packs} kartor tillgängliga.`;

    const openers = {
      mysig: `🥚 Nu finns ${value} att köpa!`,
      kort: `🥚 Färska ägg säljes.`,
      proffsig: `Lokala, färska ägg finns nu till försäljning.`,
      humor: `Hönsen har jobbat hårt – nu finns ägg att köpa! 🐔🥚`,
    };

    const facebook = `${openers[tone]}\n\n${scarcity}\n${size}-pack: ${price} kr\nHämtas: ${place}\n\n${contactLine} 🌿`;

    const sms = `Hej! Nu finns färska ägg från Hönsgården 🥚 ${size}-pack för ${price} kr. ${packs} kartor finns just nu. Vill du att jag lägger undan en?`;

    const email = `Hej!\n\nNu finns ${value} att köpa.\n\nJag har ungefär ${packs} kartor tillgängliga.\nPris: ${price} kr för ${size} ägg.\nHämtning: ${place}.\n\nSvara gärna på detta meddelande om du vill att jag lägger undan en karta åt dig.\n\nVänliga hälsningar`;

    const poster = `FÄRSKA ÄGG\nfrån lokal hönsgård\n\n${size}-pack: ${price} kr\n${packs} kartor tillgängliga\n\nHämtas: ${place}\n${contactLine}\n\nScanna QR-koden för att boka`;

    const story = `Färska ägg idag 🥚\n${size}-pack · ${price} kr\n${place}\nDM för bokning`;

    return { facebook, sms, email, poster, story };
  }, [salePacks, packSize, pricePerPack, location, contact, tone, sellingPoint]);

  const refreshSales = async () => {
    await queryClient.invalidateQueries({ queryKey: ['egg-sales'] });
    await refetch();
    toast({ title: 'Äggförsäljningen är uppdaterad' });
  };

  const addSale = async () => {
    const eggCount = Number(eggs);
    const sum = Number(amount);
    if (!customer.trim()) {
      toast({ title: 'Skriv kundens namn', description: 'Till exempel granne, kollega eller familjemedlem.', variant: 'destructive' });
      return;
    }
    if (!eggCount || eggCount < 1 || Number.isNaN(sum) || sum < 0) {
      toast({ title: 'Kontrollera antal och belopp', description: 'Antal ägg och belopp behöver vara rimliga siffror.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      await createSyncedEggSale({ customer: customer.trim(), eggs: eggCount, amount: sum, paid: false, date, note: note.trim() || undefined });
      await queryClient.invalidateQueries({ queryKey: ['egg-sales'] });
      setCustomer('');
      setEggs('12');
      setAmount('40');
      setNote('');
      setDate(todayString());
      toast({ title: 'Äggförsäljningen är sparad 🥚', description: 'Den synkas nu mellan mobil, dator och surfplatta.' });
    } catch (err: any) {
      toast({ title: 'Kunde inte spara försäljningen', description: err?.message || 'Försök igen om en stund.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const togglePaid = async (sale: EggSale) => {
    setBusyId(sale.id);
    try {
      await updateSyncedEggSale(sale.id, { paid: !sale.paid });
      await queryClient.invalidateQueries({ queryKey: ['egg-sales'] });
    } catch (err: any) {
      toast({ title: 'Kunde inte uppdatera betalstatus', description: err?.message || 'Försök igen.', variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  const removeSale = async (id: string) => {
    setBusyId(id);
    try {
      await deleteSyncedEggSale(id);
      await queryClient.invalidateQueries({ queryKey: ['egg-sales'] });
      toast({ title: 'Försäljningen är borttagen' });
    } catch (err: any) {
      toast({ title: 'Kunde inte ta bort försäljningen', description: err?.message || 'Försök igen.', variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  const applySuggestedPrice = () => {
    setPricePerPack(String(priceInsights.suggestedLow));
    toast({ title: 'Prisförslag valt', description: `${priceInsights.suggestedLow} kr per ${packSize}-pack används i generatorn.` });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="data-label mb-1">Sälj ägg</p>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Äggförsäljning 🥚</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 leading-relaxed">
            Håll koll på försäljning och skapa annonser, mail, SMS och planschtexter som hjälper dig sälja fler ägg.
          </p>
        </div>
        <Button variant="outline" onClick={refreshSales} disabled={isFetching} className="rounded-xl gap-2 w-full sm:w-auto">
          {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Uppdatera
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Sålda ägg', value: stats.totalEggs, icon: ReceiptText },
          { label: 'Totalt', value: kr(stats.totalAmount), icon: Coins },
          { label: 'Obetalt', value: kr(stats.unpaidAmount), icon: Clock, warn: stats.unpaidAmount > 0 },
          { label: 'Kunder', value: stats.customers, icon: Users },
        ].map((item) => (
          <Card key={item.label} className={`shadow-sm ${item.warn ? 'border-warning/25 bg-warning/5' : 'border-border/50 bg-card'}`}>
            <CardContent className="p-3 sm:p-4 text-center">
              <item.icon className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="stat-number text-xl sm:text-2xl text-foreground break-words">{item.value}</p>
              <p className="data-label text-[10px] mt-1">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/25 bg-gradient-to-br from-primary/10 via-card to-accent/10 shadow-sm overflow-hidden">
        <CardContent className="p-4 sm:p-5 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Wand2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-serif text-lg text-foreground">Säljgenerator</h2>
                  <Badge className="bg-primary/10 text-primary border-primary/20">Ny</Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Fyll i vad du har till salu och få färdiga texter för Facebook, SMS, mail, Instagram och plansch.
                </p>
              </div>
            </div>
            <Sparkles className="h-5 w-5 text-primary hidden sm:block" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <label className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Kartor till salu</span>
              <Input inputMode="numeric" type="number" min="1" value={salePacks} onChange={(e) => setSalePacks(e.target.value)} className="rounded-xl h-11" />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Ägg per karta</span>
              <Input inputMode="numeric" type="number" min="1" value={packSize} onChange={(e) => setPackSize(e.target.value)} className="rounded-xl h-11" />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Pris per karta</span>
              <Input inputMode="decimal" type="number" min="1" value={pricePerPack} onChange={(e) => setPricePerPack(e.target.value)} className="rounded-xl h-11" />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Ton</span>
              <select value={tone} onChange={(e) => setTone(e.target.value as any)} className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm">
                <option value="mysig">Mysig</option>
                <option value="kort">Kort</option>
                <option value="proffsig">Proffsig</option>
                <option value="humor">Humor</option>
              </select>
            </label>
            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-xs text-muted-foreground">Plats / hämtning</span>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="T.ex. Berg, Ljungsbro eller hämtas vid grinden" className="rounded-xl h-11" />
            </label>
            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-xs text-muted-foreground">Kontakt / betalning</span>
              <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="T.ex. DM, SMS eller Swish-info" className="rounded-xl h-11" />
            </label>
            <label className="space-y-1.5 sm:col-span-2 lg:col-span-4">
              <span className="text-xs text-muted-foreground">Säljargument</span>
              <Input value={sellingPoint} onChange={(e) => setSellingPoint(e.target.value)} placeholder="T.ex. blandade färger, frigående höns, extra färska" className="rounded-xl h-11" />
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <Card className="border-border/50 bg-card/70 shadow-sm lg:col-span-1">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  <h3 className="font-serif text-sm text-foreground">Prisförslag</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-lg font-bold tabular-nums text-foreground">{priceInsights.monthEggs}</p>
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground">ägg i månaden</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-lg font-bold tabular-nums text-foreground">{kr(priceInsights.monthFeedCost)}</p>
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground">foder</p>
                  </div>
                </div>
                {priceInsights.costPerEgg > 0 ? (
                  <>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Ungefärlig foderkostnad: <strong>{priceInsights.costPerEgg.toFixed(2)} kr/ägg</strong>. Rekommenderat pris: <strong>{priceInsights.suggestedLow}–{priceInsights.suggestedHigh} kr</strong> per {packSize}-pack.
                    </p>
                    <Button variant="outline" size="sm" onClick={applySuggestedPrice} className="w-full rounded-xl">
                      Använd {priceInsights.suggestedLow} kr
                    </Button>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Logga foderkostnader och äggproduktion för att få smartare prisförslag. Just nu används standardintervall 50–75 kr per {packSize}-pack.
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <MarketingOutput icon={Megaphone} title="Facebook / annons" text={marketingTexts.facebook} onCopy={() => copyText(marketingTexts.facebook, 'Annonsen')} />
              <MarketingOutput icon={MessageCircle} title="SMS till kunder" text={marketingTexts.sms} onCopy={() => copyText(marketingTexts.sms, 'SMS-texten')} />
              <MarketingOutput icon={Mail} title="E-post" text={marketingTexts.email} onCopy={() => copyText(marketingTexts.email, 'Mailet')} />
              <MarketingOutput icon={Printer} title="Planschtext" text={marketingTexts.poster} onCopy={() => copyText(marketingTexts.poster, 'Planschtexten')} />
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <QrCode className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-serif text-sm text-foreground">Nästa steg: QR-beställning</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Här kan vi senare skapa en publik bokningslänk och QR-kod till planschen så kunder kan boka ägg själva.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => copyText(marketingTexts.story, 'Instagram-texten')}>
              <Share2 className="h-4 w-4" /> Kopiera story
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/8 via-card to-accent/5 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-foreground">Lägg till försäljning</h2>
              <p className="text-sm text-muted-foreground">Spara snabbt när någon köper ägg. Du kan markera som betalt senare.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <label className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <span className="text-xs text-muted-foreground">Kund</span>
              <Input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="T.ex. Anna" className="rounded-xl h-11" />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Antal ägg</span>
              <Input inputMode="numeric" type="number" min="1" value={eggs} onChange={(e) => setEggs(e.target.value)} className="rounded-xl h-11" />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Belopp</span>
              <Input inputMode="decimal" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-xl h-11" />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Datum</span>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl h-11" />
            </label>
            <label className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <span className="text-xs text-muted-foreground">Anteckning</span>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Valfritt" className="rounded-xl h-11" />
            </label>
          </div>

          <Button onClick={addSale} disabled={saving} className="mt-4 rounded-xl gap-2 w-full sm:w-auto h-11">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Spara försäljning
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3 mb-4">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h2 className="font-serif text-lg text-foreground">Försäljningar</h2>
              <p className="text-sm text-muted-foreground">Tryck på “Markera betald” när pengarna kommit in.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : sales.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center">
              <p className="font-serif text-base text-foreground">Ingen äggförsäljning ännu</p>
              <p className="text-sm text-muted-foreground mt-1">När du säljer ägg visas kunder, belopp och betalstatus här.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sales.map((sale) => (
                <article key={sale.id} className="rounded-2xl border border-border/60 bg-muted/15 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground">{sale.customer}</p>
                        <Badge variant="secondary" className={sale.paid ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}>
                          {sale.paid ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                          {sale.paid ? 'Betald' : 'Obetald'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{sale.eggs} ägg · {kr(sale.amount)} · {new Date(sale.date).toLocaleDateString('sv-SE')}</p>
                      {sale.note && <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{sale.note}</p>}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button variant={sale.paid ? 'outline' : 'default'} size="sm" className="rounded-xl w-full sm:w-auto" onClick={() => togglePaid(sale)} disabled={busyId === sale.id}>
                        {busyId === sale.id ? <Loader2 className="h-4 w-4 animate-spin" /> : sale.paid ? 'Markera obetald' : 'Markera betald'}
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-xl text-destructive hover:text-destructive w-full sm:w-auto" onClick={() => removeSale(sale.id)} disabled={busyId === sale.id}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MarketingOutput({ icon: Icon, title, text, onCopy }: { icon: any; title: string; text: string; onCopy: () => void }) {
  return (
    <Card className="border-border/50 bg-card/80 shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="h-4 w-4 text-primary shrink-0" />
            <h3 className="font-serif text-sm text-foreground truncate">{title}</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onCopy} className="h-8 px-2 rounded-lg gap-1.5 shrink-0">
            <Copy className="h-3.5 w-3.5" /> Kopiera
          </Button>
        </div>
        <Textarea value={text} readOnly className="min-h-[130px] rounded-xl text-xs leading-relaxed resize-none bg-muted/25" />
      </CardContent>
    </Card>
  );
}
