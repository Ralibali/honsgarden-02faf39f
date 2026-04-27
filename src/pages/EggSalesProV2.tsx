import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Camera,
  CheckCircle2,
  Copy,
  ExternalLink,
  Facebook,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Mail,
  Megaphone,
  MessageCircle,
  Package,
  Share2,
  Store,
  Upload,
  Wallet,
  Wand2,
} from 'lucide-react';

const PUBLIC_BASE_URL = 'https://honsgarden.se';
const IMAGE_BUCKET = 'egg-sale-images';

type Tone = 'mysig' | 'kort' | 'proffsig' | 'humor';

type MarketingTexts = {
  facebook: string;
  sms: string;
  email: string;
  poster: string;
  story: string;
  price_tip?: string;
  source?: 'ai' | 'fallback' | 'template';
};

function safeNumber(value: string, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function copyText(text: string, label = 'Texten') {
  navigator.clipboard?.writeText(text);
  toast({ title: `${label} är kopierad` });
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

function encode(value: string) {
  return encodeURIComponent(value.trim());
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

function getExt(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(fromName)) return fromName;
  if (file.type.includes('png')) return 'png';
  if (file.type.includes('webp')) return 'webp';
  return 'jpg';
}

export default function EggSalesProV2() {
  const [title, setTitle] = useState('Färska ägg till salu');
  const [sellingPoint, setSellingPoint] = useState('Färska ägg från vår lilla hönsgård. Perfekt till frukost, bakning och helgmys.');
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
  const [imageUploading, setImageUploading] = useState(false);
  const [tone, setTone] = useState<Tone>('mysig');
  const [customSlug, setCustomSlug] = useState('');
  const [publishedSlug, setPublishedSlug] = useState('');
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedTexts, setGeneratedTexts] = useState<MarketingTexts | null>(null);

  const packCount = Math.max(1, safeNumber(salePacks, 1));
  const eggsPerPack = Math.max(1, safeNumber(packSize, 12));
  const price = Math.max(1, safeNumber(pricePerPack, 60));
  const totalPotential = packCount * price;

  const packagePrices = useMemo(() => {
    const perEgg = price / eggsPerPack;
    return {
      p6: Math.max(1, Math.round((perEgg * 6) / 5) * 5),
      p12: eggsPerPack === 12 ? price : Math.max(1, Math.round((perEgg * 12) / 5) * 5),
      p30: Math.max(1, Math.round((perEgg * 30) / 5) * 5),
    };
  }, [eggsPerPack, price]);

  const draftSlug = useMemo(
    () => slugify(customSlug || `${location || title} ${sellingPoint.includes('ägg') ? '' : 'agg'}`),
    [customSlug, location, sellingPoint, title]
  );
  const saleUrl = `${PUBLIC_BASE_URL}/s/${publishedSlug || draftSlug}`;

  const resetGenerated = () => setGeneratedTexts(null);

  const templateTexts = useMemo<MarketingTexts>(() => {
    const place = location.trim() || 'lokalt i området';
    const swishLine = swishNumber.trim()
      ? `\nSwish: ${swishNumber}${swishName ? ` (${swishName})` : ''}\nMeddelande: ${swishMessage || 'Ägg'}`
      : '';
    const scarcity = packCount <= 3
      ? 'Det finns bara några få kartor, så det är först till kvarn.'
      : `Just nu finns cirka ${packCount} kartor tillgängliga.`;
    const openers: Record<Tone, string> = {
      mysig: `🥚 ${title}`,
      kort: '🥚 Färska ägg säljes.',
      proffsig: 'Lokala, färska ägg finns nu till försäljning.',
      humor: 'Hönsen har jobbat hårt – nu finns ägg att köpa! 🐔🥚',
    };

    return {
      facebook: `${openers[tone]}\n\n${sellingPoint}\n\n${scarcity}\n${eggsPerPack}-pack: ${price} kr\nHämtas: ${place}\n${pickupInfo}\n${contact}${swishLine}\n\nBoka/läs mer: ${saleUrl}`,
      sms: `Hej! Nu finns färska ägg 🥚 ${eggsPerPack}-pack för ${price} kr. ${packCount} kartor finns just nu. Boka här: ${saleUrl}`,
      email: `Hej!\n\n${sellingPoint}\n\nJag har ungefär ${packCount} kartor tillgängliga.\nPris: ${price} kr för ${eggsPerPack} ägg.\nHämtning: ${place}.\n${pickupInfo}${swishLine}\n\nLäs mer/boka här:\n${saleUrl}\n\nVänliga hälsningar`,
      poster: `${title.toUpperCase()}\n\n${eggsPerPack}-pack: ${price} kr\n${packCount} kartor tillgängliga\n\nHämtas: ${place}\n${pickupInfo}\n${contact}${swishLine}\n\nBoka/läs mer:\n${saleUrl}`,
      story: `${title} 🥚\n${eggsPerPack}-pack · ${price} kr\n${place}\nBoka via länken`,
      price_tip: `Om allt säljs blir det cirka ${totalPotential} kr.`,
      source: 'template',
    };
  }, [contact, eggsPerPack, location, packCount, pickupInfo, price, saleUrl, sellingPoint, swishMessage, swishName, swishNumber, title, tone, totalPotential]);

  const marketingTexts = generatedTexts ?? templateTexts;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encode(saleUrl)}&quote=${encode(marketingTexts.facebook)}`;

  const uploadImage = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Välj en bildfil', variant: 'destructive' });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: 'Bilden är för stor', description: 'Välj en bild under 8 MB.', variant: 'destructive' });
      return;
    }

    setImageUploading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error('Du behöver vara inloggad för att ladda upp bild.');

      const ext = getExt(file);
      const path = `${userData.user.id}/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ''))}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type || 'image/jpeg' });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
      if (!data?.publicUrl) throw new Error('Kunde inte skapa bildlänk.');

      setImageUrl(data.publicUrl);
      resetGenerated();
      toast({ title: 'Bilden är uppladdad 📸', description: 'Den visas nu på säljlistan.' });
    } catch (err: any) {
      toast({ title: 'Kunde inte ladda upp bild', description: err?.message || 'Försök igen.', variant: 'destructive' });
    } finally {
      setImageUploading(false);
    }
  };

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
        packs_available: packCount,
        eggs_per_pack: eggsPerPack,
        price_per_pack: price,
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

      const result = publishedId
        ? await (supabase as any).from('public_egg_sale_listings').update(row).eq('id', publishedId).select('id, slug').single()
        : await (supabase as any).from('public_egg_sale_listings').insert(row).select('id, slug').single();

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
          monthEggs: packCount * eggsPerPack,
          monthFeedCost: 0,
          costPerEgg: 0,
          suggestedLow: price,
          suggestedHigh: Math.ceil(price * 1.2),
        },
      });
      if (error) throw error;
      if (!data?.facebook || !data?.sms || !data?.email || !data?.poster || !data?.story) throw new Error('AI-svaret saknar text');
      setGeneratedTexts({ ...data, facebook: `${data.facebook}\n\nBoka/läs mer: ${saleUrl}` } as MarketingTexts);
      toast({ title: data.source === 'ai' ? 'Agda har skapat säljtexter ✨' : 'Säljtexter skapade' });
    } catch (err: any) {
      toast({ title: 'Kunde inte skapa AI-texter', description: err?.message || 'Malltexterna finns kvar.', variant: 'destructive' });
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
        <Button onClick={publishListing} disabled={publishing} className="rounded-xl gap-2">
          {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Store className="h-4 w-4" />}
          {publishedSlug ? 'Uppdatera säljlista' : 'Publicera säljlista'}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-3 space-y-4">
          <Card className="border-primary/25 bg-gradient-to-br from-primary/10 via-card to-accent/10 shadow-sm overflow-hidden">
            <CardContent className="p-4 sm:p-5 space-y-5">
              <div className="flex items-start gap-3">
                <Wand2 className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h2 className="font-serif text-lg text-foreground">Säljlista</h2>
                  <p className="text-sm text-muted-foreground">Fyll i erbjudandet och välj om du vill ta en ny bild eller använda en befintlig bild.</p>
                </div>
              </div>

              <label className="space-y-1.5 block">
                <span className="text-xs text-muted-foreground">Rubrik/banner</span>
                <Input value={title} onChange={(e) => { setTitle(e.target.value); resetGenerated(); }} placeholder="T.ex. Färska ägg från Berg" className="rounded-xl h-11" />
              </label>

              <div className="rounded-2xl border border-border/50 bg-card/70 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-primary" />
                  <p className="font-serif text-sm text-foreground">Bild på äggen eller hönsen</p>
                </div>
                {imageUrl ? (
                  <img src={imageUrl} alt="Uppladdad försäljningsbild" className="h-48 w-full rounded-2xl object-cover border border-border/50" />
                ) : (
                  <div className="h-36 rounded-2xl border border-dashed border-border bg-muted/30 flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="sr-only"
                      disabled={imageUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadImage(file);
                        e.currentTarget.value = '';
                      }}
                    />
                    <span className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                      {imageUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                      {imageUploading ? 'Laddar upp...' : 'Ta ny bild'}
                    </span>
                  </label>

                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={imageUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadImage(file);
                        e.currentTarget.value = '';
                      }}
                    />
                    <span className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
                      {imageUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Välj från galleri
                    </span>
                  </label>
                </div>
                <Input value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); resetGenerated(); }} placeholder="Eller klistra in bildlänk" className="rounded-xl h-10" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  På mobil öppnar “Ta ny bild” kameran. “Välj från galleri” låter dig välja en befintlig bild från bildbiblioteket eller filer.
                </p>
              </div>

              <label className="space-y-1.5 block">
                <span className="text-xs text-muted-foreground">Beskrivning/säljargument</span>
                <Textarea value={sellingPoint} onChange={(e) => { setSellingPoint(e.target.value); resetGenerated(); }} className="rounded-xl min-h-[95px]" />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Field label="Kartor till salu" value={salePacks} setValue={(v) => { setSalePacks(v); resetGenerated(); }} type="number" />
                <Field label="Ägg per karta" value={packSize} setValue={(v) => { setPackSize(v); resetGenerated(); }} type="number" />
                <Field label="Pris per karta" value={pricePerPack} setValue={(v) => { setPricePerPack(v); resetGenerated(); }} type="number" />
                <label className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">Ton</span>
                  <select value={tone} onChange={(e) => { setTone(e.target.value as Tone); resetGenerated(); }} className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm">
                    <option value="mysig">Mysig</option>
                    <option value="kort">Kort</option>
                    <option value="proffsig">Proffsig</option>
                    <option value="humor">Humor</option>
                  </select>
                </label>
                <Field label="Plats" value={location} setValue={(v) => { setLocation(v); resetGenerated(); }} placeholder="T.ex. Berg" />
                <Field label="Önskad länk" value={customSlug} setValue={(v) => setCustomSlug(slugify(v))} placeholder={draftSlug} />
                <Field label="Hämtning" value={pickupInfo} setValue={(v) => { setPickupInfo(v); resetGenerated(); }} placeholder="T.ex. vid grinden efter kl 17" />
                <Field label="Kontakt" value={contact} setValue={(v) => { setContact(v); resetGenerated(); }} placeholder="T.ex. SMS eller DM" />
                <Field label="Swishnummer" value={swishNumber} setValue={(v) => { setSwishNumber(v); resetGenerated(); }} />
                <Field label="Swishnamn" value={swishName} setValue={(v) => { setSwishName(v); resetGenerated(); }} />
                <Field label="Swish-meddelande" value={swishMessage} setValue={(v) => { setSwishMessage(v); resetGenerated(); }} />
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
                  <Button variant="outline" onClick={() => copyText(saleUrl, 'Säljlänken')} className="rounded-xl gap-2"><Copy className="h-4 w-4" /> Kopiera</Button>
                  <Button variant="outline" onClick={() => window.open(saleUrl, '_blank')} className="rounded-xl gap-2"><ExternalLink className="h-4 w-4" /> Visa</Button>
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
                <Button onClick={generateWithAI} disabled={aiLoading} className="rounded-xl gap-2">{aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} Skapa med AI</Button>
                <Button className="rounded-xl gap-2" onClick={() => window.open(facebookShareUrl, '_blank')}><Facebook className="h-4 w-4" /> Facebook</Button>
                <Button variant="outline" className="rounded-xl gap-2" onClick={shareNative}><Share2 className="h-4 w-4" /> Dela via mobilen</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MarketingOutput icon={Megaphone} title="Facebook / gruppinlägg" text={marketingTexts.facebook} onCopy={() => copyText(marketingTexts.facebook, 'Facebook-inlägget')} />
                <MarketingOutput icon={MessageCircle} title="SMS" text={marketingTexts.sms} onCopy={() => copyText(marketingTexts.sms, 'SMS-texten')} />
                <MarketingOutput icon={Mail} title="E-post" text={marketingTexts.email} onCopy={() => copyText(marketingTexts.email, 'Mailet')} />
                <MarketingOutput icon={Package} title="Plansch" text={marketingTexts.poster} onCopy={() => copyText(marketingTexts.poster, 'Planschtexten')} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-2 space-y-4">
          <Card className="border-primary/25 shadow-sm overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt="Försäljningsbild" className="h-56 w-full object-cover" />
            ) : (
              <div className="h-40 bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center"><ImageIcon className="h-10 w-10 text-primary/60" /></div>
            )}
            <CardContent className="p-5 space-y-4">
              <Badge className="bg-primary/10 text-primary border-primary/20">Förhandsvisning</Badge>
              <div>
                <h2 className="font-serif text-2xl text-foreground">{title}</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{sellingPoint}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <MiniStat label="Kartor" value={packCount} />
                <MiniStat label="Ägg/karta" value={eggsPerPack} />
                <MiniStat label="Pris" value={`${price} kr`} />
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-2">
                <div className="flex items-center gap-2"><Package className="h-4 w-4 text-primary" /><p className="font-serif text-sm">Prislista</p></div>
                <PriceRow label="6-pack" value={`${packagePrices.p6} kr`} />
                <PriceRow label="12-pack" value={`${packagePrices.p12} kr`} />
                <PriceRow label="30-pack" value={`${packagePrices.p30} kr`} />
              </div>
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" /><p className="font-serif text-sm">Swish</p></div>
                <p className="text-sm text-muted-foreground">{swishNumber ? `${swishNumber}${swishName ? ` (${swishName})` : ''}` : 'Swishnummer visas här'}</p>
                <p className="text-xs text-muted-foreground">Meddelande: {swishMessage || 'Ägg'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, setValue, placeholder, type = 'text' }: { label: string; value: string; setValue: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Input type={type} value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} className="rounded-xl h-11" />
    </label>
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
  return <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{label}</span><span className="font-semibold text-foreground">{value}</span></div>;
}

function MarketingOutput({ icon: Icon, title, text, onCopy }: { icon: any; title: string; text: string; onCopy: () => void }) {
  return (
    <Card className="border-border/50 bg-card/80 shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0"><Icon className="h-4 w-4 text-primary shrink-0" /><h3 className="font-serif text-sm text-foreground truncate">{title}</h3></div>
          <Button variant="ghost" size="sm" onClick={onCopy} className="h-8 px-2 rounded-lg gap-1.5 shrink-0"><Copy className="h-3.5 w-3.5" /> Kopiera</Button>
        </div>
        <Textarea value={text} readOnly className="min-h-[130px] rounded-xl text-xs leading-relaxed resize-none bg-muted/25" />
      </CardContent>
    </Card>
  );
}
