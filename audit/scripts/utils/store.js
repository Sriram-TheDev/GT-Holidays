// audit/scripts/utils/store.js
// ─────────────────────────────────────────────────────────────────────────────
// In-memory result store shared across all audit modules.
// Each module pushes its findings here; the reporter drains this store.
// ─────────────────────────────────────────────────────────────────────────────

const _store = {
  meta: {
    appName:   'Voyage India',
    auditedAt: new Date().toISOString(),
    baseUrl:   '',
    duration:  0,
    pagesAudited: [],
  },
  crawl:       { pages: [], brokenLinks: [], missingAssets: [], consoleErrors: [], networkErrors: [] },
  performance: { routes: [], summary: {} },
  accessibility:{ pages: [] },
  security:    { headers: {}, mixedContent: [], recommendations: [] },
  seo:         { pages: [] },
  codeQuality: { htmlIssues: [], unusedCssHints: [], bundleAnalysis: {}, deprecatedTags: [] },
};

export const store = {
  get: ()                    => _store,
  setMeta: (key, val)        => { _store.meta[key] = val; },
  pushCrawl: (key, item)     => { _store.crawl[key].push(item); },
  pushA11y: (item)           => { _store.accessibility.pages.push(item); },
  pushPerf: (item)           => { _store.performance.routes.push(item); },
  setPerfSummary: (s)        => { _store.performance.summary = s; },
  setSecurity: (key, val)    => { _store.security[key] = val; },
  pushSecurity: (key, item)  => { _store.security[key].push(item); },
  pushSEO: (item)            => { _store.seo.pages.push(item); },
  setCodeQuality: (key, val) => { _store.codeQuality[key] = val; },
  pushCodeQuality: (key, item)=> { _store.codeQuality[key].push(item); },
};
