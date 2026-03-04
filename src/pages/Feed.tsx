import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Package, TrendingDown, Egg, Calculator, ShoppingCart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const initialPurchases = [
  { id: 1, date: '2026-03-02', type: 'Hönsfoder 25kg', cost: 249, kg: 25 },
  { id: 2, date: '2026-02-20', type: 'Hönsfoder 25kg', cost: 249, kg: 25 },
  { id: 3, date: '2026-02-05', type: 'Kalkgrit 5kg', cost: 89, kg: 5 },
  { id: 4, date: '2026-01-28', type: 'Hönsfoder 25kg', cost: 229, kg: 25 },
  { id: 5, date: '2026-01-10', type: 'Mealworms 1kg', cost: 149, kg: 1 },
];

export default function Feed() {
  const [purchases, setPurchases] = useState(initialPurchases);
  const [open, setOpen] = useState(false);
  const [newType, setNewType] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newKg, setNewKg] = useState('');

  const totalCost = purchases.reduce((s, p) => s + p.cost, 0);
  const totalKg = purchases.reduce((s, p) => s + p.kg, 0);
  const totalEggs = 850; // mock
  const costPerEgg = totalCost / totalEggs;

  const handleAdd = () => {
    if (!newType || !newCost) return;
    setPurchases([
      { id: Date.now(), date: new Date().toISOString().split('T')[0], type: newType, cost: Number(newCost), kg: Number(newKg) || 0 },
      ...purchases,
    ]);
    setNewType('');
    setNewCost('');
    setNewKg('');
    setOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Foder 🥣</h1>
          <p className="text-sm text-muted-foreground mt-1">Spåra foderinköp och kostnad per ägg</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Nytt inköp
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">Registrera foderinköp</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="Typ (t.ex. Hönsfoder 25kg)" value={newType} onChange={(e) => setNewType(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Kostnad (kr)" type="number" value={newCost} onChange={(e) => setNewCost(e.target.value)} />
                <Input placeholder="Vikt (kg)" type="number" value={newKg} onChange={(e) => setNewKg(e.target.value)} />
              </div>
              <Button className="w-full" onClick={handleAdd}>Spara inköp</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-3 sm:p-4 text-center">
            <ShoppingCart className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="stat-number text-xl text-foreground">{totalCost} kr</p>
            <p className="data-label text-[10px] mt-1">Total foderkostnad</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-3 sm:p-4 text-center">
            <Package className="h-4 w-4 text-accent mx-auto mb-1" />
            <p className="stat-number text-xl text-foreground">{totalKg} kg</p>
            <p className="data-label text-[10px] mt-1">Totalt foder</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-3 sm:p-4 text-center">
            <Egg className="h-4 w-4 text-warning mx-auto mb-1" />
            <p className="stat-number text-xl text-foreground">{totalEggs}</p>
            <p className="data-label text-[10px] mt-1">Ägg totalt</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm border-l-4 border-l-primary">
          <CardContent className="p-3 sm:p-4 text-center">
            <Calculator className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="stat-number text-xl text-primary">{costPerEgg.toFixed(1)} kr</p>
            <p className="data-label text-[10px] mt-1">Kostnad/ägg</p>
          </CardContent>
        </Card>
      </div>

      {/* Consumption estimate */}
      <Card className="bg-primary/5 border-primary/20 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-primary" />
            <span className="font-serif text-sm text-primary">Förbrukningsprognos</span>
          </div>
          <p className="text-sm text-foreground">
            Med nuvarande förbrukning (~130g/höna/dag) räcker fodret i ca <strong>12 dagar</strong>.
          </p>
          <p className="text-xs text-muted-foreground mt-1">Baserat på 6 hönor och 25 kg kvar</p>
        </CardContent>
      </Card>

      {/* Purchase history */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="font-serif text-base sm:text-lg">Inköpshistorik</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {purchases.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 sm:px-6 py-3 hover:bg-secondary/50 transition-colors">
                <div className="min-w-0 mr-3">
                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">{p.type}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{p.date} · {p.kg} kg</p>
                </div>
                <span className="stat-number text-sm text-destructive shrink-0">-{p.cost} kr</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
