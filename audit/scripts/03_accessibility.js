// audit/scripts/03_accessibility.js
// ─────────────────────────────────────────────────────────────────────────────
// MODULE 3: Accessibility (a11y) Testing
//
// Uses @axe-core/playwright to:
//  • Scan every route for WCAG 2.1 AA compliance violations
//  • Categorise by impact: critical > serious > moderate > minor
//  • Report missing ARIA labels, alt attributes, colour contrast issues
//  • Return structured violations per page
// ─────────────────────────────────────────────────────────────────────────────

import { chromium }         from 'playwright';
import AxeBuilder           from '@axe-core/playwright';
import { config }           from '../config/audit.config.js';
import { store }            from './utils/store.js';
import { logger }           from './utils/logger.js';

const { BASE_URL, CRAWL, BROWSER, A11Y } = config;

const IMPACT_ORDER = ['critical', 'serious', 'moderate', 'minor'];

function impactColour(impact) {
  const colours = { critical: '\x1b[31m', serious: '\x1b[33m', moderate: '\x1b[34m', minor: '\x1b[37m' };
  return `${colours[impact] ?? ''}${impact}\x1b[0m`;
}

async function scanPage(page, url) {
  logger.bullet(`axe-core  → ${url}`);
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: CRAWL.TIMEOUT_MS });

    const results = await new AxeBuilder({ page })
      .withTags(A11Y.WCAG_TAGS)
      .analyze();

    const violations = results.violations.map(v => ({
      id:          v.id,
      impact:      v.impact,
      description: v.description,
      help:        v.help,
      helpUrl:     v.helpUrl,
      nodeCount:   v.nodes.length,
      nodes:       v.nodes.slice(0, 3).map(n => ({
        html:     n.html?.slice(0, 200),
        target:   n.target?.join(', '),
        failureSummary: n.failureSummary?.slice(0, 200),
      })),
    }));

    const incompletes = results.incomplete?.length ?? 0;

    return {
      url,
      violationCount: violations.length,
      incomplete:     incompletes,
      violations,
      byImpact: IMPACT_ORDER.reduce((acc, lvl) => {
        acc[lvl] = violations.filter(v => v.impact === lvl).length;
        return acc;
      }, {}),
    };
  } catch (err) {
    logger.error(`axe failed for ${url}: ${err.message}`);
    return { url, error: err.message, violationCount: 0, violations: [], byImpact: {} };
  }
}

export async function runAccessibilityAudit(crawledPages = []) {
  logger.section('MODULE 3 — Accessibility (WCAG 2.1 AA)');

  const urls = [...new Set([
    ...config.KNOWN_ROUTES.map(r => BASE_URL + r),
    ...crawledPages.map(p => p.url).filter(u => u.startsWith(BASE_URL)),
  ])];

  logger.info(`Scanning ${urls.length} page(s) with axe-core (tags: ${A11Y.WCAG_TAGS.join(', ')})`);

  const browser = await chromium.launch({ headless: CRAWL.HEADLESS });
  const context = await browser.newContext({ viewport: BROWSER.VIEWPORT });

  let totalViolations = 0;

  for (const url of urls) {
    const page   = await context.newPage();
    const result = await scanPage(page, url);
    await page.close();
    store.pushA11y(result);

    totalViolations += result.violationCount;

    if (result.error) { logger.error(`  ${result.error}`); continue; }

    if (result.violationCount === 0) {
      logger.success(`  No violations on ${url}`);
    } else {
      logger.warn(`  ${result.violationCount} violation(s) — ` +
        IMPACT_ORDER.map(l => `${impactColour(l)}:${result.byImpact[l]??0}`).join('  '));

      // Show critical/serious details
      result.violations
        .filter(v => v.impact === 'critical' || v.impact === 'serious')
        .slice(0, 5)
        .forEach(v => {
          logger.bullet(`[${impactColour(v.impact)}] ${v.id}: ${v.help}`);
          v.nodes.slice(0, 2).forEach(n => logger.bullet(`       └ ${n.html?.slice(0, 100)}`));
        });
    }
  }

  await browser.close();

  logger.success(`Accessibility audit complete — ${totalViolations} total violation(s) across ${urls.length} pages`);
  return store.get().accessibility;
}

// ── Standalone entry ──────────────────────────────────────────────────────
if (process.argv[1].endsWith('03_accessibility.js')) {
  runAccessibilityAudit([]).then(() => process.exit(0)).catch(err => {
    logger.error(err.message);
    process.exit(1);
  });
}
