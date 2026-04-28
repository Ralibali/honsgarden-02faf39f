import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  CircleDollarSign,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Facebook,
  Image as ImageIcon,
  Loader2,
  Mail,
  MessageCircle,
  Package,
  PauseCircle,
  PlayCircle,
  Plus,
  Share2,
  ShoppingBasket,
  Store,
  Trash2,
  Truck,
  Upload,
  Users,
  Wallet,
  Wand2,
} from 'lucide-react';

const PUBLIC_BASE_URL = 'https://honsgarden.se';
const IMAGE_BUCKET = 'egg-sale-images';

type Tone = 'mysig' | 'kort' | 'proffsig' | 'humor';
type Listing = any;
type Booking = any;
type MarketingTexts = { facebook: string; sms: string; email: string; poster: string; story: string; price_tip?: string };

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

function safeNumber(value: string, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function encode(value: string) {
  return encodeURIComponent(value.trim());
}

function kr(value: unknown) {
  const n = Number(value || 0);
  return `${Math.round(n)} kr`;
}

function statusLabel(status: string) {
  if (status === 'paid') return 'Betald';
  if (status === 'picked_up') return 'Hämtad';
  if (status === 'cancelled') return 'Avbokad';
  return 'Ny förfrågan';
}

function statusTone(status: string) {
  if (status === 'paid') return 'bg-blue-100 text-blue-900 border-blue-200';
  if (status === 'picked_up') return 'bg-emerald-100 text-emerald-900 border-emerald-200';
  if (status === 'cancelled') return 'bg-muted text-muted-foreground border-border';
  return 'bg-amber-100 text-amber-900 border-amber-200';
}

function statusDot(status: string) {
  if (status === 'paid') return 'bg-blue-500';
  if (status === 'picked_up') return 'bg-emerald-500';
  if (status === 'cancelled') return 'bg-muted-foreground';
  return 'bg-amber-500';
}

function nextAction(status: string) {
  if (status === 'reserved') return 'Väntar på betalning/bekräftelse';
  if (status === 'paid') return 'Betald – väntar på hämtning';
  if (status === 'picked_up') return 'Klar – betald och hämtad';
  return 'Avbokad';
}

function getExt(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext && ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext)) return ext;
  if (file.type.includes('png')) return 'png';
  if (file.type.includes('webp')) return 'webp';
  return 'jpg';
}

function copyText(text: string, label = 'Texten') {
  navigator.clipboard?.writeText(text);
  toast({ title: `${label} är kopierad` });
}

function csvCell(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Du behöver vara inloggad.');
  return data.user.id;
}

async function getUniqueSlug(baseSlug: string, currentId?: string | null) {
  const clean = slugify(baseSlug);
  for (let i = 0; i < 30; i += 1) {
    const candidate = i === 0 ? clean : `${clean}-${i + 1}`;
    const { data, error } = await (supabase as any)
      .from('public_egg_sale_listings')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data || data.id === currentId) return candidate;
  }
  return `${clean}-${Date.now().toString(36)}`;
}

