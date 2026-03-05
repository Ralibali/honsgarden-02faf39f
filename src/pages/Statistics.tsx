import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { PremiumGate } from '@/components/PremiumGate';

export default function Statistics() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['stats-summary'],
    queryFn: () => api.getSummaryStats().catch(() => null),
  });

  const { data: insights } = useQuery({
    queryKey: ['stats-insights'],
    queryFn: () => api.getStatisticsInsights().catch(() => null),
  });

  const { data: feedStats } = useQuery({
    queryKey: ['feed-stats-for-statistics'],
    queryFn: () => api.getFeedStatistics().catch(() => null),
  });

  const { data: hens = [] } = useQuery({
    queryKey: ['hens-for-stats'],
    queryFn: () => api.getHens().catch(() => []),
  });

  const costPerEgg = feedStats?.cost_per_egg || 0;
  const revenuePerEgg = insights?.revenue_per_egg || 0;
  const profitPerEgg = revenuePerEgg - costPerEgg;

  if (summaryLoading) {
    return <div className="max-w-7xl mx-auto space-y-4 animate-fade-in"><Skeleton className="h-10 w-48" /><div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20" />)}</div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Statistik 📊</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Detaljerad analys av din hönsgård</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Totalt ägg', value: summary?.total_eggs ?? '–' },
          { label: 'Snitt/dag', value: summary?.avg_per_day != null ? Number(summary.avg_per_day).toFixed(1) : '–' },
          { label: 'Bästa dag', value: summary?.best_day ?? '–' },
          { label: 'Produktivitet', value: summary?.productivity != null ? `${Math.round(summary.productivity)}%` : '–' },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border shadow-sm">
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="stat-number text-xl sm:text-2xl text-foreground">{s.value}</p>
              <p className="data-label mt-1 text-[10px] sm:text-xs">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cost per egg card */}
      {(costPerEgg > 0 || revenuePerEgg > 0) && (
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-5 w-5 text-primary" />
              <h2 className="font-serif text-base text-primary">Kostnad per ägg</h2>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="stat-number text-xl text-destructive">{costPerEgg.toFixed(2)} kr</p>
                <p className="data-label text-[10px] mt-1">Kostnad/ägg</p>
              </div>
              <div>
                <p className="stat-number text-xl text-success">{revenuePerEgg.toFixed(2)} kr</p>
                <p className="data-label text-[10px] mt-1">Intäkt/ägg</p>
              </div>
              <div>
                <p className={`stat-number text-xl ${profitPerEgg >= 0 ? 'text-primary' : 'text-destructive'}`}>{profitPerEgg.toFixed(2)} kr</p>
                <p className="data-label text-[10px] mt-1">Vinst/ägg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hen production ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="font-serif text-base sm:text-lg">🏆 Topplista – Hönor</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3">
              {hens.length > 0 ? (
                [...hens]
                  .sort((a: any, b: any) => (b.total_eggs || b.eggs_total || 0) - (a.total_eggs || a.eggs_total || 0))
                  .slice(0, 6)
                  .map((hen: any, i: number) => {
                    const eggs = hen.total_eggs || hen.eggs_total || 0;
                    return (
                      <div key={hen._id || hen.id} className="flex items-center gap-2 sm:gap-3">
                        <span className="stat-number text-base sm:text-lg w-6 text-center text-muted-foreground">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs sm:text-sm font-medium text-foreground">{hen.name}</span>
                            <span className="stat-number text-xs sm:text-sm text-primary">{eggs} ägg</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-1.5">
                            <div className="bg-primary rounded-full h-1.5 transition-all duration-500" style={{ width: `${Math.min(100, (eggs / Math.max(1, eggs)) * 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Lägg till hönor för att se topplistan</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Breed distribution */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="font-serif text-base sm:text-lg">Rasfördelning</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {hens.length > 0 ? (
              <div className="space-y-2">
                {Object.entries(
                  hens.reduce((acc: Record<string, number>, hen: any) => {
                    const breed = hen.breed || hen.race || 'Okänd';
                    acc[breed] = (acc[breed] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([breed, count]) => (
                  <div key={breed} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{breed}</span>
                    <span className="stat-number text-muted-foreground">{count as number} st</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Ingen data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      {insights && (
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="font-serif text-base sm:text-lg">📈 Insikter</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {insights.tips ? (
              <ul className="space-y-2">
                {(Array.isArray(insights.tips) ? insights.tips : [insights.tips]).map((tip: string, i: number) => (
                  <li key={i} className="flex gap-2 items-start text-sm text-foreground">
                    <span className="text-primary mt-1 shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Samla mer data för att se insikter</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
