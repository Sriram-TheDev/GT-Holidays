// audit/scripts/02_performance.js
// ─────────────────────────────────────────────────────────────────────────────
// MODULE 2: Performance & Core Web Vitals Auditing
//
// Uses Lighthouse programmatically to:
//  • Run audits on every discovered/known route
//  • Measure Core Web Vitals: LCP, FID/TBT, CLS, FCP, TTI, TBT
//  • Check Lighthouse scores: Performance, Accessibility, Best Practices, SEO
//  • Compare against thresholds defined in audit.config.js
//  • Produce per-route performance reports
// ─────────────────────────────────────────────────────────────────────────────

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { config } from '../config/audit.config.js';
import { store }  from './utils/store.js';
import { logger } from './utils/logger.js';

const { BASE_URL, PERF, KNOWN_ROUTES } = config;

const LIGHTHOUSE_FLAGS = {
  logLevel:   'error',
  output:     'json',
  onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  formFactor: 'desktop',
  screenEmulation: {
    mobile:             false,
    width:              1440,
    height:             900,
    deviceScaleFactor:  1,
    disabled:           false,
  },
  throttlingMethod: 'simulate',
  throttling: {
    rttMs:                  40,
    throughputKbps:         10240,
    cpuSlowdownMultiplier:  1,
  },
};

function score(val) { return Math.round((val ?? 0) * 100); }
function ms(val)    { return val != null ? `${Math.round(val)} ms` : 'N/A'; }
function cls(val)   { return val != null ? val.toFixed(3) : 'N/A'; }

function scoreColour(s) {
  if (s >= 90) return `\x1b[32m${s}\x1b[0m`;    // green
  if (s >= 75) return `\x1b[33m${s}\x1b[0m`;    // yellow
  return             `\x1b[31m${s}\x1b[0m`;      // red
}

async function auditRoute(chrome, url) {
  logger.bullet(`Lighthouse → ${url}`);
  try {
    const { lhr } = await lighthouse(url, {
      port: chrome.port,
      ...LIGHTHOUSE_FLAGS,
    });

    const cats   = lhr.categories;
    const audits = lhr.audits;

    const result = {
      url,
      scores: {
        performance:    score(cats.performance?.score),
        accessibility:  score(cats.accessibility?.score),
        bestPractices:  score(cats['best-practices']?.score),
        seo:            score(cats.seo?.score),
      },
      webVitals: {
        lcp:       audits['largest-contentful-paint']?.numericValue,
        fcp:       audits['first-contentful-paint']?.numericValue,
        tbt:       audits['total-blocking-time']?.numericValue,
        cls:       audits['cumulative-layout-shift']?.numericValue,
        tti:       audits['interactive']?.numericValue,
        si:        audits['speed-index']?.numericValue,
      },
      opportunities: Object.values(audits)
        .filter(a => a.details?.type === 'opportunity' && a.displayValue && a.score < 0.9)
        .map(a => ({ id: a.id, title: a.title, savings: a.displayValue })),
      diagnostics: Object.values(audits)
        .filter(a => a.details?.type === 'table' && a.score != null && a.score < 0.9)
        .slice(0, 8)
        .map(a => ({ id: a.id, title: a.title, score: score(a.score) })),
    };

    // ── Threshold checks
    const fails = [];
    if (result.scores.performance   < PERF.MIN_PERFORMANCE)    fails.push(`Performance ${result.scores.performance} < ${PERF.MIN_PERFORMANCE}`);
    if (result.scores.accessibility < PERF.MIN_ACCESSIBILITY)  fails.push(`Accessibility ${result.scores.accessibility} < ${PERF.MIN_ACCESSIBILITY}`);
    if (result.scores.bestPractices < PERF.MIN_BEST_PRACTICES) fails.push(`Best-Practices ${result.scores.bestPractices} < ${PERF.MIN_BEST_PRACTICES}`);
    if (result.scores.seo           < PERF.MIN_SEO)             fails.push(`SEO ${result.scores.seo} < ${PERF.MIN_SEO}`);
    if (result.webVitals.lcp > PERF.LCP_MAX_MS) fails.push(`LCP ${ms(result.webVitals.lcp)} > ${PERF.LCP_MAX_MS}ms`);
    if (result.webVitals.tbt > PERF.TBT_MAX_MS) fails.push(`TBT ${ms(result.webVitals.tbt)} > ${PERF.TBT_MAX_MS}ms`);
    if (result.webVitals.cls > PERF.CLS_MAX)     fails.push(`CLS ${cls(result.webVitals.cls)} > ${PERF.CLS_MAX}`);

    result.thresholdFailures = fails;
    return result;
  } catch (err) {
    logger.error(`Lighthouse failed for ${url}: ${err.message}`);
    return { url, error: err.message, scores: {}, webVitals: {}, opportunities: [], diagnostics: [], thresholdFailures: [] };
  }
}

