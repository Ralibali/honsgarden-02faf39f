import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const BASE_URL = 'https://honsgarden.se';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://sikbymtrbhrofysgkqsj.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpa2J5bXRyYmhyb2Z5c2drcXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjQ0MjAsImV4cCI6MjA4ODI0MDQyMH0.SlgJoYwkD5GWeZ2mK-GihDvEWpt8noKWE8xulzSOqaU';

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const escapeXml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

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

// ============================================================
// Generic prerender helpers
// ============================================================

const DEFAULT_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
const NOINDEX_ROBOTS = 'noindex, nofollow';

function buildHeadGeneric({ title, description, path, ogImage, ogImageAlt, noindex, ogType = 'website', jsonLd }) {
  const url = `${BASE_URL}${path}`;
  const image = ogImage || '/og-image.jpg';
  const imageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;
  const robots = noindex ? NOINDEX_ROBOTS : DEFAULT_ROBOTS;

  const jsonLdTag = jsonLd
    ? `\n<script type="application/ld+json" id="json-ld-prerendered">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`
    : '';

  return `\n<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${escapeHtml(url)}">
<link rel="alternate" hreflang="sv" href="${escapeHtml(url)}">
<link rel="alternate" hreflang="x-default" href="${escapeHtml(url)}">
<meta property="og:type" content="${escapeHtml(ogType)}">
<meta property="og:url" content="${escapeHtml(url)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(imageUrl)}">
<meta property="og:image:alt" content="${escapeHtml(ogImageAlt || title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(imageUrl)}">${jsonLdTag}`;
}

function injectHead(template, headHtml) {
  return template
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[\s\S]*?>/i, '')
    .replace(/<meta name="robots"[\s\S]*?>/i, '')
    .replace(/<link rel="canonical"[\s\S]*?>/i, '')
    .replace(/<link rel="alternate" hreflang="sv"[\s\S]*?>/i, '')
    .replace(/<link rel="alternate" hreflang="x-default"[\s\S]*?>/i, '')
    .replace(/<meta property="og:title"[\s\S]*?>/i, '')
    .replace(/<meta property="og:description"[\s\S]*?>/i, '')
    .replace(/<meta property="og:url"[\s\S]*?>/i, '')
    .replace(/<meta property="og:image"[\s\S]*?>/i, '')
    .replace(/<meta property="og:image:alt"[\s\S]*?>/i, '')
    .replace(/<meta name="twitter:title"[\s\S]*?>/i, '')
    .replace(/<meta name="twitter:description"[\s\S]*?>/i, '')
    .replace(/<meta name="twitter:image"[\s\S]*?>/i, '')
    .replace('</head>', `${headHtml}\n</head>`);
}

async function writeRoute(route, html) {
  const target = route === '' ? join('dist', 'index.html') : join('dist', route, 'index.html');
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html, 'utf8');
}

// ============================================================
// Article rendering (kept from previous implementation)
// ============================================================

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

function buildArticleHead(post) {
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
  return buildHeadGeneric({
    title,
    description,
    path,
    ogImage: image,
    ogImageAlt: post.title,
    ogType: 'article',
    jsonLd,
  });
}

// ============================================================
// Data fetching
// ============================================================

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

// ============================================================
// Static page configs
// ============================================================

const STATIC_PAGES = [
  {
    path: '/',
    route: '',
    title: 'Hönsgården – Äggloggare & App för Hobbyuppfödare av Höns',
    description: 'Logga ägg, spåra hälsa och räkna ut din foderkostnad. Gratis app för Sveriges 21 000+ hobbyhönsägare. Fungerar offline. Kom igång på 2 minuter.',
    ogImage: '/og-image.jpg',
  },
  {
    path: '/om-oss',
    route: 'om-oss',
    title: 'Om Hönsgården – Vår vision för svenska hönsägare',
    description: 'Lär känna Hönsgården – byggt av och för svenska hobbyhönsägare. Vår vision, historia och varför vi finns.',
    ogImage: '/og-image.jpg',
  },
  {
    path: '/blogg',
    route: 'blogg',
    title: 'Blogg om höns – Guider, tips & hälsa | Hönsgården',
    description: 'Läs Sveriges bästa blogg om höns. Guider för nybörjare, hälsotips, hönsraser och allt om hobbyhönsägande.',
    ogImage: '/og-image.jpg',
  },
  {
    path: '/verktyg/aggkalkylator',
    route: 'verktyg/aggkalkylator',
    title: 'Äggkalkylator – Räkna äggproduktion & foderkostnad | Hönsgården',
    description: 'Räkna ut din äggproduktion, foderkostnad per ägg och vinst per höna. Gratis kalkylator för svenska hönsägare.',
    ogImage: '/og-image.jpg',
  },
];

