import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type SeoType = 'seo_breeds' | 'seo_problems' | 'seo_care_topics' | 'seo_months';
type SeoRow = Tables<'seo_breeds'> | Tables<'seo_problems'> | Tables<'seo_care_topics'> | Tables<'seo_months'>;

const CONFIG: Record<SeoType, { label: string; singular: string; needsCategory?: boolean; needsMonth?: boolean }> = {
  seo_breeds: { label: 'Raser', singular: 'ras' },
  seo_problems: { label: 'Problem', singular: 'problem', needsCategory: true },
  seo_care_topics: { label: 'Skötsel', singular: 'skötselämne', needsCategory: true },
  seo_months: { label: 'Månader', singular: 'månad', needsMonth: true },
};

const slugify = (value: string) => value.toLowerCase().trim().replace(/[åä]/g, 'a').replace(/ö/g, 'o').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function SeoAdmin() {
  const queryClient = useQueryClient();
  const [type, setType] = useState<SeoType>('seo_breeds');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [monthNumber, setMonthNumber] = useState('1');
  const config = CONFIG[type];

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['seo-admin', type],
    queryFn: async () => {
      const { data, error } = await supabase.from(type).select('*').order('updated_at', { ascending: false }).limit(100);
      if (error) throw new Error(error.message);
      return (data ?? []) as SeoRow[];
    },
  });

  const resetForm = () => {
    setName('');
    setSlug('');
    setCategory('');
    setMonthNumber('1');
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const base = { name, slug: slug || slugify(name), generation_status: 'pending', published: false };
      const payload = type === 'seo_months'
        ? { ...base, month_number: Number(monthNumber) || 1 }
        : config.needsCategory
          ? { ...base, category: category || 'Allmänt' }
          : base;
      const { error } = await supabase.from(type).insert(payload as never);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-admin', type] });
      resetForm();
      toast({ title: 'SEO-post skapad' });
    },
    onError: (err: Error) => toast({ title: 'Kunde inte skapa', description: err.message, variant: 'destructive' }),
  });

  const generateMutation = useMutation({
    mutationFn: async ({ id, rowType }: { id: string; rowType: SeoType }) => {
      const { error } = await supabase.functions.invoke('seo-generate-content', { body: { type: rowType, id } });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-admin', type] });
      toast({ title: 'Generering startad' });
    },
    onError: (err: Error) => toast({ title: 'Kunde inte generera', description: err.message, variant: 'destructive' }),
  });

  const publishMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase.from(type).update({ published } as never).eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-admin', type] });
      toast({ title: 'Publicering uppdaterad' });
    },
  });

  const missingContent = useMemo(() => rows.filter((row) => !('content' in row) || !row.content).length, [rows]);

  return (
    <div className="space-y-4">
      <Tabs value={type} onValueChange={(value) => { setType(value as SeoType); resetForm(); }}>
        <TabsList className="flex w-full overflow-x-auto rounded-xl">
          {Object.entries(CONFIG).map(([key, item]) => <TabsTrigger key={key} value={key} className="rounded-lg text-xs">{item.label}</TabsTrigger>)}
        </TabsList>
        {Object.keys(CONFIG).map((key) => <TabsContent key={key} value={key} />)}
      </Tabs>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-serif">Skapa {config.singular}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-4">
          <Input placeholder="Namn" value={name} onChange={(event) => { setName(event.target.value); setSlug(slugify(event.target.value)); }} className="rounded-xl" />
          <Input placeholder="slug" value={slug} onChange={(event) => setSlug(slugify(event.target.value))} className="rounded-xl" />
          {config.needsCategory && <Input placeholder="Kategori" value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl" />}
          {config.needsMonth && <Input type="number" min="1" max="12" placeholder="Månad" value={monthNumber} onChange={(event) => setMonthNumber(event.target.value)} className="rounded-xl" />}
          <Button disabled={!name.trim() || createMutation.isPending} onClick={() => createMutation.mutate()} className="rounded-xl gap-2">
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Skapa
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{rows.length} poster</span>
        <span>{missingContent} saknar text</span>
      </div>

      {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : (
        <div className="space-y-2">
          {rows.map((row) => (
            <Card key={row.id} className="border-border/50">
              <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{row.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">/{row.slug}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge variant={row.published ? 'default' : 'secondary'} className="text-[10px]">{row.published ? 'Publicerad' : 'Utkast'}</Badge>
                    <Badge variant="outline" className="text-[10px]">{row.generation_status}</Badge>
                    {'content' in row && row.content ? <Badge variant="outline" className="text-[10px] text-success">Text finns</Badge> : <Badge variant="outline" className="text-[10px] text-warning">Saknar text</Badge>}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1.5 text-xs" disabled={generateMutation.isPending} onClick={() => generateMutation.mutate({ id: row.id, rowType: type })}>
                    <RefreshCw className="h-3.5 w-3.5" /> Generera
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1.5 text-xs" disabled={publishMutation.isPending} onClick={() => publishMutation.mutate({ id: row.id, published: !row.published })}>
                    {row.published ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                    {row.published ? 'Avpublicera' : 'Publicera'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}