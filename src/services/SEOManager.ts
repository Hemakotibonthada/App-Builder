/**
 * SEO Manager
 * 
 * Complete SEO management for generated applications.
 * Features:
 * - Per-page meta tags
 * - Open Graph / Twitter Cards
 * - Structured data (JSON-LD)
 * - Sitemap generation
 * - Robots.txt generation
 * - SEO score/audit
 * - Canonical URLs
 * - Favicon management
 */

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export interface PageSEO {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  robots: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  structuredData: StructuredDataItem[];
  customHead: string;
}

export interface StructuredDataItem {
  type: string;
  data: Record<string, unknown>;
}

export interface SEOAuditResult {
  score: number;
  issues: SEOIssue[];
  passed: string[];
}

export interface SEOIssue {
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  fix: string;
}

/* ──────────────────────────────────────────────
 * Default SEO Config
 * ────────────────────────────────────────────── */

export const DEFAULT_PAGE_SEO: PageSEO = {
  title: '',
  description: '',
  keywords: [],
  canonicalUrl: '',
  robots: 'index, follow',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: '',
  twitterDescription: '',
  twitterImage: '',
  structuredData: [],
  customHead: '',
};

/* ──────────────────────────────────────────────
 * SEO Audit Engine
 * ────────────────────────────────────────────── */

export function auditPageSEO(seo: PageSEO, pageContent: string): SEOAuditResult {
  const issues: SEOIssue[] = [];
  const passed: string[] = [];

  // Title checks
  if (!seo.title) {
    issues.push({ severity: 'error', category: 'Title', message: 'Missing page title', fix: 'Add a descriptive title tag' });
  } else {
    if (seo.title.length < 30) issues.push({ severity: 'warning', category: 'Title', message: 'Title is too short (< 30 chars)', fix: 'Make title more descriptive' });
    else if (seo.title.length > 60) issues.push({ severity: 'warning', category: 'Title', message: 'Title is too long (> 60 chars)', fix: 'Shorten title to under 60 characters' });
    else passed.push('Title length is optimal (30-60 chars)');
  }

  // Description checks
  if (!seo.description) {
    issues.push({ severity: 'error', category: 'Description', message: 'Missing meta description', fix: 'Add a 150-160 character description' });
  } else {
    if (seo.description.length < 120) issues.push({ severity: 'warning', category: 'Description', message: 'Description is short (< 120 chars)', fix: 'Expand description for better SEO' });
    else if (seo.description.length > 160) issues.push({ severity: 'warning', category: 'Description', message: 'Description is long (> 160 chars)', fix: 'Trim to 160 characters' });
    else passed.push('Meta description length is optimal');
  }

  // Open Graph
  if (seo.ogTitle || seo.ogDescription) passed.push('Open Graph tags configured');
  else issues.push({ severity: 'warning', category: 'Social', message: 'Missing Open Graph tags', fix: 'Add OG title, description, and image' });

  if (seo.ogImage) passed.push('OG image set');
  else issues.push({ severity: 'info', category: 'Social', message: 'No Open Graph image', fix: 'Add a 1200×630px image for social sharing' });

  // Twitter Card
  if (seo.twitterCard) passed.push('Twitter Card configured');

  // Canonical URL
  if (seo.canonicalUrl) passed.push('Canonical URL set');
  else issues.push({ severity: 'info', category: 'Technical', message: 'No canonical URL', fix: 'Set canonical URL to prevent duplicate content' });

  // Keywords
  if (seo.keywords.length > 0) passed.push(`${seo.keywords.length} keywords set`);
  else issues.push({ severity: 'info', category: 'Keywords', message: 'No keywords set', fix: 'Add relevant keywords for the page' });

  // Content checks
  if (pageContent) {
    const wordCount = pageContent.split(/\s+/).length;
    if (wordCount < 100) issues.push({ severity: 'warning', category: 'Content', message: 'Very little text content', fix: 'Add more descriptive content (300+ words recommended)' });
    else if (wordCount >= 300) passed.push(`Content length good (${wordCount} words)`);
  }

  // Structured data
  if (seo.structuredData.length > 0) passed.push('Structured data (JSON-LD) configured');
  else issues.push({ severity: 'info', category: 'Technical', message: 'No structured data', fix: 'Add JSON-LD for rich search results' });

  // Calculate score
  const totalChecks = issues.length + passed.length;
  const score = totalChecks > 0 ? Math.round((passed.length / totalChecks) * 100) : 0;

  return { score, issues, passed };
}

