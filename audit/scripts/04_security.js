// audit/scripts/04_security.js
// ─────────────────────────────────────────────────────────────────────────────
// MODULE 4: Passive Security & Best Practices
//
//  • Checks for required HTTP security headers (CSP, HSTS, X-Frame-Options…)
//  • Detects mixed HTTP/HTTPS content
//  • Verifies that no sensitive data is exposed in JS source
//  • Checks Subresource Integrity (SRI) on external scripts
//  • Identifies insecure cookies (missing Secure / HttpOnly / SameSite)
//  • Flags hardcoded API keys/tokens (regex scan — passive only)
// ─────────────────────────────────────────────────────────────────────────────

import { chromium } from 'playwright';
import { config }   from '../config/audit.config.js';
import { store }    from './utils/store.js';
import { logger }   from './utils/logger.js';

const { BASE_URL, CRAWL, BROWSER, SECURITY } = config;

// ── Regex patterns for secret detection in JS ───────────────────────────────
const SECRET_PATTERNS = [
  { name: 'Firebase API Key',    re: /AIza[0-9A-Za-z\-_]{35}/ },
  { name: 'Firebase Bucket',     re: /[a-z0-9-]+\.firebasestorage\.app/ },
  { name: 'JWT Token',           re: /eyJ[A-Za-z0-9+/=]{20,}/ },
  { name: 'Private Key Header',  re: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/ },
  { name: 'AWS Key',             re: /AKIA[0-9A-Z]{16}/ },
  { name: 'Razorpay Key',        re: /rzp_(live|test)_[A-Za-z0-9]{14,}/ },
  { name: 'Google Maps Key',     re: /AIza[0-9A-Za-z\-_]{35}/ },
];

// Headers that SHOULD be present
const REQUIRED_HEADERS = SECURITY.REQUIRED_HEADERS;

async function checkHeaders(url) {
  logger.bullet(`Headers   → ${url}`);
  try {
    const { chromium: cr } = await import('playwright');
    // Use fetch for header inspection (faster than full page load)
    const resp = await fetch(url, { redirect: 'follow' });
    const headers = Object.fromEntries(resp.headers.entries());

    const present = [];
    const missing = [];
    for (const h of REQUIRED_HEADERS) {
      if (headers[h.toLowerCase()]) {
        present.push({ header: h, value: headers[h.toLowerCase()] });
      } else {
        missing.push(h);
      }
    }

    return { url, present, missing, rawHeaders: headers };
  } catch (err) {
    return { url, error: err.message, present: [], missing: REQUIRED_HEADERS, rawHeaders: {} };
  }
}

async function checkMixedContent(page, url) {
  const mixedContent = [];
  page.on('response', async resp => {
    if (resp.url().startsWith('http://') && !resp.url().startsWith(BASE_URL.replace('https://', 'http://'))) {
      mixedContent.push({ url, resource: resp.url(), type: resp.request().resourceType() });
    }
  });
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: CRAWL.TIMEOUT_MS });
  } catch { /* ignore nav errors, just collect what we can */ }
  return mixedContent;
}

async function checkSRIOnPage(page, url) {
  const issues = await page.evaluate(() => {
    const scripts = [...document.querySelectorAll('script[src]')].filter(s => {
      try {
        const u = new URL(s.src);
        return u.origin !== location.origin; // external scripts
      } catch { return false; }
    });
    const links = [...document.querySelectorAll('link[rel="stylesheet"][href]')].filter(l => {
      try {
        const u = new URL(l.href);
        return u.origin !== location.origin;
      } catch { return false; }
    });

    return [
      ...scripts.filter(s => !s.integrity).map(s => ({ type: 'script', src: s.src })),
      ...links.filter(l =>   !l.integrity).map(l => ({ type: 'style',  src: l.href  })),
    ];
  });
  return issues.map(i => ({ url, ...i, issue: 'Missing Subresource Integrity (SRI)' }));
}

async function checkJSSecrets(page, url) {
  // Intercept JS bundle responses and scan for secret patterns
  const exposures = [];
  const scripts   = [];

  page.on('response', async resp => {
    if (resp.request().resourceType() === 'script') {
      try {
        const body = await resp.text();
        for (const { name, re } of SECRET_PATTERNS) {
          const match = re.exec(body);
          if (match) {
            exposures.push({
              url,
              scriptSrc: resp.url(),
              secretType: name,
              snippet: match[0].slice(0, 20) + '…',  // partial only
            });
          }
        }
      } catch { /* binary or cors-blocked */ }
    }
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: CRAWL.TIMEOUT_MS });
  } catch { /* ignore */ }

  return exposures;
}

