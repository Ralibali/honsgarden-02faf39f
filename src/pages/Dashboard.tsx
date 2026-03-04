import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Egg, Bird, TrendingUp, TrendingDown, Coins, Plus, CloudSun, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const weekData = [
  { day: 'Mån', eggs: 4 },
  { day: 'Tis', eggs: 6 },
  { day: 'Ons', eggs: 5 },
  { day: 'Tor', eggs: 7 },
  { day: 'Fre', eggs: 3 },
  { day: 'Lör', eggs: 8 },
  { day: 'Sön', eggs: 6 },
];

const stats = [
  { label: 'Ägg idag', value: '6', icon: Egg, trend: '+2', trendUp: true },
  { label: 'Hönor', value: '12', icon: Bird, trend: '', trendUp: true },
  { label: 'Denna månad', value: '142', icon: TrendingUp, trend: '+12%', trendUp: true },
  { label: 'Netto', value: '1 240 kr', icon: Coins, trend: '-3%', trendUp: false },
];

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-foreground">God morgon! 🌅</h1>
          <p className="text-muted-foreground mt-1">Tisdag 4 mars, 2026</p>
        </div>
        <Button className="gap-2 shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] active:scale-95 transition-transform">
          <Plus className="h-4 w-4" />
          Logga ägg
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border hover:border-surface-highlight transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
                {stat.trend && (
                  <span className={`text-xs font-medium flex items-center gap-1 ${stat.trendUp ? 'text-success' : 'text-destructive'}`}>
                    {stat.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className="stat-number text-2xl text-foreground">{stat.value}</p>
              <p className="data-label mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart + Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-serif">Äggproduktion denna vecka</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekData}>
                  <defs>
                    <linearGradient id="eggGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    stroke="hsl(215, 20%, 45%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(215, 20%, 45%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(217, 33%, 12%)',
                      border: '1px solid hsl(217, 33%, 20%)',
                      borderRadius: '8px',
                      color: 'hsl(210, 40%, 98%)',
                      fontSize: 13,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="eggs"
                    stroke="hsl(38, 92%, 50%)"
                    strokeWidth={2}
                    fill="url(#eggGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weather + Alerts */}
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <CloudSun className="h-8 w-8 text-primary" />
                <div>
                  <p className="stat-number text-2xl text-foreground">4°C</p>
                  <p className="text-sm text-muted-foreground">Molnigt, Stockholm</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Känns som 1°C · Luftfuktighet 78%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border border-l-4 border-l-warning">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <p className="text-sm font-medium text-foreground">Tips</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Temperaturen sjunker ikväll. Se till att hönshuset är välisolerat och att vattnet inte fryser.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <p className="data-label mb-3">Topproducenter idag</p>
              <div className="space-y-2.5">
                {[
                  { name: 'Greta', eggs: 2, breed: 'Barnevelder' },
                  { name: 'Astrid', eggs: 2, breed: 'Sussex' },
                  { name: 'Saga', eggs: 1, breed: 'Leghorn' },
                ].map((hen) => (
                  <div key={hen.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🐔</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{hen.name}</p>
                        <p className="text-xs text-muted-foreground">{hen.breed}</p>
                      </div>
                    </div>
                    <span className="stat-number text-sm text-primary">{hen.eggs} ägg</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
