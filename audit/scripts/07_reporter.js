// audit/scripts/07_reporter.js
// ─────────────────────────────────────────────────────────────────────────────
// MODULE 7: Report Generator
//
//  • Reads the central store and serialises to JSON
//  • Generates a self-contained, styled HTML report (no external deps)
//  • Includes executive summary, per-category cards, findings tables
//  • Generates a final pass/fail verdict with overall health score
// ─────────────────────────────────────────────────────────────────────────────

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join }    from 'path';
import { store }   from './utils/store.js';
import { logger }  from './utils/logger.js';
import { config }  from '../config/audit.config.js';

const REPORTS_DIR = join(import.meta.dirname, '..', 'reports');

// ── Score badge colour ─────────────────────────────────────────────────────
function scoreClass(s) {
  if (s >= 90) return 'pass';
  if (s >= 75) return 'warn';
  return 'fail';
}

// ── Compute overall health score ───────────────────────────────────────────
function computeHealthScore(data) {
  let points = 100;
  const penalties = [];

  // Crawl penalties
  const bl = data.crawl.brokenLinks.length;
  const ma = data.crawl.missingAssets.length;
  const ce = data.crawl.consoleErrors.length;
  if (bl > 0) { points -= Math.min(bl * 5, 20); penalties.push(`${bl} broken links (-${Math.min(bl*5,20)}pts)`); }
  if (ma > 0) { points -= Math.min(ma * 3, 15); penalties.push(`${ma} missing assets (-${Math.min(ma*3,15)}pts)`); }
  if (ce > 0) { points -= Math.min(ce * 2, 10); penalties.push(`${ce} JS console errors (-${Math.min(ce*2,10)}pts)`); }

  // Performance penalties
  const avgPerf = data.performance.summary?.averageScores?.performance ?? 100;
  if (avgPerf < 75) { points -= 15; penalties.push(`Low perf score ${avgPerf} (-15pts)`); }
  else if (avgPerf < 90) { points -= 5; penalties.push(`Perf ${avgPerf} < 90 (-5pts)`); }

  // Accessibility penalties
  const totalViolations = data.accessibility.pages?.reduce((s, p) => s + (p.violationCount ?? 0), 0) ?? 0;
  const criticalA11y    = data.accessibility.pages?.reduce((s, p) => s + (p.byImpact?.critical ?? 0), 0) ?? 0;
  if (criticalA11y > 0) { points -= Math.min(criticalA11y * 8, 20); penalties.push(`${criticalA11y} critical a11y violations (-pts)`); }

  // Security penalties
  const missingHeaders = data.security.headers?.missing?.length ?? 0;
  if (missingHeaders >= 4) { points -= 15; penalties.push(`${missingHeaders} missing security headers (-15pts)`); }
  else if (missingHeaders > 0) { points -= Math.min(missingHeaders * 3, 10); penalties.push(`${missingHeaders} missing security headers (-pts)`); }

  // SEO penalties
  const seoIssues = data.seo.pages?.reduce((s, p) => s + (p.issues?.filter(i => i.severity === 'critical').length ?? 0), 0) ?? 0;
  if (seoIssues > 0) { points -= Math.min(seoIssues * 4, 10); penalties.push(`${seoIssues} critical SEO issues (-pts)`); }

  return {
    score:    Math.max(0, Math.round(points)),
    penalties,
  };
}

