# Voyage India — Site Audit Framework

A comprehensive, modular automated QA audit system built for the **Voyage India** React/Vite application. Covers functional QA, performance, accessibility, security, SEO, and code quality in a single command.

---

## Architecture

```
audit/
├── config/
│   └── audit.config.js      ← All thresholds, URLs, flags (edit here)
├── scripts/
│   ├── utils/
│   │   ├── logger.js         ← Colour-coded console output
│   │   └── store.js          ← In-memory result store
│   ├── 01_crawler.js         ← BFS crawler + functional QA
│   ├── 02_performance.js     ← Lighthouse + Core Web Vitals
│   ├── 03_accessibility.js   ← axe-core WCAG 2.1 AA scan
│   ├── 04_security.js        ← HTTP headers + mixed content + secrets
│   ├── 05_seo.js             ← Meta tags, canonical, robots.txt
│   ├── 06_code_quality.js    ← Bundle analysis + code smell detection
│   ├── 07_reporter.js        ← HTML + JSON report generator
│   └── orchestrator.js       ← Master runner (entry point)
├── reports/                  ← Generated reports (git-ignored)
└── package.json
```

---

## Requirements

- **Node.js v20+**
- **Chromium** (installed automatically by Playwright)
- Dev server running at `http://localhost:5173` (i.e., `npm run dev` from project root)

---

## Setup

```bash
# From the project root
cd audit
npm install
npx playwright install chromium
```

---

## Usage

> **Start the dev server first** in the project root:
> ```bash
> npm run dev
> ```

### Run all modules
```bash
npm run audit:full
```

### Run individual modules
```bash
npm run audit:crawl        # Module 1 — Crawler & functional QA
npm run audit:perf         # Module 2 — Lighthouse performance
npm run audit:a11y         # Module 3 — Accessibility
npm run audit:security     # Module 4 — Security headers & secrets
npm run audit:seo          # Module 5 — SEO tags & robots.txt
npm run audit:code         # Module 6 — Bundle & code quality
npm run audit:report       # Module 7 — Regenerate report from stored data
```

### Skip heavy modules (faster CI runs)
```bash
node scripts/orchestrator.js --skip-perf
node scripts/orchestrator.js --skip-a11y
node scripts/orchestrator.js --skip-perf --skip-a11y --skip-security
```

---

## Configuration

Edit `config/audit.config.js` to customise:

| Setting | Default | Description |
|---------|---------|-------------|
| `BASE_URL` | `http://localhost:5173` | Dev server URL |
| `CRAWL.MAX_PAGES` | `50` | Max pages to BFS-crawl |
| `PERF.MIN_PERFORMANCE` | `75` | Lighthouse threshold |
| `PERF.LCP_MAX_MS` | `2500` | LCP threshold |
| `PERF.CLS_MAX` | `0.1` | CLS threshold |
| `A11Y.WCAG_TAGS` | `wcag2a, wcag2aa, wcag21aa` | WCAG compliance level |
| `SEO.REQUIRE_CANONICAL` | `true` | Enforce canonical URLs |

---

## Reports

After a run, reports are written to `audit/reports/`:

- **`audit-report.html`** — Dark-themed, self-contained HTML report with
  health score, per-module cards, findings tables, and violation details.
- **`audit-results.json`** — Machine-readable raw results for CI parsing.

Open the HTML report:
```bash
start audit/reports/audit-report.html   # Windows
open  audit/reports/audit-report.html   # macOS
```

---

## What Each Module Checks

### Module 1 — Crawler (Playwright)
- BFS page discovery from known routes + href harvesting
- HTTP status codes (4xx/5xx = broken link)
- Missing assets (images, fonts, stylesheets)
- JS console errors (type: `error`)
- Failed network requests

### Module 2 — Performance (Lighthouse)
- LCP, CLS, TBT, FCP, TTI, Speed Index
- Lighthouse scores: Performance, Accessibility, Best Practices, SEO
- Top optimisation opportunities per route
- Threshold comparison with CI pass/fail

### Module 3 — Accessibility (axe-core)
- WCAG 2.1 Level A + AA rules
- Missing ARIA labels, roles, landmarks
- Poor colour contrast (automated detection)
- Missing alt text on images
- Keyboard navigation (focus management)

### Module 4 — Security
- Required HTTP headers: `CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy`
- Mixed HTTP/HTTPS content detection
- Subresource Integrity (SRI) on external scripts/styles
- Exposed secrets scan in JS bundles: Firebase keys, Razorpay keys, JWT tokens, AWS keys

### Module 5 — SEO
- Title tag length (10–60 chars)
- Meta description (50–160 chars)
- Canonical URL
- Open Graph (og:title, og:description, og:image)
- Twitter Card tags
- Heading hierarchy (single H1, no skips)
- Image alt text coverage
- JSON-LD structured data
- robots.txt validation, sitemap.xml presence
- Duplicate title detection across pages

### Module 6 — Code Quality
- Bundle size analysis (from `dist/assets/`)
- Heavy JS chunks (>250 KB flagged, >500 KB critical)
- Heavy dependency inventory (firebase, gsap, motion, etc.)
- `console.log` / `debugger` leftover in source
- TODO/FIXME/HACK/BUG comments
- Large files (>400 LOC)
- CSS bloat (`!important`, deep nesting, 200+ selectors)

---

## Health Score

The overall score (0–100) is computed from penalty deductions:

| Issue | Deduction |
|-------|-----------|
| Each broken link | -5pts (max -20) |
| Each missing asset | -3pts (max -15) |
| Each JS console error | -2pts (max -10) |
| Low performance score (<75) | -15pts |
| Per critical a11y violation | -8pts (max -20) |
| Missing security headers ≥4 | -15pts |
| Each missing header | -3pts (max -10) |
| Each critical SEO issue | -4pts (max -10) |

**Verdict:** ≥85 = PASS · 65-84 = NEEDS WORK · <65 = FAIL

---

## CI/CD (GitHub Actions)

The workflow at `.github/workflows/site-audit.yml`:

1. Builds the Vite app with production secrets from repo secrets
2. Starts `vite preview` as the test server
3. Installs Playwright + audit dependencies
4. Runs the full audit suite
5. Uploads the HTML report as a workflow artifact
6. Posts a Markdown summary as a PR comment (on pull requests)
7. Exits with code `1` if health score < 65 (blocks merge)

**Trigger schedule:** Daily at 07:30 IST + every push to `main` + every PR.

---

## Adding to Production Audit

To audit against a deployed URL (e.g. Firebase Hosting), update `config/audit.config.js`:
```js
BASE_URL: 'https://voyage-india.web.app',
```

And in the GitHub workflow, remove the build/preview server steps and point `BASE_URL` directly at the live URL.
