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
import { supabase } from '@/integrations/supabase/client';
import {
  Coins, Plus, Trash2, CheckCircle2, Clock, Users, ReceiptText, Sparkles,
  Loader2, RefreshCw, Copy, Mail, MessageCircle, Megaphone, Printer,
  Wand2, Calculator, QrCode, Share2, Facebook, ExternalLink, Image as ImageIcon,
  Store, Wallet, Package, Link as LinkIcon,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type MarketingTexts = {
  facebook: string;
  sms: string;
  email: string;
  poster: string;
  story: string;
  price_tip?: string;
  source?: 'ai' | 'fallback' | 'template';
};

const PUBLIC_BASE_URL = 'https://honsgarden.se';

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

function encode(value: string) {
  return encodeURIComponent(value.trim());
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'farska-agg';
}

async function getUniqueSlug(baseSlug: string) {
  const clean = slugify(baseSlug);
  for (let i = 0; i < 30; i += 1) {
    const candidate = i === 0 ? clean : `${clean}-${i + 1}`;
    const { data, error } = await (supabase as any)
      .from('public_egg_sale_listings')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return candidate;
  }
  return `${clean}-${Date.now().toString(36)}`;
}

export default function EggSalesPro() {
  const queryClient = useQueryClient();
  const [customer, setCustomer] = useState('');
  const [eggs, setEggs] = useState('12');
  const [amount, setAmount] = useState('40');
  const [date, setDate] = useState(todayString());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [title, setTitle] = useState('Färska ägg till salu');
  const [salePacks, setSalePacks] = useState('6');
  const [packSize, setPackSize] = useState('12');
  const [pricePerPack, setPricePerPack] = useState('60');
  const [location, setLocation] = useState('');
  const [pickupInfo, setPickupInfo] = useState('Hämtas efter överenskommelse.');
  const [contact, setContact] = useState('Skicka meddelande vid intresse');
  const [swishNumber, setSwishNumber] = useState('');
  const [swishName, setSwishName] = useState('');
  const [swishMessage, setSwishMessage] = useState('Ägg');
  const [imageUrl, setImageUrl] = useState('');
  const [tone, setTone] = useState<'mysig' | 'kort' | 'proffsig' | 'humor'>('mysig');
  const [sellingPoint, setSellingPoint] = useState('färska ägg från vår lilla hönsgård');
  const [customSlug, setCustomSlug] = useState('');
  const [publishedSlug, setPublishedSlug] = useState('');
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedTexts, setGeneratedTexts] = useState<MarketingTexts | null>(null);

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
    const suggestedLow = costPerEgg > 0 ? Math.ceil((costPerEgg * selectedPackSize * 1.5) / 5) * 5 : 50;
    const suggestedHigh = costPerEgg > 0 ? Math.ceil((costPerEgg * selectedPackSize * 2.1) / 5) * 5 : 75;
    return { monthEggs, monthFeedCost, costPerEgg, suggestedLow, suggestedHigh };
  }, [eggLogs, feedRecords, packSize]);

  const packagePrices = useMemo(() => {
    const size = Math.max(1, safeNumber(packSize, 12));
    const price = Math.max(1, safeNumber(pricePerPack, 60));
    const perEgg = price / size;
    return {
      p6: Math.max(1, Math.round((perEgg * 6) / 5) * 5),
      p12: size === 12 ? price : Math.max(1, Math.round((perEgg * 12) / 5) * 5),
      p30: Math.max(1, Math.round((perEgg * 30) / 5) * 5),
    };
  }, [packSize, pricePerPack]);

  const draftSlug = useMemo(() => slugify(customSlug || `${location || title} ${sellingPoint.includes('ägg') ? '' : 'agg'}`), [customSlug, location, title, sellingPoint]);
  const activeSlug = publishedSlug || draftSlug;
  const saleUrl = `${PUBLIC_BASE_URL}/s/${activeSlug}`;

  const templateTexts = useMemo<MarketingTexts>(() => {
    const packs = Math.max(1, safeNumber(salePacks, 1));
    const size = Math.max(1, safeNumber(packSize, 12));
    const price = Math.max(1, safeNumber(pricePerPack, 60));
    const place = location.trim() || 'lokalt i området';
    const swishLine = swishNumber.trim() ? `\nSwish: ${swishNumber}${swishName ? ` (${swishName})` : ''}\nMeddelande: ${swishMessage || 'Ägg'}` : '';
    const scarcity = packs <= 3 ? 'Det finns bara några få kartor, så det är först till kvarn.' : `Just nu finns cirka ${packs} kartor tillgängliga.`;
    const openers = {
      mysig: `🥚 ${title}`,
      kort: `🥚 Färska ägg säljes.`,
      proffsig: `Lokala, färska ägg finns nu till försäljning.`,
      humor: `Hönsen har jobbat hårt – nu finns ägg att köpa! 🐔🥚`,
    };

    return {
      facebook: `${openers[tone]}\n\n${sellingPoint}\n\n${scarcity}\n${size}-pack: ${price} kr\nHämtas: ${place}\n${pickupInfo}\n${contact}${swishLine}\n\nBoka/läs mer: ${saleUrl}`,
      sms: `Hej! Nu finns färska ägg 🥚 ${size}-pack för ${price} kr. ${packs} kartor finns just nu. Boka här: ${saleUrl}`,
      email: `Hej!\n\n${sellingPoint}\n\nJag har ungefär ${packs} kartor tillgängliga.\nPris: ${price} kr för ${size} ägg.\nHämtning: ${place}.\n${pickupInfo}${swishLine}\n\nLäs mer/boka här:\n${saleUrl}\n\nVänliga hälsningar`,
      poster: `${title.toUpperCase()}\n\n${size}-pack: ${price} kr\n${packs} kartor tillgängliga\n\nHämtas: ${place}\n${pickupInfo}\n${contact}${swishLine}\n\nBoka/läs mer:\n${saleUrl}`,
      story: `${title} 🥚\n${size}-pack · ${price} kr\n${place}\nBoka via länken`,
      price_tip: priceInsights.costPerEgg > 0
        ? `Din uppskattade foderkostnad är ${priceInsights.costPerEgg.toFixed(2)} kr/ägg. Ett rimligt intervall är ${priceInsights.suggestedLow}-${priceInsights.suggestedHigh} kr per ${size}-pack.`
        : `Om allt säljs blir det cirka ${packs * price} kr. Logga foderkostnader för smartare prisförslag.`,
      source: 'template',
    };
  }, [salePacks, packSize, pricePerPack, location, contact, tone, sellingPoint, title, pickupInfo, swishNumber, swishName, swishMessage, saleUrl, priceInsights]);

  const marketingTexts = generatedTexts ?? templateTexts;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encode(saleUrl)}&quote=${encode(marketingTexts.facebook)}`;

  const resetGenerated = () => setGeneratedTexts(null);

  const publishListing = async () => {
    setPublishing(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error('Du behöver vara inloggad för att publicera en säljlista.');

      const slug = publishedSlug || await getUniqueSlug(draftSlug);
      const row = {
        user_id: userData.user.id,
        slug,
        title: title.trim() || 'Färska ägg till salu',
        description: sellingPoint.trim() || 'Färska ägg från lokal hönsgård.',
        image_url: imageUrl.trim() || null,
        packs_available: Math.max(1, safeNumber(salePacks, 1)),
        eggs_per_pack: Math.max(1, safeNumber(packSize, 12)),
        price_per_pack: Math.max(1, safeNumber(pricePerPack, 60)),
        location: location.trim() || null,
        pickup_info: pickupInfo.trim() || null,
        contact_info: contact.trim() || null,
        swish_number: swishNumber.trim() || null,
        swish_name: swishName.trim() || null,
        swish_message: swishMessage.trim() || 'Ägg',
        p6_price: packagePrices.p6,
        p12_price: packagePrices.p12,
        p30_price: packagePrices.p30,
        is_active: true,
      };

      let result;
      if (publishedId) {
        result = await (supabase as any).from('public_egg_sale_listings').update(row).eq('id', publishedId).select('id, slug').single();
      } else {
        result = await (supabase as any).from('public_egg_sale_listings').insert(row).select('id, slug').single();
      }
      if (result.error) throw result.error;
      setPublishedId(result.data.id);
      setPublishedSlug(result.data.slug);
      toast({ title: 'Säljlistan är publicerad ✨', description: `${PUBLIC_BASE_URL}/s/${result.data.slug}` });
    } catch (err: any) {
      toast({ title: 'Kunde inte publicera säljlistan', description: err?.message || 'Försök igen.', variant: 'destructive' });
    } finally {
      setPublishing(false);
    }
  };

  const generateWithAI = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('egg-sales-marketing', {
        body: {
          salePacks,
          packSize,
          pricePerPack,
          location,
          contact: `${contact}\nHämtning: ${pickupInfo}\nSwish: ${swishNumber || 'ej angivet'} ${swishName || ''}`,
          tone,
          sellingPoint,
          monthEggs: priceInsights.monthEggs,
          monthFeedCost: priceInsights.monthFeedCost,
          costPerEgg: priceInsights.costPerEgg,
          suggestedLow: priceInsights.suggestedLow,
          suggestedHigh: priceInsights.suggestedHigh,
        },
      });
      if (error) throw error;
      if (!data?.facebook || !data?.sms || !data?.email || !data?.poster || !data?.story) throw new Error('AI-svaret saknar text');
      setGeneratedTexts({ ...data, facebook: `${data.facebook}\n\nBoka/läs mer: ${saleUrl}` } as MarketingTexts);
      toast({ title: data.source === 'ai' ? 'Agda har skapat säljtexter ✨' : 'Säljtexter skapade' });
    } catch (err: any) {
      toast({ title: 'Kunde inte skapa AI-texter', description: err?.message || 'Malltexterna finns kvar att använda.', variant: 'destructive' });
    } finally {
      setAiLoading(false);
    }
  };

  const shareNative = async () => {
    const text = `${marketingTexts.facebook}\n\n${saleUrl}`;
    if (navigator.share) {
      await navigator.share({ title, text, url: saleUrl }).catch(() => undefined);
      return;
    }
    copyText(text, 'Delningstexten');
  };

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
      toast({ title: 'Äggförsäljningen är sparad 🥚' });
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

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <div>
          <p className="data-label mb-1">Sälj ägg</p>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Agda-säljgenerator 🥚</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 leading-relaxed">
            Skapa en unik säljlista med bild, Swish, AI-texter och enkel länk som {PUBLIC_BASE_URL}/s/bergs-agg.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={publishListing} disabled={publishing} className="rounded-xl gap-2">
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Store className="h-4 w-4" />}
            {publishedSlug ? 'Uppdatera säljlista' : 'Publicera säljlista'}
          </Button>
          <Button variant="outline" onClick={refreshSales} disabled={isFetching} className="rounded-xl gap-2">
            {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Uppdatera
          </Button>
        </div>
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

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-3 space-y-4">
          <Card className="border-primary/25 bg-gradient-to-br from-primary/10 via-card to-accent/10 shadow-sm overflow-hidden">
            <CardContent className="p-4 sm:p-5 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Wand2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-serif text-lg text-foreground">Säljlista</h2>
                      <Badge className="bg-primary/10 text-primary border-primary/20">Unik länk</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Fyll i erbjudandet. Publicera när du är redo, så får listan en kort länk.
                    </p>
                  </div>
                </div>
                <Sparkles className="h-5 w-5 text-primary hidden sm:block" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="space-y-1.5 sm:col-span-2">
                  <span className="text-xs text-muted-foreground">Rubrik/banner</span>
                  <Input value={title} onChange={(e) => { setTitle(e.target.value); resetGenerated(); }} placeholder="T.ex. Färska ägg från Berg" className="rounded-xl h-11" />
                </label>
                <label className="space-y-1.5 sm:col-span-2">
                  <span className="text-xs text-muted-foreground">Bild på det du säljer</span>
                  <Input value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); resetGenerated(); }} placeholder="Klistra in bildlänk till ägg, hönor eller gårdsbod" className="rounded-xl h-11" />
                  <p className="text-[11px] text-muted-foreground">Första versionen använder bildlänk. Nästa steg kan bli uppladdning direkt från mobilen.</p>
                </label>
                <label className="space-y-1.5 sm:col-span-2">
                  <span className="text-xs text-muted-foreground">Beskrivning/säljargument</span>
                  <Textarea value={sellingPoint} onChange={(e) => { setSellingPoint(e.target.value); resetGenerated(); }} className="rounded-xl min-h-[95px]" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">Kartor till salu</span>
                  <Input inputMode="numeric" type="number" min="1" value={salePacks} onChange={(e) => { setSalePacks(e.target.value); resetGenerated(); }} className="rounded-xl h-11" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">Ägg per karta</span>
                  <Input inputMode="numeric" type="number" min="1" value={packSize} onChange={(e) => { setPackSize(e.target.value); resetGenerated(); }} className="rounded-xl h-11" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">Pris per karta</span>
                  <Input inputMode="decimal" type="number" min="1" value={pricePerPack} onChange={(e) => { setPricePerPack(e.target.value); resetGenerated(); }} className="rounded-xl h-11" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">Ton</span>
                  <select value={tone} onChange={(e) => { setTone(e.target.value as any); resetGenerated(); }} className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm">
                    <option value="mysig">Mysig</option>
                    <option value="kort">Kort</option>
                    <option value="proffsig">Proffsig</option>
                    <option value="humor">Humor</option>
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">Plats</span>
                  <Input value={location} onChange={(e) => { setLocation(e.target.value); resetGenerated(); }} placeholder="T.ex. Berg" className="rounded-xl h-11" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">Önskad länk</span>
                  <Input value={customSlug} onChange={(e) => setCustomSlug(slugify(e.target.value))} placeholder={draftSlug} className="rounded-xl h-11" />
                </label>
                <label className="space-y-1.5 sm:col-span-2">
                  <span className="text-xs text-muted-foreground">Hämtning</span>
                  <Input value={pickupInfo} onChange={(e) => { setPickupInfo(e.target.value); resetGenerated(); }} placeholder="T.ex. Hämtas vid grinden efter kl 17" className="rounded-xl h-11" />
                </label>
                <label className="space-y-1.5 sm:col-span-2">
                  <span className="text-xs text-muted-foreground">Kontakt</span>
                  <Input value={contact} onChange={(e) => { setContact(e.target.value); resetGenerated(); }} placeholder="T.ex. SMS, Messenger eller DM" className="rounded-xl h-11" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">Swishnummer</span>
                  <Input value={swishNumber} onChange={(e) => { setSwishNumber(e.target.value); resetGenerated(); }} placeholder="T.ex. 0701234567" className="rounded-xl h-11" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">Swishnamn</span>
                  <Input value={swishName} onChange={(e) => { setSwishName(e.target.value); resetGenerated(); }} placeholder="Valfritt" className="rounded-xl h-11" />
                </label>
                <label className="space-y-1.5 sm:col-span-2">
                  <span className="text-xs text-muted-foreground">Swish-meddelande</span>
                  <Input value={swishMessage} onChange={(e) => { setSwishMessage(e.target.value); resetGenerated(); }} placeholder="T.ex. Ägg + namn" className="rounded-xl h-11" />
                </label>
              </div>

              <div className="rounded-2xl border border-border/50 bg-muted/25 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-primary" />
                  <p className="font-serif text-sm text-foreground">Försäljningslänk</p>
                </div>
                <p className="text-sm text-foreground break-all">{saleUrl}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button onClick={publishListing} disabled={publishing} className="rounded-xl gap-2">
                    {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Store className="h-4 w-4" />}
                    Publicera
                  </Button>
                  <Button variant="outline" onClick={() => copyText(saleUrl, 'Säljlänken')} className="rounded-xl gap-2">
                    <Copy className="h-4 w-4" /> Kopiera
                  </Button>
                  <Button variant="outline" onClick={() => window.open(saleUrl, '_blank')} className="rounded-xl gap-2">
                    <ExternalLink className="h-4 w-4" /> Visa
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Megaphone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h2 className="font-serif text-lg text-foreground">Agdas texter</h2>
                  <p className="text-sm text-muted-foreground">Skapa AI-text, kopiera eller dela direkt.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button onClick={generateWithAI} disabled={aiLoading} className="rounded-xl gap-2">
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  Skapa med AI
                </Button>
                <Button className="rounded-xl gap-2" onClick={() => window.open(facebookShareUrl, '_blank')}>
                  <Facebook className="h-4 w-4" /> Facebook
                </Button>
                <Button variant="outline" className="rounded-xl gap-2" onClick={shareNative}>
                  <Share2 className="h-4 w-4" /> Dela via mobilen
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MarketingOutput icon={Megaphone} title="Facebook / gruppinlägg" text={marketingTexts.facebook} onCopy={() => copyText(marketingTexts.facebook, 'Facebook-inlägget')} />
                <MarketingOutput icon={MessageCircle} title="SMS" text={marketingTexts.sms} onCopy={() => copyText(marketingTexts.sms, 'SMS-texten')} />
                <MarketingOutput icon={Mail} title="E-post" text={marketingTexts.email} onCopy={() => copyText(marketingTexts.email, 'Mailet')} />
                <MarketingOutput icon={Printer} title="Plansch" text={marketingTexts.poster} onCopy={() => copyText(marketingTexts.poster, 'Planschtexten')} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-2 space-y-4">
          <Card className="border-primary/25 shadow-sm overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt="Försäljningsbild" className="h-56 w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <div className="h-40 bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center">
                <ImageIcon className="h-10 w-10 text-primary/60" />
              </div>
            )}
            <CardContent className="p-5 space-y-4">
              <Badge className="bg-primary/10 text-primary border-primary/20">Förhandsvisning</Badge>
              <div>
                <h2 className="font-serif text-2xl text-foreground">{title}</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{sellingPoint}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <MiniStat label="Kartor" value={salePacks || 0} />
                <MiniStat label="Ägg/karta" value={packSize || 0} />
                <MiniStat label="Pris" value={`${pricePerPack || 0} kr`} />
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-2">
                <div className="flex items-center gap-2"><Package className="h-4 w-4 text-primary" /><p className="font-serif text-sm">Prislista</p></div>
                <PriceRow label="6-pack" value={`${packagePrices.p6} kr`} />
                <PriceRow label="12-pack" value={`${packagePrices.p12} kr`} />
                <PriceRow label="30-pack" value={`${packagePrices.p30} kr`} />
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-2">
                <p className="text-sm text-muted-foreground">📍 {location || 'Plats visas här'}</p>
                <p className="text-sm text-muted-foreground">🕒 {pickupInfo}</p>
                <p className="text-sm text-muted-foreground">💬 {contact}</p>
                <p className="text-sm text-muted-foreground">💸 {swishNumber ? `Swish: ${swishNumber}${swishName ? ` (${swishName})` : ''}` : 'Swishnummer visas här'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5 shadow-sm">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                <p className="font-serif text-sm text-foreground">Betalning</p>
              </div>
              <p className="text-xs text-muted-foreground">På kundens sida visas Swishnummer och meddelande tydligt. Kunden kan kopiera uppgifterna.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/8 via-card to-accent/5 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3 mb-4">
            <Plus className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h2 className="font-serif text-lg text-foreground">Lägg till faktisk försäljning</h2>
              <p className="text-sm text-muted-foreground">Spara när någon köper ägg. Du kan markera som betalt senare.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Kund" className="rounded-xl h-11" />
            <Input inputMode="numeric" type="number" min="1" value={eggs} onChange={(e) => setEggs(e.target.value)} className="rounded-xl h-11" />
            <Input inputMode="decimal" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-xl h-11" />
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl h-11" />
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anteckning" className="rounded-xl h-11" />
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

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-muted/30 border border-border/50 p-3">
      <p className="font-bold text-foreground tabular-nums">{value}</p>
      <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
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
