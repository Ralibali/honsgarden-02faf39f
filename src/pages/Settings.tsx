import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, Bell, Shield, LogOut } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif text-foreground">Inställningar ⚙️</h1>
        <p className="text-muted-foreground mt-1">Hantera ditt konto och din hönsgård</p>
      </div>

      {/* Profile */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Namn</Label>
              <Input defaultValue="Erik Andersson" className="mt-1.5 h-11" />
            </div>
            <div>
              <Label className="text-muted-foreground">E-post</Label>
              <Input defaultValue="erik@honsgarden.se" className="mt-1.5 h-11" />
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Gårdsnamn</Label>
            <Input defaultValue="Erikssons Hönsgård" className="mt-1.5 h-11" />
          </div>
          <Button className="active:scale-95 transition-transform">Spara ändringar</Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifikationer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Daglig äggpåminnelse', desc: 'Påminnelse att logga ägg varje kväll', defaultChecked: true },
            { label: 'Veckosummering', desc: 'E-post med veckans statistik', defaultChecked: true },
            { label: 'Vädervarningar', desc: 'Notis vid extrem väderlek', defaultChecked: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.defaultChecked} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Account */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Konto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="gap-2">
            Byt lösenord
          </Button>
          <div className="pt-4 border-t border-border">
            <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
              <LogOut className="h-4 w-4" />
              Logga ut
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