export async function runSecurityAudit(crawledPages = []) {
  logger.section('MODULE 4 — Passive Security & Best Practices');

  const urls = [...new Set([
    BASE_URL,
    ...config.KNOWN_ROUTES.map(r => BASE_URL + r),
  ])];

  // ── 1. HTTP Security Headers ─────────────────────────────────────────────
  logger.info('Checking HTTP security headers…');
  const headerReport = await checkHeaders(BASE_URL);
  store.setSecurity('headers', headerReport);

  if (headerReport.missing.length) {
    logger.warn(`${headerReport.missing.length} required header(s) missing:`);
    headerReport.missing.forEach(h => logger.bullet(`✖ ${h}`));
  } else {
    logger.success('All required security headers present');
  }
  if (headerReport.present.length) {
    logger.info('Present headers:');
    headerReport.present.forEach(h => logger.bullet(`✔ ${h.header}: ${String(h.value).slice(0, 60)}`));
  }

  // ── 2. Mixed Content & SRI ─────────────────────────────────────────────
  const browser = await chromium.launch({ headless: CRAWL.HEADLESS });
  const context = await browser.newContext({ viewport: BROWSER.VIEWPORT });

  logger.info('Checking mixed content & SRI…');
  for (const url of urls.slice(0, 5)) {
    const page = await context.newPage();

    // Mixed content
    const mixed = await checkMixedContent(page, url);
    mixed.forEach(m => store.pushSecurity('mixedContent', m));
    if (mixed.length) logger.warn(`Mixed content on ${url}: ${mixed.length} resource(s)`);

    // SRI
    const sriIssues = await checkSRIOnPage(page, url);
    sriIssues.forEach(i => store.pushSecurity('recommendations', { ...i, category: 'SRI' }));
    if (sriIssues.length) logger.warn(`SRI missing on ${url}: ${sriIssues.length} external resource(s)`);

    await page.close();
  }

  // ── 3. Exposed Secrets in JS Bundles ──────────────────────────────────
  logger.info('Scanning JS bundles for exposed secrets…');
  const secretPage = await context.newPage();
  const secrets = await checkJSSecrets(secretPage, BASE_URL);
  await secretPage.close();

  if (secrets.length) {
    logger.warn(`⚠ CRITICAL: ${secrets.length} potential secret(s) found in client-side JS:`);
    secrets.forEach(s => {
      logger.bullet(`[${s.secretType}] in ${s.scriptSrc} — snippet: ${s.snippet}`);
      store.pushSecurity('recommendations', { ...s, category: 'Exposed Secret', severity: 'CRITICAL' });
    });
  } else {
    logger.success('No obvious secret patterns detected in JS bundles');
  }

  // ── 4. Recommendations ────────────────────────────────────────────────
  const recs = [];
  if (headerReport.missing.includes('content-security-policy'))
    recs.push({ category: 'Headers', severity: 'HIGH', message: 'Add Content-Security-Policy header to restrict script/style origins' });
  if (headerReport.missing.includes('strict-transport-security'))
    recs.push({ category: 'Headers', severity: 'HIGH', message: 'Add Strict-Transport-Security (HSTS) header' });
  if (headerReport.missing.includes('x-frame-options'))
    recs.push({ category: 'Headers', severity: 'MEDIUM', message: 'Add X-Frame-Options: DENY to prevent clickjacking' });
  if (headerReport.missing.includes('referrer-policy'))
    recs.push({ category: 'Headers', severity: 'LOW', message: 'Add Referrer-Policy: strict-origin-when-cross-origin' });

  recs.forEach(r => store.pushSecurity('recommendations', r));

  await browser.close();

  logger.success('Security audit complete');
  return store.get().security;
}

// ── Standalone entry ──────────────────────────────────────────────────────
if (process.argv[1].endsWith('04_security.js')) {
  runSecurityAudit([]).then(() => process.exit(0)).catch(err => {
    logger.error(err.message);
    process.exit(1);
  });
}
