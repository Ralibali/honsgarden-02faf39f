import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, TrendingUp, TrendingDown, Coins, ShoppingCart, Minus, Users, Loader2, Trash2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function Finance() {
  const [view, setView] = useState('overview');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ type: 'income', amount: '', description: '', category: '', date: format(new Date(), 'yyyy-MM-dd') });
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => api.getTransactions(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary-stats'] });
      setDialogOpen(false);
      setForm({ type: 'income', amount: '', description: '', category: '', date: format(new Date(), 'yyyy-MM-dd') });
      toast({ title: 'Transaktion sparad!' });
    },
    onError: (err: any) => toast({ title: 'Fel', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({ title: 'Transaktion borttagen' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description) return;
    createMutation.mutate({
      type: form.type,
      amount: parseFloat(form.amount),
      description: form.description,
      category: form.category || null,
      date: form.date,
    });
  };

  const now = new Date();
  const currentMonth = now.getMonth();

  const monthIncome = transactions
    .filter((t: any) => t.type === 'income' && new Date(t.date).getMonth() === currentMonth)
    .reduce((s: number, t: any) => s + Math.abs(t.amount), 0);

  const monthExpense = transactions
    .filter((t: any) => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth)
    .reduce((s: number, t: any) => s + Math.abs(t.amount), 0);

  const net = monthIncome - monthExpense;

  const customerMap: Record<string, { total: number; orders: number }> = {};
  transactions.filter((t: any) => t.type === 'income' && t.category).forEach((t: any) => {
    const key = t.category;
    if (!customerMap[key]) customerMap[key] = { total: 0, orders: 0 };
    customerMap[key].total += Math.abs(t.amount);
    customerMap[key].orders += 1;
  });
  const customerSales = Object.entries(customerMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total);

  if (isLoading) {
    return <div className="max-w-6xl mx-auto space-y-4 animate-fade-in"><Skeleton className="h-10 w-48" /><div className="grid grid-cols-3 gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}</div></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Ekonomi 💰</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Intäkter, kostnader och netto</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 active:scale-95 transition-transform w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Ny transaktion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">Ny transaktion</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Typ</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Intäkt</SelectItem>
                    <SelectItem value="expense">Kostnad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Beskrivning</Label>
                <Input className="mt-1.5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="T.ex. Äggförsäljning" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Belopp (kr)</Label>
                  <Input className="mt-1.5" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                </div>
                <div>
                  <Label>Datum</Label>
                  <Input className="mt-1.5" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Kategori (valfritt)</Label>
                <Input className="mt-1.5" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="T.ex. Foder, Ägg, Strö" />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Spara transaktion
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="overview">Översikt</TabsTrigger>
          <TabsTrigger value="customers">Kategorier</TabsTrigger>
        </TabsList>
      </Tabs>

      {view === 'overview' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card className="bg-card border-border border-l-4 border-l-success shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-4 w-4 text-success" />
                  <span className="data-label">Intäkter</span>
                </div>
                <p className="stat-number text-xl sm:text-2xl text-foreground">{monthIncome} kr</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border border-l-4 border-l-destructive shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Minus className="h-4 w-4 text-destructive" />
                  <span className="data-label">Kostnader</span>
                </div>
                <p className="stat-number text-xl sm:text-2xl text-foreground">{monthExpense} kr</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border border-l-4 border-l-primary shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="data-label">Netto</span>
                </div>
                <p className={`stat-number text-xl sm:text-2xl ${net >= 0 ? 'text-success' : 'text-destructive'}`}>{net} kr</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="font-serif text-base sm:text-lg">Senaste transaktioner</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {transactions.slice(0, 20).map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-secondary/50 transition-colors group">
                    <div className="min-w-0 mr-3">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">{t.description}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {t.date}{t.category && ` · ${t.category}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`stat-number text-sm sm:text-base shrink-0 ${t.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                        {t.type === 'income' ? '+' : '-'}{Math.abs(t.amount)} kr
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => deleteMutation.mutate(t.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">Inga transaktioner ännu</div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="font-serif text-base sm:text-lg flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Per kategori
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {customerSales.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 hover:bg-secondary/50 transition-colors">
                  <span className="stat-number text-lg w-6 text-center text-muted-foreground">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground truncate">{c.name}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{c.orders} transaktioner</p>
                  </div>
                  <span className="stat-number text-sm text-success shrink-0">+{c.total} kr</span>
                </div>
              ))}
              {customerSales.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">Inga kategorier registrerade ännu</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