export default function EggSalesProV6() {
  const qc = useQueryClient();
  const [title, setTitle] = useState('Färska ägg till salu');
  const [description, setDescription] = useState('Färska ägg från vår lilla hönsgård. Perfekt till frukost, bakning och helgmys.');
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
  const [customSlug, setCustomSlug] = useState('');
  const [tone, setTone] = useState<Tone>('mysig');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [publishedSlug, setPublishedSlug] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedTexts, setGeneratedTexts] = useState<MarketingTexts | null>(null);

  useEffect(() => {
    document.title = 'Agda sälj | Hönsgården';
  }, []);

  const packCount = Math.max(1, safeNumber(salePacks, 1));
  const eggsPerPack = Math.max(1, safeNumber(packSize, 12));
  const price = Math.max(1, safeNumber(pricePerPack, 60));
  const draftSlug = useMemo(() => slugify(customSlug || `${location || title} agg`), [customSlug, location, title]);
  const saleUrl = `${PUBLIC_BASE_URL}/s/${publishedSlug || draftSlug}`;
  const p6 = Math.max(1, Math.round(((price / eggsPerPack) * 6) / 5) * 5);
  const p12 = eggsPerPack === 12 ? price : Math.max(1, Math.round(((price / eggsPerPack) * 12) / 5) * 5);
  const p30 = Math.max(1, Math.round(((price / eggsPerPack) * 30) / 5) * 5);

  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['my-public-egg-sale-listings-v6'],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      const { data, error } = await (supabase as any)
        .from('public_egg_sale_listings')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['my-public-egg-sale-bookings-v6'],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      const { data, error } = await (supabase as any)
        .from('public_egg_sale_bookings')
        .select('*')
        .eq('seller_user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30_000,
  });

  const listingById = useMemo(() => {
    const map: Record<string, Listing> = {};
    (listings as Listing[]).forEach((l) => { map[l.id] = l; });
    return map;
  }, [listings]);

  const bookingCounts = useMemo(() => {
    const map: Record<string, number> = {};
    (bookings as Booking[]).forEach((b) => {
      if (b.status !== 'cancelled') map[b.listing_id] = (map[b.listing_id] || 0) + Number(b.packs || 0);
    });
    return map;
  }, [bookings]);

  const salesStats = useMemo(() => {
    const rows = bookings as Booking[];
    const active = rows.filter((b) => b.status !== 'cancelled');
    const reserved = rows.filter((b) => b.status === 'reserved');
    const paid = rows.filter((b) => b.status === 'paid');
    const pickedUp = rows.filter((b) => b.status === 'picked_up');
    const cancelled = rows.filter((b) => b.status === 'cancelled');

    const amountFor = (items: Booking[]) => items.reduce((sum, b) => {
      const listing = listingById[b.listing_id];
      return sum + Number(b.packs || 0) * Number(listing?.price_per_pack || 0);
    }, 0);
    const packsFor = (items: Booking[]) => items.reduce((sum, b) => sum + Number(b.packs || 0), 0);

    return {
      totalActive: active.length,
      reservedCount: reserved.length,
      paidCount: paid.length,
      pickedUpCount: pickedUp.length,
      cancelledCount: cancelled.length,
      reservedPacks: packsFor(reserved),
      paidPacks: packsFor(paid),
      pickedUpPacks: packsFor(pickedUp),
      activePacks: packsFor(active),
      reservedAmount: amountFor(reserved),
      paidAmount: amountFor(paid),
      pickedUpAmount: amountFor(pickedUp),
      confirmedAmount: amountFor([...paid, ...pickedUp]),
      completedAmount: amountFor(pickedUp),
    };
  }, [bookings, listingById]);

  const texts = useMemo<MarketingTexts>(() => {
    if (generatedTexts) return generatedTexts;
    const place = location.trim() || 'lokalt i området';
    const scarcity = packCount <= 3 ? 'Det finns bara några få kartor, så det är först till kvarn.' : `Just nu finns cirka ${packCount} kartor tillgängliga.`;
    const swishLine = swishNumber.trim() ? `\nSwish: ${swishNumber}${swishName ? ` (${swishName})` : ''}\nMeddelande: ${swishMessage || 'Ägg'}` : '';
    const opener = tone === 'humor' ? 'Hönsen har jobbat hårt – nu finns ägg att köpa! 🐔🥚' : tone === 'kort' ? '🥚 Färska ägg säljes.' : tone === 'proffsig' ? 'Lokala, färska ägg finns nu till försäljning.' : `🥚 ${title}`;
    return {
      facebook: `${opener}\n\n${description}\n\n${scarcity}\n${eggsPerPack}-pack: ${price} kr\nHämtas: ${place}\n${pickupInfo}\n${contact}${swishLine}\n\nSkicka bokningsförfrågan här: ${saleUrl}`,
      sms: `Hej! Nu finns färska ägg 🥚 ${eggsPerPack}-pack för ${price} kr. Skicka bokningsförfrågan här: ${saleUrl}`,
      email: `Hej!\n\n${description}\n\nJag har ungefär ${packCount} kartor tillgängliga. Pris: ${price} kr för ${eggsPerPack} ägg.\nHämtning: ${place}.\n${pickupInfo}${swishLine}\n\nSkicka bokningsförfrågan här:\n${saleUrl}\n\nVänliga hälsningar`,
      poster: `${title.toUpperCase()}\n\n${eggsPerPack}-pack: ${price} kr\n${packCount} kartor tillgängliga\n\nHämtas: ${place}\n${pickupInfo}\n${contact}${swishLine}\n\nBokningsförfrågan:\n${saleUrl}`,
      story: `${title} 🥚\n${eggsPerPack}-pack · ${price} kr\n${place}\nBoka via länken`,
      price_tip: `Om allt säljs blir det cirka ${packCount * price} kr.`,
    };
  }, [generatedTexts, title, description, packCount, eggsPerPack, price, location, pickupInfo, contact, swishNumber, swishName, swishMessage, saleUrl, tone]);

  const invalidateAgda = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['my-public-egg-sale-listings-v6'] }),
      qc.invalidateQueries({ queryKey: ['my-public-egg-sale-bookings-v6'] }),
    ]);
  };

  const loadListing = (l: Listing) => {
    setEditingId(l.id);
    setPublishedSlug(l.slug || '');
    setCustomSlug(l.slug || '');
    setTitle(l.title || 'Färska ägg till salu');
    setDescription(l.description || '');
    setImageUrl(l.image_url || '');
    setSalePacks(String(l.packs_available || 1));
    setPackSize(String(l.eggs_per_pack || 12));
    setPricePerPack(String(Math.round(Number(l.price_per_pack || 60))));
    setLocation(l.location || '');
    setPickupInfo(l.pickup_info || '');
    setContact(l.contact_info || '');
    setSwishNumber(l.swish_number || '');
    setSwishName(l.swish_name || '');
    setSwishMessage(l.swish_message || 'Ägg');
    setGeneratedTexts(null);
    toast({ title: 'Säljlistan är öppnad för redigering' });
  };

  const duplicateListing = (l: Listing) => {
    loadListing(l);
    setEditingId(null);
    setPublishedSlug('');
    setCustomSlug(`${l.slug || draftSlug}-ny`);
    toast({ title: 'Säljlistan är duplicerad', description: 'Publicera för att skapa en ny länk.' });
  };

  const newListing = () => {
    setEditingId(null);
    setPublishedSlug('');
    setCustomSlug('');
    setGeneratedTexts(null);
    toast({ title: 'Ny säljlista skapad' });
  };

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) return toast({ title: 'Välj en bildfil', variant: 'destructive' });
    if (file.size > 8 * 1024 * 1024) return toast({ title: 'Bilden är för stor', description: 'Välj en bild under 8 MB.', variant: 'destructive' });
    setImageUploading(true);
    try {
      const userId = await getCurrentUserId();
      const path = `${userId}/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ''))}.${getExt(file)}`;
      const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type || 'image/jpeg' });
      if (error) throw error;
      const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
      setImageUrl(data.publicUrl);
      setGeneratedTexts(null);
      toast({ title: 'Bilden är uppladdad 📸' });
    } catch (e: any) {
      toast({ title: 'Kunde inte ladda upp bild', description: e.message, variant: 'destructive' });
    } finally {
      setImageUploading(false);
    }
  };

  const publishListing = async () => {
    setPublishing(true);
    try {
      const userId = await getCurrentUserId();
      const requestedSlug = publishedSlug || customSlug || draftSlug;
      const slug = await getUniqueSlug(requestedSlug, editingId);
      const row = {
        user_id: userId,
        slug,
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl.trim() || null,
        packs_available: packCount,
        eggs_per_pack: eggsPerPack,
        price_per_pack: price,
        location: location.trim() || null,
        pickup_info: pickupInfo.trim() || null,
        contact_info: contact.trim() || null,
        swish_number: swishNumber.trim() || null,
        swish_name: swishName.trim() || null,
        swish_message: swishMessage.trim() || 'Ägg',
        p6_price: p6,
        p12_price: p12,
        p30_price: p30,
        is_active: true,
      };
      const result = editingId
        ? await (supabase as any).from('public_egg_sale_listings').update(row).eq('id', editingId).select('id, slug').single()
        : await (supabase as any).from('public_egg_sale_listings').insert(row).select('id, slug').single();
      if (result.error) throw result.error;
      setEditingId(result.data.id);
      setPublishedSlug(result.data.slug);
      setCustomSlug(result.data.slug);
      await invalidateAgda();
      toast({ title: editingId ? 'Säljlistan är uppdaterad ✨' : 'Säljlistan är publicerad ✨', description: `${PUBLIC_BASE_URL}/s/${result.data.slug}` });
      if (slug !== requestedSlug) toast({ title: 'Länken justerades automatiskt', description: `Den blev /s/${slug} eftersom önskad länk var upptagen.` });
    } catch (e: any) {
      toast({ title: 'Kunde inte publicera', description: e.message, variant: 'destructive' });
    } finally {
      setPublishing(false);
    }
  };

  const updateListingState = async (id: string, patch: Record<string, unknown>, message: string) => {
    const { error } = await (supabase as any).from('public_egg_sale_listings').update(patch).eq('id', id);
    if (error) return toast({ title: 'Kunde inte uppdatera säljlistan', description: error.message, variant: 'destructive' });
    await invalidateAgda();
    toast({ title: message });
  };

  const deleteListing = async (listing: Listing) => {
    const ok = window.confirm(`Vill du ta bort säljlistan ”${listing.title || listing.slug}”? Länken /s/${listing.slug} kommer sluta fungera och bokningar för listan tas bort.`);
    if (!ok) return;
    const { error } = await (supabase as any).from('public_egg_sale_listings').delete().eq('id', listing.id);
    if (error) return toast({ title: 'Kunde inte ta bort säljlistan', description: error.message, variant: 'destructive' });
    if (editingId === listing.id) newListing();
    await invalidateAgda();
    toast({ title: 'Säljlistan är borttagen', description: `Länken /s/${listing.slug} är inte längre aktiv.` });
  };

  const updateBookingStatus = async (id: string, status: string) => {
    const current = (bookings as Booking[]).find((b) => b.id === id);
    if (current?.status === 'picked_up' && status === 'paid') {
      return toast({ title: 'Hämtade bokningar kan inte nedgraderas', description: 'En hämtad bokning är redan betald och avslutad.', variant: 'destructive' });
    }
    const { error } = await (supabase as any).from('public_egg_sale_bookings').update({ status }).eq('id', id);
    if (error) return toast({ title: 'Kunde inte uppdatera bokningen', description: error.message, variant: 'destructive' });
    await invalidateAgda();
    toast({ title: status === 'paid' ? 'Bokningen är markerad som betald' : status === 'picked_up' ? 'Bokningen är markerad som hämtad' : 'Bokningen är uppdaterad' });
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
          sellingPoint: description,
          monthEggs: packCount * eggsPerPack,
          monthFeedCost: 0,
          costPerEgg: 0,
          suggestedLow: price,
          suggestedHigh: Math.ceil(price * 1.2),
        },
      });
      if (error) throw error;
      setGeneratedTexts({ ...data, facebook: `${data.facebook}\n\nSkicka bokningsförfrågan här: ${saleUrl}` });
      toast({ title: 'Agda har skapat säljtexter ✨' });
    } catch (e: any) {
      toast({ title: 'Kunde inte skapa AI-texter', description: e.message, variant: 'destructive' });
    } finally {
      setAiLoading(false);
    }
  };

  const shareNative = async () => {
    if (navigator.share) await navigator.share({ title, text: texts.facebook, url: saleUrl }).catch(() => undefined);
    else copyText(texts.facebook, 'Delningstexten');
  };

  const customerReply = (booking: Booking) => {
    const listing = listingById[booking.listing_id];
    const unitPrice = Number(listing?.price_per_pack || 0);
    const sum = Number(booking.packs || 0) * unitPrice;
    const swish = listing?.swish_number ? `\nSwish: ${listing.swish_number}${listing.swish_name ? ` (${listing.swish_name})` : ''}\nMeddelande: ${listing.swish_message || 'Ägg'}` : '';
    return `Hej ${booking.customer_name}! Din bokningsförfrågan på ${booking.packs} karta/kartor ägg är mottagen.${unitPrice ? `\nSumma: ${sum} kr.` : ''}\n${listing?.pickup_info || 'Vi bestämmer hämtningstid tillsammans.'}${swish}\n\nVänliga hälsningar`;
  };

  const exportBookingsCsv = () => {
    const rows = [
      ['Datum', 'Säljlista', 'Länk', 'Kundnamn', 'Kontakt', 'Antal kartor', 'Pris per karta', 'Summa', 'Status', 'Meddelande'],
      ...(bookings as Booking[]).map((b) => {
        const listing = listingById[b.listing_id];
        const unitPrice = Number(listing?.price_per_pack || 0);
        return [
          new Date(b.created_at).toLocaleString('sv-SE'),
          listing?.title || 'Okänd säljlista',
          listing?.slug ? `${PUBLIC_BASE_URL}/s/${listing.slug}` : '',
          b.customer_name,
          b.customer_phone || '',
          b.packs,
          unitPrice || '',
          unitPrice ? Number(b.packs || 0) * unitPrice : '',
          statusLabel(b.status),
          b.customer_message || '',
        ];
      }),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(';')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agda-bokningar-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'CSV exporterad', description: 'Filen kan öppnas i Excel eller Google Sheets.' });
  };

  const copyCustomerList = () => {
    const text = (bookings as Booking[]).map((b) => {
      const listing = listingById[b.listing_id];
      const unitPrice = Number(listing?.price_per_pack || 0);
      const sum = unitPrice ? ` · ${Number(b.packs || 0) * unitPrice} kr` : '';
      return `${b.customer_name}${b.customer_phone ? ` (${b.customer_phone})` : ''} · ${b.packs} kartor${sum} · ${statusLabel(b.status)} · ${listing?.title || 'Okänd säljlista'}`;
    }).join('\n');
    copyText(text || 'Inga bokningar ännu', 'Kundlistan');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <div>
          <p className="data-label mb-1">Sälj ägg</p>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Agda-säljgenerator 🥚</h1>
          <p className="text-sm text-muted-foreground mt-1">Skapa säljlistor, ta emot bokningsförfrågningar, visa Swish och håll koll på lagret.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={newListing} className="rounded-xl gap-2"><Plus className="h-4 w-4" /> Ny lista</Button>
          <Button onClick={publishListing} disabled={publishing} className="rounded-xl gap-2">{publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Store className="h-4 w-4" />} {editingId ? 'Uppdatera' : 'Publicera'}</Button>
        </div>
      </div>

      <Card className="border-primary/25 bg-gradient-to-br from-primary/10 via-card to-accent/10 shadow-sm">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg flex items-center gap-2"><ShoppingBasket className="h-5 w-5 text-primary" /> Försäljning och beställningar</h2>
              <p className="text-sm text-muted-foreground">Här ser du både statistik och alla som skickat in en förfrågan via dina säljsidor.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button variant="outline" className="rounded-xl gap-2" onClick={copyCustomerList}><Copy className="h-4 w-4" /> Kopiera kundlista</Button>
              <Button variant="outline" className="rounded-xl gap-2" onClick={exportBookingsCsv}><Download className="h-4 w-4" /> Exportera CSV</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <SalesStat icon={AlertCircle} label="Nya förfrågningar" value={salesStats.reservedCount} sub={`${salesStats.reservedPacks} kartor · ${kr(salesStats.reservedAmount)}`} tone="amber" />
            <SalesStat icon={CircleDollarSign} label="Betalda (ej hämtade)" value={salesStats.paidCount} sub={`${salesStats.paidPacks} kartor · ${kr(salesStats.paidAmount)}`} tone="blue" />
            <SalesStat icon={Truck} label="Hämtade & klara" value={salesStats.pickedUpCount} sub={`${salesStats.pickedUpPacks} kartor · ${kr(salesStats.pickedUpAmount)}`} tone="green" />
            <SalesStat icon={Wallet} label="Bekräftat värde" value={kr(salesStats.confirmedAmount)} sub={`${salesStats.paidPacks + salesStats.pickedUpPacks} kartor betalda/hämtade`} tone="default" />
          </div>

          {bookingsLoading ? (
            <div className="py-6 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (bookings as Booking[]).length === 0 ? (
            <div className="rounded-2xl border border-dashed p-5 text-center"><Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" /><p className="font-medium">Inga bokningsförfrågningar ännu</p><p className="text-sm text-muted-foreground mt-1">När någon beställer via din publika länk visas det här direkt.</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {(bookings as Booking[]).map((b) => {
                const listing = listingById[b.listing_id];
                const unitPrice = Number(listing?.price_per_pack || 0);
                const total = unitPrice ? Number(b.packs || 0) * unitPrice : 0;
                const isPaid = b.status === 'paid' || b.status === 'picked_up';
                const isPickedUp = b.status === 'picked_up';
                return (
                  <div key={b.id} className={`rounded-2xl border bg-card p-4 space-y-3 shadow-sm ${b.status === 'reserved' ? 'border-blue-200' : b.status === 'paid' ? 'border-amber-200' : b.status === 'picked_up' ? 'border-emerald-200 bg-emerald-50/30' : 'opacity-70'}`}>
                    <div className="flex justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{b.customer_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{b.customer_phone || 'Ingen kontakt angiven'}</p>
                      </div>
                      <Badge className={statusTone(b.status)}>{statusLabel(b.status)}</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <MiniStat label="Kartor" value={b.packs} />
                      <MiniStat label="Summa" value={total ? kr(total) : '–'} />
                      <MiniStat label="Status" value={isPickedUp ? 'Klar' : isPaid ? 'Betald' : 'Ny'} />
                    </div>

                    <div className="rounded-xl bg-muted/30 border p-3 text-xs space-y-1">
                      <p><span className="text-muted-foreground">Gäller:</span> <strong>{listing?.title || 'Okänd säljlista'}</strong></p>
                      {listing?.slug && <p className="truncate text-muted-foreground">{PUBLIC_BASE_URL}/s/{listing.slug}</p>}
                      <p><span className="text-muted-foreground">Nästa steg:</span> <strong>{nextAction(b.status)}</strong></p>
                    </div>

                    {b.customer_message && <p className="text-xs text-muted-foreground whitespace-pre-wrap">{b.customer_message}</p>}

                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant={isPaid ? 'default' : 'outline'} className="rounded-xl" onClick={() => updateBookingStatus(b.id, 'paid')} disabled={b.status === 'cancelled' || isPickedUp} title={isPickedUp ? 'Hämtade bokningar kan inte nedgraderas' : undefined}><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Betald</Button>
                      <Button size="sm" variant={isPickedUp ? 'default' : 'outline'} className="rounded-xl" onClick={() => updateBookingStatus(b.id, 'picked_up')} disabled={b.status === 'cancelled'}><Truck className="h-3.5 w-3.5 mr-1" /> Hämtad</Button>
                      <Button size="sm" variant="outline" className="rounded-xl col-span-2" onClick={() => copyText(customerReply(b), 'Svar till kund')}><MessageCircle className="h-3.5 w-3.5 mr-1" /> Kopiera svar till kund</Button>
                      {b.status !== 'cancelled' && <Button size="sm" variant="ghost" className="rounded-xl text-destructive hover:text-destructive col-span-2" onClick={() => updateBookingStatus(b.id, 'cancelled')}><Trash2 className="h-3.5 w-3.5 mr-1" /> Avboka</Button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <Card className="border-primary/25 bg-gradient-to-br from-primary/10 via-card to-accent/10 shadow-sm">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <h2 className="font-serif text-lg">Säljlista</h2>
              <Field label="Rubrik/banner" value={title} setValue={(v) => { setTitle(v); setGeneratedTexts(null); }} />
              <div className="rounded-2xl border border-border/50 bg-card/70 p-4 space-y-3">
                <p className="font-serif text-sm flex items-center gap-2"><Camera className="h-4 w-4 text-primary" /> Bild</p>
                {imageUrl ? <img src={imageUrl} className="h-52 w-full rounded-2xl object-cover border" /> : <div className="h-40 rounded-2xl border border-dashed flex items-center justify-center text-muted-foreground"><ImageIcon className="h-8 w-8" /></div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2"><FileButton label="Ta ny bild" icon="camera" uploading={imageUploading} capture onFile={uploadImage} /><FileButton label="Välj från galleri" icon="upload" uploading={imageUploading} onFile={uploadImage} /></div>
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Eller klistra in bildlänk" className="rounded-xl" />
              </div>
              <label className="space-y-1.5 block"><span className="text-xs text-muted-foreground">Beskrivning</span><Textarea value={description} onChange={(e) => { setDescription(e.target.value); setGeneratedTexts(null); }} className="rounded-xl min-h-[95px]" /></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Field label="Kartor" value={salePacks} setValue={setSalePacks} type="number" />
                <Field label="Ägg/karta" value={packSize} setValue={setPackSize} type="number" />
                <Field label="Pris/karta" value={pricePerPack} setValue={setPricePerPack} type="number" />
                <label className="space-y-1.5"><span className="text-xs text-muted-foreground">Ton</span><select value={tone} onChange={(e) => setTone(e.target.value as Tone)} className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm"><option value="mysig">Mysig</option><option value="kort">Kort</option><option value="proffsig">Proffsig</option><option value="humor">Humor</option></select></label>
                <Field label="Plats" value={location} setValue={setLocation} />
                <Field label="Önskad länk" value={customSlug} setValue={(v) => setCustomSlug(slugify(v))} placeholder={draftSlug} />
                <Field label="Hämtning" value={pickupInfo} setValue={setPickupInfo} />
                <Field label="Kontakt" value={contact} setValue={setContact} />
                <Field label="Swishnummer" value={swishNumber} setValue={setSwishNumber} />
                <Field label="Swishnamn" value={swishName} setValue={setSwishName} />
                <Field label="Swish-meddelande" value={swishMessage} setValue={setSwishMessage} />
              </div>
              <div className="rounded-2xl bg-muted/25 border p-4 space-y-3"><p className="text-sm break-all">{saleUrl}</p><div className="grid grid-cols-1 sm:grid-cols-3 gap-2"><Button onClick={publishListing} disabled={publishing} className="rounded-xl">{editingId ? 'Uppdatera' : 'Publicera'}</Button><Button variant="outline" onClick={() => copyText(saleUrl, 'Säljlänken')} className="rounded-xl">Kopiera</Button><Button variant="outline" onClick={() => window.open(saleUrl, '_blank')} className="rounded-xl">Visa</Button></div></div>
            </CardContent>
          </Card>

          <Card className="shadow-sm"><CardContent className="p-4 sm:p-5 space-y-4"><div className="flex items-center justify-between gap-2"><h2 className="font-serif text-lg">Agdas texter</h2><Button onClick={generateWithAI} disabled={aiLoading} className="rounded-xl gap-2">{aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} AI</Button></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-2"><Button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encode(saleUrl)}&quote=${encode(texts.facebook)}`, '_blank')} className="rounded-xl gap-2"><Facebook className="h-4 w-4" /> Facebook</Button><Button variant="outline" onClick={shareNative} className="rounded-xl gap-2"><Share2 className="h-4 w-4" /> Dela</Button><Button variant="outline" onClick={() => copyText(texts.facebook, 'Facebooktexten')} className="rounded-xl gap-2"><Copy className="h-4 w-4" /> Kopiera</Button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><MarketingOutput icon={MessageCircle} title="Facebook" text={texts.facebook} /><MarketingOutput icon={MessageCircle} title="SMS" text={texts.sms} /><MarketingOutput icon={Mail} title="E-post" text={texts.email} /><MarketingOutput icon={Package} title="Plansch" text={texts.poster} /></div></CardContent></Card>
        </div>

        <div className="space-y-5">
          <Card className="overflow-hidden shadow-sm">{imageUrl ? <img src={imageUrl} className="h-48 w-full object-cover" /> : <div className="h-40 bg-muted/30 flex items-center justify-center"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>}<CardContent className="p-4 space-y-3"><Badge>Förhandsvisning</Badge><h2 className="font-serif text-2xl">{title}</h2><p className="text-sm text-muted-foreground">{description}</p><div className="grid grid-cols-3 gap-2 text-center"><MiniStat label="Kartor" value={packCount} /><MiniStat label="Ägg" value={eggsPerPack} /><MiniStat label="Pris" value={`${price} kr`} /></div><div className="rounded-2xl border bg-muted/20 p-4 text-sm space-y-1"><PriceRow label="6-pack" value={`${p6} kr`} /><PriceRow label="12-pack" value={`${p12} kr`} /><PriceRow label="30-pack" value={`${p30} kr`} /></div><div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm"><Wallet className="h-4 w-4 inline mr-1 text-primary" /> {swishNumber || 'Swishnummer visas här'}</div></CardContent></Card>

          <Card className="shadow-sm"><CardContent className="p-4 space-y-3"><h2 className="font-serif text-lg">Mina säljlistor</h2>{listingsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (listings as Listing[]).length === 0 ? <p className="text-sm text-muted-foreground">Inga publicerade säljlistor ännu.</p> : <div className="space-y-2">{(listings as Listing[]).slice(0, 8).map((l) => { const booked = bookingCounts[l.id] || 0; const left = Math.max(0, Number(l.packs_available || 0) - booked); return <div key={l.id} className="rounded-2xl border p-3 space-y-2"><div><p className="font-medium text-sm truncate">{l.title}</p><p className="text-xs text-muted-foreground truncate">{PUBLIC_BASE_URL}/s/{l.slug}</p></div><div className="flex flex-wrap gap-1"><Badge variant={l.is_active ? 'default' : 'secondary'}>{l.is_active ? 'Aktiv' : 'Pausad'}</Badge>{l.sold_out_manually && <Badge variant="destructive">Slutsåld</Badge>}<Badge variant="outline">{left} kvar</Badge></div><div className="grid grid-cols-2 gap-2"><Button size="sm" variant="outline" className="rounded-xl" onClick={() => loadListing(l)}><Edit3 className="h-3.5 w-3.5 mr-1" /> Redigera</Button><Button size="sm" variant="ghost" className="rounded-xl" onClick={() => window.open(`${PUBLIC_BASE_URL}/s/${l.slug}`, '_blank')}><ExternalLink className="h-3.5 w-3.5 mr-1" /> Visa</Button><Button size="sm" variant="outline" className="rounded-xl" onClick={() => duplicateListing(l)}><Copy className="h-3.5 w-3.5 mr-1" /> Duplicera</Button><Button size="sm" variant="outline" className="rounded-xl" onClick={() => updateListingState(l.id, { is_active: !l.is_active }, l.is_active ? 'Säljlistan är pausad' : 'Säljlistan är aktiv igen')}>{l.is_active ? <PauseCircle className="h-3.5 w-3.5 mr-1" /> : <PlayCircle className="h-3.5 w-3.5 mr-1" />}{l.is_active ? 'Pausa' : 'Aktivera'}</Button><Button size="sm" variant="outline" className="rounded-xl" onClick={() => updateListingState(l.id, { sold_out_manually: !l.sold_out_manually }, l.sold_out_manually ? 'Säljlistan är inte längre slutsåld' : 'Säljlistan är markerad som slutsåld')}>{l.sold_out_manually ? 'Öppna' : 'Slutsåld'}</Button><Button size="sm" variant="ghost" className="rounded-xl text-destructive hover:text-destructive" onClick={() => deleteListing(l)}><Trash2 className="h-3.5 w-3.5 mr-1" /> Ta bort</Button></div></div>; })}</div>}</CardContent></Card>
        </div>
      </div>
    </div>
  );
}

function SalesStat({ icon: Icon, label, value, sub, tone }: { icon: any; label: string; value: string | number; sub: string; tone: 'blue' | 'amber' | 'green' | 'default' }) {
  const toneClass = tone === 'blue' ? 'bg-blue-50 border-blue-200 text-blue-900' : tone === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-900' : tone === 'green' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-card border-border text-foreground';
  return <div className={`rounded-2xl border p-4 ${toneClass}`}><Icon className="h-4 w-4 mb-2" /><p className="text-2xl font-bold tabular-nums">{value}</p><p className="data-label text-[10px] mt-1">{label}</p><p className="text-xs mt-1 opacity-80">{sub}</p></div>;
}

function FileButton({ label, icon, uploading, capture, onFile }: { label: string; icon: 'camera' | 'upload'; uploading: boolean; capture?: boolean; onFile: (file: File) => void }) {
  const Icon = icon === 'camera' ? Camera : Upload;
  return <label className="cursor-pointer"><input type="file" accept="image/*" capture={capture ? 'environment' : undefined} className="sr-only" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) onFile(file); e.currentTarget.value = ''; }} /><span className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-medium hover:bg-muted/50 transition-colors">{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}{uploading ? 'Laddar upp...' : label}</span></label>;
}

function Field({ label, value, setValue, placeholder, type = 'text' }: { label: string; value: string; setValue: (v: string) => void; placeholder?: string; type?: string }) {
  return <label className="space-y-1.5"><span className="text-xs text-muted-foreground">{label}</span><Input type={type} value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} className="rounded-xl h-11" /></label>;
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl bg-muted/30 border p-3"><p className="font-bold text-foreground tabular-nums truncate">{value}</p><p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1">{label}</p></div>;
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="font-semibold">{value}</span></div>;
}

function MarketingOutput({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return <Card className="border-border/50 bg-card/80 shadow-sm"><CardContent className="p-4 space-y-3"><div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2 min-w-0"><Icon className="h-4 w-4 text-primary shrink-0" /><h3 className="font-serif text-sm truncate">{title}</h3></div><Button variant="ghost" size="sm" onClick={() => copyText(text, title)} className="h-8 px-2 rounded-lg"><Copy className="h-3.5 w-3.5 mr-1" /> Kopiera</Button></div><Textarea value={text} readOnly className="min-h-[120px] rounded-xl text-xs leading-relaxed resize-none bg-muted/25" /></CardContent></Card>;
}
