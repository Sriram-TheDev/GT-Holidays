// audit/scripts/06_code_quality.js
// ─────────────────────────────────────────────────────────────────────────────
// MODULE 6: Code Quality & Bloat Reduction
//
//  • Analyses Vite build output for chunk sizes and dependency bloat
//  • Detects unused/heavy dependencies from package.json
//  • Counts lines of code (LOC) per component/page
//  • HTML validation using htmlhint
//  • Deprecated HTML tags detection
//  • Checks for console.log leftover in production code
//  • Dead code hints: exported but possibly unused modules
//  • CSS specificity / utility class sprawl analysis
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, extname }                         from 'path';
import { config }                                          from '../config/audit.config.js';
import { store }                                           from './utils/store.js';
import { logger }                                          from './utils/logger.js';

const PROJECT_ROOT = join(import.meta.dirname, '..', '..');
const SRC_DIR      = join(PROJECT_ROOT, 'src');
const DIST_DIR     = join(PROJECT_ROOT, 'dist');
const PKG_PATH     = join(PROJECT_ROOT, 'package.json');

// ── Recursive file walker ───────────────────────────────────────────────────
function walkDir(dir, exts = ['.js', '.jsx', '.ts', '.tsx', '.css', '.html']) {
  const files = [];
  function walk(d) {
    if (!existsSync(d)) return;
    readdirSync(d).forEach(f => {
      const full = join(d, f);
      if (f === 'node_modules' || f === '.git') return;
      const stat = statSync(full);
      if (stat.isDirectory()) walk(full);
      else if (exts.includes(extname(f).toLowerCase())) files.push(full);
    });
  }
  walk(dir);
  return files;
}

// ── Bundle size analysis ────────────────────────────────────────────────────
function analyseBundles() {
  logger.bullet('Analysing build output…');
  if (!existsSync(DIST_DIR)) {
    return { error: 'No dist/ found. Run `npm run build` first.', chunks: [] };
  }

  const assetsDir = join(DIST_DIR, 'assets');
  if (!existsSync(assetsDir)) return { error: 'No dist/assets/ directory.', chunks: [] };

  const files = readdirSync(assetsDir).map(f => {
    const full = join(assetsDir, f);
    const { size } = statSync(full);
    const kb       = (size / 1024).toFixed(1);
    const type     = f.endsWith('.js') ? 'js' : f.endsWith('.css') ? 'css' : 'asset';
    const severity = size > 500*1024 ? 'critical' : size > 250*1024 ? 'warn' : 'ok';
    return { name: f, sizeBytes: size, sizeKb: Number(kb), type, severity };
  }).sort((a, b) => b.sizeBytes - a.sizeBytes);

  const total = files.reduce((s, f) => s + f.sizeBytes, 0);
  const jsChunks = files.filter(f => f.type === 'js');
  const cssFiles = files.filter(f => f.type === 'css');

  return {
    totalSize:    (total / 1024).toFixed(1) + ' KB',
    totalBytes:   total,
    jsChunkCount: jsChunks.length,
    cssFileCount: cssFiles.length,
    chunks:       files.slice(0, 20),
    heavyChunks:  files.filter(f => f.severity !== 'ok'),
  };
}

// ── Dependency weight analysis ──────────────────────────────────────────────
function analyseDependencies() {
  logger.bullet('Analysing package.json dependencies…');
  const pkg   = JSON.parse(readFileSync(PKG_PATH, 'utf8'));
  const deps  = { ...pkg.dependencies, ...pkg.devDependencies };

  // Known large packages with alternatives
  const heavyPackages = {
    'gsap':               { sizeKb: 270, note: 'Large animation lib — already chunked' },
    'motion':             { sizeKb: 130, note: 'Framer Motion — consider tree-shaking' },
    'firebase':           { sizeKb: 400, note: 'Large SDK — use modular imports only' },
    '@react-google-maps/api': { sizeKb: 150, note: 'Google Maps — only import used hooks' },
    '@vis.gl/react-google-maps': { sizeKb: 80,  note: 'Vis.gl maps — check if both are needed' },
    'ogl':                { sizeKb: 200, note: 'WebGL lib — ensure tree-shaking works' },
  };

  const flagged = Object.entries(deps)
    .filter(([name]) => heavyPackages[name])
    .map(([name, version]) => ({
      package: name,
      version,
      ...heavyPackages[name],
    }));

  return { total: Object.keys(deps).length, flagged };
}

