import React, { useMemo, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Egg, Flame, Star, Trophy, Target, Zap, Heart, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  icon: React.ElementType;
  unlocked: boolean;
  progress: number; // 0-100
  current: number;
  target: number;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
}

interface AchievementsProps {
  eggs: any[];
  hens: any[];
  streak: number;
}

function getTierColors(tier: string, unlocked: boolean) {
  if (!unlocked) return { bg: 'bg-muted/40', border: 'border-border/30', text: 'text-muted-foreground/40', icon: 'text-muted-foreground/30' };
  switch (tier) {
    case 'bronze': return { bg: 'bg-accent/8', border: 'border-accent/20', text: 'text-accent', icon: 'text-accent' };
    case 'silver': return { bg: 'bg-muted/60', border: 'border-border', text: 'text-foreground', icon: 'text-muted-foreground' };
    case 'gold': return { bg: 'bg-warning/10', border: 'border-warning/25', text: 'text-warning', icon: 'text-warning' };
    case 'diamond': return { bg: 'bg-primary/10', border: 'border-primary/25', text: 'text-primary', icon: 'text-primary' };
    default: return { bg: 'bg-muted/40', border: 'border-border/30', text: 'text-muted-foreground', icon: 'text-muted-foreground' };
  }
}

export default function Achievements({ eggs, hens, streak }: AchievementsProps) {
  const { user } = useAuth();
  const rewardedRef = useRef<Set<string>>(new Set());
  const achievements = useMemo(() => {
    const totalEggs = eggs.reduce((sum: number, e: any) => sum + (e.count || 0), 0);
    const activeHens = hens.filter((h: any) => h.is_active).length;

    // Count unique days with egg logs
    const uniqueDays = new Set(eggs.filter((e: any) => e.count > 0).map((e: any) => e.date)).size;

    // Hens with eggs assigned
    const hensWithEggs = new Set(eggs.filter((e: any) => e.hen_id).map((e: any) => e.hen_id)).size;

    const list: Achievement[] = [
      {
        id: 'first-egg',
        title: 'Första ägget!',
        description: 'Registrera ditt första ägg',
        emoji: '🥚',
        icon: Egg,
        unlocked: totalEggs >= 1,
        progress: Math.min(100, (totalEggs / 1) * 100),
        current: Math.min(totalEggs, 1),
        target: 1,
        tier: 'bronze',
      },
      {
        id: 'dozen',
        title: 'Ett dussin',
        description: 'Registrera 12 ägg totalt',
        emoji: '📦',
        icon: Egg,
        unlocked: totalEggs >= 12,
        progress: Math.min(100, (totalEggs / 12) * 100),
        current: Math.min(totalEggs, 12),
        target: 12,
        tier: 'bronze',
      },
      {
        id: 'hundred-eggs',
        title: 'Hundralansen',
        description: 'Registrera 100 ägg totalt',
        emoji: '💯',
        icon: Star,
        unlocked: totalEggs >= 100,
        progress: Math.min(100, (totalEggs / 100) * 100),
        current: Math.min(totalEggs, 100),
        target: 100,
        tier: 'silver',
      },
      {
        id: 'five-hundred',
        title: 'Äggfabriken',
        description: 'Registrera 500 ägg totalt',
        emoji: '🏭',
        icon: Trophy,
        unlocked: totalEggs >= 500,
        progress: Math.min(100, (totalEggs / 500) * 100),
        current: Math.min(totalEggs, 500),
        target: 500,
        tier: 'gold',
      },
      {
        id: 'thousand-eggs',
        title: 'Äggets mästare',
        description: 'Registrera 1 000 ägg totalt',
        emoji: '👑',
        icon: Crown,
        unlocked: totalEggs >= 1000,
        progress: Math.min(100, (totalEggs / 1000) * 100),
        current: Math.min(totalEggs, 1000),
        target: 1000,
        tier: 'diamond',
      },
      {
        id: 'streak-7',
        title: 'Veckosviten',
        description: 'Logga ägg 7 dagar i rad',
        emoji: '🔥',
        icon: Flame,
        unlocked: streak >= 7,
        progress: Math.min(100, (streak / 7) * 100),
        current: Math.min(streak, 7),
        target: 7,
        tier: 'bronze',
      },
      {
        id: 'streak-30',
        title: 'Månadsmaraton',
        description: 'Logga ägg 30 dagar i rad',
        emoji: '🏃',
        icon: Flame,
        unlocked: streak >= 30,
        progress: Math.min(100, (streak / 30) * 100),
        current: Math.min(streak, 30),
        target: 30,
        tier: 'gold',
      },
      {
        id: 'streak-100',
        title: 'Legendens streak',
        description: 'Logga ägg 100 dagar i rad',
        emoji: '⚡',
        icon: Zap,
        unlocked: streak >= 100,
        progress: Math.min(100, (streak / 100) * 100),
        current: Math.min(streak, 100),
        target: 100,
        tier: 'diamond',
      },
      {
        id: 'first-hen',
        title: 'Ny kompis',
        description: 'Lägg till din första höna',
        emoji: '🐔',
        icon: Heart,
        unlocked: activeHens >= 1,
        progress: Math.min(100, (activeHens / 1) * 100),
        current: Math.min(activeHens, 1),
        target: 1,
        tier: 'bronze',
      },
      {
        id: 'flock-5',
        title: 'Liten flock',
        description: 'Ha minst 5 aktiva hönor',
        emoji: '🐓',
        icon: Target,
        unlocked: activeHens >= 5,
        progress: Math.min(100, (activeHens / 5) * 100),
        current: Math.min(activeHens, 5),
        target: 5,
        tier: 'silver',
      },
      {
        id: 'dedicated',
        title: 'Hängiven hönsbonde',
        description: 'Logga ägg minst 30 olika dagar',
        emoji: '📅',
        icon: Target,
        unlocked: uniqueDays >= 30,
        progress: Math.min(100, (uniqueDays / 30) * 100),
        current: Math.min(uniqueDays, 30),
        target: 30,
        tier: 'silver',
      },
      {
        id: 'tracker',
        title: 'Detektivhöna',
        description: 'Koppla ägg till minst 3 specifika hönor',
        emoji: '🔍',
        icon: Star,
        unlocked: hensWithEggs >= 3,
        progress: Math.min(100, (hensWithEggs / 3) * 100),
        current: Math.min(hensWithEggs, 3),
        target: 3,
        tier: 'silver',
      },
    ];

    // Sort: unlocked first (most recent progress), then locked by progress
    return list.sort((a, b) => {
      if (a.unlocked && !b.unlocked) return -1;
      if (!a.unlocked && b.unlocked) return 1;
      return b.progress - a.progress;
    });
  }, [eggs, hens, streak]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  // Grant 7 days premium for newly unlocked achievements
  useEffect(() => {
    if (!user?.id) return;
    const unlocked = achievements.filter(a => a.unlocked);
    if (unlocked.length === 0) return;

    const grantRewards = async () => {
      // Fetch already rewarded achievements
      const { data: existing } = await supabase
        .from('achievement_rewards')
        .select('achievement_id')
        .eq('user_id', user.id);
      
      const alreadyRewarded = new Set((existing || []).map(r => r.achievement_id));

      for (const achievement of unlocked) {
        if (alreadyRewarded.has(achievement.id) || rewardedRef.current.has(achievement.id)) continue;
        rewardedRef.current.add(achievement.id);

        // Record reward and grant premium
        const { error } = await supabase.from('achievement_rewards').insert({ user_id: user.id, achievement_id: achievement.id });
        if (!error) {
          await supabase.rpc('grant_premium_days', { _user_id: user.id, _days: 7 });
          toast({ title: `🏆 ${achievement.title} – upplåst!`, description: 'Du har fått 7 dagars gratis Premium som belöning!' });
        }
      }
    };
    grantRewards();
  }, [achievements, user?.id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-warning/10 flex items-center justify-center">
            <Trophy className="h-4 w-4 text-warning" />
          </div>
          <div>
            <h2 className="font-serif text-base text-foreground">Achievements</h2>
            <p className="text-[11px] text-muted-foreground">{unlockedCount} av {achievements.length} upplåsta</p>
          </div>
        </div>
        <span className="text-xs bg-warning/10 text-warning px-3 py-1 rounded-full font-semibold border border-warning/15">
          {unlockedCount}/{achievements.length}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {achievements.map((a) => {
          const colors = getTierColors(a.tier, a.unlocked);
          return (
            <Card
              key={a.id}
              className={`overflow-hidden border ${colors.border} ${a.unlocked ? 'shadow-sm' : 'opacity-60'} transition-all`}
            >
              <CardContent className="p-3 text-center">
                <span className={`text-2xl block mb-1.5 ${a.unlocked ? '' : 'grayscale opacity-40'}`}>
                  {a.emoji}
                </span>
                <p className={`text-[11px] font-semibold leading-tight ${a.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {a.title}
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5 leading-snug">{a.description}</p>

                {/* Progress bar */}
                <div className="mt-2 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      a.unlocked
                        ? a.tier === 'diamond' ? 'bg-primary' : a.tier === 'gold' ? 'bg-warning' : a.tier === 'silver' ? 'bg-muted-foreground' : 'bg-accent'
                        : 'bg-muted-foreground/30'
                    }`}
                    style={{ width: `${a.progress}%` }}
                  />
                </div>
                <p className="text-[8px] text-muted-foreground mt-1 tabular-nums">
                  {a.current}/{a.target}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
