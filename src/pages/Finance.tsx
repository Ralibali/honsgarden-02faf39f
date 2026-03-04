import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, Coins, ShoppingCart, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { month: 'Sep', income: 800, costs: 450 },
  { month: 'Okt', income: 920, costs: 500 },
  { month: 'Nov', income: 750, costs: 480 },
  { month: 'Dec', income: 600, costs: 520 },
  { month: 'Jan', income: 500, costs: 490 },
  { month: 'Feb', income: 850, costs: 460 },
  { month: 'Mar', income: 400, costs: 200 },
];

const recentTransactions = [
  { id: 1, description: 'Äggförsäljning – 3 kartonger', amount: 180, type: 'income', date: '2026-03-03' },
  { id: 2, description: 'Foder – 25kg säck', amount: -249, type: 'expense', date: '2026-03-02' },
  { id: 3, description: 'Äggförsäljning – 2 kartonger', amount: 120, type: 'income', date: '2026-03-01' },
  { id: 4, description: 'Veterinärbesök – Freja', amount: -450, type: 'expense', date: '2026-02-28' },
  { id: 5, description: 'Äggförsäljning – 5 kartonger', amount: 300, type: 'income', date: '2026-02-27' },
];

export default function Finance() {
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-card border-border border-l-4 border-l-success">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="h-4 w-4 text-success" />
              <span className="data-label">Intäkter (mars)</span>
            </div>
            <p className="stat-number text-xl sm:text-2xl text-foreground">1 680 kr</p>
            <span className="text-[10px] sm:text-xs text-success flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> +15% vs förra månaden
            </span>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-l-4 border-l-destructive">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <Minus className="h-4 w-4 text-destructive" />
              <span className="data-label">Kostnader (mars)</span>
            </div>
            <p className="stat-number text-xl sm:text-2xl text-foreground">699 kr</p>
            <span className="text-[10px] sm:text-xs text-destructive flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3" /> -8% vs förra månaden
            </span>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-l-4 border-l-primary">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-4 w-4 text-primary" />
              <span className="data-label">Netto (mars)</span>
            </div>
            <p className="stat-number text-xl sm:text-2xl text-foreground">981 kr</p>
            <span className="text-[10px] sm:text-xs text-primary flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> Vinst!
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="font-serif text-base sm:text-lg">Intäkter vs Kostnader</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" stroke="hsl(215, 20%, 45%)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(215, 20%, 45%)" fontSize={11} tickLine={false} axisLine={false} width={35} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(217, 33%, 12%)',
                    border: '1px solid hsl(217, 33%, 20%)',
                    borderRadius: '8px',
                    color: 'hsl(210, 40%, 98%)',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="income" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="costs" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card className="bg-card border-border">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="font-serif text-base sm:text-lg">Senaste transaktioner</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-secondary/50 transition-colors">
                <div className="min-w-0 mr-3">
                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">{t.description}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{t.date}</p>
                </div>
                <span className={`stat-number text-sm sm:text-base shrink-0 ${t.amount > 0 ? 'text-success' : 'text-destructive'}`}>
                  {t.amount > 0 ? '+' : ''}{t.amount} kr
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
