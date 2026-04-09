const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ success: false, error: 'URL is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: 'Firecrawl not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // SSRF protection: block internal/private IPs and non-HTTP schemes
    try {
      const parsed = new URL(formattedUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return new Response(JSON.stringify({ success: false, error: 'Only HTTP(S) URLs allowed' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const hostname = parsed.hostname.toLowerCase();
      const blockedPatterns = [
        /^localhost$/i, /^127\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./,
        /^0\./, /^\[::1?\]$/, /^169\.254\./, /\.internal$/, /\.local$/,
        /metadata\.google/, /\.amazonaws\.com$/,
      ];
      if (blockedPatterns.some(p => p.test(hostname))) {
        return new Response(JSON.stringify({ success: false, error: 'URL not allowed' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'Invalid URL' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Scraping product URL:', formattedUrl);

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl error:', data);
      return new Response(JSON.stringify({ success: false, error: data.error || 'Scrape failed' }), {
        status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract metadata from Firecrawl response
    const metadata = data?.data?.metadata || data?.metadata || {};
    const result = {
      success: true,
      title: metadata.title || metadata.og_title || metadata['og:title'] || '',
      description: metadata.description || metadata.og_description || metadata['og:description'] || '',
      image: metadata.og_image || metadata['og:image'] || metadata.image || '',
      price: '', // Will try to extract from markdown
      url: formattedUrl,
    };

    // Try to extract price from markdown content
    const markdown = data?.data?.markdown || data?.markdown || '';
    const priceMatch = markdown.match(/(\d[\d\s]*[,:]\d{2}\s*(?:kr|SEK|:-)|(?:kr|SEK)\s*\d[\d\s]*[,:]\d{2}|\d+\s*kr)/i);
    if (priceMatch) {
      result.price = priceMatch[0].trim();
    }

    console.log('Product scraped:', result.title);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
