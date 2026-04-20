import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Edit, Eye, Loader2, Play, Search, Shield, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const STATUS_OPTIONS = ['all', 'pending', 'generating', 'completed', 'failed'] as const;
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  generating: 'Genererar',
  completed: 'Klar',
  failed: 'Misslyckad',
};

const statusClass: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground border-border',
  generating: 'bg-primary/10 text-primary border-primary/20',
  completed: 'bg-success/10 text-success border-success/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
};

type SeoType = 'breeds' | 'problems' | 'care' | 'months';
type JsonItem = Record<string, string | number | null>;
type SeoRow = Record<string, any> & { id: string; slug: string; name: string; generation_status: string; published: boolean };

type SeoConfig = {
  type: SeoType;
  label: string;
  table: 'seo_breeds' | 'seo_problems' | 'seo_care_topics' | 'seo_months';
  categoryField: string;
  categoryLabel: string;
  previewBase: string;
  jsonFields: { key: string; label: string; fields: string[] }[];
  textFields: string[];
};

const configs: SeoConfig[] = [
  {
    type: 'breeds',
    label: 'Raser',
    table: 'seo_breeds',
    categoryField: 'breed_group',
    categoryLabel: 'Grupp',
    previewBase: '/raser',
    textFields: ['summary', 'content', 'medical_disclaimer', 'meta_title', 'meta_description', 'og_image_url'],
    jsonFields: [
      { key: 'key_facts', label: 'Faktabox', fields: ['label', 'value'] },
      { key: 'faq', label: 'FAQ', fields: ['q', 'a'] },
      { key: 'authoritative_sources', label: 'Källor', fields: ['title', 'url', 'publisher'] },
    ],
  },
  {
    type: 'problems',
    label: 'Problem',
    table: 'seo_problems',
    categoryField: 'category',
    categoryLabel: 'Kategori',
    previewBase: '/problem',
    textFields: ['summary', 'treatment_overview', 'when_to_call_vet', 'content', 'medical_disclaimer', 'meta_title', 'meta_description', 'og_image_url'],
    jsonFields: [
      { key: 'symptoms', label: 'Symptom', fields: ['symptom', 'description'] },
      { key: 'causes', label: 'Orsaker', fields: ['cause', 'description'] },
      { key: 'diagnosis_steps', label: 'Diagnossteg', fields: ['step_number', 'name', 'description'] },
      { key: 'prevention_steps', label: 'Förebyggande steg', fields: ['step_number', 'name', 'description'] },
      { key: 'key_facts', label: 'Faktabox', fields: ['label', 'value'] },
      { key: 'faq', label: 'FAQ', fields: ['q', 'a'] },
      { key: 'authoritative_sources', label: 'Källor', fields: ['title', 'url', 'publisher'] },
    ],
  },
  {
    type: 'care',
    label: 'Skötsel',
    table: 'seo_care_topics',
    categoryField: 'category',
    categoryLabel: 'Kategori',
    previewBase: '/skotsel',
    textFields: ['summary', 'content', 'meta_title', 'meta_description', 'og_image_url'],
    jsonFields: [
      { key: 'key_facts', label: 'Faktabox', fields: ['label', 'value'] },
      { key: 'howto_steps', label: 'How-to steg', fields: ['step_number', 'name', 'description', 'image_url'] },
      { key: 'required_materials', label: 'Material', fields: ['item', 'quantity', 'note'] },
      { key: 'faq', label: 'FAQ', fields: ['q', 'a'] },
      { key: 'authoritative_sources', label: 'Källor', fields: ['title', 'url', 'publisher'] },
    ],
  },
  {
    type: 'months',
    label: 'Månader',
    table: 'seo_months',
    categoryField: 'month_number',
    categoryLabel: 'Månad',
    previewBase: '/manad',
    textFields: ['summary', 'temperature_considerations', 'daylight_considerations', 'egg_production_expectation', 'content', 'meta_title', 'meta_description', 'og_image_url'],
    jsonFields: [
      { key: 'typical_tasks', label: 'Typiska uppgifter', fields: ['task', 'priority', 'description'] },
      { key: 'common_problems_this_month', label: 'Vanliga problem', fields: ['slug', 'note'] },
      { key: 'key_facts', label: 'Faktabox', fields: ['label', 'value'] },
      { key: 'faq', label: 'FAQ', fields: ['q', 'a'] },
    ],
  },
];

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function StatusBadge({ status }: { status: string }) {
  return <Badge variant="outline" className={statusClass[status] || statusClass.pending}>{STATUS_LABELS[status] || status}</Badge>;
}