const CATEGORY_META = {
  guide: { label: 'Guider', title: 'Guider om höns – Allt du behöver veta som hönsägare | Hönsgården', description: 'Kompletta guider om höns – från att bygga hönshus till att välja rätt ras. Steg-för-steg-instruktioner för nybörjare och erfarna hönsägare.', ogImage: '/blog-images/chicken-coop.jpg' },
  recension: { label: 'Recensioner', title: 'Produktrecensioner för hönsägare – Testat & granskat | Hönsgården', description: 'Ärliga recensioner av produkter för hönsägare. Vi testar hönshus, foder, värmelampor, äggkläckare och mer.', ogImage: '/blog-images/feed-varieties.jpg' },
  tips: { label: 'Tips & tricks', title: 'Tips & tricks för hönsägare – Smarta knep för hönsgården | Hönsgården', description: 'Praktiska tips och smarta knep för att sköta dina höns bättre. Spara tid, pengar och håll flocken frisk.', ogImage: '/blog-images/hens-feeding.jpg' },
  halsa: { label: 'Hälsa', title: 'Hönshälsa – Sjukdomar, behandling & förebyggande | Hönsgården', description: 'Allt om hönshälsa: vanliga sjukdomar, symptom, behandling och förebyggande åtgärder. Håll din flock frisk och glad.', ogImage: '/blog-images/hen-health-check.jpg' },
  nyborjare: { label: 'Nybörjare', title: 'Börja med höns – Komplett nybörjarguide | Hönsgården', description: 'Ska du skaffa höns? Här hittar du allt en nybörjare behöver veta – från val av ras till bygge av hönshus och daglig skötsel.', ogImage: '/blog-images/baby-chicks.jpg' },
  raser: { label: 'Raser', title: 'Hönsraser i Sverige – Jämförelser & guider | Hönsgården', description: 'Jämför hönsraser för svenskt klimat: värpning, temperament, vinterhärdighet och pris för hobbyhönsägare.', ogImage: '/blog-images/chicken-breeds.jpg' },
  tradgard: { label: 'Trädgård & odling', title: 'Trädgård & odling – Tips för självhushåll | Hönsgården', description: 'Odla grönsaker, kompostera med höns och skapa en produktiv trädgård.', ogImage: '/blog-images/spring-garden.jpg' },
  hem: { label: 'Hem & hållbarhet', title: 'Hem & hållbarhet – Hållbart boende med höns | Hönsgården', description: 'Tips för ett hållbart hem med höns. Kompostering, självhushåll och smarta lösningar för den miljömedvetna hönsägaren.', ogImage: '/blog-images/farm-kitchen.jpg' },
  friluftsliv: { label: 'Friluftsliv & natur', title: 'Friluftsliv & natur – Utomhuslivet med höns | Hönsgården', description: 'Friluftsliv, naturupplevelser och livet utomhus.', ogImage: '/blog-images/sunset-farm.jpg' },
};

// ============================================================
// Page builders
// ============================================================

function buildStaticPage(template, page) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': page.path === '/' ? 'WebSite' : 'WebPage',
    name: page.title,
    description: page.description,
    url: `${BASE_URL}${page.path}`,
    inLanguage: 'sv-SE',
  };
  const head = buildHeadGeneric({ ...page, jsonLd });
  return injectHead(template, head);
}

function buildCategoryPage(template, slug, meta) {
  const path = `/blogg/kategori/${slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${BASE_URL}${path}`,
        name: meta.label,
        description: meta.description,
        url: `${BASE_URL}${path}`,
        inLanguage: 'sv-SE',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Hem', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Blogg', item: `${BASE_URL}/blogg` },
          { '@type': 'ListItem', position: 3, name: meta.label, item: `${BASE_URL}${path}` },
        ],
      },
    ],
  };
  const head = buildHeadGeneric({
    title: meta.title,
    description: meta.description,
    path,
    ogImage: meta.ogImage,
    ogImageAlt: meta.label,
    jsonLd,
  });
  return injectHead(template, head);
}

function buildTagPage(template, tag) {
  const path = `/blogg/tagg/${encodeURIComponent(tag)}`;
  const display = tag.charAt(0).toUpperCase() + tag.slice(1);
  const head = buildHeadGeneric({
    title: `${display} – Artiklar om ${tag} | Hönsgården`,
    description: `Läs alla artiklar om ${tag}. Tips, guider och information från Hönsgården.`,
    path,
    ogImage: '/og-image.jpg',
    ogImageAlt: display,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: display,
      url: `${BASE_URL}${path}`,
      inLanguage: 'sv-SE',
    },
  });
  return injectHead(template, head);
}

function buildTermsPage(template) {
  const head = buildHeadGeneric({
    title: 'Användarvillkor & Integritetspolicy | Hönsgården',
    description: 'Hönsgårdens användarvillkor och integritetspolicy.',
    path: '/terms',
    noindex: true,
  });
  return injectHead(template, head);
}

function buildArticlePage(template, post) {
  const html = injectHead(template, buildArticleHead(post))
    .replace('<div id="root"></div>', `<div id="root">${renderArticle(post)}</div>`);
  return html;
}

