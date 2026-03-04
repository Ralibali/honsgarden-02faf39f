import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, Coins, ShoppingCart, Minus, Users, Loader2, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const tooltipStyle = {
  backgroundColor: 'hsl(40, 25%, 99%)',
  border: '1px solid hsl(35, 15%, 85%)',
  borderRadius: '8px',
  color: 'hsl(30, 10%, 15%)',
  fontSize: 12,
};

export default function Finance() {
  const [view, setView] = useState('overview');

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => api.getTransactions(),
  });

  const { data: summaryStats } = useQuery({
    queryKey: ['summary-stats'],
    queryFn: () => api.getSummaryStats().catch(() => null),
  });

  const now = new Date();
  const currentMonth = now.getMonth();
  
  const monthIncome = transactions
    .filter((t: any) => t.type === 'income' && new Date(t.date).getMonth() === currentMonth)
    .reduce((s: number, t: any) => s + Math.abs(t.amount), 0);
  
  const monthExpense = transactions
    .filter((t: any) => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth)
    .reduce((s: number, t: any) => s + Math.abs(t.amount), 0);

  const net = monthIncome - monthExpense;

  // Group by customer
  const customerMap: Record<string, { total: number; orders: number }> = {};
  transactions.filter((t: any) => t.type === 'income' && t.customer).forEach((t: any) => {
    if (!customerMap[t.customer]) customerMap[t.customer] = { total: 0, orders: 0 };
    customerMap[t.customer].total += Math.abs(t.amount);
    customerMap[t.customer].orders += 1;
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
        <Button className="gap-2 active:scale-95 transition-transform w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Ny transaktion
        </Button>
      </div>

      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="overview">Översikt</TabsTrigger>
          <TabsTrigger value="customers">Kunder</TabsTrigger>
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
                  <div key={t._id || t.id} className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-secondary/50 transition-colors">
                    <div className="min-w-0 mr-3">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">{t.description}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {t.date}{t.customer && ` · ${t.customer}`}
                      </p>
                    </div>
                    <span className={`stat-number text-sm sm:text-base shrink-0 ${t.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                      {t.type === 'income' ? '+' : '-'}{Math.abs(t.amount)} kr
                    </span>
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
              Försäljning per kund
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
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{c.orders} beställningar</p>
                  </div>
                  <span className="stat-number text-sm text-success shrink-0">+{c.total} kr</span>
                </div>
              ))}
              {customerSales.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">Inga kundförsäljningar registrerade ännu</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
