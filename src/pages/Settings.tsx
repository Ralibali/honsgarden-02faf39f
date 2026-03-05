import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, Bell, Shield, LogOut, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: coopSettings, isLoading: coopLoading } = useQuery({
    queryKey: ['coop-settings'],
    queryFn: () => api.getCoopSettings(),
  });

  const { data: reminderSettings, isLoading: reminderLoading } = useQuery({
    queryKey: ['reminder-settings'],
    queryFn: () => api.getReminderSettings(),
  });

  const [name, setName] = useState('');
  const [coopName, setCoopName] = useState('');
  const [henCount, setHenCount] = useState('');
  const [location, setLocation] = useState('');
  const [morningReminder, setMorningReminder] = useState(true);
  const [eveningReminder, setEveningReminder] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    if (coopSettings) {
      setCoopName(coopSettings.coop_name || '');
      setHenCount(String(coopSettings.hen_count || ''));
      setLocation(coopSettings.location || '');
    }
  }, [coopSettings]);

  useEffect(() => {
    if (reminderSettings) {
      setMorningReminder(reminderSettings.morning_reminder ?? true);
      setEveningReminder(reminderSettings.evening_reminder ?? true);
    }
  }, [reminderSettings]);

  useEffect(() => {
    if (user) setName(user.name || '');
  }, [user]);

  const saveCoopMutation = useMutation({
    mutationFn: (data: any) => api.updateCoopSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coop-settings'] });
      toast({ title: 'Inställningar sparade! ✅' });
    },
    onError: (err: any) => toast({ title: 'Fel', description: err.message, variant: 'destructive' }),
  });

  const saveReminderMutation = useMutation({
    mutationFn: (data: any) => api.updateReminderSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminder-settings'] });
      toast({ title: 'Påminnelser uppdaterade! ✅' });
    },
    onError: (err: any) => toast({ title: 'Fel', description: err.message, variant: 'destructive' }),
  });

  const feedbackMutation = useMutation({
    mutationFn: (data: any) => api.submitFeedback(data),
    onSuccess: () => {
      toast({ title: 'Tack för din feedback! 💚' });
      setFeedbackMsg('');
    },
    onError: (err: any) => toast({ title: 'Fel', description: err.message, variant: 'destructive' }),
  });

  const handleSaveProfile = () => {
    saveCoopMutation.mutate({
      coop_name: coopName,
      hen_count: Number(henCount) || 0,
      location: location || null,
    });
  };

  const handleSaveReminders = () => {
    saveReminderMutation.mutate({
      morning_reminder: morningReminder,
      evening_reminder: eveningReminder,
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleFeedback = () => {
    if (!feedbackMsg.trim()) return;
    feedbackMutation.mutate({ message: feedbackMsg.trim() });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Inställningar ⚙️</h1>
        <p className="text-sm text-muted-foreground mt-1">Hantera ditt konto och din hönsgård</p>
      </div>

      {/* Profile */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profil & Gård
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">E-post</Label>
              <Input value={user?.email || ''} disabled className="mt-1.5 h-11 bg-muted/50" />
            </div>
            <div>
              <Label className="text-muted-foreground">Gårdsnamn</Label>
              <Input value={coopName} onChange={(e) => setCoopName(e.target.value)} placeholder="Min hönsgård" className="mt-1.5 h-11" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Antal hönor</Label>
              <Input type="number" value={henCount} onChange={(e) => setHenCount(e.target.value)} placeholder="0" className="mt-1.5 h-11" />
            </div>
            <div>
              <Label className="text-muted-foreground">Plats</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="T.ex. Linköping" className="mt-1.5 h-11" />
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={saveCoopMutation.isPending} className="active:scale-95 transition-transform">
            {saveCoopMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Spara ändringar
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Påminnelser
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">Morgonpåminnelse</p>
              <p className="text-xs text-muted-foreground">Påminnelse att öppna hönshuset</p>
            </div>
            <Switch checked={morningReminder} onCheckedChange={setMorningReminder} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">Kvällspåminnelse</p>
              <p className="text-xs text-muted-foreground">Påminnelse att stänga och logga ägg</p>
            </div>
            <Switch checked={eveningReminder} onCheckedChange={setEveningReminder} />
          </div>
          <Button variant="outline" onClick={handleSaveReminders} disabled={saveReminderMutation.isPending} className="active:scale-95 transition-transform">
            {saveReminderMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Spara påminnelser
          </Button>
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Skicka feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Berätta vad du tycker, önskar eller vill förbättra..."
            value={feedbackMsg}
            onChange={(e) => setFeedbackMsg(e.target.value)}
            rows={3}
          />
          <Button variant="outline" onClick={handleFeedback} disabled={feedbackMutation.isPending || !feedbackMsg.trim()}>
            {feedbackMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Skicka
          </Button>
        </CardContent>
      </Card>

      {/* Account */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Konto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="pt-2">
            <Button variant="outline" className="gap-2 text-destructive hover:text-destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logga ut
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