// ── HTML template generator ─────────────────────────────────────────────────
function generateHTML(data, health, timestamp) {
  const { score, penalties } = health;
  const verdict = score >= 85 ? 'PASS' : score >= 65 ? 'NEEDS WORK' : 'FAIL';
  const verdictClass = score >= 85 ? 'pass' : score >= 65 ? 'warn' : 'fail';

  const avgScores  = data.performance.summary?.averageScores ?? {};
  const allPages   = data.crawl.pages ?? [];
  const allA11y    = data.accessibility.pages ?? [];
  const security   = data.security;
  const seoPages   = data.seo.pages ?? [];
  const codeQuality = data.codeQuality;

  function buildSEOTable() {
    return seoPages.map(p => `
      <tr>
        <td class="url">${p.url}</td>
        <td>${p.title?.slice(0,50) || '<span class="badge fail">MISSING</span>'}</td>
        <td class="${p.description ? '' : 'fail-text'}">${p.description ? '✔' : '✖ MISSING'}</td>
        <td class="${p.canonical  ? '' : 'warn-text'}">${p.canonical  ? '✔' : '✖'}</td>
        <td>${p.h1Count}</td>
        <td class="${p.imgMissingAlt > 0 ? 'warn-text' : ''}">${p.imgMissingAlt}/${p.imgCount}</td>
        <td>${p.hasJsonLd ? '✔' : '✖'}</td>
        <td><span class="badge ${p.issues?.length === 0 ? 'pass' : p.issues?.some(i=> i.severity==='critical') ? 'fail' : 'warn'}">${p.issues?.length ?? 0}</span></td>
      </tr>
    `).join('');
  }

  function buildA11yTable() {
    return allA11y.map(p => `
      <tr>
        <td class="url">${p.url}</td>
        <td class="${(p.byImpact?.critical??0) > 0 ? 'fail-text' : ''}">${p.byImpact?.critical ?? 0}</td>
        <td class="${(p.byImpact?.serious??0) > 0 ? 'warn-text' : ''}">${p.byImpact?.serious ?? 0}</td>
        <td>${p.byImpact?.moderate ?? 0}</td>
        <td>${p.byImpact?.minor ?? 0}</td>
        <td><span class="badge ${p.violationCount === 0 ? 'pass' : p.byImpact?.critical > 0 ? 'fail' : 'warn'}">${p.violationCount}</span></td>
      </tr>
    `).join('');
  }

  function buildSecurityTable() {
    const rows = security.headers?.missing?.map(h => `
      <tr><td class="fail-text">✖ MISSING</td><td>${h}</td><td class="warn-text">Required security header not set</td></tr>
    `).join('') ?? '';
    const present = security.headers?.present?.map(h => `
      <tr><td class="pass-text">✔ PRESENT</td><td>${h.header}</td><td class="muted">${String(h.value).slice(0,60)}</td></tr>
    `).join('') ?? '';
    return rows + present;
  }

  function buildBundleTable() {
    const chunks = codeQuality.bundleAnalysis?.chunks ?? [];
    return chunks.slice(0,15).map(c => `
      <tr>
        <td class="mono">${c.name}</td>
        <td class="mono">${c.type.toUpperCase()}</td>
        <td class="mono ${c.severity !== 'ok' ? 'warn-text' : ''}">${c.sizeKb} KB</td>
        <td><span class="badge ${c.severity === 'ok' ? 'pass' : c.severity === 'warn' ? 'warn' : 'fail'}">${c.severity}</span></td>
      </tr>
    `).join('');
  }

  function buildCodeIssues() {
    const issues = codeQuality.sourceIssues?.issues ?? [];
    if (!issues.length) return '<tr><td colspan="4" class="pass-text center">✔ No code quality issues detected</td></tr>';
    return issues.flatMap(f =>
      f.issues.map(i => `
        <tr>
          <td class="mono">${f.file}</td>
          <td class="mono">${i.line ? 'L' + i.line : '—'}</td>
          <td><span class="badge ${i.type === 'debugger' ? 'fail' : 'warn'}">${i.type}</span></td>
          <td class="mono muted">${i.snippet?.slice(0, 80)}</td>
        </tr>
      `)
    ).join('');
  }

  function buildCrawlPagesTable() {
    return allPages.map(p => `
      <tr>
        <td class="url">${p.url}</td>
        <td>${p.title?.slice(0,40) || '—'}</td>
        <td class="${p.statusCode >= 400 ? 'fail-text' : p.statusCode >= 300 ? 'warn-text' : 'pass-text'}">${p.statusCode}</td>
        <td>${p.linkCount}</td>
        <td class="${p.errorCount > 0 ? 'warn-text' : ''}">${p.errorCount}</td>
      </tr>
    `).join('');
  }

  function buildPerfTable() {
    const routes = data.performance.routes ?? [];
    return routes.map(r => `
      <tr>
        <td class="url">${r.url}</td>
        <td class="mono ${scoreClass(r.scores.performance)}-text">${r.scores.performance ?? '—'}</td>
        <td class="mono ${scoreClass(r.scores.accessibility)}-text">${r.scores.accessibility ?? '—'}</td>
        <td class="mono ${scoreClass(r.scores.seo)}-text">${r.scores.seo ?? '—'}</td>
        <td class="mono">${r.webVitals?.lcp != null ? Math.round(r.webVitals.lcp) + 'ms' : '—'}</td>
        <td class="mono">${r.webVitals?.cls != null ? r.webVitals.cls.toFixed(3) : '—'}</td>
        <td class="mono">${r.webVitals?.tbt != null ? Math.round(r.webVitals.tbt) + 'ms' : '—'}</td>
      </tr>
    `).join('');
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Voyage India — Site Audit Report</title>
  <style>
    :root {
      --bg:      #0d1117;
      --surface: #161b22;
      --border:  #30363d;
      --text:    #e6edf3;
      --muted:   #8b949e;
      --pass:    #3fb950;
      --warn:    #d29922;
      --fail:    #f85149;
      --blue:    #58a6ff;
      --accent:  #1f6feb;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
           background: var(--bg); color: var(--text); line-height: 1.6; }
    .container { max-width: 1400px; margin: 0 auto; padding: 2rem; }

    /* Header */
    .report-header { background: linear-gradient(135deg, #0d1117 0%, #1f2937 100%);
                     border-bottom: 1px solid var(--border); padding: 3rem 2rem;
                     display: flex; align-items: center; justify-content: space-between; }
    .report-title { font-size: 2rem; font-weight: 700; letter-spacing: -0.5px; }
    .report-title span { color: var(--blue); }
    .report-meta { color: var(--muted); font-size: 0.875rem; margin-top: 0.5rem; }

    /* Health Score */
    .health-score { text-align: center; }
    .score-circle { width: 120px; height: 120px; border-radius: 50%;
                    display: flex; flex-direction: column; align-items: center;
                    justify-content: center; border: 4px solid;
                    margin: 0 auto 0.5rem; }
    .score-circle.pass { border-color: var(--pass); background: rgba(63,185,80,0.1); }
    .score-circle.warn { border-color: var(--warn); background: rgba(210,153,34,0.1); }
    .score-circle.fail { border-color: var(--fail); background: rgba(248,81,73,0.1); }
    .score-num  { font-size: 2.5rem; font-weight: 700; }
    .score-label{ font-size: 0.65rem; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
    .verdict    { font-size: 1rem; font-weight: 700; letter-spacing: 1px; }
    .verdict.pass { color: var(--pass); }
    .verdict.warn { color: var(--warn); }
    .verdict.fail { color: var(--fail); }

    /* Summary cards */
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr));
                    gap: 1rem; margin: 2rem 0; }
    .card { background: var(--surface); border: 1px solid var(--border);
            border-radius: 8px; padding: 1.25rem; }
    .card-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px;
                  color: var(--muted); margin-bottom: 0.5rem; }
    .card-value { font-size: 2rem; font-weight: 700; }
    .card-value.pass { color: var(--pass); }
    .card-value.warn { color: var(--warn); }
    .card-value.fail { color: var(--fail); }
    .card-sub   { font-size: 0.8rem; color: var(--muted); margin-top: 0.25rem; }

    /* Sections */
    .section { margin: 3rem 0; }
    .section-header { display: flex; align-items: center; gap: 0.75rem;
                      padding-bottom: 0.75rem; border-bottom: 1px solid var(--border);
                      margin-bottom: 1.5rem; }
    .section-icon { font-size: 1.5rem; }
    .section-title { font-size: 1.25rem; font-weight: 600; }
    .section-badge { margin-left: auto; }

    /* Tables */
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    th { background: #1c2128; padding: 0.75rem 1rem; text-align: left;
         font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px;
         color: var(--muted); border-bottom: 1px solid var(--border); }
    td { padding: 0.6rem 1rem; border-bottom: 1px solid #1c2128; vertical-align: top; }
    tr:hover td { background: rgba(255,255,255,0.02); }
    .url  { font-family: monospace; font-size: 0.8rem; color: var(--blue); max-width: 320px;
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .mono { font-family: monospace; font-size: 0.8rem; }
    .muted { color: var(--muted); }
    .center { text-align: center; padding: 2rem; }

    /* Badges */
    .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 999px;
             font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .badge.pass { background: rgba(63,185,80,0.15); color: var(--pass); }
    .badge.warn { background: rgba(210,153,34,0.15); color: var(--warn); }
    .badge.fail { background: rgba(248,81,73,0.15); color: var(--fail); }
    .badge.info { background: rgba(88,166,255,0.15); color: var(--blue); }

    /* Colour text helpers */
    .pass-text { color: var(--pass); }
    .warn-text { color: var(--warn); }
    .fail-text { color: var(--fail); }
    .blue-text { color: var(--blue); }

    /* Penalty list */
    .penalty-list { list-style: none; padding: 0; }
    .penalty-list li { padding: 0.4rem 0; border-bottom: 1px solid #1c2128;
                       font-size: 0.875rem; display: flex; gap: 0.5rem; }
    .penalty-list li::before { content: '▼'; color: var(--fail); flex-shrink: 0; }

    /* Footer */
    footer { margin-top: 4rem; padding: 2rem; border-top: 1px solid var(--border);
             text-align: center; color: var(--muted); font-size: 0.8rem; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    @media(max-width:768px){.two-col{grid-template-columns:1fr;}.report-header{flex-direction:column;gap:2rem;}}
  </style>
</head>
<body>

<header class="report-header">
  <div>
    <h1 class="report-title">Voyage <span>India</span> — Site Audit</h1>
    <p class="report-meta">Generated: ${timestamp} · Base URL: ${config.BASE_URL} · Pages: ${allPages.length}</p>
    <p class="report-meta">Framework: React + Vite · Stack: Playwright · Lighthouse · axe-core</p>
  </div>
  <div class="health-score">
    <div class="score-circle ${verdictClass}">
      <span class="score-num">${score}</span>
      <span class="score-label">/ 100</span>
    </div>
    <p class="verdict ${verdictClass}">${verdict}</p>
  </div>
</header>

<div class="container">

  <!-- Summary Cards -->
  <div class="summary-grid">
    <div class="card">
      <p class="card-label">Pages Crawled</p>
      <p class="card-value">${allPages.length}</p>
      <p class="card-sub">${data.crawl.brokenLinks.length} broken links</p>
    </div>
    <div class="card">
      <p class="card-label">Console Errors</p>
      <p class="card-value ${data.crawl.consoleErrors.length > 0 ? 'fail' : 'pass'}">${data.crawl.consoleErrors.length}</p>
      <p class="card-sub">${data.crawl.networkErrors.length} network failures</p>
    </div>
    <div class="card">
      <p class="card-label">Avg Performance</p>
      <p class="card-value ${scoreClass(avgScores.performance)}">${avgScores.performance ?? 'N/A'}</p>
      <p class="card-sub">Lighthouse score (0–100)</p>
    </div>
    <div class="card">
      <p class="card-label">A11y Violations</p>
      <p class="card-value ${allA11y.reduce((s,p)=>s+(p.violationCount??0),0)>0?'fail':'pass'}">${allA11y.reduce((s,p)=>s+(p.violationCount??0),0)}</p>
      <p class="card-sub">${allA11y.reduce((s,p)=>s+(p.byImpact?.critical??0),0)} critical</p>
    </div>
    <div class="card">
      <p class="card-label">Security Headers</p>
      <p class="card-value ${(security.headers?.missing?.length??0) > 0 ? 'fail' : 'pass'}">${(security.headers?.missing?.length??0) === 0 ? '✔' : security.headers?.missing?.length}</p>
      <p class="card-sub">${security.headers?.missing?.length ?? '?'} missing of ${config.SECURITY.REQUIRED_HEADERS.length} required</p>
    </div>
    <div class="card">
      <p class="card-label">SEO Issues</p>
      <p class="card-value ${seoPages.reduce((s,p)=>s+(p.issues?.filter(i=>i.severity==='critical').length??0),0)>0?'warn':'pass'}">${seoPages.reduce((s,p)=>s+(p.issues?.length??0),0)}</p>
      <p class="card-sub">across ${seoPages.length} pages</p>
    </div>
    <div class="card">
      <p class="card-label">Bundle Size</p>
      <p class="card-value ${codeQuality.bundleAnalysis?.heavyChunks?.length > 0 ? 'warn' : 'pass'}">${codeQuality.bundleAnalysis?.totalSize ?? 'N/A'}</p>
      <p class="card-sub">${codeQuality.bundleAnalysis?.jsChunkCount ?? 0} JS chunks</p>
    </div>
    <div class="card">
      <p class="card-label">Code Issues</p>
      <p class="card-value ${(codeQuality.sourceIssues?.issues?.length??0)>0?'warn':'pass'}">${codeQuality.sourceIssues?.issues?.reduce((s,f)=>s+f.issues.length,0)??0}</p>
      <p class="card-sub">console.log, debugger, TODOs</p>
    </div>
  </div>

  <!-- Penalties -->
  ${penalties.length ? `
  <div class="card" style="margin-bottom:2rem;">
    <p class="card-label" style="margin-bottom:1rem;">Score Penalties</p>
    <ul class="penalty-list">${penalties.map(p=>`<li>${p}</li>`).join('')}</ul>
  </div>
  ` : ''}

  <!-- 1. CRAWL RESULTS -->
  <div class="section">
    <div class="section-header">
      <span class="section-icon">🕷️</span>
      <h2 class="section-title">Crawl Results & Functional QA</h2>
      <span class="section-badge"><span class="badge ${data.crawl.brokenLinks.length > 0 ? 'fail' : 'pass'}">${allPages.length} pages</span></span>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>URL</th><th>Title</th><th>Status</th><th>Links</th><th>Errors</th></tr></thead>
        <tbody>${buildCrawlPagesTable() || '<tr><td colspan="5" class="center muted">No pages crawled</td></tr>'}</tbody>
      </table>
    </div>
    ${data.crawl.brokenLinks.length > 0 ? `
    <h3 style="margin:1.5rem 0 0.75rem;font-size:1rem;">Broken Links (${data.crawl.brokenLinks.length})</h3>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Status</th><th>Broken URL</th><th>Found On</th></tr></thead>
        <tbody>${data.crawl.brokenLinks.map(b=>`<tr><td class="fail-text mono">${b.status}</td><td class="url">${b.href}</td><td class="url muted">${b.url}</td></tr>`).join('')}</tbody>
      </table>
    </div>` : ''}
    ${data.crawl.consoleErrors.length > 0 ? `
    <h3 style="margin:1.5rem 0 0.75rem;font-size:1rem;">JS Console Errors (${data.crawl.consoleErrors.length})</h3>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Page</th><th>Error Message</th></tr></thead>
        <tbody>${data.crawl.consoleErrors.slice(0,20).map(e=>`<tr><td class="url">${e.url}</td><td class="mono muted" style="font-size:0.75rem;">${e.source?.slice(0,150)}</td></tr>`).join('')}</tbody>
      </table>
    </div>` : '<p class="pass-text" style="margin-top:1rem">✔ No JS console errors detected</p>'}
  </div>

  <!-- 2. PERFORMANCE -->
  <div class="section">
    <div class="section-header">
      <span class="section-icon">⚡</span>
      <h2 class="section-title">Performance & Core Web Vitals</h2>
      <span class="section-badge"><span class="badge ${scoreClass(avgScores.performance)}">Avg ${avgScores.performance ?? 'N/A'}</span></span>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>URL</th><th>Perf</th><th>A11y</th><th>SEO</th><th>LCP</th><th>CLS</th><th>TBT</th></tr></thead>
        <tbody>${buildPerfTable() || '<tr><td colspan="7" class="center muted">Run with --perf flag or ensure dev server is active</td></tr>'}</tbody>
      </table>
    </div>
    ${data.performance.routes?.flatMap(r => r.opportunities ?? []).slice(0,8).length > 0 ? `
    <h3 style="margin:1.5rem 0 0.75rem;font-size:1rem;">Top Opportunities</h3>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Audit</th><th>Potential Saving</th></tr></thead>
        <tbody>${data.performance.routes.flatMap(r=>r.opportunities??[]).slice(0,8).map(o=>`<tr><td>${o.title}</td><td class="warn-text mono">${o.savings}</td></tr>`).join('')}</tbody>
      </table>
    </div>` : ''}
  </div>

  <!-- 3. ACCESSIBILITY -->
  <div class="section">
    <div class="section-header">
      <span class="section-icon">♿</span>
      <h2 class="section-title">Accessibility (WCAG 2.1 AA)</h2>
      <span class="section-badge"><span class="badge ${allA11y.reduce((s,p)=>s+(p.byImpact?.critical??0),0)>0?'fail':allA11y.reduce((s,p)=>s+(p.violationCount??0),0)>0?'warn':'pass'}">${allA11y.reduce((s,p)=>s+(p.violationCount??0),0)} violations</span></span>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>URL</th><th>🔴 Critical</th><th>🟠 Serious</th><th>🔵 Moderate</th><th>⚪ Minor</th><th>Total</th></tr></thead>
        <tbody>${buildA11yTable() || '<tr><td colspan="6" class="center pass-text">✔ No violations found</td></tr>'}</tbody>
      </table>
    </div>
    ${allA11y.flatMap(p => p.violations ?? []).filter(v => v.impact === 'critical' || v.impact === 'serious').length > 0 ? `
    <h3 style="margin:1.5rem 0 0.75rem;font-size:1rem;">Critical & Serious Violations</h3>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Rule</th><th>Impact</th><th>Description</th><th>Nodes</th><th>Learn More</th></tr></thead>
        <tbody>${allA11y.flatMap(p=>p.violations??[]).filter(v=>v.impact==='critical'||v.impact==='serious').slice(0,15).map(v=>`
          <tr>
            <td class="mono">${v.id}</td>
            <td><span class="badge ${v.impact==='critical'?'fail':'warn'}">${v.impact}</span></td>
            <td>${v.help}</td>
            <td>${v.nodeCount}</td>
            <td><a href="${v.helpUrl}" style="color:var(--blue);font-size:0.8rem;">Docs ↗</a></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : ''}
  </div>

  <!-- 4. SECURITY -->
  <div class="section">
    <div class="section-header">
      <span class="section-icon">🔒</span>
      <h2 class="section-title">Security & Best Practices</h2>
      <span class="section-badge"><span class="badge ${(security.headers?.missing?.length??0)>0?'fail':'pass'}">${(security.headers?.missing?.length??0)} headers missing</span></span>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Status</th><th>Header</th><th>Value / Note</th></tr></thead>
        <tbody>${buildSecurityTable() || '<tr><td colspan="3" class="center muted">No data</td></tr>'}</tbody>
      </table>
    </div>
    ${security.recommendations?.length > 0 ? `
    <h3 style="margin:1.5rem 0 0.75rem;font-size:1rem;">Recommendations & Findings</h3>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Severity</th><th>Category</th><th>Message</th></tr></thead>
        <tbody>${security.recommendations.map(r=>`<tr><td><span class="badge ${r.severity==='CRITICAL'||r.severity==='HIGH'?'fail':r.severity==='MEDIUM'?'warn':'info'}">${r.severity??'INFO'}</span></td><td>${r.category}</td><td>${r.message || (r.scriptSrc ? `Found in: ${r.scriptSrc}` : JSON.stringify(r).slice(0,100))}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>` : ''}
  </div>

  <!-- 5. SEO -->
  <div class="section">
    <div class="section-header">
      <span class="section-icon">🔍</span>
      <h2 class="section-title">SEO Audit</h2>
      <span class="section-badge"><span class="badge ${seoPages.reduce((s,p)=>s+(p.issues?.filter(i=>i.severity==='critical').length??0),0)>0?'fail':'pass'}">${seoPages.reduce((s,p)=>s+(p.issues?.length??0),0)} issues</span></span>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>URL</th><th>Title</th><th>Description</th><th>Canonical</th><th>H1</th><th>Alt Missing</th><th>JSON-LD</th><th>Issues</th></tr></thead>
        <tbody>${buildSEOTable() || '<tr><td colspan="8" class="center muted">No data</td></tr>'}</tbody>
      </table>
    </div>
  </div>

  <!-- 6. CODE QUALITY -->
  <div class="section">
    <div class="section-header">
      <span class="section-icon">🧹</span>
      <h2 class="section-title">Code Quality & Bundle Analysis</h2>
    </div>
    <div class="two-col">
      <div>
        <h3 style="font-size:1rem;margin-bottom:0.75rem;">Bundle Chunks</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Chunk</th><th>Type</th><th>Size</th><th>Status</th></tr></thead>
            <tbody>${buildBundleTable() || '<tr><td colspan="4" class="center muted">Run npm run build first</td></tr>'}</tbody>
          </table>
        </div>
      </div>
      <div>
        <h3 style="font-size:1rem;margin-bottom:0.75rem;">Heavy Dependencies</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Package</th><th>~Size</th><th>Note</th></tr></thead>
            <tbody>${(codeQuality.dependencyAnalysis?.flagged??[]).map(d=>`<tr><td class="mono">${d.package}</td><td class="mono warn-text">${d.sizeKb}KB</td><td class="muted">${d.note}</td></tr>`).join('') || '<tr><td colspan="3" class="center pass-text">✔ No heavy deps flagged</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>
    <h3 style="font-size:1rem;margin:1.5rem 0 0.75rem;">Source Code Issues</h3>
    <div class="table-wrap">
      <table>
        <thead><tr><th>File</th><th>Line</th><th>Type</th><th>Snippet</th></tr></thead>
        <tbody>${buildCodeIssues()}</tbody>
      </table>
    </div>
  </div>

</div>

<footer>
  <p>Voyage India Site Audit Framework v1.0 · Generated ${timestamp}</p>
  <p style="margin-top:0.5rem;">Stack: Playwright · Google Lighthouse · axe-core · Node.js</p>
</footer>

</body>
</html>`;
}

// ── Main report generator ───────────────────────────────────────────────────
export async function generateReport() {
  logger.section('MODULE 7 — Report Generator');

  const data   = store.get();
  const health = computeHealthScore(data);
  const ts     = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  if (!existsSync(REPORTS_DIR)) mkdirSync(REPORTS_DIR, { recursive: true });

  // JSON
  const jsonPath = join(REPORTS_DIR, config.OUTPUT.JSON_FILE);
  writeFileSync(jsonPath, JSON.stringify({ health, ...data }, null, 2), 'utf8');
  logger.success(`JSON report written → ${jsonPath}`);

  // HTML
  const html     = generateHTML(data, health, ts);
  const htmlPath = join(REPORTS_DIR, config.OUTPUT.HTML_FILE);
  writeFileSync(htmlPath, html, 'utf8');
  logger.success(`HTML report written → ${htmlPath}`);

  // Console summary
  logger.section('FINAL AUDIT SUMMARY');
  console.log(`  Overall Health Score : ${health.score} / 100`);
  console.log(`  Verdict              : ${health.score >= 85 ? '✔ PASS' : health.score >= 65 ? '⚠ NEEDS WORK' : '✖ FAIL'}`);
  console.log(`  Pages Audited        : ${data.crawl.pages.length}`);
  console.log(`  Broken Links         : ${data.crawl.brokenLinks.length}`);
  console.log(`  Console Errors       : ${data.crawl.consoleErrors.length}`);
  console.log(`  A11y Violations      : ${data.accessibility.pages.reduce((s,p)=>s+(p.violationCount??0),0)}`);
  console.log(`  Security Headers     : ${data.security.headers?.missing?.length ?? '?'} missing`);
  console.log(`  SEO Issues           : ${data.seo.pages.reduce((s,p)=>s+(p.issues?.length??0),0)}`);
  console.log(`  Code Issues          : ${data.codeQuality.sourceIssues?.issues?.reduce((s,f)=>s+f.issues.length,0) ?? 0}`);

  return { jsonPath, htmlPath, health };
}

// ── Standalone entry ──────────────────────────────────────────────────────
if (process.argv[1].endsWith('07_reporter.js')) {
  generateReport().then(() => process.exit(0)).catch(err => {
    logger.error(err.message);
    process.exit(1);
  });
}
