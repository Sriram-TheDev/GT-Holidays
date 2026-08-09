// audit/scripts/utils/logger.js
// ─────────────────────────────────────────────────────────────────────────────
// Shared logger utility with severity levels and colour-coded console output.
// ─────────────────────────────────────────────────────────────────────────────

import chalk from 'chalk';

const ICONS = {
  info:    '●',
  success: '✔',
  warn:    '⚠',
  error:   '✖',
  section: '━',
  bullet:  '›',
};

function timestamp() {
  return chalk.dim(`[${new Date().toLocaleTimeString()}]`);
}

export const logger = {
  info:    (...args) => console.log(chalk.cyan(ICONS.info),    timestamp(), ...args),
  success: (...args) => console.log(chalk.green(ICONS.success),timestamp(), ...args),
  warn:    (...args) => console.log(chalk.yellow(ICONS.warn),  timestamp(), chalk.yellow(...args)),
  error:   (...args) => console.log(chalk.red(ICONS.error),    timestamp(), chalk.red(...args)),
  bullet:  (...args) => console.log(chalk.dim(ICONS.bullet),   '           ', ...args),

  section: (title) => {
    const line = ICONS.section.repeat(60);
    console.log('\n' + chalk.bold.blue(line));
    console.log(chalk.bold.white(`  ${title.toUpperCase()}`));
    console.log(chalk.bold.blue(line) + '\n');
  },

  table: (data, columns) => {
    if (!data || data.length === 0) {
      console.log(chalk.dim('  (no data)'));
      return;
    }
    const colKeys = columns || Object.keys(data[0]);
    const widths  = colKeys.map(k => Math.max(k.length, ...data.map(r => String(r[k] ?? '').length)));
    const header  = colKeys.map((k, i) => k.padEnd(widths[i])).join(' │ ');
    const sep     = widths.map(w => '─'.repeat(w)).join('─┼─');
    console.log('  ' + chalk.bold(header));
    console.log('  ' + chalk.dim(sep));
    data.forEach(row => {
      const line = colKeys.map((k, i) => String(row[k] ?? '').padEnd(widths[i])).join(' │ ');
      console.log('  ' + line);
    });
  },
};
