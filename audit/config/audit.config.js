// audit/config/audit.config.js
// ─────────────────────────────────────────────────────────────────────────────
// Central configuration for the Voyage India Site Audit Framework.
// All scripts import constants from here — never hardcode URLs or thresholds.
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
  // ── Target ────────────────────────────────────────────────────────────────
  BASE_URL: 'http://localhost:5173',   // dev server (npm run dev)
  APP_NAME: 'Voyage India',

  // ── Known SPA routes (React Router) ───────────────────────────────────────
  // Crawler augments these with any hrefs it finds on-page.
  KNOWN_ROUTES: [
    '/',
    '/auth',
    '/discover',
    '/my-trips',
    '/seed',
    // Dynamic – will be resolved during crawl
    // '/package/:packageId'
    // '/checkout'
    // '/confirmation/:bookingId'
  ],

  // ── Crawl settings ────────────────────────────────────────────────────────
  CRAWL: {
    MAX_DEPTH:       3,
    MAX_PAGES:       50,
    TIMEOUT_MS:      15_000,
    CONCURRENCY:     3,
    SAME_ORIGIN_ONLY: true,
    HEADLESS:        true,
  },

  // ── Performance thresholds (Lighthouse) ───────────────────────────────────
  PERF: {
    MIN_PERFORMANCE:    75,
    MIN_ACCESSIBILITY:  90,
    MIN_BEST_PRACTICES: 85,
    MIN_SEO:            85,
    LCP_MAX_MS:         2500,
    FID_MAX_MS:         100,
    CLS_MAX:            0.1,
    TBT_MAX_MS:         200,
  },

  // ── Security headers to verify ────────────────────────────────────────────
  SECURITY: {
    REQUIRED_HEADERS: [
      'content-security-policy',
      'strict-transport-security',
      'x-frame-options',
      'x-content-type-options',
      'referrer-policy',
      'permissions-policy',
    ],
    MIXED_CONTENT_ALLOWED: false,
  },

  // ── SEO checklist ─────────────────────────────────────────────────────────
  SEO: {
    MIN_TITLE_LENGTH:       10,
    MAX_TITLE_LENGTH:       60,
    MIN_DESCRIPTION_LENGTH: 50,
    MAX_DESCRIPTION_LENGTH: 160,
    REQUIRE_CANONICAL:      true,
    REQUIRE_OG_TAGS:        true,
    ROBOTS_TXT_PATH:        '/robots.txt',
    SITEMAP_PATH:           '/sitemap.xml',
  },

  // ── Accessibility ─────────────────────────────────────────────────────────
  A11Y: {
    WCAG_TAGS:     ['wcag2a', 'wcag2aa', 'wcag21aa'],
    FAIL_SEVERITY: 'critical', // 'critical' | 'serious' | 'moderate' | 'minor'
  },

  // ── Output ────────────────────────────────────────────────────────────────
  OUTPUT: {
    DIR:          './reports',
    JSON_FILE:    'audit-results.json',
    HTML_FILE:    'audit-report.html',
    TIMESTAMP:    true,
  },

  // ── Browser ───────────────────────────────────────────────────────────────
  BROWSER: {
    VIEWPORT: { width: 1440, height: 900 },
    USER_AGENT: 'VoyageAuditBot/1.0 (+https://voyage-india.app)',
  },
};
