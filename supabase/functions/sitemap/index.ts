import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

const responseHeaders = {
  ...corsHeaders,
  "Content-Type": "application/xml; charset=utf-8",
};

const BASE_URL = "https://honsgarden.se";

const CATEGORIES = [
  "guide", "recension", "tips", "halsa",
  "nyborjare", "raser", "tradgard", "hem", "friluftsliv",
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at, published_at, cover_image_url, feature_image_url, title, category, tags")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  // Collect unique tags
  const allTags = new Set<string>();
  if (posts) {
    for (const post of posts) {
      if (post.tags) {
        for (const tag of post.tags) allTags.add(tag);
      }
    }
  }

  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "weekly" },
    { loc: "/blogg", priority: "0.9", changefreq: "daily" },
    { loc: "/guider", priority: "0.8", changefreq: "daily" },
    { loc: "/om-oss", priority: "0.7", changefreq: "monthly" },
    { loc: "/verktyg/aggkalkylator", priority: "0.8", changefreq: "monthly" },
    { loc: "/login", priority: "0.5", changefreq: "monthly" },
    { loc: "/terms", priority: "0.3", changefreq: "yearly" },
  ];

  const now = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

  // Static pages
  for (const page of staticPages) {
    xml += `  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="sv" href="${BASE_URL}${page.loc}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${page.loc}" />
  </url>
`;
  }

  // Category pages
  for (const cat of CATEGORIES) {
    xml += `  <url>
    <loc>${BASE_URL}/blogg/kategori/${cat}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="sv" href="${BASE_URL}/blogg/kategori/${cat}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/blogg/kategori/${cat}" />
  </url>
`;
  }

  // Tag pages
  for (const tag of allTags) {
    const encoded = encodeURIComponent(tag);
    xml += `  <url>
    <loc>${BASE_URL}/blogg/tagg/${encoded}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="sv" href="${BASE_URL}/blogg/tagg/${encoded}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/blogg/tagg/${encoded}" />
  </url>
`;
  }

  // Blog posts (both /blogg/ canonical and /guider/ alternate)
  if (posts) {
    for (const post of posts) {
      const lastmod = (post.updated_at || post.published_at || now).split("T")[0];
      const featureImage = post.feature_image_url || post.cover_image_url;
      const imageUrl = featureImage
        ? (featureImage.startsWith("http") ? featureImage : `${BASE_URL}${featureImage}`)
        : null;

      xml += `  <url>
    <loc>${BASE_URL}/blogg/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="sv" href="${BASE_URL}/blogg/${post.slug}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/blogg/${post.slug}" />`;

      if (imageUrl) {
        xml += `
    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
      <image:title>${escapeXml(post.title || "")}</image:title>
    </image:image>`;
      }

      xml += `
  </url>
`;
    }
  }

  xml += `</urlset>`;

  return new Response(xml, {
    headers: {
      ...responseHeaders,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
});