/* ──────────────────────────────────────────────
 * Generators
 * ────────────────────────────────────────────── */

export function generateMetaTags(seo: PageSEO): string {
  const tags: string[] = [];

  if (seo.title) tags.push(`<title>${seo.title}</title>`);
  if (seo.description) tags.push(`<meta name="description" content="${seo.description}" />`);
  if (seo.keywords.length > 0) tags.push(`<meta name="keywords" content="${seo.keywords.join(', ')}" />`);
  if (seo.robots) tags.push(`<meta name="robots" content="${seo.robots}" />`);
  if (seo.canonicalUrl) tags.push(`<link rel="canonical" href="${seo.canonicalUrl}" />`);

  // Open Graph
  if (seo.ogTitle || seo.title) tags.push(`<meta property="og:title" content="${seo.ogTitle || seo.title}" />`);
  if (seo.ogDescription || seo.description) tags.push(`<meta property="og:description" content="${seo.ogDescription || seo.description}" />`);
  if (seo.ogImage) tags.push(`<meta property="og:image" content="${seo.ogImage}" />`);
  tags.push(`<meta property="og:type" content="${seo.ogType}" />`);

  // Twitter
  tags.push(`<meta name="twitter:card" content="${seo.twitterCard}" />`);
  if (seo.twitterTitle || seo.title) tags.push(`<meta name="twitter:title" content="${seo.twitterTitle || seo.title}" />`);
  if (seo.twitterDescription || seo.description) tags.push(`<meta name="twitter:description" content="${seo.twitterDescription || seo.description}" />`);
  if (seo.twitterImage || seo.ogImage) tags.push(`<meta name="twitter:image" content="${seo.twitterImage || seo.ogImage}" />`);

  return tags.join('\n');
}

export function generateSitemap(pages: { path: string; updatedAt: number; priority?: number }[], baseUrl: string): string {
  const entries = pages.map(p => {
    const lastmod = new Date(p.updatedAt).toISOString().split('T')[0];
    const priority = p.priority ?? (p.path === '/' ? 1.0 : 0.8);
    return `  <url>\n    <loc>${baseUrl}${p.path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n    <changefreq>weekly</changefreq>\n  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>`;
}

export function generateRobotsTxt(baseUrl: string, disallowPaths: string[] = []): string {
  const lines = ['User-agent: *'];
  for (const path of disallowPaths) lines.push(`Disallow: ${path}`);
  lines.push(`\nSitemap: ${baseUrl}/sitemap.xml`);
  return lines.join('\n');
}

export function generateStructuredData(items: StructuredDataItem[]): string {
  return items.map(item => {
    const data = { '@context': 'https://schema.org', '@type': item.type, ...item.data };
    return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
  }).join('\n');
}

/* ──────────────────────────────────────────────
 * Structured Data Templates
 * ────────────────────────────────────────────── */

export const STRUCTURED_DATA_TEMPLATES: Record<string, Record<string, unknown>> = {
  'Organization': { '@type': 'Organization', name: '', url: '', logo: '', description: '', sameAs: [] },
  'Website': { '@type': 'WebSite', name: '', url: '', potentialAction: { '@type': 'SearchAction', target: '{search_term_string}', 'query-input': 'required name=search_term_string' } },
  'Product': { '@type': 'Product', name: '', description: '', image: '', offers: { '@type': 'Offer', price: '', priceCurrency: 'USD' } },
  'Article': { '@type': 'Article', headline: '', author: { '@type': 'Person', name: '' }, datePublished: '', image: '' },
  'FAQ': { '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: '', acceptedAnswer: { '@type': 'Answer', text: '' } }] },
  'BreadcrumbList': { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: '', item: '' }] },
  'LocalBusiness': { '@type': 'LocalBusiness', name: '', address: { '@type': 'PostalAddress', streetAddress: '', addressLocality: '', addressRegion: '', postalCode: '' }, telephone: '' },
  'SoftwareApplication': { '@type': 'SoftwareApplication', name: '', operatingSystem: 'Web', applicationCategory: 'DesignApplication', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
};
