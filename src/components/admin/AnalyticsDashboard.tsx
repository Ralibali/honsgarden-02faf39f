import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Eye, Users, MousePointerClick, Globe, Monitor, Smartphone, Tablet,
  TrendingUp, ArrowUp, ArrowDown, Clock, BarChart3, MapPin, FileText, Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

type Period = '7d' | '30d' | '90d';

function daysAgo(d: number) {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return date.toISOString();
}

const COLORS = [
  'hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--warning))',
  'hsl(var(--success))', 'hsl(var(--destructive))', '#8b5cf6', '#06b6d4', '#f59e0b'
];

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState<Period>('30d');
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const since = daysAgo(days);

  // Page views
  const { data: pageViews = [], isLoading: pvLoading } = useQuery({
    queryKey: ['analytics-pageviews', period],
    queryFn: async () => {
      const { data } = await supabase
        .from('page_views')
        .select('path, created_at, device_type, referrer, session_id')
        .gte('created_at', since)
        .order('created_at', { ascending: true });
      return (data || []) as any[];
    },
  });

  // Click events
  const { data: clickEvents = [], isLoading: ceLoading } = useQuery({
    queryKey: ['analytics-clicks', period],
    queryFn: async () => {
      const { data } = await supabase
        .from('click_events')
        .select('event_name, element_text, path, created_at, session_id')
        .gte('created_at', since)
        .order('created_at', { ascending: true });
      return (data || []) as any[];
    },
  });

  const isLoading = pvLoading || ceLoading;

  // Unique visitors (by session_id)
  const uniqueSessions = new Set(pageViews.map(pv => pv.session_id)).size;
  const totalPageViews = pageViews.length;
  const avgPagesPerVisit = uniqueSessions ? (totalPageViews / uniqueSessions).toFixed(1) : '0';

  // Views per day for chart
  const viewsByDay: Record<string, { views: number; visitors: Set<string> }> = {};
  pageViews.forEach(pv => {
    const day = pv.created_at.slice(0, 10);
    if (!viewsByDay[day]) viewsByDay[day] = { views: 0, visitors: new Set() };
    viewsByDay[day].views++;
    viewsByDay[day].visitors.add(pv.session_id);
  });
  const chartData = Object.entries(viewsByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({
      date: date.slice(5), // MM-DD
      Sidvisningar: d.views,
      Besökare: d.visitors.size,
    }));

  // Top pages
  const pageCounts: Record<string, number> = {};
  pageViews.forEach(pv => { pageCounts[pv.path] = (pageCounts[pv.path] || 0) + 1; });
  const topPages = Object.entries(pageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12);

  // Blog posts specifically
  const blogPages = topPages.filter(([path]) => path.startsWith('/blogg/'));

  // Device distribution
  const deviceCounts: Record<string, number> = {};
  pageViews.forEach(pv => {
    const d = pv.device_type || 'unknown';
    deviceCounts[d] = (deviceCounts[d] || 0) + 1;
  });
  const deviceData = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));

  // Referrer sources
  const refCounts: Record<string, number> = {};
  pageViews.forEach(pv => {
    let source = 'Direkt';
    if (pv.referrer) {
      try {
        const url = new URL(pv.referrer);
        source = url.hostname.replace('www.', '');
      } catch { source = pv.referrer; }
    }
    refCounts[source] = (refCounts[source] || 0) + 1;
  });
  const topReferrers = Object.entries(refCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  // Top click events
  const clickCounts: Record<string, { count: number; text: string }> = {};
  clickEvents.forEach(ce => {
    const key = ce.event_name;
    if (!clickCounts[key]) clickCounts[key] = { count: 0, text: ce.element_text || ce.event_name };
    clickCounts[key].count++;
  });
  const topClicks = Object.entries(clickCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10);

  // Click events by page
  const clicksByPage: Record<string, number> = {};
  clickEvents.forEach(ce => {
    clicksByPage[ce.path] = (clicksByPage[ce.path] || 0) + 1;
  });
  const topClickPages = Object.entries(clicksByPage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const DeviceIcon = ({ type }: { type: string }) => {
    if (type === 'mobile') return <Smartphone className="h-3.5 w-3.5" />;
    if (type === 'tablet') return <Tablet className="h-3.5 w-3.5" />;
    return <Monitor className="h-3.5 w-3.5" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Period selector */}
      <div className="flex items-center gap-2">
        {(['7d', '30d', '90d'] as Period[]).map(p => (
          <Button
            key={p}
            variant={period === p ? 'default' : 'outline'}
            size="sm"
            className="text-xs h-8 rounded-lg"
            onClick={() => setPeriod(p)}
          >
            {p === '7d' ? '7 dagar' : p === '30d' ? '30 dagar' : '90 dagar'}
          </Button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Eye, label: 'Sidvisningar', value: totalPageViews, color: 'text-primary', bg: 'bg-primary/8' },
          { icon: Users, label: 'Unika besökare', value: uniqueSessions, color: 'text-accent', bg: 'bg-accent/8' },
          { icon: BarChart3, label: 'Sidor/besök', value: avgPagesPerVisit, color: 'text-warning', bg: 'bg-warning/8' },
          { icon: MousePointerClick, label: 'Klickhändelser', value: clickEvents.length, color: 'text-success', bg: 'bg-success/8' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <Card key={label} className="border-border/50">
            <CardContent className="p-3 text-center">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mx-auto mb-1`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="stat-number text-xl text-foreground">{value}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Traffic chart */}
      {chartData.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="px-4 py-3">
            <CardTitle className="font-serif text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Trafik över tid
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="Sidvisningar" stroke="hsl(var(--primary))" fill="url(#pvGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="Besökare" stroke="hsl(var(--accent))" fill="url(#visGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Top pages */}
        <Card className="border-border/50">
          <CardHeader className="px-4 py-3">
            <CardTitle className="font-serif text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Populära sidor
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {topPages.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Ingen data ännu</p>
            ) : (
              <div className="space-y-2">
                {topPages.map(([path, count], i) => {
                  const maxCount = topPages[0][1];
                  return (
                    <div key={path} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-5 text-right">{i + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs text-foreground truncate">{path}</span>
                          <span className="text-xs font-medium text-primary ml-2">{count}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-1">
                          <div
                            className="bg-primary rounded-full h-1 transition-all"
                            style={{ width: `${(count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blog performance */}
        <Card className="border-border/50">
          <CardHeader className="px-4 py-3">
            <CardTitle className="font-serif text-sm flex items-center gap-2">
              📝 Blogginlägg – topp
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {blogPages.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Inga bloggbesök ännu</p>
            ) : (
              <div className="space-y-2">
                {blogPages.map(([path, count], i) => {
                  const slug = path.replace('/blogg/', '');
                  return (
                    <div key={path} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] text-muted-foreground">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`}</span>
                        <span className="text-xs text-foreground truncate">{slug}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] shrink-0">{count} visningar</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Traffic sources */}
        <Card className="border-border/50">
          <CardHeader className="px-4 py-3">
            <CardTitle className="font-serif text-sm flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Trafikkällor
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {topReferrers.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Ingen data ännu</p>
            ) : (
              <div className="space-y-2">
                {topReferrers.map(([source, count], i) => (
                  <div key={source} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-foreground truncate">{source}</span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground ml-2">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device breakdown */}
        <Card className="border-border/50">
          <CardHeader className="px-4 py-3">
            <CardTitle className="font-serif text-sm flex items-center gap-2">
              <Monitor className="h-4 w-4 text-primary" /> Enheter
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {deviceData.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Ingen data ännu</p>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={45}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {deviceData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 flex-1">
                  {deviceData.map((d, i) => {
                    const pct = totalPageViews ? Math.round((d.value / totalPageViews) * 100) : 0;
                    return (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <DeviceIcon type={d.name} />
                          <span className="text-xs text-foreground capitalize">{d.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{pct}% ({d.value})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top click events */}
        <Card className="border-border/50">
          <CardHeader className="px-4 py-3">
            <CardTitle className="font-serif text-sm flex items-center gap-2">
              <MousePointerClick className="h-4 w-4 text-primary" /> Populära klick
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {topClicks.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Inga klickhändelser ännu. Data samlas in automatiskt.
              </p>
            ) : (
              <div className="space-y-2">
                {topClicks.map(([name, { count, text }], i) => (
                  <div key={name} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs text-foreground block truncate">{text}</span>
                      <span className="text-[10px] text-muted-foreground">{name}</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0">{count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Clicks by page */}
        <Card className="border-border/50">
          <CardHeader className="px-4 py-3">
            <CardTitle className="font-serif text-sm flex items-center gap-2">
              📍 Klick per sida
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {topClickPages.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Ingen data ännu</p>
            ) : (
              <div className="space-y-2">
                {topClickPages.map(([path, count]) => (
                  <div key={path} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-foreground truncate">{path}</span>
                    <span className="text-xs font-medium text-primary">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
