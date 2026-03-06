import { useEffect } from 'react';

const BASE = 'https://honsgarden.se';

interface SeoOptions {
  title: string;
  description: string;
  path: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

/**
 * Sets document title, meta description, canonical URL, OG tags and optional JSON-LD.
 * Cleans up on unmount.
 */
export function useSeo({ title, description, path, ogType = 'website', ogImage, noindex, jsonLd }: SeoOptions) {
  useEffect(() => {
    // Title
    document.title = title;

    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${BASE}${path}`;

    // OG tags
    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    setMeta('og:title', title);
    setMeta('og:description', description);
    setMeta('og:url', `${BASE}${path}`);
    setMeta('og:type', ogType);
    if (ogImage) setMeta('og:image', ogImage.startsWith('http') ? ogImage : `${BASE}${ogImage}`);

    // Noindex
    if (noindex) {
      let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
      if (!robots) {
        robots = document.createElement('meta');
        robots.name = 'robots';
        document.head.appendChild(robots);
      }
      robots.content = 'noindex, nofollow';
    }

    // JSON-LD
    if (jsonLd) {
      let script = document.getElementById('json-ld-page') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = 'json-ld-page';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      const data = Array.isArray(jsonLd)
        ? { '@context': 'https://schema.org', '@graph': jsonLd }
        : { '@context': 'https://schema.org', ...jsonLd };
      script.textContent = JSON.stringify(data);
    }

    return () => {
      document.title = 'Hönsgården – Din digitala äggloggare';
      document.querySelector('link[rel="canonical"]')?.remove();
      document.getElementById('json-ld-page')?.remove();
      if (noindex) document.querySelector('meta[name="robots"]')?.remove();
    };
  }, [title, description, path, ogType, ogImage, noindex, jsonLd]);
}
