import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users, Crown, MessageSquare, BarChart3, Loader2, Trash2,
  Shield, TrendingUp, Egg, AlertTriangle, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

export default function Admin() {
  const queryClient = useQueryClient();

  const { data: adminCheck, isLoading: checkLoading, isError: checkError } = useQuery({
    queryKey: ['admin-check'],
    queryFn: () => api.adminCheck(),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.adminStats(),
    enabled: !!adminCheck?.is_admin,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.adminUsers(),
    enabled: !!adminCheck?.is_admin,
  });

  const { data: subscriptions, isLoading: subsLoading } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => api.adminSubscriptions(),
    enabled: !!adminCheck?.is_admin,
  });

  const { data: feedback, isLoading: feedbackLoading } = useQuery({
    queryKey: ['admin-feedback'],
    queryFn: () => api.adminFeedback(),
    enabled: !!adminCheck?.is_admin,
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => api.adminDeleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({ title: 'Användare raderad' });
    },
    onError: (err: any) => toast({ title: 'Fel', description: err.message, variant: 'destructive' }),
  });

  const updateFeedbackMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.adminUpdateFeedbackStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      toast({ title: 'Feedback uppdaterad' });
    },
  });

  const updateSubMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      api.adminUpdateSubscription(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Prenumeration uppdaterad' });
    },
    onError: (err: any) => toast({ title: 'Fel', description: err.message, variant: 'destructive' }),
  });

  if (checkLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (checkError || !adminCheck?.is_admin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Shield className="h-12 w-12 text-destructive/50" />
        <h2 className="font-serif text-xl text-foreground">Åtkomst nekad</h2>
        <p className="text-sm text-muted-foreground">Du har inte behörighet att se denna sida.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-serif text-foreground">Admin</h1>
          <p className="text-xs text-muted-foreground">Hantera användare, prenumerationer och feedback</p>
        </div>
      </div>

      {/* Stats overview */}
      {statsLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-border">
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="stat-number text-2xl text-foreground">{stats.user_count ?? '–'}</p>
              <p className="text-[10px] text-muted-foreground">Användare</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 text-center">
              <Crown className="h-5 w-5 text-warning mx-auto mb-1" />
              <p className="stat-number text-2xl text-foreground">{stats.premium_users ?? stats.premium ?? '–'}</p>
              <p className="text-[10px] text-muted-foreground">Premium</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 text-center">
              <Egg className="h-5 w-5 text-accent mx-auto mb-1" />
              <p className="stat-number text-2xl text-foreground">{stats.total_eggs ?? stats.eggs ?? '–'}</p>
              <p className="text-[10px] text-muted-foreground">Ägg totalt</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 text-success mx-auto mb-1" />
              <p className="stat-number text-2xl text-foreground">{stats.active_today ?? stats.dau ?? '–'}</p>
              <p className="text-[10px] text-muted-foreground">Aktiva idag</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="users" className="text-xs sm:text-sm gap-1">
            <Users className="h-3.5 w-3.5" /> Användare
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="text-xs sm:text-sm gap-1">
            <Crown className="h-3.5 w-3.5" /> Prenumerationer
          </TabsTrigger>
          <TabsTrigger value="feedback" className="text-xs sm:text-sm gap-1">
            <MessageSquare className="h-3.5 w-3.5" /> Feedback
          </TabsTrigger>
        </TabsList>

        {/* Users tab */}
        <TabsContent value="users" className="space-y-3">
          {usersLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : !users?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">Inga användare hittades.</p>
          ) : (
            <div className="space-y-2">
              {users.map((user: any) => (
                <Card key={user._id || user.id} className="border-border">
                  <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {(user.name || user.email || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{user.name || 'Namnlös'}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {user.is_premium && (
                          <Badge variant="secondary" className="text-[9px] bg-warning/10 text-warning border-warning/20">
                            <Crown className="h-2.5 w-2.5 mr-0.5" /> Premium
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('sv-SE') : '–'}
                        </span>
                      </div>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive/50 hover:text-destructive shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Radera användare?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Detta raderar <strong>{user.email}</strong> och all deras data permanent. Kan inte ångras.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Avbryt</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteUserMutation.mutate(user._id || user.id)}
                          >
                            Radera
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Subscriptions tab */}
        <TabsContent value="subscriptions" className="space-y-3">
          {subsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : !subscriptions?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">Inga prenumerationer hittades.</p>
          ) : (
            <div className="space-y-2">
              {subscriptions.map((sub: any) => (
                <Card key={sub._id || sub.user_id || sub.id} className="border-border">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{sub.email || sub.user_email || '–'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={`text-[9px] ${
                              sub.status === 'active' ? 'bg-success/10 text-success border-success/20' :
                              sub.status === 'cancelled' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                              'bg-muted text-muted-foreground'
                            }`}
                          >
                            {sub.status === 'active' ? 'Aktiv' : sub.status === 'cancelled' ? 'Avslutad' : sub.status || '–'}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{sub.plan || sub.plan_type || '–'}</span>
                          {sub.expires_at && (
                            <span className="text-[10px] text-muted-foreground">
                              → {new Date(sub.expires_at).toLocaleDateString('sv-SE')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {sub.status !== 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[10px] h-7"
                            onClick={() => updateSubMutation.mutate({
                              userId: sub.user_id || sub._id,
                              data: { is_premium: true }
                            })}
                          >
                            <Crown className="h-3 w-3 mr-1" /> Ge Premium
                          </Button>
                        )}
                        {sub.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[10px] h-7 text-destructive"
                            onClick={() => updateSubMutation.mutate({
                              userId: sub.user_id || sub._id,
                              data: { is_premium: false }
                            })}
                          >
                            Ta bort
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Feedback tab */}
        <TabsContent value="feedback" className="space-y-3">
          {feedbackLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : !feedback?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">Ingen feedback ännu.</p>
          ) : (
            <div className="space-y-2">
              {feedback.map((fb: any) => (
                <Card key={fb._id || fb.id} className="border-border">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        fb.status === 'resolved' ? 'bg-success/10' :
                        fb.status === 'in_progress' ? 'bg-warning/10' :
                        'bg-primary/10'
                      }`}>
                        {fb.status === 'resolved' ? <CheckCircle2 className="h-4 w-4 text-success" /> :
                         fb.status === 'in_progress' ? <Clock className="h-4 w-4 text-warning" /> :
                         <MessageSquare className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-medium text-foreground">{fb.user_email || fb.email || 'Anonym'}</p>
                          <Badge variant="outline" className="text-[9px]">
                            {fb.type || fb.category || 'Allmänt'}
                          </Badge>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed">{fb.message || fb.text || fb.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {fb.created_at ? new Date(fb.created_at).toLocaleDateString('sv-SE') : '–'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 mt-3 justify-end">
                      {fb.status !== 'in_progress' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] h-7"
                          onClick={() => updateFeedbackMutation.mutate({ id: fb._id || fb.id, status: 'in_progress' })}
                        >
                          <Clock className="h-3 w-3 mr-1" /> Pågår
                        </Button>
                      )}
                      {fb.status !== 'resolved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] h-7 text-success"
                          onClick={() => updateFeedbackMutation.mutate({ id: fb._id || fb.id, status: 'resolved' })}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Löst
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
