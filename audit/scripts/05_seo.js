// audit/scripts/05_seo.js
// ─────────────────────────────────────────────────────────────────────────────
// MODULE 5: SEO Auditing
//
//  • Title tags (length, uniqueness)
//  • Meta descriptions (length, presence)
//  • Canonical URLs
//  • Open Graph & Twitter Card tags
//  • Heading hierarchy (single H1, no skips)
//  • robots.txt validation
//  • sitemap.xml presence
//  • Structured data (JSON-LD) detection
//  • Image alt text coverage
//  • Duplicate titles/descriptions across pages
// ─────────────────────────────────────────────────────────────────────────────

import { chromium } from 'playwright';
import { config }   from '../config/audit.config.js';
import { store }    from './utils/store.js';
import { logger }   from './utils/logger.js';

const { BASE_URL, CRAWL, BROWSER, SEO } = config;

async function getSEOData(page, url) {
  return page.evaluate(() => {
    const getMeta = (name) =>
      document.querySelector(`meta[name="${name}"]`)?.content ||
      document.querySelector(`meta[property="${name}"]`)?.content || '';

    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
      .map(h => ({ tag: h.tagName, text: h.textContent?.trim().slice(0, 80) }));

    const images = [...document.images].map(i => ({
      src:    i.src?.slice(0, 100),
      alt:    i.alt,
      hasAlt: Boolean(i.alt),
    }));

    const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map(s => { try { return JSON.parse(s.textContent); } catch { return null; } })
      .filter(Boolean);

    return {
      title:       document.title,
      description: getMeta('description'),
      canonical:   document.querySelector('link[rel="canonical"]')?.href ?? '',
      ogTitle:     getMeta('og:title'),
      ogDescription: getMeta('og:description'),
      ogImage:     getMeta('og:image'),
      ogType:      getMeta('og:type'),
      twitterCard: getMeta('twitter:card'),
      robots:      getMeta('robots'),
      viewport:    getMeta('viewport'),
      charset:     document.characterSet,
      lang:        document.documentElement.lang,
      headings,
      images,
      jsonLd:      scripts,
    };
  });
}

function auditSEOData(url, data) {
  const issues = [];

  // Title
  if (!data.title) {
    issues.push({ severity: 'critical', field: 'title', message: 'Missing <title> tag' });
  } else if (data.title.length < SEO.MIN_TITLE_LENGTH) {
    issues.push({ severity: 'warn', field: 'title', message: `Title too short (${data.title.length} chars, min ${SEO.MIN_TITLE_LENGTH})` });
  } else if (data.title.length > SEO.MAX_TITLE_LENGTH) {
    issues.push({ severity: 'warn', field: 'title', message: `Title too long (${data.title.length} chars, max ${SEO.MAX_TITLE_LENGTH})` });
  }

  // Description
  if (!data.description) {
    issues.push({ severity: 'critical', field: 'meta-description', message: 'Missing meta description' });
  } else if (data.description.length < SEO.MIN_DESCRIPTION_LENGTH) {
    issues.push({ severity: 'warn', field: 'meta-description', message: `Description too short (${data.description.length} chars)` });
  } else if (data.description.length > SEO.MAX_DESCRIPTION_LENGTH) {
    issues.push({ severity: 'warn', field: 'meta-description', message: `Description too long (${data.description.length} chars)` });
  }

  // Canonical
  if (!data.canonical && SEO.REQUIRE_CANONICAL) {
    issues.push({ severity: 'warn', field: 'canonical', message: 'Missing canonical URL' });
  }

  // OG tags
  if (SEO.REQUIRE_OG_TAGS) {
    if (!data.ogTitle)       issues.push({ severity: 'info', field: 'og:title',       message: 'Missing og:title' });
    if (!data.ogDescription) issues.push({ severity: 'info', field: 'og:description', message: 'Missing og:description' });
    if (!data.ogImage)       issues.push({ severity: 'info', field: 'og:image',       message: 'Missing og:image' });
  }

  // Twitter Card
  if (!data.twitterCard) {
    issues.push({ severity: 'info', field: 'twitter:card', message: 'Missing twitter:card meta tag' });
  }

  // lang attribute
  if (!data.lang) {
    issues.push({ severity: 'warn', field: 'lang', message: 'Missing lang attribute on <html>' });
  }

  // Viewport
  if (!data.viewport) {
    issues.push({ severity: 'critical', field: 'viewport', message: 'Missing viewport meta tag' });
  }

  // Heading hierarchy
  const h1Count = data.headings.filter(h => h.tag === 'H1').length;
  if (h1Count === 0)  issues.push({ severity: 'warn', field: 'headings', message: 'No <h1> found on page' });
  if (h1Count > 1)    issues.push({ severity: 'warn', field: 'headings', message: `Multiple <h1> tags (${h1Count})` });

  // Image alt text
  const noAlt = data.images.filter(i => !i.hasAlt);
  if (noAlt.length > 0) {
    issues.push({
      severity: 'warn',
      field:    'images',
      message:  `${noAlt.length} image(s) missing alt text`,
      detail:   noAlt.slice(0, 5).map(i => i.src),
    });
  }

  // JSON-LD
  if (data.jsonLd.length === 0) {
    issues.push({ severity: 'info', field: 'structured-data', message: 'No JSON-LD structured data found' });
  }

  return issues;
}

