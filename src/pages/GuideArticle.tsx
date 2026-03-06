import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Egg, Loader2, BookOpen, CalendarDays } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  guide: 'Guide',
  recension: 'Recension',
  tips: 'Tips & tricks',
  halsa: 'Hälsa',
  nyborjare: 'Nybörjare',
};

/** Simple markdown to HTML - handles common patterns */
function renderMarkdown(md: string): string {
  let html = md
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-serif text-foreground mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-serif text-foreground mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-serif text-foreground mt-8 mb-3">$1</h1>')
    // Bold & italic
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links - affiliate links get special styling
    .replace(/\[(.+?)\]\((.+?)\)/g, (_, text, url) => {
      const isAffiliate = url.includes('adtraction') || url.includes('awin') || url.includes('tradedoubler') || url.includes('partner') || text.includes('→') || text.toLowerCase().includes('köp');
      if (isAffiliate) {
        return `<a href="${url}" target="_blank" rel="noopener sponsored" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity no-underline">${text}</a>`;
      }
      return `<a href="${url}" target="_blank" rel="noopener" class="text-primary underline underline-offset-2 hover:opacity-80">${text}</a>`;
    })
    // Unordered lists
    .replace(/^[-*] (.+)$/gm, '<li class="ml-4 list-disc text-foreground/90">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-foreground/90">$1</li>')
    // Images
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="rounded-xl my-4 w-full max-w-lg" loading="lazy" />')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary/30 pl-4 py-1 my-4 text-muted-foreground italic">$1</blockquote>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="my-6 border-border/50" />')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p class="text-foreground/85 leading-relaxed mb-4">')
    // Single newlines within paragraphs
    .replace(/\n/g, '<br />');

  return `<p class="text-foreground/85 leading-relaxed mb-4">${html}</p>`;
}

export default function GuideArticle() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // SEO - set document title, meta, and JSON-LD
  React.useEffect(() => {
    if (post) {
      document.title = post.meta_title || post.title + ' | Hönsgården';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', post.meta_description || post.excerpt || '');

      // Canonical URL
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = `https://honsgarden.lovable.app/blogg/${post.slug}`;

      // JSON-LD Article structured data
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.meta_description || post.excerpt || '',
        image: post.cover_image_url || 'https://honsgarden.lovable.app/favicon.ico',
        datePublished: post.published_at,
        dateModified: post.updated_at || post.published_at,
        author: { '@type': 'Organization', name: 'Hönsgården' },
        publisher: {
          '@type': 'Organization',
          name: 'Hönsgården',
          url: 'https://honsgarden.lovable.app',
        },
        mainEntityOfPage: `https://honsgarden.lovable.app/blogg/${post.slug}`,
      };
      let script = document.getElementById('json-ld-article') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = 'json-ld-article';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }
    return () => {
      document.title = 'Hönsgården';
      document.getElementById('json-ld-article')?.remove();
      document.querySelector('link[rel="canonical"]')?.remove();
    };
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <BookOpen className="h-10 w-10 text-muted-foreground/30" />
        <h1 className="font-serif text-xl text-foreground">Artikeln hittades inte</h1>
        <Link to="/guider"><Button variant="outline" className="rounded-xl"><ArrowLeft className="h-4 w-4 mr-1" /> Tillbaka till guider</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/guider" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Guider
          </Link>
          <Link to="/login">
            <Button size="sm" className="rounded-xl text-xs gap-1">
              <Egg className="h-3 w-3" /> Kom igång
            </Button>
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {post.category && (
            <Badge variant="secondary" className="text-[10px]">
              {categoryLabels[post.category] || post.category}
            </Badge>
          )}
          {post.published_at && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {new Date(post.published_at).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-foreground leading-tight mb-4">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">{post.excerpt}</p>
        )}

        {/* Cover */}
        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full rounded-2xl aspect-video object-cover mb-8"
          />
        )}

        {/* Content */}
        <div
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-8 pt-6 border-t border-border/50">
            {post.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-[10px]">#{tag}</Badge>
            ))}
          </div>
        )}

        {/* Inline CTA */}
        <div className="mt-12 bg-gradient-to-br from-primary/5 via-card to-accent/5 rounded-2xl p-6 sm:p-8 border border-border/30 text-center">
          <span className="text-2xl mb-2 block">🐔</span>
          <h3 className="font-serif text-lg text-foreground mb-2">
            Vill du hålla koll på dina höns?
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
            Logga ägg, foder och hälsa med Hönsgården – helt kostnadsfritt.
          </p>
          <Link to="/login">
            <Button className="rounded-xl gap-2">
              <Egg className="h-4 w-4" /> Skapa ett konto
            </Button>
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Hönsgården</span>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-foreground transition-colors">Startsidan</Link>
            <Link to="/guider" className="hover:text-foreground transition-colors">Guider</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Villkor</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
