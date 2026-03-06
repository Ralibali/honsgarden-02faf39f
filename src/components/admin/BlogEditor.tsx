import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  Plus, ArrowLeft, Save, Eye, EyeOff, Trash2, Loader2,
  ImagePlus, FileText, Tag, Search, Globe, MonitorSmartphone
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import DOMPurify from 'dompurify';

/** Render content for preview – supports HTML and Markdown */
function isHtmlContent(content: string): boolean {
  const trimmed = content.trim();
  return trimmed.startsWith('<') || trimmed.startsWith('<!');
}

function renderPreview(md: string): string {
  if (isHtmlContent(md)) {
    return DOMPurify.sanitize(md, {
      ADD_TAGS: ['iframe', 'video', 'source', 'picture'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'loading', 'target', 'rel'],
    });
  }
  let html = md
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-serif text-foreground mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-serif text-foreground mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-serif text-foreground mt-8 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, (_, text, url) => {
      const isAffiliate = url.includes('adtraction') || url.includes('awin') || url.includes('tradedoubler') || url.includes('partner') || text.includes('→') || text.toLowerCase().includes('köp');
      if (isAffiliate) {
        return `<a href="${url}" target="_blank" rel="noopener sponsored" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity no-underline">${text}</a>`;
      }
      return `<a href="${url}" target="_blank" rel="noopener" class="text-primary underline underline-offset-2 hover:opacity-80">${text}</a>`;
    })
    .replace(/^[-*] (.+)$/gm, '<li class="ml-4 list-disc text-foreground/90">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-foreground/90">$1</li>')
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="rounded-xl my-4 w-full max-w-lg" loading="lazy" />')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary/30 pl-4 py-1 my-4 text-muted-foreground italic">$1</blockquote>')
    .replace(/^---$/gm, '<hr class="my-6 border-border/50" />')
    .replace(/\n\n/g, '</p><p class="text-foreground/85 leading-relaxed mb-4">')
    .replace(/\n/g, '<br />');
  return DOMPurify.sanitize(`<p class="text-foreground/85 leading-relaxed mb-4">${html}</p>`);
}

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category: string | null;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  published_at: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/å/g, 'a').replace(/ä/g, 'a').replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function PostForm({ post, onBack }: { post?: BlogPost; onBack: () => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [content, setContent] = useState(post?.content || '');
  const [category, setCategory] = useState(post?.category || 'guide');
  const [tagsInput, setTagsInput] = useState((post?.tags || []).join(', '));
  const [metaTitle, setMetaTitle] = useState(post?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(post?.meta_description || '');
  const [coverUrl, setCoverUrl] = useState(post?.cover_image_url || '');
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!post);

  useEffect(() => {
    if (autoSlug && title) setSlug(slugify(title));
  }, [title, autoSlug]);

  const saveMutation = useMutation({
    mutationFn: async (publish?: boolean) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Ej inloggad');

      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      const postData: any = {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        category,
        tags,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        cover_image_url: coverUrl || null,
        author_id: user.id,
      };

      if (publish !== undefined) {
        postData.is_published = publish;
        if (publish && !post?.published_at) {
          postData.published_at = new Date().toISOString();
        }
        if (!publish) {
          postData.published_at = null;
        }
      }

      if (post) {
        const { error } = await supabase.from('blog_posts').update(postData).eq('id', post.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from('blog_posts').insert(postData);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast({ title: 'Sparad!' });
      onBack();
    },
    onError: (err: any) => toast({ title: 'Fel', description: err.message, variant: 'destructive' }),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('blog-images').upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from('blog-images').getPublicUrl(path);
      setCoverUrl(data.publicUrl);
      toast({ title: 'Bild uppladdad' });
    } catch (err: any) {
      toast({ title: 'Uppladdning misslyckades', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-lg">
          <ArrowLeft className="h-4 w-4 mr-1" /> Tillbaka
        </Button>
        <h2 className="font-serif text-lg flex-1">{post ? 'Redigera artikel' : 'Ny artikel'}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Main content - 2 cols */}
        <div className="md:col-span-2 space-y-4">
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Titel</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="T.ex. Bästa hönsfodret 2026" className="rounded-xl font-medium" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">URL-slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">/blogg/</span>
                  <Input value={slug} onChange={e => { setSlug(e.target.value); setAutoSlug(false); }} placeholder="basta-honsfodret" className="rounded-xl text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Sammanfattning</label>
                <Textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Kort beskrivning som visas i listan..." rows={2} className="rounded-xl" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-muted-foreground">Innehåll (Markdown / HTML)</label>
                  <Button
                    type="button"
                    variant={showPreview ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 rounded-lg text-[10px] gap-1"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <MonitorSmartphone className="h-3 w-3" />
                    {showPreview ? 'Redigera' : 'Förhandsgranska'}
                  </Button>
                </div>
                {showPreview ? (
                  <div className="rounded-xl border border-border/60 bg-background p-4 sm:p-6 min-h-[400px] overflow-auto">
                    {coverUrl && (
                      <img src={coverUrl} alt={title} className="w-full aspect-video object-cover rounded-xl mb-6" />
                    )}
                    <h1 className="text-2xl sm:text-3xl font-serif text-foreground mb-2">{title || 'Utan titel'}</h1>
                    {excerpt && <p className="text-muted-foreground text-sm mb-6">{excerpt}</p>}
                    <div
                      className="prose-custom"
                      dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
                    />
                  </div>
                ) : (
                  <>
                    <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Skriv din artikel här... Använd **fetstil**, *kursiv*, ## rubriker, [länktext](url) eller klistra in HTML." rows={16} className="rounded-xl font-mono text-sm" />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Tips: Använd [Köp här →](https://din-affiliate-länk.se) för affiliate-länkar. Du kan även klistra in ren HTML.
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Publish */}
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" /> Publicering</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => saveMutation.mutate(false)}
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-lg text-xs"
                  disabled={saveMutation.isPending || !title || !slug}
                >
                  <Save className="h-3 w-3 mr-1" /> Spara utkast
                </Button>
                <Button
                  onClick={() => saveMutation.mutate(true)}
                  size="sm"
                  className="flex-1 rounded-lg text-xs"
                  disabled={saveMutation.isPending || !title || !slug || !content}
                >
                  {saveMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3 mr-1" />}
                  Publicera
                </Button>
              </div>
              {post?.is_published && (
                <Button
                  onClick={() => saveMutation.mutate(false)}
                  variant="outline"
                  size="sm"
                  className="w-full rounded-lg text-xs text-warning"
                  disabled={saveMutation.isPending}
                >
                  <EyeOff className="h-3 w-3 mr-1" /> Avpublicera
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Cover image */}
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><ImagePlus className="h-3 w-3" /> Omslagsbild</p>
              {coverUrl ? (
                <div className="relative">
                  <img src={coverUrl} alt="Omslag" className="rounded-lg w-full aspect-video object-cover" />
                  <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 rounded-full" onClick={() => setCoverUrl('')}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 py-6 border-2 border-dashed border-border/60 rounded-xl cursor-pointer hover:border-primary/40 transition-colors">
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : <ImagePlus className="h-5 w-5 text-muted-foreground" />}
                  <span className="text-[10px] text-muted-foreground">{uploading ? 'Laddar upp...' : 'Klicka för att ladda upp'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              )}
              <Input value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="Eller klistra in bild-URL" className="rounded-xl text-xs" />
            </CardContent>
          </Card>

          {/* Category & tags */}
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1"><FileText className="h-3 w-3" /> Kategori</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="rounded-xl text-xs h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="recension">Recension</SelectItem>
                    <SelectItem value="tips">Tips & tricks</SelectItem>
                    <SelectItem value="halsa">Hälsa</SelectItem>
                    <SelectItem value="nybörjare">Nybörjare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1"><Tag className="h-3 w-3" /> Taggar</label>
                <Input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="foder, höns, recension" className="rounded-xl text-xs" />
                <p className="text-[9px] text-muted-foreground mt-0.5">Kommaseparerade</p>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Search className="h-3 w-3" /> SEO</p>
              <div>
                <label className="text-[10px] text-muted-foreground">Meta-titel (max 60 tecken)</label>
                <Input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder={title || 'Sidtitel'} className="rounded-xl text-xs" maxLength={60} />
                <span className="text-[9px] text-muted-foreground">{(metaTitle || title).length}/60</span>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Meta-beskrivning (max 160 tecken)</label>
                <Textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} placeholder={excerpt || 'Beskrivning för sökmotorer'} rows={2} className="rounded-xl text-xs" maxLength={160} />
                <span className="text-[9px] text-muted-foreground">{(metaDescription || excerpt || '').length}/160</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function BlogEditor() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<BlogPost | 'new' | null>(null);
  const [search, setSearch] = useState('');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast({ title: 'Artikel raderad' });
    },
  });

  if (editing) {
    return <PostForm post={editing === 'new' ? undefined : editing} onBack={() => setEditing(null)} />;
  }

  const filtered = search
    ? posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    : posts;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Sök artiklar..." className="pl-9 rounded-xl h-10" />
        </div>
        <Button onClick={() => setEditing('new')} size="sm" className="rounded-xl gap-1">
          <Plus className="h-4 w-4" /> Ny artikel
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : !filtered.length ? (
        <div className="text-center py-12">
          <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{search ? 'Inga artiklar matchade sökningen.' : 'Inga artiklar ännu.'}</p>
          <Button onClick={() => setEditing('new')} variant="outline" size="sm" className="mt-3 rounded-xl">
            <Plus className="h-3 w-3 mr-1" /> Skapa din första artikel
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(post => (
            <Card key={post.id} className="border-border/50 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setEditing(post)}>
              <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                {post.cover_image_url ? (
                  <img src={post.cover_image_url} alt="" className="w-14 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-14 h-10 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Badge variant="secondary" className={`text-[9px] ${post.is_published ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground'}`}>
                      {post.is_published ? '● Publicerad' : 'Utkast'}
                    </Badge>
                    {post.category && (
                      <Badge variant="outline" className="text-[9px]">{post.category}</Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(post.updated_at).toLocaleDateString('sv-SE')}
                    </span>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/50 hover:text-destructive shrink-0" onClick={e => e.stopPropagation()}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl" onClick={e => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-serif">Radera artikel?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Detta raderar <strong>{post.title}</strong> permanent.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Avbryt</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                        onClick={() => deleteMutation.mutate(post.id)}
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
    </div>
  );
}
