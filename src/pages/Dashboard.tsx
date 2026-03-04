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
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">God morgon! 🌅</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Tisdag 4 mars, 2026</p>
        </div>
        <Button className="gap-2 shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] active:scale-95 transition-transform w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Logga ägg
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border hover:border-surface-highlight transition-all duration-300">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
                {stat.trend && (
                  <span className={`text-[10px] sm:text-xs font-medium flex items-center gap-0.5 ${stat.trendUp ? 'text-success' : 'text-destructive'}`}>
                    {stat.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className="stat-number text-xl sm:text-2xl text-foreground">{stat.value}</p>
              <p className="data-label mt-1 text-[10px] sm:text-xs">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart + Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Chart */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg font-serif">Äggproduktion denna vecka</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="h-48 sm:h-64">
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
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(215, 20%, 45%)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={30}
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
        <div className="space-y-3 sm:space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <CloudSun className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                <div>
                  <p className="stat-number text-xl sm:text-2xl text-foreground">4°C</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Molnigt, Stockholm</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Känns som 1°C · Luftfuktighet 78%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border border-l-4 border-l-warning">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <p className="text-sm font-medium text-foreground">Tips</p>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Temperaturen sjunker ikväll. Se till att hönshuset är välisolerat och att vattnet inte fryser.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 sm:p-5">
              <p className="data-label mb-3">Topproducenter idag</p>
              <div className="space-y-2.5">
                {[
                  { name: 'Greta', eggs: 2, breed: 'Barnevelder' },
                  { name: 'Astrid', eggs: 2, breed: 'Sussex' },
                  { name: 'Saga', eggs: 1, breed: 'Leghorn' },
                ].map((hen) => (
                  <div key={hen.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg">🐔</span>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-foreground">{hen.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{hen.breed}</p>
                      </div>
                    </div>
                    <span className="stat-number text-xs sm:text-sm text-primary">{hen.eggs} ägg</span>
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
