import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const BASE_URL = 'https://honsgarden.se';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://sikbymtrbhrofysgkqsj.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzaWtiYm10cmJocm9meXNna3FzaiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcyNjY0NDIwLCJleHAiOjIwODgyNDA0MjB9.SlgJoYwkD5GWeZ2mK-GihDvEWpt8noKWE8xulzSOqaU';

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const slugifyHeading = (text = '') => text
  .toLowerCase()
  .replace(/å/g, 'a').replace(/ä/g, 'a').replace(/ö/g, 'o')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

function stripTags(value = '') {
  return String(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function sanitizeHtml(html = '') {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');
}

function isHtmlContent(content = '') {
  const trimmed = content.trim();
  return trimmed.startsWith('<') || trimmed.startsWith('<!');
}

function renderMarkdown(markdown = '') {
  const lines = escapeHtml(markdown).split(/\n{2,}/).map((block) => {
    if (/^###\s+/.test(block)) {
      const text = block.replace(/^###\s+/, '').trim();
      return `<h3 id="${slugifyHeading(text)}" class="text-lg font-serif text-foreground mt-6 mb-2 scroll-mt-24">${text}</h3>`;
    }
    if (/^##\s+/.test(block)) {
      const text = block.replace(/^##\s+/, '').trim();
      return `<h2 id="${slugifyHeading(text)}" class="text-xl font-serif text-foreground mt-8 mb-3 scroll-mt-24">${text}</h2>`;
    }
    if (/^#\s+/.test(block)) {
      const text = block.replace(/^#\s+/, '').trim();
      return `<h1 id="${slugifyHeading(text)}" class="text-2xl font-serif text-foreground mt-8 mb-3 scroll-mt-24">${text}</h1>`;
    }
    if (/^[-*]\s+/m.test(block)) {
      const items = block.split('\n').filter(Boolean).map((line) => `<li>${line.replace(/^[-*]\s+/, '')}</li>`).join('');
      return `<ul class="my-4 ml-5 list-disc text-foreground/85 leading-relaxed">${items}</ul>`;
    }
    return `<p class="text-foreground/85 leading-relaxed mb-4">${block.replace(/\n/g, '<br />')}</p>`;
  }).join('\n');

  return lines
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\[(.+?)\]\((https?:\/\/[^)]+|\/[^)]+)\)/g, '<a href="$2" class="text-primary underline underline-offset-2">$1</a>')
    .replace(/!\[(.+?)\]\((https?:\/\/[^)]+|\/[^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-xl my-4 w-full max-w-lg" loading="lazy" />');
}

function renderArticle(post) {
  const image = post.feature_image_url || post.cover_image_url || '/blog-images/hens-garden.jpg';
  const imageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;
  const date = post.published_at ? new Date(post.published_at).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const content = sanitizeHtml(isHtmlContent(post.content) ? post.content : renderMarkdown(post.content));

  return `<div class="min-h-screen bg-background">
    <header class="border-b border-border/50 bg-card/50">
      <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/blogg" class="text-sm text-muted-foreground hover:text-foreground">← Blogg</a>
        <a href="/login" class="inline-flex items-center justify-center rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">Kom igång</a>
      </div>
    </header>
    <main class="max-w-4xl mx-auto px-4 py-8" id="main-content">
      <article>
        <nav class="text-xs text-muted-foreground mb-5"><a href="/">Hem</a> / <a href="/blogg">Blogg</a> / ${escapeHtml(post.title)}</nav>
        <div class="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          ${post.category ? `<span class="rounded-full border border-border px-2 py-1">${escapeHtml(post.category)}</span>` : ''}
          ${date ? `<time datetime="${escapeHtml(post.published_at)}">${date}</time>` : ''}
          <span>${post.reading_time_minutes || Math.max(1, Math.ceil(stripTags(post.content).split(/\s+/).length / 220))} min läsning</span>
        </div>
        <h1 class="font-serif text-3xl sm:text-5xl text-foreground leading-tight mb-4">${escapeHtml(post.title)}</h1>
        ${post.excerpt ? `<p class="text-lg text-muted-foreground leading-relaxed mb-6">${escapeHtml(post.excerpt)}</p>` : ''}
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(post.title)}" class="w-full aspect-[16/9] object-cover rounded-2xl mb-8" loading="eager" />
        <div class="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-foreground/85 prose-a:text-primary prose-strong:text-foreground">${content}</div>
      </article>
    </main>
  </div>`;
}

function buildHead(post) {
  const title = `${post.title} | Hönsgården`;
  const description = post.meta_description || post.excerpt || stripTags(post.content).slice(0, 155);
  const path = `/blogg/${post.slug}`;
  const url = `${BASE_URL}${path}`;
  const image = post.feature_image_url || post.cover_image_url || '/blog-images/hens-garden.jpg';
  const imageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: post.title,
        description,
        image: imageUrl,
        datePublished: post.published_at,
        dateModified: post.updated_at || post.published_at,
        author: { '@type': 'Organization', name: 'Hönsgården', url: BASE_URL },
        publisher: { '@type': 'Organization', name: 'Hönsgården', url: BASE_URL },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        inLanguage: 'sv-SE',
        wordCount: post.word_count || stripTags(post.content).split(/\s+/).length,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Hem', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Blogg', item: `${BASE_URL}/blogg` },
          { '@type': 'ListItem', position: 3, name: post.title, item: url },
        ],
      },
    ],
  };

  return `\n<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<link rel="canonical" href="${escapeHtml(url)}">
<link rel="alternate" hreflang="sv" href="${escapeHtml(url)}">
<link rel="alternate" hreflang="x-default" href="${escapeHtml(url)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${escapeHtml(url)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(imageUrl)}">
<meta property="og:image:alt" content="${escapeHtml(post.title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(imageUrl)}">
<meta name="citation_title" content="${escapeHtml(post.title)}">
<meta name="citation_author" content="Hönsgården">
<meta name="citation_language" content="sv">
<script type="application/ld+json" id="json-ld-prerendered">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`;
}

async function fetchPosts() {
  const params = new URLSearchParams({
    select: 'slug,title,excerpt,content,cover_image_url,feature_image_url,category,tags,meta_description,meta_keywords,reading_time_minutes,word_count,published_at,updated_at',
    is_published: 'eq.true',
    order: 'published_at.desc',
    limit: '1000',
  });
  const response = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?${params}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!response.ok) throw new Error(`Kunde inte hämta bloggartiklar (${response.status})`);
  return response.json();
}

async function writeStaticPage(template, route, post) {
  const html = template
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[\s\S]*?>/i, '')
    .replace(/<link rel="canonical"[\s\S]*?>/i, '')
    .replace('</head>', `${buildHead(post)}\n</head>`)
    .replace('<div id="root"></div>', `<div id="root">${renderArticle(post)}</div>`);
  const target = join('dist', route, 'index.html');
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html, 'utf8');
}

async function main() {
  const template = await readFile('dist/index.html', 'utf8');
  const posts = await fetchPosts();
  await Promise.all(posts.flatMap((post) => [
    writeStaticPage(template, `blogg/${post.slug}`, post),
    writeStaticPage(template, `guider/${post.slug}`, post),
  ]));
  console.log(`✅ Prerendered ${posts.length} bloggartiklar till statisk HTML.`);
}

main().catch((error) => {
  console.error('Prerendering misslyckades:', error.message);
  process.exit(1);
});