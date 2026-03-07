import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Loader2, Search, Link2, ExternalLink } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type GlossaryEntry = {
  id: string;
  keyword: string;
  url: string;
  rel: string;
  is_active: boolean;
  created_at: string;
};

export default function GlossaryManager() {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [url, setUrl] = useState('');
  const [search, setSearch] = useState('');
  const [isSponsored, setIsSponsored] = useState(true);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['glossary-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('link_glossary')
        .select('*')
        .order('keyword', { ascending: true });
      if (error) throw error;
      return data as GlossaryEntry[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('link_glossary').insert({
        keyword: keyword.trim(),
        url: url.trim(),
        rel: isSponsored ? 'noopener sponsored' : 'noopener',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glossary-entries'] });
      setKeyword('');
      setUrl('');
      toast({ title: `"${keyword}" tillagd!` });
    },
    onError: (err: any) => toast({ title: 'Fel', description: err.message, variant: 'destructive' }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('link_glossary')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['glossary-entries'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('link_glossary').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glossary-entries'] });
      toast({ title: 'Borttagen' });
    },
  });

  const filtered = search
    ? entries.filter(e => e.keyword.toLowerCase().includes(search.toLowerCase()))
    : entries;

  return (
    <div className="space-y-4">
      {/* Add new */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Plus className="h-3 w-3" /> Lägg till nytt länkord
          </p>
          <div className="flex gap-2">
            <Input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Nyckelord, t.ex. Granngården"
              className="rounded-xl text-sm flex-1"
            />
            <Input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="Affiliatelänk (URL)"
              className="rounded-xl text-sm flex-1"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <Switch checked={isSponsored} onCheckedChange={setIsSponsored} />
              Sponsrad länk (rel="sponsored")
            </label>
            <Button
              size="sm"
              className="rounded-xl text-xs gap-1"
              onClick={() => addMutation.mutate()}
              disabled={!keyword.trim() || !url.trim() || addMutation.isPending}
            >
              {addMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              Lägg till
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Sök länkord..."
          className="pl-9 rounded-xl"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : !filtered.length ? (
        <div className="text-center py-8">
          <Link2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {search ? 'Inga länkord matchade.' : 'Inga länkord ännu. Lägg till ditt första ovan!'}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground">{filtered.length} länkord</p>
          {filtered.map(entry => (
            <Card key={entry.id} className="border-border/50">
              <CardContent className="p-3 flex items-center gap-3">
                <Switch
                  checked={entry.is_active}
                  onCheckedChange={(checked) => toggleMutation.mutate({ id: entry.id, is_active: checked })}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{entry.keyword}</p>
                    {entry.rel.includes('sponsored') && (
                      <Badge variant="outline" className="text-[8px] h-4">Sponsrad</Badge>
                    )}
                    {!entry.is_active && (
                      <Badge variant="secondary" className="text-[8px] h-4 text-muted-foreground">Inaktiv</Badge>
                    )}
                  </div>
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener"
                    className="text-[10px] text-muted-foreground hover:text-primary truncate block max-w-xs flex items-center gap-1"
                  >
                    {entry.url.length > 50 ? entry.url.slice(0, 50) + '...' : entry.url}
                    <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                  </a>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive/50 hover:text-destructive shrink-0"
                  onClick={() => deleteMutation.mutate(entry.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Alla ord ovan ersätts automatiskt med länken i publicerade artiklar (max 1 gång per ord per artikel).
      </p>
    </div>
  );
}
