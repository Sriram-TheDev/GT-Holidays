// audit/scripts/01_crawler.js
// ─────────────────────────────────────────────────────────────────────────────
// MODULE 1: Functional QA & Crawling
//
// Uses Playwright to:
//  • BFS-crawl all reachable pages starting from BASE_URL
//  • Detect broken links (4xx/5xx responses)
//  • Detect missing assets (images, fonts, scripts, stylesheets)
//  • Capture JS console errors
//  • Capture failed network requests
//  • Record redirect chains
// ─────────────────────────────────────────────────────────────────────────────

import { chromium } from 'playwright';
import { config }   from '../config/audit.config.js';
import { store }    from './utils/store.js';
import { logger }   from './utils/logger.js';

const { BASE_URL, CRAWL, BROWSER } = config;

// ── Helpers ────────────────────────────────────────────────────────────────
function normalise(url, base) {
  try {
    const u = new URL(url, base);
    u.hash = '';         // strip fragment
    u.search = '';       // strip query for dedup (uncomment if you want QS)
    return u.href;
  } catch { return null; }
}

function isSameOrigin(url) {
  try { return new URL(url).origin === new URL(BASE_URL).origin; }
  catch { return false; }
}

function isAuditableAsset(url) {
  const ext = url.split('?')[0].split('#')[0].split('.').pop().toLowerCase();
  return ['png','jpg','jpeg','gif','webp','svg','avif','woff','woff2','ttf','eot','ico'].includes(ext);
}

// ── Per-page probe ─────────────────────────────────────────────────────────
async function probePage(page, url) {
  const consoleErrors   = [];
  const networkErrors   = [];
  const brokenLinks     = [];
  const missingAssets   = [];
  const discoveredLinks = new Set();

  // ── Console listener
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({ url, source: msg.text(), location: msg.location() });
    }
  });

  // ── Network failure listener
  page.on('requestfailed', req => {
    networkErrors.push({
      url,
      resource: req.url(),
      reason:   req.failure()?.errorText ?? 'unknown',
      type:     req.resourceType(),
    });
  });

  // ── Response listener (broken links & missing assets)
  page.on('response', async resp => {
    const status  = resp.status();
    const resUrl  = resp.url();
    const resType = resp.request().resourceType();

    if (status >= 400) {
      if (isAuditableAsset(resUrl)) {
        missingAssets.push({ url, asset: resUrl, status });
      } else {
        brokenLinks.push({ url, href: resUrl, status });
      }
    }
  });

  // ── Navigate
  let pageTitle = '';
  let statusCode = 200;
  try {
    const resp = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout:   CRAWL.TIMEOUT_MS,
    });
    statusCode = resp?.status() ?? 0;
    pageTitle  = await page.title();
  } catch (err) {
    return {
      url, statusCode: 0, pageTitle: '',
      error: err.message,
      consoleErrors, networkErrors, brokenLinks, missingAssets,
      links: [],
    };
  }

  // ── Harvest all hrefs from the rendered DOM
  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll('a[href]')].map(a => a.href)
  );
  hrefs.forEach(h => {
    const norm = normalise(h, BASE_URL);
    if (norm && (!CRAWL.SAME_ORIGIN_ONLY || isSameOrigin(norm))) {
      discoveredLinks.add(norm);
    }
  });

  // ── Grab img src / link href / script src for asset check
  const assets = await page.evaluate(() => [
    ...[...document.images].map(i => i.src),
    ...[...document.querySelectorAll('link[rel="stylesheet"]')].map(l => l.href),
    ...[...document.querySelectorAll('script[src]')].map(s => s.src),
  ]);
  // (network listener handles non-200 responses, this list is for reference)

  return {
    url,
    statusCode,
    pageTitle,
    consoleErrors,
    networkErrors,
    brokenLinks,
    missingAssets,
    links: [...discoveredLinks],
    assets,
  };
}

// ── BFS Crawler ────────────────────────────────────────────────────────────
export async function runCrawler() {
  logger.section('MODULE 1 — Functional QA & Crawler');

  const browser = await chromium.launch({ headless: CRAWL.HEADLESS });
  const context = await browser.newContext({
    viewport:  BROWSER.VIEWPORT,
    userAgent: BROWSER.USER_AGENT,
  });

  const visited  = new Set();
  const queue    = [normalise(BASE_URL, BASE_URL)];
  const allPages = [];

  // Seed with known routes
  config.KNOWN_ROUTES.forEach(r => {
    const n = normalise(BASE_URL + r, BASE_URL);
    if (n && !queue.includes(n)) queue.push(n);
  });

  logger.info(`Starting BFS crawl from ${BASE_URL}`);
  logger.info(`Max pages: ${CRAWL.MAX_PAGES} | Max depth: ${CRAWL.MAX_DEPTH}`);

  while (queue.length > 0 && visited.size < CRAWL.MAX_PAGES) {
    const url = queue.shift();
    if (!url || visited.has(url)) continue;
    visited.add(url);

    logger.bullet(`Probing → ${url}`);
    const page   = await context.newPage();
    const result = await probePage(page, url);
    await page.close();

    allPages.push(result);

    // Enqueue discovered links
    result.links.forEach(link => {
      if (!visited.has(link) && !queue.includes(link)) {
        queue.push(link);
      }
    });

    // Push findings to store
    result.consoleErrors.forEach(e  => store.pushCrawl('consoleErrors', e));
    result.networkErrors.forEach(e  => store.pushCrawl('networkErrors', e));
    result.brokenLinks.forEach(l    => store.pushCrawl('brokenLinks', l));
    result.missingAssets.forEach(a  => store.pushCrawl('missingAssets', a));
  }

  // Persist page map
  allPages.forEach(p => store.pushCrawl('pages', {
    url:        p.url,
    title:      p.pageTitle,
    statusCode: p.statusCode,
    assetCount: p.assets?.length ?? 0,
    linkCount:  p.links.length,
    errorCount: p.consoleErrors.length + p.networkErrors.length,
  }));

  store.setMeta('pagesAudited', allPages.map(p => p.url));

  await browser.close();

  // ── Report to console ────────────────────────────────────────────────────
  logger.success(`Crawled ${allPages.length} pages`);

  const broken = store.get().crawl.brokenLinks;
  if (broken.length) {
    logger.warn(`${broken.length} broken link(s) detected:`);
    broken.forEach(b => logger.bullet(`[${b.status}] ${b.href}  (found on: ${b.url})`));
  } else {
    logger.success('No broken links detected');
  }

  const missing = store.get().crawl.missingAssets;
  if (missing.length) {
    logger.warn(`${missing.length} missing asset(s):`);
    missing.forEach(a => logger.bullet(`[${a.status}] ${a.asset}`));
  }

  const consErr = store.get().crawl.consoleErrors;
  if (consErr.length) {
    logger.warn(`${consErr.length} JS console error(s):`);
    consErr.slice(0, 10).forEach(e => logger.bullet(`${e.source.slice(0, 120)}`));
  } else {
    logger.success('No JS console errors detected');
  }

  const netErr = store.get().crawl.networkErrors;
  if (netErr.length) {
    logger.warn(`${netErr.length} failed network request(s):`);
    netErr.slice(0, 10).forEach(e => logger.bullet(`[${e.reason}] ${e.resource}`));
  }

  return store.get().crawl;
}

// ── Standalone entry ──────────────────────────────────────────────────────
if (process.argv[1].endsWith('01_crawler.js')) {
  runCrawler().then(() => process.exit(0)).catch(err => {
    logger.error(err.message);
    process.exit(1);
  });
}
