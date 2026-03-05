import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Egg, Heart, Calendar, TrendingUp, Share2, Edit2, Loader2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function HenProfile() {
  const { henId } = useParams<{ henId: string }>();
  const navigate = useNavigate();

  const { data: hen, isLoading: henLoading } = useQuery({
    queryKey: ['hen-profile', henId],
    queryFn: () => api.getHenProfile(henId!),
    enabled: !!henId,
  });

  const { data: allEggs = [] } = useQuery({
    queryKey: ['eggs'],
    queryFn: () => api.getEggs(),
    staleTime: 60_000,
  });

  if (henLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!hen) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Hönan hittades inte.</p>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate('/app/hens')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Tillbaka
        </Button>
      </div>
    );
  }

  const isRooster = hen.hen_type === 'rooster';
  const henEggs = (allEggs as any[]).filter((e: any) => e.hen_id === henId);
  const totalEggs = henEggs.reduce((sum: number, e: any) => sum + (e.count || 0), 0);

  // Weekly eggs
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekEggs = henEggs.filter((e: any) => new Date(e.date) >= weekAgo).reduce((sum: number, e: any) => sum + (e.count || 0), 0);

  // Monthly eggs
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const monthEggs = henEggs.filter((e: any) => new Date(e.date) >= monthAgo).reduce((sum: number, e: any) => sum + (e.count || 0), 0);

  // Best day
  const dailyCounts: Record<string, number> = {};
  henEggs.forEach((e: any) => { dailyCounts[e.date] = (dailyCounts[e.date] || 0) + e.count; });
  const bestDay = Object.entries(dailyCounts).sort(([, a], [, b]) => b - a)[0];

  // Age
  let ageText = '';
  if (hen.birth_date) {
    const birth = new Date(hen.birth_date);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
    if (months < 12) ageText = `${months} månader`;
    else {
      const years = Math.floor(months / 12);
      const rem = months % 12;
      ageText = `${years} år${rem > 0 ? ` ${rem} mån` : ''}`;
    }
  }

  // Egg rate (eggs per week average over last 30 days)
  const avgPerWeek = monthEggs > 0 ? Math.round((monthEggs / 30) * 7 * 10) / 10 : 0;

  // Recent health logs
  const healthLogs = (hen.health_logs || []).slice(0, 5);

  const handleShare = async () => {
    const text = `${isRooster ? '🐓' : '🐔'} ${hen.name}${hen.breed ? ` (${hen.breed})` : ''}\n${!isRooster ? `🥚 ${totalEggs} ägg totalt\n` : ''}Logga dina höns på honsgarden.se`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${hen.name} – Hönsgården`, text });
      } else {
        await navigator.clipboard.writeText(text);
        toast({ title: '📋 Kopierat!' });
      }
    } catch { /* cancelled */ }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate('/app/hens')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">Tillbaka till hönor</span>
      </div>

      {/* Hero card */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/20" />
        <CardContent className="p-6 text-center">
          <span className="text-6xl block mb-3">{isRooster ? '🐓' : '🐔'}</span>
          <h1 className="text-2xl font-serif text-foreground mb-1">{hen.name}</h1>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {hen.breed && (
              <Badge variant="secondary" className="text-xs">{hen.breed}</Badge>
            )}
            {hen.color && (
              <Badge variant="secondary" className="text-xs">{hen.color}</Badge>
            )}
            <Badge variant="secondary" className={`text-xs ${hen.is_active ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
              {hen.is_active ? 'Aktiv' : 'Inaktiv'}
            </Badge>
            {isRooster && (
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">Tupp</Badge>
            )}
          </div>
          {ageText && (
            <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> {ageText} gammal
            </p>
          )}
          {hen.notes && (
            <p className="text-sm text-muted-foreground mt-3 italic bg-muted/30 rounded-xl p-3">{hen.notes}</p>
          )}
        </CardContent>
      </Card>

      {/* Stats grid (only for hens) */}
      {!isRooster && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { icon: Egg, value: totalEggs, label: 'Totalt', color: 'text-primary', bg: 'bg-primary/8' },
            { icon: TrendingUp, value: weekEggs, label: 'Veckan', color: 'text-accent', bg: 'bg-accent/8' },
            { icon: Calendar, value: monthEggs, label: '30 dagar', color: 'text-muted-foreground', bg: 'bg-muted/60' },
            { icon: TrendingUp, value: avgPerWeek, label: 'Ägg/vecka', color: 'text-success', bg: 'bg-success/8' },
          ].map(({ icon: Icon, value, label, color, bg }, i) => (
            <Card key={i} className="border-border/50 shadow-sm">
              <CardContent className="p-3 text-center">
                <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mx-auto mb-1.5`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <p className="text-lg font-bold text-foreground tabular-nums">{value}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Best day */}
      {bestDay && (
        <Card className="border-warning/15 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-sm font-medium text-foreground">Bästa dagen</p>
              <p className="text-xs text-muted-foreground">
                {new Date(bestDay[0]).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })} – {bestDay[1]} ägg
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health logs */}
      {healthLogs.length > 0 && (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <Heart className="h-4 w-4 text-destructive/60" />
              <h3 className="font-serif text-sm text-foreground">Hälsologg</h3>
            </div>
            <div className="space-y-2">
              {healthLogs.map((log: any, i: number) => (
                <div key={i} className="flex gap-3 items-start p-2.5 rounded-xl bg-muted/30 border border-border/20">
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5 font-medium bg-muted/60 px-2 py-0.5 rounded-md">
                    {new Date(log.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
                  </span>
                  <div>
                    {log.type && <span className="text-[10px] text-primary font-medium uppercase">{log.type}</span>}
                    <p className="text-xs text-foreground">{log.description || '–'}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Share button */}
      <div className="flex gap-2">
        <Button className="flex-1 rounded-xl h-11 gap-2" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          Dela {hen.name}
        </Button>
        <Button variant="outline" className="rounded-xl h-11 gap-2" onClick={() => navigate('/app/hens')}>
          <Edit2 className="h-4 w-4" />
          Redigera
        </Button>
      </div>

      {/* CTA for non-users (visible but subtle) */}
      <Card className="bg-primary/5 border-primary/15">
        <CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">
            🐔 Starta din egen hönsgård i appen →{' '}
            <a href="/" className="text-primary font-semibold hover:underline">honsgarden.se</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
