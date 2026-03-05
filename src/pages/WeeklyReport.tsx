import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Share2, Download, Copy, Check, Sparkles, TrendingUp, TrendingDown, Minus, Egg, Bird, Flame, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format, subDays, startOfWeek, endOfWeek, startOfDay } from 'date-fns';
import { sv } from 'date-fns/locale';

function getSeason(): string {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return 'vår';
  if (m >= 5 && m <= 7) return 'sommar';
  if (m >= 8 && m <= 10) return 'höst';
  return 'vinter';
}

function drawReportCard(canvas: HTMLCanvasElement, data: {
  weekEggs: number; prevWeekEggs: number; avgPerDay: number; henCount: number;
  bestDay: string; streak: number; insights: string[]; userName?: string;
  weekLabel: string;
}) {
  const ctx = canvas.getContext('2d')!;
  const w = 1080;
  const h = 1350;
  canvas.width = w;
  canvas.height = h;

  // Background
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#f5f0e8');
  grad.addColorStop(0.5, '#f0ebe0');
  grad.addColorStop(1, '#e8e0d4');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Top bar
  const barGrad = ctx.createLinearGradient(0, 0, w, 0);
  barGrad.addColorStop(0, '#3d7a4a');
  barGrad.addColorStop(1, '#8b6e3b');
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, w, 8);

  // Header
  ctx.fillStyle = '#3d7a4a';
  ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🐔 Hönsgården — Veckorapport', w / 2, 70);

  ctx.fillStyle = '#8b7a68';
  ctx.font = '22px system-ui, -apple-system, sans-serif';
  ctx.fillText(data.weekLabel, w / 2, 105);

  // Divider
  ctx.strokeStyle = 'rgba(139,115,85,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, 130);
  ctx.lineTo(w - 100, 130);
  ctx.stroke();

  // Main stat
  ctx.fillStyle = '#2d1a0e';
  ctx.font = 'bold 160px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${data.weekEggs}`, w / 2, 310);
  ctx.fillStyle = '#6b5a48';
  ctx.font = '34px system-ui, -apple-system, sans-serif';
  ctx.fillText('ägg denna vecka 🥚', w / 2, 365);

  // Trend
  const diff = data.weekEggs - data.prevWeekEggs;
  const trendText = diff > 0 ? `▲ +${diff} jämfört med förra veckan` : diff < 0 ? `▼ ${diff} jämfört med förra veckan` : '— Samma som förra veckan';
  ctx.fillStyle = diff > 0 ? '#3d7a4a' : diff < 0 ? '#b44' : '#8b7a68';
  ctx.font = '24px system-ui, -apple-system, sans-serif';
  ctx.fillText(trendText, w / 2, 410);

  // Stats grid
  const statsY = 470;
  const stats = [
    { label: 'Snitt/dag', value: data.avgPerDay.toFixed(1), emoji: '📊' },
    { label: 'Hönor', value: `${data.henCount}`, emoji: '🐔' },
    { label: 'Bästa dag', value: data.bestDay, emoji: '⭐' },
    { label: 'Streak', value: `${data.streak}d`, emoji: '🔥' },
  ];
  const cardW = 210;
  const gap = 30;
  const startX = (w - (cardW * 4 + gap * 3)) / 2;

  stats.forEach((s, i) => {
    const x = startX + i * (cardW + gap);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.roundRect(x, statsY, cardW, 140, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(139,115,85,0.1)';
    ctx.beginPath();
    ctx.roundRect(x, statsY, cardW, 140, 16);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '28px system-ui';
    ctx.fillStyle = '#2d1a0e';
    ctx.fillText(s.emoji, x + cardW / 2, statsY + 42);
    ctx.font = 'bold 40px system-ui, -apple-system, sans-serif';
    ctx.fillText(s.value, x + cardW / 2, statsY + 92);
    ctx.font = '18px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#8b7a68';
    ctx.fillText(s.label, x + cardW / 2, statsY + 122);
  });

  // AI Insights section
  if (data.insights.length > 0) {
    const insY = 670;
    ctx.fillStyle = 'rgba(61,122,74,0.06)';
    ctx.beginPath();
    ctx.roundRect(80, insY, w - 160, 30 + data.insights.length * 60, 20);
    ctx.fill();

    ctx.fillStyle = '#3d7a4a';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('✨ AI-insikter', 120, insY + 40);

    ctx.fillStyle = '#3a2e22';
    ctx.font = '20px system-ui, -apple-system, sans-serif';
    data.insights.forEach((insight, i) => {
      const text = `• ${insight}`;
      // Word wrap
      const maxW = w - 260;
      const words = text.split(' ');
      let line = '';
      let y = insY + 80 + i * 60;
      for (const word of words) {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > maxW && line) {
          ctx.fillText(line.trim(), 120, y);
          line = word + ' ';
          y += 26;
        } else {
          line = test;
        }
      }
      ctx.fillText(line.trim(), 120, y);
    });
  }

  // User name
  if (data.userName) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#6b5a48';
    ctx.font = '24px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${data.userName}s hönsgård`, w / 2, h - 150);
  }

  // CTA
  ctx.fillStyle = '#3d7a4a';
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Logga dina ägg gratis!', w / 2, h - 90);
  ctx.fillStyle = '#8b7a68';
  ctx.font = '20px system-ui, -apple-system, sans-serif';
  ctx.fillText('honsgarden.se', w / 2, h - 58);

  // Bottom bar
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, h - 8, w, 8);
}

