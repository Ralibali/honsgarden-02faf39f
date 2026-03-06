import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  User, Bell, Shield, LogOut, Loader2, MessageSquare, Mail,
  FileText, HelpCircle, Crown, Download, Palette, Moon, Sun,
  Heart, ExternalLink, Info, Trash2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';

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
  const [displayName, setDisplayName] = useState('');
  const [morningReminder, setMorningReminder] = useState(true);
  const [eveningReminder, setEveningReminder] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [supportMsg, setSupportMsg] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('delete-account');
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: async () => {
      toast({ title: 'Konto raderat 👋', description: 'All din data har tagits bort.' });
      await logout();
      navigate('/login');
    },
    onError: (err: any) => toast({ title: 'Fel vid radering', description: err.message, variant: 'destructive' }),
  });

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
    setDisplayName(user?.name || '');
  }, [user?.name]);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const saveCoopMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.updateCoopSettings(data);
      // Auto-create example hens if hen_count > existing hens
      const desiredCount = Number(data.hen_count) || 0;
      if (desiredCount > 0) {
        const existingHens = await api.getHens();
        const activeHens = (existingHens as any[]).filter((h: any) => h.is_active && h.hen_type !== 'rooster');
        const toCreate = desiredCount - activeHens.length;
        if (toCreate > 0) {
          const exampleNames = [
            'Greta', 'Agda', 'Astrid', 'Berta', 'Doris', 'Elsa', 'Freja', 'Gullan',
            'Hedvig', 'Inga', 'Kajsa', 'Lotta', 'Maja', 'Nora', 'Olga', 'Petra',
            'Rut', 'Sigrid', 'Tyra', 'Ulla', 'Vera', 'Ylva', 'Åsa', 'Östra',
            'Alma', 'Birgit', 'Dagny', 'Ebba', 'Fanny', 'Gerd',
          ];
          const usedNames = new Set((existingHens as any[]).map((h: any) => h.name));
          const available = exampleNames.filter(n => !usedNames.has(n));
          const breeds = ['Barnevelder', 'Leghorn', 'Sussex', 'Orpington', 'Wyandotte', 'Australorp', 'Maran', 'Araucana'];
          const colors = ['Brun', 'Vit', 'Svart', 'Röd', 'Grå', 'Spräcklig'];
          for (let i = 0; i < toCreate && i < available.length; i++) {
            await api.createHen({
              name: available[i],
              breed: breeds[i % breeds.length],
              color: colors[i % colors.length],
              hen_type: 'hen',
              birth_date: null,
              notes: null,
              flock_id: null,
            });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coop-settings'] });
      queryClient.invalidateQueries({ queryKey: ['hens'] });
      toast({ title: 'Inställningar sparade! ✅' });
    },
    onError: (err: any) => toast({ title: 'Fel', description: err.message, variant: 'destructive' }),
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (name: string) => {
      const userId = user?.id;
      if (!userId) throw new Error('Inte inloggad');
      const { error } = await supabase.from('profiles').update({ display_name: name }).eq('user_id', userId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: 'Namn uppdaterat! ✅' });
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

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const [eggs, hens, transactions] = await Promise.all([
        api.getEggs(),
        api.getHens(),
        api.getTransactions(),
      ]);

      // Build CSV for eggs
      let csv = 'Typ,Datum,Antal,Höna,Anteckningar\n';
      (eggs as any[]).forEach((e: any) => {
        csv += `Ägg,${e.date},${e.count},"${e.hen_id || ''}","${(e.notes || '').replace(/"/g, '""')}"\n`;
      });
      csv += '\nTyp,Namn,Ras,Färg,Födelsedatum,Aktiv,Typ\n';
      (hens as any[]).forEach((h: any) => {
        csv += `Höna,"${h.name}","${h.breed || ''}","${h.color || ''}",${h.birth_date || ''},${h.is_active},${h.hen_type}\n`;
      });
      csv += '\nTyp,Datum,Belopp,Kategori,Beskrivning\n';
      (transactions as any[]).forEach((t: any) => {
        csv += `Transaktion,${t.date},${t.amount},"${t.category || ''}","${(t.description || '').replace(/"/g, '""')}"\n`;
      });

      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `honsgarden-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Data exporterad! 📥' });
    } catch (err: any) {
      toast({ title: 'Fel vid export', description: err.message, variant: 'destructive' });
    } finally {
      setExportLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isPremium = user?.subscription_status === 'premium';

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Inställningar ⚙️</h1>
        <p className="text-sm text-muted-foreground mt-1">Hantera ditt konto och din hönsgård</p>
      </div>

      {/* Subscription status */}
      <Card className={`shadow-sm overflow-hidden ${isPremium ? 'border-primary/30 bg-primary/3' : 'border-warning/20 bg-warning/3'}`}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPremium ? 'bg-primary/10' : 'bg-warning/10'}`}>
              <Crown className={`h-5 w-5 ${isPremium ? 'text-primary' : 'text-warning'}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {isPremium ? 'Premium-medlem' : 'Gratisplan'}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {isPremium ? 'Du har tillgång till alla funktioner' : 'Uppgradera för full funktionalitet'}
              </p>
            </div>
          </div>
          {!isPremium && (
            <Button size="sm" className="rounded-xl gap-1.5 text-xs" onClick={() => navigate('/app/premium')}>
              <Crown className="h-3.5 w-3.5" />
              Uppgradera
            </Button>
          )}
        </CardContent>
      </Card>

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
              <Label className="text-muted-foreground">Visningsnamn</Label>
              <div className="flex gap-2 mt-1.5">
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ditt namn" className="h-11 rounded-xl flex-1" />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 px-3 rounded-xl"
                  disabled={saveProfileMutation.isPending || displayName === user?.name}
                  onClick={() => saveProfileMutation.mutate(displayName)}
                >
                  {saveProfileMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Spara'}
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">E-post</Label>
              <Input value={user?.email || ''} disabled className="mt-1.5 h-11 bg-muted/50 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-muted-foreground">Gårdsnamn</Label>
              <Input value={coopName} onChange={(e) => setCoopName(e.target.value)} placeholder="Min hönsgård" className="mt-1.5 h-11 rounded-xl" />
            </div>
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
            Spara gårdsinställningar
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Utseende
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="h-4.5 w-4.5 text-muted-foreground" /> : <Sun className="h-4.5 w-4.5 text-warning" />}
              <div>
                <p className="text-sm font-medium text-foreground">Mörkt tema</p>
                <p className="text-xs text-muted-foreground">Byt till mörkare färger för ögonen</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>
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

      {/* Data export */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Exportera data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Ladda ner all din data (ägg, hönor, transaktioner) som en CSV-fil för bokföring eller backup.
          </p>
          <Button variant="outline" className="rounded-xl gap-2" onClick={handleExportData} disabled={exportLoading}>
            {exportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exportera som CSV
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
        <CardContent className="space-y-4">
          <Button variant="outline" className="gap-2 text-destructive hover:text-destructive rounded-xl" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logga ut
          </Button>

          <div className="border-t border-border/50 pt-4">
            <p className="text-xs text-muted-foreground mb-3">
              Genom att radera ditt konto tas all din data bort permanent. Detta kan inte ångras.
            </p>
            {!showDeleteConfirm ? (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl text-xs"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Radera mitt konto
              </Button>
            ) : (
              <div className="space-y-2 p-3 bg-destructive/5 rounded-xl border border-destructive/20">
                <p className="text-sm font-medium text-destructive">Är du säker? All data raderas permanent.</p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2 rounded-xl"
                    disabled={deleteAccountMutation.isPending}
                    onClick={() => deleteAccountMutation.mutate()}
                  >
                    {deleteAccountMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    Ja, radera allt
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowDeleteConfirm(false)}>
                    Avbryt
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* App info */}
      <div className="text-center pt-2 pb-4">
        <div className="flex items-center justify-center gap-1.5 text-muted-foreground/50">
          <Heart className="h-3 w-3" />
          <span className="text-[10px]">Hönsgården v1.0 · Gjord med kärlek i Sverige</span>
          <Heart className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}
