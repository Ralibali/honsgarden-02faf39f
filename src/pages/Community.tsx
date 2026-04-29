import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import EmptyState from '@/components/EmptyState';
import { logModerationAction } from '@/lib/communityModerationLog';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Copy,
  Heart,
  Image as ImageIcon,
  Loader2,
  MapPin,
  MessageCircle,
  Plus,
  Reply,
  Search,
  Send,
  ShoppingBag,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';

const IMAGE_BUCKET = 'community-images';

const categories = [
  'Alla',
  'Frågor',
  'Tips & råd',
  'Visa min hönsgård',
  'Säljes / skänkes',
  'Köpes',
  'Hälsa',
  'Foder',
  'Kläckning',
  'Äggförsäljning',
  'Övrigt',
];

const reportReasons = ['Olämpligt innehåll', 'Spam', 'Fel kategori', 'Misstänkt bedrägeri', 'Annat'];

type Post = any;
type Comment = any;

function isMarketCategory(category: string) {
  return category === 'Säljes / skänkes' || category === 'Köpes';
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'community-bild';
}

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Du behöver vara inloggad.');
  return data.user.id;
}

async function uploadCommunityImage(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Välj en bildfil.');
  if (file.size > 8 * 1024 * 1024) throw new Error('Bilden är för stor. Välj en bild under 8 MB.');
  const userId = await getCurrentUserId();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ''))}.${ext}`;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'image/jpeg',
  });
  if (error) throw error;
  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export default function Community() {
  const qc = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('Alla');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Frågor');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyImageUrl, setReplyImageUrl] = useState('');
  const [replyUploading, setReplyUploading] = useState(false);

  useEffect(() => {
    document.title = 'Community | Hönsgården';
  }, []);

  const { data: userData } = useQuery({
    queryKey: ['community-current-user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  const userId = userData?.id;

  const { data: isAdmin = false } = useQuery({
    queryKey: ['community-is-admin', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId!)
        .eq('role', 'admin')
        .maybeSingle();
      if (error) return false;
      return !!data;
    },
  });

  const togglePin = async (post: Post) => {
    const { error } = await (supabase as any)
      .from('community_posts')
      .update({ is_pinned: !post.is_pinned })
      .eq('id', post.id);
    if (error) return toast({ title: 'Kunde inte uppdatera', description: error.message, variant: 'destructive' });
    await qc.invalidateQueries({ queryKey: ['community-posts'] });
    toast({ title: post.is_pinned ? 'Inlägget är inte längre fäst' : 'Inlägget är fäst högst upp 📌' });
  };

  const deleteComment = async (comment: Comment) => {
    if (!window.confirm('Vill du ta bort kommentaren?')) return;
    const { error } = await (supabase as any).from('community_comments').delete().eq('id', comment.id);
    if (error) return toast({ title: 'Kunde inte ta bort', description: error.message, variant: 'destructive' });
    await qc.invalidateQueries({ queryKey: ['community-comments'] });
    toast({ title: 'Kommentaren är borttagen' });
  };

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['community-posts'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('community_posts')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['community-comments'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('community_comments')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: reactions = [] } = useQuery({
    queryKey: ['community-reactions'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('community_reactions')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const commentsByPost = useMemo(() => {
    const map: Record<string, Comment[]> = {};
    (comments as Comment[]).forEach((c) => {
      map[c.post_id] = [...(map[c.post_id] || []), c];
    });
    return map;
  }, [comments]);

  const reactionsByPost = useMemo(() => {
    const map: Record<string, any[]> = {};
    (reactions as any[]).forEach((r) => {
      if (r.post_id) map[r.post_id] = [...(map[r.post_id] || []), r];
    });
    return map;
  }, [reactions]);

  const filteredPosts = useMemo(() => {
    return (posts as Post[]).filter((post) => {
      const matchesCategory = selectedCategory === 'Alla' || post.category === selectedCategory;
      const haystack = `${post.title || ''} ${post.content || ''} ${post.location || ''}`.toLowerCase();
      const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, search]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('Frågor');
    setLocation('');
    setPrice('');
    setContactInfo('');
    setImageUrl('');
  };

  const createPost = useMutation({
    mutationFn: async () => {
      const uid = await getCurrentUserId();
      if (title.trim().length < 3) throw new Error('Skriv en tydligare rubrik.');
      if (content.trim().length < 5) throw new Error('Skriv lite mer i inlägget.');
      const { error } = await (supabase as any).from('community_posts').insert({
        user_id: uid,
        title: title.trim(),
        content: content.trim(),
        category,
        image_url: imageUrl || null,
        location: isMarketCategory(category) ? location.trim() || null : null,
        price: isMarketCategory(category) && price ? Number(price) : null,
        contact_info: isMarketCategory(category) ? contactInfo.trim() || null : null,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['community-posts'] });
      resetForm();
      setShowForm(false);
      toast({ title: 'Inlägget är publicerat 💚' });
    },
    onError: (e: any) => toast({ title: 'Kunde inte publicera', description: e.message, variant: 'destructive' }),
  });

  const createComment = useMutation({
    mutationFn: async (postId: string) => {
      const uid = await getCurrentUserId();
      if (replyText.trim().length < 2 && !replyImageUrl) throw new Error('Skriv ett svar eller lägg till en bild.');
      const { error } = await (supabase as any).from('community_comments').insert({
        post_id: postId,
        user_id: uid,
        content: replyText.trim(),
        image_url: replyImageUrl || null,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['community-comments'] });
      setReplyText('');
      setReplyImageUrl('');
      toast({ title: 'Svaret är publicerat' });
    },
    onError: (e: any) => toast({ title: 'Kunde inte svara', description: e.message, variant: 'destructive' }),
  });

  const toggleLike = async (post: Post) => {
    try {
      const uid = await getCurrentUserId();
      const existing = (reactionsByPost[post.id] || []).find((r) => r.user_id === uid && r.reaction_type === 'like');
      if (existing) {
        const { error } = await (supabase as any).from('community_reactions').delete().eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('community_reactions').insert({ post_id: post.id, user_id: uid, reaction_type: 'like' });
        if (error) throw error;
      }
      await qc.invalidateQueries({ queryKey: ['community-reactions'] });
    } catch (e: any) {
      toast({ title: 'Kunde inte reagera', description: e.message, variant: 'destructive' });
    }
  };

  const reportPost = async (post: Post) => {
    const reason = window.prompt(`Varför vill du anmäla inlägget?\n\n${reportReasons.join('\n')}`) || '';
    if (!reason.trim()) return;
    try {
      const uid = await getCurrentUserId();
      const { error } = await (supabase as any).from('community_reports').insert({
        post_id: post.id,
        reported_by: uid,
        reason: reason.trim(),
      });
      if (error) throw error;
      toast({ title: 'Tack, inlägget är anmält', description: 'Vi tittar på det så snart vi kan.' });
    } catch (e: any) {
      toast({ title: 'Kunde inte anmäla', description: e.message, variant: 'destructive' });
    }
  };

  const deletePost = async (post: Post) => {
    if (!window.confirm('Vill du ta bort inlägget?')) return;
    const { error } = await (supabase as any).from('community_posts').delete().eq('id', post.id);
    if (error) return toast({ title: 'Kunde inte ta bort', description: error.message, variant: 'destructive' });
    await qc.invalidateQueries({ queryKey: ['community-posts'] });
    toast({ title: 'Inlägget är borttaget' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <div>
          <p className="data-label mb-1">Community</p>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Hönsgården Community 🐔</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 leading-relaxed">
            Ställ frågor, dela bilder, svara andra hönsägare och lägg upp sådant du vill sälja, köpa eller skänka.
          </p>
        </div>
        <Button className="rounded-xl gap-2" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> {showForm ? 'Stäng' : 'Nytt inlägg'}
        </Button>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/8 via-card to-accent/5 shadow-sm">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <Button key={cat} size="sm" variant={selectedCategory === cat ? 'default' : 'outline'} className="rounded-full shrink-0" onClick={() => setSelectedCategory(cat)}>
                {cat}
              </Button>
            ))}
          </div>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Sök bland frågor, tips och säljesinlägg..." className="rounded-xl pl-9" />
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="border-primary/20 shadow-sm">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <h2 className="font-serif text-lg text-foreground">Skapa inlägg</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1.5 sm:col-span-2"><span className="text-xs text-muted-foreground">Rubrik</span><Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" placeholder="T.ex. Varför värper mina hönor mindre?" /></label>
              <label className="space-y-1.5"><span className="text-xs text-muted-foreground">Kategori</span><select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm">{categories.filter((c) => c !== 'Alla').map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select></label>
              <label className="space-y-1.5"><span className="text-xs text-muted-foreground">Bild</span><FileButton uploading={imageUploading} onFile={async (file) => { setImageUploading(true); try { setImageUrl(await uploadCommunityImage(file)); toast({ title: 'Bilden är uppladdad' }); } catch (e: any) { toast({ title: 'Kunde inte ladda upp bild', description: e.message, variant: 'destructive' }); } finally { setImageUploading(false); } }} /></label>
              {isMarketCategory(category) && <><label className="space-y-1.5"><span className="text-xs text-muted-foreground">Pris</span><Input value={price} onChange={(e) => setPrice(e.target.value)} className="rounded-xl" type="number" placeholder="T.ex. 150" /></label><label className="space-y-1.5"><span className="text-xs text-muted-foreground">Plats</span><Input value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-xl" placeholder="T.ex. Berg, Ljungsbro" /></label><label className="space-y-1.5 sm:col-span-2"><span className="text-xs text-muted-foreground">Kontaktinfo</span><Input value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="rounded-xl" placeholder="T.ex. skriv PM eller ring 070..." /></label></>}
              <label className="space-y-1.5 sm:col-span-2"><span className="text-xs text-muted-foreground">Text</span><Textarea value={content} onChange={(e) => setContent(e.target.value)} className="rounded-xl min-h-[120px]" placeholder="Skriv ditt inlägg..." /></label>
            </div>
            {imageUrl && <img src={imageUrl} alt="Förhandsvisning" className="h-48 w-full rounded-2xl object-cover border" />}
            <div className="flex justify-end gap-2"><Button variant="outline" className="rounded-xl" onClick={() => { resetForm(); setShowForm(false); }}>Avbryt</Button><Button className="rounded-xl gap-2" disabled={createPost.isPending} onClick={() => createPost.mutate()}>{createPost.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Publicera</Button></div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filteredPosts.length === 0 ? (
            <EmptyState icon={Users} title="Inga inlägg ännu" description="Bli först med att ställa en fråga, dela en bild eller starta en tråd." actionLabel="Skapa inlägg" onAction={() => setShowForm(true)} />
          ) : (
            filteredPosts.map((post) => {
              const postComments = commentsByPost[post.id] || [];
              const likes = reactionsByPost[post.id] || [];
              const likedByMe = likes.some((r) => r.user_id === userId);
              const isOwner = post.user_id === userId;
              const isOpen = openPostId === post.id;
              return (
                <article key={post.id} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                  {post.image_url && <img src={post.image_url} alt={post.title} className="h-56 w-full object-cover" />}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2"><Badge variant="secondary">{post.category}</Badge>{post.is_sold && <Badge className="bg-success/10 text-success border-success/20">Såld</Badge>}{post.is_pinned && <Badge>Fäst</Badge>}</div>
                        <h2 className="font-serif text-lg text-foreground break-words">{post.title}</h2>
                        <p className="text-[11px] text-muted-foreground mt-1">Publicerat {post.created_at ? new Date(post.created_at).toLocaleString('sv-SE') : 'nyligen'}</p>
                      </div>
                      {isMarketCategory(post.category) && <ShoppingBag className="h-5 w-5 text-primary shrink-0" />}
                    </div>

                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{isOpen ? post.content : `${String(post.content).slice(0, 220)}${String(post.content).length > 220 ? '...' : ''}`}</p>

                    {isMarketCategory(post.category) && <div className="rounded-xl border bg-muted/25 p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm"><p><strong>Pris:</strong> {post.price ? `${Math.round(Number(post.price))} kr` : 'Ej angivet'}</p><p className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {post.location || 'Plats saknas'}</p><p><strong>Kontakt:</strong> {post.contact_info || 'Skriv svar i tråden'}</p></div>}

                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm" variant={likedByMe ? 'default' : 'outline'} className="rounded-xl gap-1.5" onClick={() => toggleLike(post)}><Heart className="h-3.5 w-3.5" /> {likes.length}</Button>
                      <Button size="sm" variant="outline" className="rounded-xl gap-1.5" onClick={() => setOpenPostId(isOpen ? null : post.id)}><MessageCircle className="h-3.5 w-3.5" /> {postComments.length} svar</Button>
                      <Button size="sm" variant="ghost" className="rounded-xl gap-1.5" onClick={() => reportPost(post)}><AlertTriangle className="h-3.5 w-3.5" /> Anmäl</Button>
                      {(isOwner || isAdmin) && isMarketCategory(post.category) && <Button size="sm" variant="outline" className="rounded-xl gap-1.5" onClick={async () => { await (supabase as any).from('community_posts').update({ is_sold: !post.is_sold }).eq('id', post.id); await qc.invalidateQueries({ queryKey: ['community-posts'] }); }}><CheckCircle2 className="h-3.5 w-3.5" /> {post.is_sold ? 'Öppna igen' : 'Markera såld'}</Button>}
                      {isAdmin && <Button size="sm" variant="outline" className="rounded-xl gap-1.5 border-primary/40 text-primary" onClick={() => togglePin(post)} title={post.is_pinned ? 'Lossa fäst' : 'Fäst högst upp'}>📌 {post.is_pinned ? 'Lossa' : 'Fäst'}</Button>}
                      {(isOwner || isAdmin) && <Button size="sm" variant="ghost" className="rounded-xl text-destructive hover:text-destructive gap-1.5" onClick={() => deletePost(post)}><Trash2 className="h-3.5 w-3.5" /> Ta bort{isAdmin && !isOwner ? ' (admin)' : ''}</Button>}
                    </div>

                    {isOpen && <div className="border-t border-border/50 pt-4 space-y-3"><h3 className="font-serif text-sm text-foreground flex items-center gap-2"><Reply className="h-4 w-4 text-primary" /> Svar</h3>{postComments.length === 0 ? <p className="text-sm text-muted-foreground">Inga svar ännu. Var först att hjälpa till.</p> : postComments.map((comment) => <div key={comment.id} className="rounded-xl bg-muted/30 border p-3"><p className="text-sm whitespace-pre-wrap">{comment.content}</p>{comment.image_url && <img src={comment.image_url} alt="Svarbild" className="mt-2 rounded-xl max-h-56 w-full object-cover" />}<div className="flex items-center justify-between mt-2 gap-2"><p className="text-[11px] text-muted-foreground">{comment.created_at ? new Date(comment.created_at).toLocaleString('sv-SE') : 'nyligen'}</p>{(comment.user_id === userId || isAdmin) && <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:text-destructive gap-1" onClick={() => deleteComment(comment)}><Trash2 className="h-3 w-3" /> Ta bort</Button>}</div></div>)}<div className="rounded-xl border bg-background p-3 space-y-2"><Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} className="rounded-xl min-h-[80px]" placeholder="Skriv ett svar..." />{replyImageUrl && <img src={replyImageUrl} alt="Svarbild" className="h-36 w-full rounded-xl object-cover" />}<div className="flex flex-col sm:flex-row gap-2 justify-between"><FileButton small uploading={replyUploading} onFile={async (file) => { setReplyUploading(true); try { setReplyImageUrl(await uploadCommunityImage(file)); toast({ title: 'Bilden är uppladdad' }); } catch (e: any) { toast({ title: 'Kunde inte ladda upp bild', description: e.message, variant: 'destructive' }); } finally { setReplyUploading(false); } }} /><Button size="sm" className="rounded-xl gap-1.5" disabled={createComment.isPending} onClick={() => createComment.mutate(post.id)}>{createComment.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Svara</Button></div></div></div>}

                    {isOpen && <div className="border-t border-border/50 pt-4 space-y-3"><h3 className="font-serif text-sm text-foreground flex items-center gap-2"><Reply className="h-4 w-4 text-primary" /> Svar</h3>{postComments.length === 0 ? <p className="text-sm text-muted-foreground">Inga svar ännu. Var först att hjälpa till.</p> : postComments.map((comment) => <div key={comment.id} className="rounded-xl bg-muted/30 border p-3"><p className="text-sm whitespace-pre-wrap">{comment.content}</p>{comment.image_url && <img src={comment.image_url} alt="Svarbild" className="mt-2 rounded-xl max-h-56 w-full object-cover" />}<p className="text-[11px] text-muted-foreground mt-2">{comment.created_at ? new Date(comment.created_at).toLocaleString('sv-SE') : 'nyligen'}</p></div>)}<div className="rounded-xl border bg-background p-3 space-y-2"><Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} className="rounded-xl min-h-[80px]" placeholder="Skriv ett svar..." />{replyImageUrl && <img src={replyImageUrl} alt="Svarbild" className="h-36 w-full rounded-xl object-cover" />}<div className="flex flex-col sm:flex-row gap-2 justify-between"><FileButton small uploading={replyUploading} onFile={async (file) => { setReplyUploading(true); try { setReplyImageUrl(await uploadCommunityImage(file)); toast({ title: 'Bilden är uppladdad' }); } catch (e: any) { toast({ title: 'Kunde inte ladda upp bild', description: e.message, variant: 'destructive' }); } finally { setReplyUploading(false); } }} /><Button size="sm" className="rounded-xl gap-1.5" disabled={createComment.isPending} onClick={() => createComment.mutate(post.id)}>{createComment.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Svara</Button></div></div></div>}
                  </div>
                </article>
              );
            })
          )}
        </div>

        <aside className="space-y-3">
          <Card className="border-primary/20 bg-primary/5 shadow-sm"><CardContent className="p-4 space-y-2"><h2 className="font-serif text-base text-foreground">Community-regler</h2><p className="text-sm text-muted-foreground leading-relaxed">Var vänlig, hjälp varandra och tänk på att råd om sjukdomar aldrig ersätter veterinär.</p></CardContent></Card>
          <Card className="shadow-sm"><CardContent className="p-4 space-y-2"><h2 className="font-serif text-base text-foreground">Tips</h2><p className="text-sm text-muted-foreground leading-relaxed">Lägg gärna till bild när du frågar om hönshus, ägg, foder, skador eller saker du säljer.</p></CardContent></Card>
        </aside>
      </div>
    </div>
  );
}

function FileButton({ uploading, onFile, small = false }: { uploading: boolean; onFile: (file: File) => void; small?: boolean }) {
  return (
    <label className="cursor-pointer">
      <input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) onFile(file); e.currentTarget.value = ''; }} />
      <span className={`inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-medium hover:bg-muted/50 transition-colors ${small ? 'h-9 px-3' : 'h-10 w-full px-3'}`}>
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : small ? <Camera className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
        {uploading ? 'Laddar upp...' : small ? 'Lägg till bild' : 'Välj bild'}
      </span>
    </label>
  );
}