async function checkRobotsTxt() {
  const url = BASE_URL + SEO.ROBOTS_TXT_PATH;
  logger.bullet(`robots.txt → ${url}`);
  try {
    const resp = await fetch(url);
    if (!resp.ok) return { exists: false, status: resp.status, content: '' };
    const text = await resp.text();
    const hasDisallow = text.includes('Disallow');
    const hasSitemap  = text.includes('Sitemap:');
    return { exists: true, status: resp.status, content: text, hasDisallow, hasSitemap };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

async function checkSitemap() {
  const url = BASE_URL + SEO.SITEMAP_PATH;
  logger.bullet(`sitemap   → ${url}`);
  try {
    const resp = await fetch(url);
    return { exists: resp.ok, status: resp.status };
  } catch {
    return { exists: false };
  }
}

export async function runSEOAudit(crawledPages = []) {
  logger.section('MODULE 5 — SEO Audit');

  const urls = [...new Set([
    ...config.KNOWN_ROUTES.map(r => BASE_URL + r),
    ...crawledPages.map(p => p.url).filter(u => u.startsWith(BASE_URL)),
  ])];

  // robots.txt & sitemap
  const [robots, sitemap] = await Promise.all([checkRobotsTxt(), checkSitemap()]);

  if (robots.exists) {
    logger.success(`robots.txt found (${robots.content.split('\n').length} lines)`);
    if (!robots.hasSitemap) logger.warn('robots.txt has no Sitemap: directive');
  } else {
    logger.warn('robots.txt not found or server error');
  }

  if (sitemap.exists) logger.success('sitemap.xml found');
  else                logger.warn('sitemap.xml not found — generate one for better indexability');

  // per-page SEO scan
  const browser = await chromium.launch({ headless: CRAWL.HEADLESS });
  const context = await browser.newContext({ viewport: BROWSER.VIEWPORT });

  let totalIssues = 0;
  const titles    = new Map();

  for (const url of urls) {
    logger.bullet(`SEO scan  → ${url}`);
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: CRAWL.TIMEOUT_MS });
      const data   = await getSEOData(page, url);
      const issues = auditSEOData(url, data);

      // Duplicate title check
      if (data.title) {
        if (titles.has(data.title)) {
          issues.push({ severity: 'warn', field: 'title', message: `Duplicate title — also used on ${titles.get(data.title)}` });
        } else {
          titles.set(data.title, url);
        }
      }

      totalIssues += issues.length;

      const pageResult = {
        url,
        title:       data.title,
        description: data.description,
        canonical:   data.canonical,
        lang:        data.lang,
        h1Count:     data.headings.filter(h => h.tag === 'H1').length,
        imgCount:    data.images.length,
        imgMissingAlt: data.images.filter(i => !i.hasAlt).length,
        hasJsonLd:   data.jsonLd.length > 0,
        ogTitle:     data.ogTitle,
        robots:      robots,
        sitemap:     sitemap,
        issues,
      };
      store.pushSEO(pageResult);

      if (issues.length === 0) {
        logger.success(`  SEO OK on ${url}`);
      } else {
        const crits = issues.filter(i => i.severity === 'critical');
        if (crits.length) logger.error(`  ${crits.length} critical SEO issue(s):`);
        issues.forEach(i => logger.bullet(
          `  [${i.severity.toUpperCase()}] ${i.field}: ${i.message}`
        ));
      }
    } catch (err) {
      logger.error(`SEO scan failed for ${url}: ${err.message}`);
    }
    await page.close();
  }

  await browser.close();

  logger.success(`SEO audit complete — ${totalIssues} total issue(s) across ${urls.length} pages`);
  return store.get().seo;
}

// ── Standalone entry ──────────────────────────────────────────────────────
if (process.argv[1].endsWith('05_seo.js')) {
  runSEOAudit([]).then(() => process.exit(0)).catch(err => {
    logger.error(err.message);
    process.exit(1);
  });
}