/**
 * Statisk redirect-sida för konsoliderade URL:er (t.ex. /guider/* → /blogg/*).
 * Sätter canonical till destinationen, noindex, meta refresh + JS-fallback.
 * Sökmotorer behandlar detta som en stark konsolideringssignal när 301 saknas.
 */
function buildRedirectPage(template, targetPath) {
  const targetUrl = `${BASE_URL}${targetPath}`;
  const head = `\n<title>Omdirigerar till ${escapeHtml(targetUrl)}</title>
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${escapeHtml(targetUrl)}">
<meta http-equiv="refresh" content="0; url=${escapeHtml(targetUrl)}">
<meta property="og:url" content="${escapeHtml(targetUrl)}">
<script>window.location.replace(${JSON.stringify(targetPath)});</script>`;
  const bodyHtml = `<div id="root"><p>Den här sidan har flyttats. Omdirigerar till <a href="${escapeHtml(targetUrl)}">${escapeHtml(targetUrl)}</a>…</p></div>`;
  return injectHead(template, head)
    .replace('<div id="root"></div>', bodyHtml);
}

// ============================================================
// Sitemap (statisk fallback genererad vid build)
// ============================================================

function buildSitemap(posts, tags) {
  const now = new Date().toISOString().split('T')[0];
  const urls = [];
  const push = (loc, opts = {}) => {
    urls.push({ loc, lastmod: opts.lastmod || now, changefreq: opts.changefreq || 'monthly', priority: opts.priority || '0.7' });
  };

  push(`${BASE_URL}/`, { changefreq: 'weekly', priority: '1.0' });
  push(`${BASE_URL}/om-oss`, { changefreq: 'monthly', priority: '0.7' });
  push(`${BASE_URL}/blogg`, { changefreq: 'daily', priority: '0.9' });
  push(`${BASE_URL}/verktyg/aggkalkylator`, { changefreq: 'monthly', priority: '0.8' });

  for (const slug of Object.keys(CATEGORY_META)) {
    push(`${BASE_URL}/blogg/kategori/${slug}`, { changefreq: 'weekly', priority: '0.7' });
  }
  for (const tag of tags) {
    push(`${BASE_URL}/blogg/tagg/${encodeURIComponent(tag)}`, { changefreq: 'weekly', priority: '0.6' });
  }
  for (const post of posts) {
    const lastmod = (post.updated_at || post.published_at || now).split('T')[0];
    push(`${BASE_URL}/blogg/${post.slug}`, { lastmod, changefreq: 'weekly', priority: '0.8' });
  }

  const body = urls.map(u => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

// ============================================================
// Main
// ============================================================

async function main() {
  const template = await readFile('dist/index.html', 'utf8');
  const posts = await fetchPosts();

  // 1. Statiska publika sidor (metadata-injektion)
  for (const page of STATIC_PAGES) {
    await writeRoute(page.route, buildStaticPage(template, page));
  }

  // 2. Terms (noindex)
  await writeRoute('terms', buildTermsPage(template));

  // 3. Kategorisidor
  for (const [slug, meta] of Object.entries(CATEGORY_META)) {
    await writeRoute(`blogg/kategori/${slug}`, buildCategoryPage(template, slug, meta));
  }

  // 4. Tagg-sidor (samla unika från artiklar)
  const tagSet = new Set();
  for (const post of posts) {
    if (Array.isArray(post.tags)) post.tags.forEach(t => t && tagSet.add(t));
  }
  const tags = Array.from(tagSet);
  for (const tag of tags) {
    await writeRoute(`blogg/tagg/${encodeURIComponent(tag)}`, buildTagPage(template, tag));
  }

  // 5. Artiklar – /blogg/ är canonical. /guider/ behålls bakåtkompatibelt
  //    men levereras som noindex-redirect till motsvarande /blogg/-URL.
  await Promise.all(posts.flatMap((post) => [
    writeRoute(`blogg/${post.slug}`, buildArticlePage(template, post)),
    writeRoute(`guider/${post.slug}`, buildRedirectPage(template, `/blogg/${post.slug}`)),
  ]));

  // 5b. /guider index → /blogg
  await writeRoute('guider', buildRedirectPage(template, '/blogg'));

  // 6. Skriv om public sitemap.xml till färska data (endast /blogg-URL:er)
  const sitemap = buildSitemap(posts, tags);
  await writeFile(join('dist', 'sitemap.xml'), sitemap, 'utf8');

  console.log(`✅ Prerendered ${STATIC_PAGES.length} statiska + ${Object.keys(CATEGORY_META).length} kategori- + ${tags.length} tagg- + ${posts.length} artikel-sidor (+ /guider redirects). Sitemap uppdaterad.`);
}

main().catch((error) => {
  console.error('Prerendering misslyckades:', error.message);
  process.exit(1);
});