function normalizeArray(value: unknown): JsonItem[] {
  return Array.isArray(value) ? value as JsonItem[] : [];
}

function Repeater({ label, fields, value, onChange }: { label: string; fields: string[]; value: unknown; onChange: (next: JsonItem[]) => void }) {
  const items = normalizeArray(value);
  const addItem = () => onChange([...items, Object.fromEntries(fields.map(field => [field, '']))]);
  const updateItem = (index: number, field: string, nextValue: string) => {
    onChange(items.map((item, i) => i === index ? { ...item, [field]: field === 'step_number' ? Number(nextValue) || '' : nextValue } : item));
  };
  const removeItem = (index: number) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-2 rounded-xl border border-border/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm font-medium">{label}</Label>
        <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={addItem}>Lägg till</Button>
      </div>
      {!items.length ? <p className="text-xs text-muted-foreground">Inga rader tillagda.</p> : null}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="grid gap-2 rounded-xl bg-muted/40 p-3">
            {fields.map(field => (
              <Input
                key={field}
                value={String(item[field] ?? '')}
                onChange={(event) => updateItem(index, field, event.target.value)}
                placeholder={field}
                className="rounded-xl"
              />
            ))}
            <Button type="button" size="sm" variant="ghost" className="justify-self-end rounded-xl text-destructive hover:text-destructive" onClick={() => removeItem(index)}>
              Ta bort
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewPanel({ row }: { row: SeoRow | null }) {
  if (!row) return <div className="text-sm text-muted-foreground">Välj en post för preview.</div>;
  const faq = normalizeArray(row.faq);
  return (
    <aside className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-auto rounded-xl border border-border/60 bg-background p-4">
      <Badge variant="outline" className="mb-3">Live-preview</Badge>
      <h2 className="font-serif text-2xl text-foreground">{row.name}</h2>
      <p className="mt-1 text-xs text-muted-foreground">/{row.slug}</p>
      {row.summary ? <p className="mt-4 text-sm leading-relaxed text-foreground/80">{row.summary}</p> : null}
      {row.content ? <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">{row.content}</div> : <p className="mt-4 text-sm text-muted-foreground">Inget content ännu.</p>}
      {faq.length ? (
        <div className="mt-5 space-y-3">
          <h3 className="font-serif text-lg text-foreground">FAQ</h3>
          {faq.map((item, i) => (
            <div key={i} className="rounded-xl bg-muted/40 p-3">
              <p className="text-sm font-medium text-foreground">{String(item.q ?? '')}</p>
              <p className="mt-1 text-sm text-muted-foreground">{String(item.a ?? '')}</p>
            </div>
          ))}
        </div>
      ) : null}
    </aside>
  );
}

function SeoTable({ config, rows, onEdit, onPublishRequest, onGenerate }: { config: SeoConfig; rows: SeoRow[]; onEdit: (row: SeoRow) => void; onPublishRequest: (config: SeoConfig, row: SeoRow, next: boolean) => void; onGenerate: (config: SeoConfig, row: SeoRow) => void }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Namn</TableHead>
          <TableHead>{config.categoryLabel}</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Publicerad</TableHead>
          <TableHead>Senast genererad</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(row => (
          <TableRow key={row.id}>
            <TableCell>
              <div className="font-medium text-foreground">{row.name}</div>
              <div className="text-xs text-muted-foreground">{row.slug}</div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{String(row[config.categoryField] ?? '–')}</TableCell>
            <TableCell><StatusBadge status={row.generation_status} /></TableCell>
            <TableCell>
              <Switch checked={!!row.published} onCheckedChange={(next) => onPublishRequest(config, row, next)} aria-label="Publicera" />
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{row.last_generated_at ? new Date(row.last_generated_at).toLocaleString('sv-SE') : '–'}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" className="rounded-xl gap-1" onClick={() => onGenerate(config, row)}>
                  <Sparkles className="h-3.5 w-3.5" /> Generera
                </Button>
                <Button type="button" size="sm" variant="outline" className="rounded-xl gap-1" onClick={() => onEdit(row)}>
                  <Edit className="h-3.5 w-3.5" /> Redigera
                </Button>
                <Button type="button" size="sm" variant="ghost" className="rounded-xl gap-1" onClick={() => window.open(`${config.previewBase}/${row.slug}?preview=1`, '_blank')}>
                  <Eye className="h-3.5 w-3.5" /> Förhandsgranska
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function SeoAdmin() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SeoType>('breeds');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editing, setEditing] = useState<{ config: SeoConfig; row: SeoRow } | null>(null);
  const [publishTarget, setPublishTarget] = useState<{ config: SeoConfig; row: SeoRow; next: boolean } | null>(null);
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number } | null>(null);

  const { data: adminCheck, isLoading: adminLoading, isError } = useQuery({ queryKey: ['admin-check'], queryFn: () => api.adminCheck() });

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['seo-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('seo_settings' as any).select('*').limit(1).maybeSingle();
      if (error) throw new Error(error.message);
      return data as any;
    },
    enabled: !!adminCheck?.is_admin,
  });

  const { data: rowGroups = {}, isLoading: rowsLoading } = useQuery({
    queryKey: ['seo-admin-rows'],
    queryFn: async () => {
      const entries = await Promise.all(configs.map(async config => {
        const { data, error } = await supabase.from(config.table as any).select('*').order('name', { ascending: true });
        if (error) throw new Error(error.message);
        return [config.type, data ?? []] as const;
      }));
      return Object.fromEntries(entries) as Record<SeoType, SeoRow[]>;
    },
    enabled: !!adminCheck?.is_admin,
  });

  const settingsMutation = useMutation({
    mutationFn: async (patch: Record<string, boolean>) => {
      const { error } = await supabase.from('seo_settings' as any).update(patch).eq('id', settings.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seo-settings'] }),
    onError: (error: any) => toast({ title: 'Kunde inte spara SEO-inställning', description: error.message, variant: 'destructive' }),
  });

  const updateRowMutation = useMutation({
    mutationFn: async ({ config, id, patch }: { config: SeoConfig; id: string; patch: Record<string, any> }) => {
      const { error } = await supabase.from(config.table as any).update(patch).eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-admin-rows'] });
      toast({ title: 'SEO-post uppdaterad' });
    },
    onError: (error: any) => toast({ title: 'Kunde inte uppdatera', description: error.message, variant: 'destructive' }),
  });

  const activeConfig = configs.find(config => config.type === activeTab)!;
  const filteredRows = useMemo(() => {
    const rows = rowGroups[activeTab] ?? [];
    const needle = search.trim().toLowerCase();
    return rows.filter(row => {
      const matchesSearch = !needle || row.name.toLowerCase().includes(needle) || row.slug.toLowerCase().includes(needle);
      const matchesStatus = statusFilter === 'all' || row.generation_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [activeTab, rowGroups, search, statusFilter]);

  const saveEditing = () => {
    if (!editing) return;
    const { config, row } = editing;
    const patch: Record<string, any> = {};
    [...config.textFields, ...config.jsonFields.map(field => field.key)].forEach(key => { patch[key] = row[key] || null; });
    updateRowMutation.mutate({ config, id: row.id, patch });
    setEditing(null);
  };

  const runGenerate = async (config: SeoConfig, row: SeoRow) => {
    await updateRowMutation.mutateAsync({ config, id: row.id, patch: { generation_status: 'generating' } });
    const { error } = await supabase.functions.invoke('seo-generate-content', { body: { type: config.type, id: row.id } });
    if (error) {
      await updateRowMutation.mutateAsync({ config, id: row.id, patch: { generation_status: 'failed' } });
      throw new Error(error.message);
    }
    await updateRowMutation.mutateAsync({ config, id: row.id, patch: { generation_status: 'completed', last_generated_at: new Date().toISOString() } });
  };

  const handleGenerate = (config: SeoConfig, row: SeoRow) => {
    runGenerate(config, row).catch((error) => toast({ title: 'Generering misslyckades', description: error.message, variant: 'destructive' }));
  };

  const handleBatchGenerate = async () => {
    const targets = filteredRows.filter(row => row.generation_status !== 'completed');
    setBatchProgress({ done: 0, total: targets.length });
    for (let i = 0; i < targets.length; i += 1) {
      try { await runGenerate(activeConfig, targets[i]); } catch { /* per-row status becomes failed */ }
      setBatchProgress({ done: i + 1, total: targets.length });
      if (i < targets.length - 1) await sleep(2000);
    }
    toast({ title: 'Batch klar', description: `${targets.length} poster behandlade.` });
    setBatchProgress(null);
  };

  if (adminLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (isError || !adminCheck?.is_admin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Shield className="h-12 w-12 text-destructive/50" />
        <h1 className="font-serif text-xl text-foreground">Åtkomst nekad</h1>
        <p className="text-sm text-muted-foreground">Du har inte behörighet att se denna sida.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="font-serif text-3xl text-foreground">SEO-admin</h1>
        <p className="text-sm text-muted-foreground">Hantera SEO-contentmotorn utan att aktivera publika rutter förrän materialet är granskat.</p>
      </div>

      <Card className="border-border/60">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
          {settingsLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : (
            <>
              <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/35 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Publika SEO-rutter aktiverade</p>
                  <p className="text-xs text-muted-foreground">Styr om /raser/:slug m.fl. får läsas publikt.</p>
                </div>
                <Switch checked={!!settings?.public_routes_enabled} onCheckedChange={(checked) => settingsMutation.mutate({ public_routes_enabled: checked })} />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/35 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">llms.txt aktiverad</p>
                  <p className="text-xs text-muted-foreground">Feature flag för framtida llms.txt-export.</p>
                </div>
                <Switch checked={!!settings?.llms_txt_enabled} onCheckedChange={(checked) => settingsMutation.mutate({ llms_txt_enabled: checked })} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SeoType)} className="space-y-4">
        <TabsList className="flex w-full overflow-x-auto rounded-xl">
          {configs.map(config => <TabsTrigger key={config.type} value={config.type} className="rounded-lg">{config.label}</TabsTrigger>)}
        </TabsList>

        {configs.map(config => (
          <TabsContent key={config.type} value={config.type} className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Sök namn eller slug..." className="rounded-xl pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full rounded-xl sm:w-52"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map(status => <SelectItem key={status} value={status}>{status === 'all' ? 'Alla statusar' : STATUS_LABELS[status]}</SelectItem>)}</SelectContent>
              </Select>
              <Button type="button" className="rounded-xl gap-2" onClick={handleBatchGenerate} disabled={!!batchProgress}>
                {batchProgress ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {batchProgress ? `${batchProgress.done}/${batchProgress.total}` : 'Generera alla saknade'}
              </Button>
            </div>

            <Card className="border-border/60">
              <CardContent className="p-0">
                {rowsLoading ? <div className="flex justify-center p-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : (
                  <SeoTable config={config} rows={filteredRows} onEdit={(row) => setEditing({ config, row: { ...row } })} onPublishRequest={(cfg, row, next) => next ? setPublishTarget({ config: cfg, row, next }) : updateRowMutation.mutate({ config: cfg, id: row.id, patch: { published: false } })} onGenerate={handleGenerate} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[92vh] max-w-6xl overflow-auto">
          <DialogHeader>
            <DialogTitle>Redigera SEO-post</DialogTitle>
            <DialogDescription>Fyll contentfält och strukturerade fält innan publicering.</DialogDescription>
          </DialogHeader>
          {editing ? (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><Label>Namn</Label><Input value={editing.row.name ?? ''} disabled className="mt-1 rounded-xl" /></div>
                  <div><Label>Slug</Label><Input value={editing.row.slug ?? ''} disabled className="mt-1 rounded-xl" /></div>
                </div>
                {editing.config.textFields.map(field => (
                  <div key={field} className="space-y-1.5">
                    <Label>{field}</Label>
                    {field === 'content' ? (
                      <Textarea value={editing.row[field] ?? ''} onChange={(event) => setEditing({ ...editing, row: { ...editing.row, [field]: event.target.value } })} className="min-h-52 rounded-xl" />
                    ) : (
                      <Textarea value={editing.row[field] ?? ''} onChange={(event) => setEditing({ ...editing, row: { ...editing.row, [field]: event.target.value } })} className="rounded-xl" />
                    )}
                  </div>
                ))}
                {editing.config.jsonFields.map(field => (
                  <Repeater key={field.key} label={field.label} fields={field.fields} value={editing.row[field.key]} onChange={(next) => setEditing({ ...editing, row: { ...editing.row, [field.key]: next } })} />
                ))}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" className="rounded-xl" onClick={() => setEditing(null)}>Avbryt</Button>
                  <Button type="button" className="rounded-xl" onClick={saveEditing} disabled={updateRowMutation.isPending}>Spara</Button>
                </div>
              </div>
              <PreviewPanel row={editing.row} />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!publishTarget} onOpenChange={(open) => !open && setPublishTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publicera SEO-sida?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">Denna sida blir publikt synlig på honsgarden.se. Har du läst igenom innehållet? Har du verifierat faktauppgifter?</span>
              {publishTarget?.config.type === 'problems' ? (
                <span className="block rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-destructive">
                  <AlertTriangle className="mr-2 inline h-4 w-4" />⚠️ Denna sida rör djurhälsa. Verifiera mot Jordbruksverket/SVA. I dagsläget granskas innehåll inte av veterinär — säkerställ att medical_disclaimer-fältet är ifyllt.
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (!publishTarget) return;
              updateRowMutation.mutate({ config: publishTarget.config, id: publishTarget.row.id, patch: { published: publishTarget.next } });
              setPublishTarget(null);
            }}>Publicera</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
