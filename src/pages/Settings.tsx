import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, Bell, Shield, LogOut, Loader2, MessageSquare, Mail, FileText, HelpCircle } from 'lucide-react';
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

  const { data: coopSettings } = useQuery({
    queryKey: ['coop-settings'],
    queryFn: () => api.getCoopSettings(),
  });

  const { data: reminderSettings } = useQuery({
    queryKey: ['reminder-settings'],
    queryFn: () => api.getReminderSettings(),
  });

  const [coopName, setCoopName] = useState('');
  const [henCount, setHenCount] = useState('');
  const [location, setLocation] = useState('');
  const [morningReminder, setMorningReminder] = useState(true);
  const [eveningReminder, setEveningReminder] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [supportMsg, setSupportMsg] = useState('');

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

  const supportMutation = useMutation({
    mutationFn: (data: any) => api.submitFeedback({ ...data, status: 'support' }),
    onSuccess: () => {
      toast({ title: 'Meddelande skickat! 📩', description: 'Vi svarar så snart vi kan.' });
      setSupportMsg('');
    },
    onError: (err: any) => toast({ title: 'Fel', description: err.message, variant: 'destructive' }),
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Inställningar ⚙️</h1>
        <p className="text-sm text-muted-foreground mt-1">Hantera ditt konto och din hönsgård</p>
      </div>

      {/* Profile */}
      <Card className="border-border/50 shadow-sm">
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
              <Input value={user?.email || ''} disabled className="mt-1.5 h-11 bg-muted/50 rounded-xl" />
            </div>
            <div>
              <Label className="text-muted-foreground">Gårdsnamn</Label>
              <Input value={coopName} onChange={(e) => setCoopName(e.target.value)} placeholder="Min hönsgård" className="mt-1.5 h-11 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Antal hönor</Label>
              <Input type="number" value={henCount} onChange={(e) => setHenCount(e.target.value)} placeholder="0" className="mt-1.5 h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-muted-foreground">Plats</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="T.ex. Linköping" className="mt-1.5 h-11 rounded-xl" />
            </div>
          </div>
          <Button onClick={() => saveCoopMutation.mutate({ coop_name: coopName, hen_count: Number(henCount) || 0, location: location || null })} disabled={saveCoopMutation.isPending} className="rounded-xl">
            {saveCoopMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Spara ändringar
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-border/50 shadow-sm">
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
          <Button variant="outline" onClick={() => saveReminderMutation.mutate({ morning_reminder: morningReminder, evening_reminder: eveningReminder })} disabled={saveReminderMutation.isPending} className="rounded-xl">
            {saveReminderMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Spara påminnelser
          </Button>
        </CardContent>
      </Card>

      {/* Support / Contact */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Kontakta kundtjänst
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Har du frågor, problem eller behöver hjälp? Skriv till oss nedan eller mejla direkt till{' '}
            <a href="mailto:info@honsgarden.se" className="text-primary hover:underline">info@honsgarden.se</a>.
          </p>
          <Textarea
            placeholder="Beskriv ditt ärende..."
            value={supportMsg}
            onChange={(e) => setSupportMsg(e.target.value)}
            rows={3}
            className="rounded-xl"
          />
          <Button variant="outline" onClick={() => { if (supportMsg.trim()) supportMutation.mutate({ message: `[SUPPORT] ${supportMsg.trim()}` }); }} disabled={supportMutation.isPending || !supportMsg.trim()} className="rounded-xl gap-2">
            {supportMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <Mail className="h-4 w-4" />
            Skicka
          </Button>
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card className="border-border/50 shadow-sm">
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
            className="rounded-xl"
          />
          <Button variant="outline" onClick={() => { if (feedbackMsg.trim()) feedbackMutation.mutate({ message: feedbackMsg.trim() }); }} disabled={feedbackMutation.isPending || !feedbackMsg.trim()} className="rounded-xl">
            {feedbackMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Skicka
          </Button>
        </CardContent>
      </Card>

      {/* Legal */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Juridiskt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2 text-sm text-muted-foreground hover:text-foreground rounded-xl" onClick={() => navigate('/terms')}>
            <FileText className="h-4 w-4" />
            Användarvillkor & Integritetspolicy
          </Button>
        </CardContent>
      </Card>

      {/* Account */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Konto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="gap-2 text-destructive hover:text-destructive rounded-xl" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logga ut
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
