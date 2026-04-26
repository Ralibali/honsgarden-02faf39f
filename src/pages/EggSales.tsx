import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createSyncedEggSale, deleteSyncedEggSale, getSyncedEggSales, updateSyncedEggSale } from '@/lib/syncedProductState';
import type { EggSale } from '@/lib/localProductState';
import { Coins, Plus, Trash2, CheckCircle2, Clock, Users, ReceiptText, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

function todayString() {
  return new Date().toISOString().split('T')[0];
}

function kr(value: number) {
  return `${value.toFixed(0)} kr`;
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

  const { data: sales = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['egg-sales'],
    queryFn: getSyncedEggSales,
    staleTime: 30_000,
  });

  const stats = useMemo(() => {
    const totalAmount = sales.reduce((sum, s) => sum + (s.amount || 0), 0);
    const paidAmount = sales.filter((s) => s.paid).reduce((sum, s) => sum + (s.amount || 0), 0);
    const unpaidAmount = totalAmount - paidAmount;
    const totalEggs = sales.reduce((sum, s) => sum + (s.eggs || 0), 0);
    const customers = new Set(sales.map((s) => s.customer.trim()).filter(Boolean)).size;
    return { totalAmount, paidAmount, unpaidAmount, totalEggs, customers };
  }, [sales]);

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

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="data-label mb-1">Sälj ägg</p>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Äggförsäljning 🥚</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 leading-relaxed">
            Håll koll på vem som köpt ägg, vad som är betalt och vad som återstår. Datan synkas mellan dina enheter.
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