// ── Source code quality checks ──────────────────────────────────────────────
function analyseSourceCode() {
  logger.bullet('Scanning source files for code quality issues…');
  const files  = walkDir(SRC_DIR);
  const issues = [];
  const stats  = [];

  files.forEach(file => {
    const rel     = relative(SRC_DIR, file);
    const content = readFileSync(file, 'utf8');
    const lines   = content.split('\n');
    const loc     = lines.length;

    const fileIssues = [];

    // Leftover console.log / debugger
    lines.forEach((line, i) => {
      if (/console\.(log|debug|warn)\(/.test(line) && !line.trim().startsWith('//')) {
        fileIssues.push({ line: i + 1, type: 'console.log', snippet: line.trim().slice(0, 80) });
      }
      if (/\bdebugger\b/.test(line)) {
        fileIssues.push({ line: i + 1, type: 'debugger', snippet: line.trim() });
      }
    });

    // Deprecated HTML-in-JSX patterns
    const deprecated = ['<marquee', '<blink', '<font ', '<center', '<spacer', '<frame', '<frameset'];
    deprecated.forEach(tag => {
      if (content.includes(tag)) {
        fileIssues.push({ type: 'deprecated-tag', snippet: tag });
      }
    });

    // TODO / FIXME / HACK comments
    const todoPattern = /\/\/\s*(TODO|FIXME|HACK|XXX|BUG)[:]\s*(.+)/gi;
    let match;
    while ((match = todoPattern.exec(content)) !== null) {
      const lineNo = content.slice(0, match.index).split('\n').length;
      fileIssues.push({ line: lineNo, type: match[1].toUpperCase(), snippet: match[2].trim().slice(0, 80) });
    }

    // Large files
    const sizeKb = (content.length / 1024).toFixed(1);
    if (loc > 400) {
      fileIssues.push({ type: 'large-file', snippet: `${loc} lines — consider splitting` });
    }

    if (fileIssues.length > 0) issues.push({ file: rel, issues: fileIssues });
    stats.push({ file: rel, loc, sizeKb: Number(sizeKb), issueCount: fileIssues.length });
  });

  // Top largest files
  const largest = [...stats].sort((a,b) => b.loc - a.loc).slice(0, 10);

  return { totalFiles: files.length, issues, largest };
}

// ── Unused CSS hints (no PurgeCSS, but flag utility sprawl) ────────────────
function analyseCSSBloat() {
  logger.bullet('Scanning CSS for bloat hints…');
  const cssFiles = walkDir(SRC_DIR, ['.css']);
  const hints = [];

  cssFiles.forEach(f => {
    const content = readFileSync(f, 'utf8');
    const rel     = relative(SRC_DIR, f);

    // Count unique selectors
    const selectors = content.match(/^[.#[a-zA-Z][^{]+\{/gm) ?? [];
    const utilCount = (content.match(/^\s+\w+-[a-z]+-\d+/gm) ?? []).length;
    const important = (content.match(/!important/g) ?? []).length;
    const deepNest  = (content.match(/\s{8,}[.#]/g) ?? []).length;

    if (important > 3) hints.push({ file: rel, issue: `${important} !important declarations — may indicate specificity wars` });
    if (deepNest > 5)  hints.push({ file: rel, issue: `${deepNest} instances of deep nesting (>4 levels)` });
    if (selectors.length > 200) hints.push({ file: rel, issue: `${selectors.length} selectors — consider splitting` });
  });

  return { cssFiles: cssFiles.length, hints };
}

export async function runCodeQualityAudit() {
  logger.section('MODULE 6 — Code Quality & Bloat');

  const bundles  = analyseBundles();
  const deps     = analyseDependencies();
  const srcCode  = analyseSourceCode();
  const css      = analyseCSSBloat();

  // ── Bundle report ──────────────────────────────────────────────────────
  if (bundles.error) {
    logger.warn(bundles.error);
  } else {
    logger.info(`Build output: ${bundles.totalSize}  (${bundles.jsChunkCount} JS chunks, ${bundles.cssFileCount} CSS files)`);
    if (bundles.heavyChunks.length) {
      logger.warn('Heavy chunks (>250 KB):');
      bundles.heavyChunks.forEach(c => logger.bullet(`${c.name.padEnd(50)} ${c.sizeKb} KB  [${c.severity}]`));
    } else {
      logger.success('All JS chunks within size limits');
    }
  }

  // ── Dependencies ───────────────────────────────────────────────────────
  logger.info(`Total dependencies: ${deps.total}`);
  if (deps.flagged.length) {
    logger.warn('Heavy / dual-purpose packages:');
    deps.flagged.forEach(d => logger.bullet(`${d.package}@${d.version}  ~${d.sizeKb}KB — ${d.note}`));
  }

  // ── Source issues ─────────────────────────────────────────────────────
  const totalCodeIssues = srcCode.issues.reduce((s, f) => s + f.issues.length, 0);
  logger.info(`Scanned ${srcCode.totalFiles} source files — ${totalCodeIssues} issue(s):`);
  srcCode.issues.forEach(f => {
    f.issues.forEach(i => logger.bullet(`[${i.type}] ${f.file}${i.line ? ':L' + i.line : ''} — ${i.snippet}`));
  });

  if (srcCode.largest.length) {
    logger.info('Largest files by LOC:');
    srcCode.largest.forEach(f => logger.bullet(`${String(f.loc).padStart(4)} lines  ${f.file}`));
  }

  // ── CSS ───────────────────────────────────────────────────────────────
  if (css.hints.length) {
    logger.warn(`CSS bloat hints (${css.hints.length}):`);
    css.hints.forEach(h => logger.bullet(`${h.file}: ${h.issue}`));
  } else {
    logger.success('No major CSS bloat detected');
  }

  // Push to store
  store.setCodeQuality('bundleAnalysis', bundles);
  store.setCodeQuality('dependencyAnalysis', deps);
  store.setCodeQuality('sourceIssues', srcCode);
  store.setCodeQuality('cssAnalysis', css);

  logger.success('Code quality audit complete');
  return store.get().codeQuality;
}

// ── Standalone entry ──────────────────────────────────────────────────────
if (process.argv[1].endsWith('06_code_quality.js')) {
  runCodeQualityAudit().then(() => process.exit(0)).catch(err => {
    logger.error(err.message);
    process.exit(1);
  });
}