export async function runPerformanceAudit(crawledPages = []) {
  logger.section('MODULE 2 — Performance & Core Web Vitals');

  // Merge known routes with crawled pages (deduplicate)
  const urls = [...new Set([
    ...KNOWN_ROUTES.map(r => BASE_URL + r),
    ...crawledPages.map(p => p.url).filter(u => u.startsWith(BASE_URL)),
  ])];

  logger.info(`Auditing ${urls.length} route(s) with Lighthouse`);

  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
  });

  for (const url of urls) {
    const result = await auditRoute(chrome, url);
    store.pushPerf(result);

    // Console summary per route
    const s = result.scores;
    if (result.error) {
      logger.error(`  Error: ${result.error}`);
      continue;
    }
    console.log(
      `    Perf:${scoreColour(s.performance)}  ` +
      `A11y:${scoreColour(s.accessibility)}  ` +
      `BP:${scoreColour(s.bestPractices)}  ` +
      `SEO:${scoreColour(s.seo)}`
    );
    console.log(
      `    LCP:${ms(result.webVitals.lcp)}  ` +
      `TBT:${ms(result.webVitals.tbt)}  ` +
      `CLS:${cls(result.webVitals.cls)}`
    );
    if (result.thresholdFailures.length) {
      result.thresholdFailures.forEach(f => logger.warn(`  ⚠ THRESHOLD FAIL: ${f}`));
    } else {
      logger.success('  All thresholds passed');
    }
    if (result.opportunities.length) {
      logger.info(`  Top opportunities:`);
      result.opportunities.slice(0, 4).forEach(o => logger.bullet(`${o.title} — ${o.savings}`));
    }
  }

  await chrome.kill();

  // Aggregate summary
  const allRoutes = store.get().performance.routes.filter(r => !r.error);
  const avg = (key) => allRoutes.length
    ? Math.round(allRoutes.reduce((s, r) => s + (r.scores[key] ?? 0), 0) / allRoutes.length)
    : 0;

  const summary = {
    routesAudited: urls.length,
    averageScores: {
      performance:   avg('performance'),
      accessibility: avg('accessibility'),
      bestPractices: avg('bestPractices'),
      seo:           avg('seo'),
    },
    totalThresholdFailures: allRoutes.reduce((s, r) => s + r.thresholdFailures.length, 0),
  };
  store.setPerfSummary(summary);

  logger.success('Performance audit complete');
  logger.info(`Average scores — Perf:${summary.averageScores.performance}  A11y:${summary.averageScores.accessibility}  BP:${summary.averageScores.bestPractices}  SEO:${summary.averageScores.seo}`);

  return store.get().performance;
}

// ── Standalone entry ──────────────────────────────────────────────────────
if (process.argv[1].endsWith('02_performance.js')) {
  runPerformanceAudit([]).then(() => process.exit(0)).catch(err => {
    logger.error(err.message);
    process.exit(1);
  });
}