export default function WeeklyReport() {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const prevWeekStart = subDays(weekStart, 7);
  const prevWeekEnd = subDays(weekStart, 1);

  const weekLabel = `${format(weekStart, 'd MMM', { locale: sv })} – ${format(weekEnd, 'd MMM yyyy', { locale: sv })}`;

  const { data: eggs } = useQuery({ queryKey: ['eggs'], queryFn: () => api.getEggs() });
  const { data: hens } = useQuery({ queryKey: ['hens'], queryFn: () => api.getHens() });
  const { data: feedStats } = useQuery({ queryKey: ['feed-stats'], queryFn: () => api.getFeedStatistics() });

  const weekEggs = (eggs as any[] || [])
    .filter((e: any) => e.date >= format(weekStart, 'yyyy-MM-dd') && e.date <= format(weekEnd, 'yyyy-MM-dd'))
    .reduce((s: number, e: any) => s + e.count, 0);

  const prevWeekEggs = (eggs as any[] || [])
    .filter((e: any) => e.date >= format(prevWeekStart, 'yyyy-MM-dd') && e.date <= format(prevWeekEnd, 'yyyy-MM-dd'))
    .reduce((s: number, e: any) => s + e.count, 0);

  // Best day this week
  const dayMap: Record<string, number> = {};
  (eggs as any[] || [])
    .filter((e: any) => e.date >= format(weekStart, 'yyyy-MM-dd') && e.date <= format(weekEnd, 'yyyy-MM-dd'))
    .forEach((e: any) => { dayMap[e.date] = (dayMap[e.date] || 0) + e.count; });
  const bestDayEntry = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0];
  const bestDay = bestDayEntry ? format(new Date(bestDayEntry[0]), 'EEE', { locale: sv }) : '—';

  const henCount = (hens as any[] || []).filter((h: any) => h.is_active).length;
  const daysInWeek = Math.min(7, Math.ceil((now.getTime() - weekStart.getTime()) / 86400000) + 1);
  const avgPerDay = daysInWeek > 0 ? weekEggs / daysInWeek : 0;

  const streak = useQuery({ queryKey: ['streak'], queryFn: () => api.getStreak() });
  const streakVal = (streak.data as any)?.current_streak || 0;

  const diff = weekEggs - prevWeekEggs;

  const weekData = {
    weekEggs, prevWeekEggs, avgPerDay, henCount,
    bestDay, feedCost: (feedStats as any)?.total_cost || 0,
    streak: streakVal, season: getSeason(),
  };

  const fetchInsights = async () => {
    setLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('weekly-insights', {
        body: { weekData },
      });
      if (error) throw error;
      setInsights(data.insights || []);
    } catch (err: any) {
      console.error('AI insights error:', err);
      toast({ title: 'Kunde inte hämta AI-insikter', description: err.message, variant: 'destructive' });
      setInsights(['Bra jobbat den här veckan! Fortsätt logga regelbundet för bäst insikter.']);
    } finally {
      setLoadingAI(false);
    }
  };

  const generateImage = useCallback(() => {
    if (!canvasRef.current) return;
    drawReportCard(canvasRef.current, {
      ...weekData, insights, userName: user?.name, weekLabel,
    });
    setGenerated(true);
  }, [weekData, insights, user?.name, weekLabel]);

  useEffect(() => {
    if (insights.length > 0) generateImage();
  }, [insights, generateImage]);

  // Generate without AI on mount
  useEffect(() => {
    if (canvasRef.current && !generated) {
      drawReportCard(canvasRef.current, {
        ...weekData, insights: [], userName: user?.name, weekLabel,
      });
    }
  }, [eggs, hens]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `veckorapport-${format(now, 'yyyy-MM-dd')}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    toast({ title: '📥 Rapport nedladdad!' });
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise<Blob>((resolve) =>
        canvasRef.current!.toBlob((b) => resolve(b!), 'image/png')
      );
      const file = new File([blob], 'veckorapport.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Min veckorapport 🐔',
          text: `Mina höns värpte ${weekEggs} ägg denna vecka! 🥚 Logga dina ägg gratis på honsgarden.se`,
          files: [file],
        });
      } else {
        await navigator.clipboard.writeText(
          `Mina höns värpte ${weekEggs} ägg denna vecka! 🥚🐔\n\nLogga dina ägg gratis → honsgarden.se`
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({ title: '📋 Text kopierad!', description: 'Ladda ner bilden och dela tillsammans.' });
      }
    } catch { /* cancelled */ }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Veckorapport 📊</h1>
        <p className="text-sm text-muted-foreground mt-1">{weekLabel}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Egg, label: 'Ägg', value: weekEggs, color: 'text-primary' },
          { icon: diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus, label: 'Trend', value: diff > 0 ? `+${diff}` : `${diff}`, color: diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-500' : 'text-muted-foreground' },
          { icon: Bird, label: 'Hönor', value: henCount, color: 'text-primary' },
          { icon: Flame, label: 'Streak', value: `${streakVal}d`, color: 'text-orange-500' },
        ].map((s) => (
          <Card key={s.label} className="border-border/50 shadow-sm">
            <CardContent className="p-3 flex flex-col items-center gap-1">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <span className="text-xl font-bold text-foreground">{s.value}</span>
              <span className="text-[11px] text-muted-foreground">{s.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <Card className="border-primary/20 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-insikter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.length > 0 ? (
            <ul className="space-y-2">
              {insights.map((insight, i) => (
                <li key={i} className="text-sm text-foreground flex gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Tryck på knappen nedan för att generera personliga AI-insikter baserade på din veckodata.
            </p>
          )}
          <Button
            onClick={fetchInsights}
            disabled={loadingAI}
            variant={insights.length > 0 ? 'outline' : 'default'}
            className="rounded-xl gap-2"
          >
            {loadingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {insights.length > 0 ? 'Generera nya insikter' : 'Generera AI-insikter'}
          </Button>
        </CardContent>
      </Card>

      {/* Shareable card */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Dela din veckorapport
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl overflow-hidden border border-border/30">
            <canvas
              ref={canvasRef}
              className="w-full h-auto"
              style={{ maxHeight: '500px', objectFit: 'contain' }}
            />
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 rounded-xl h-10 gap-2 text-sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Dela
            </Button>
            <Button variant="outline" className="rounded-xl h-10 gap-2 text-sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Ladda ner
            </Button>
            <Button variant="outline" className="rounded-xl h-10 text-sm" onClick={async () => {
              await navigator.clipboard.writeText(
                `Mina höns värpte ${weekEggs} ägg denna vecka! 🥚🐔\nSnitt: ${avgPerDay.toFixed(1)}/dag | ${henCount} hönor | ${streakVal}d streak 🔥\n\nhonsgarden.se`
              );
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
              toast({ title: '📋 Kopierat!' });
            }}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
