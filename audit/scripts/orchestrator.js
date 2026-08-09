// audit/scripts/orchestrator.js
// ─────────────────────────────────────────────────────────────────────────────
// MASTER ORCHESTRATOR — runs all audit modules in sequence and generates
// the final report. This is the entry point for `npm run audit:full`.
//
// Usage:
//   node scripts/orchestrator.js [--skip-perf] [--skip-a11y] [--skip-security]
// ─────────────────────────────────────────────────────────────────────────────

import { performance } from 'perf_hooks';
import { config }      from '../config/audit.config.js';
import { store }       from './utils/store.js';
import { logger }      from './utils/logger.js';

const flags = new Set(process.argv.slice(2));
const SKIP_PERF     = flags.has('--skip-perf');
const SKIP_A11Y     = flags.has('--skip-a11y');
const SKIP_SECURITY = flags.has('--skip-security');

// Lazy-import modules to avoid import order issues
async function loadModules() {
  const [
    { runCrawler },
    { runPerformanceAudit },
    { runAccessibilityAudit },
    { runSecurityAudit },
    { runSEOAudit },
    { runCodeQualityAudit },
    { generateReport },
  ] = await Promise.all([
    import('./01_crawler.js'),
    import('./02_performance.js'),
    import('./03_accessibility.js'),
    import('./04_security.js'),
    import('./05_seo.js'),
    import('./06_code_quality.js'),
    import('./07_reporter.js'),
  ]);
  return { runCrawler, runPerformanceAudit, runAccessibilityAudit, runSecurityAudit, runSEOAudit, runCodeQualityAudit, generateReport };
}

async function main() {
  const t0 = performance.now();

  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║       VOYAGE INDIA — COMPREHENSIVE SITE AUDIT v1.0          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  logger.info(`Target: ${config.BASE_URL}`);
  logger.info(`Time  : ${new Date().toLocaleString()}`);
  logger.info(`Flags : ${SKIP_PERF?'--skip-perf ':''} ${SKIP_A11Y?'--skip-a11y ':''} ${SKIP_SECURITY?'--skip-security ':''}`);

  store.setMeta('baseUrl', config.BASE_URL);

  const mods = await loadModules();

  // ── Module 1: Crawl ──────────────────────────────────────────────────────
  const crawlResults = await mods.runCrawler();

  // ── Module 2: Performance ────────────────────────────────────────────────
  if (!SKIP_PERF) {
    await mods.runPerformanceAudit(crawlResults.pages);
  } else {
    logger.warn('Skipping performance audit (--skip-perf)');
  }

  // ── Module 3: Accessibility ──────────────────────────────────────────────
  if (!SKIP_A11Y) {
    await mods.runAccessibilityAudit(crawlResults.pages);
  } else {
    logger.warn('Skipping accessibility audit (--skip-a11y)');
  }

  // ── Module 4: Security ───────────────────────────────────────────────────
  if (!SKIP_SECURITY) {
    await mods.runSecurityAudit(crawlResults.pages);
  } else {
    logger.warn('Skipping security audit (--skip-security)');
  }

  // ── Module 5: SEO ────────────────────────────────────────────────────────
  await mods.runSEOAudit(crawlResults.pages);

  // ── Module 6: Code Quality ───────────────────────────────────────────────
  await mods.runCodeQualityAudit();

  // ── Module 7: Report ─────────────────────────────────────────────────────
  const { jsonPath, htmlPath, health } = await mods.generateReport();

  const duration = ((performance.now() - t0) / 1000).toFixed(1);
  store.setMeta('duration', Number(duration));

  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log(`║  AUDIT COMPLETE  ·  Score: ${String(health.score).padEnd(4)} / 100  ·  ${duration}s elapsed   ║`);
  console.log(`║  Report: ${htmlPath.slice(-54).padEnd(54)}  ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Non-zero exit if health is failing (useful for CI)
  if (health.score < 65) process.exit(1);
}

main().catch(err => {
  logger.error(`Fatal error: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
