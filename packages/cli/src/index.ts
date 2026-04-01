import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import {
  run,
  DEFAULT_CONFIG,
  CONFIG_FILE,
  generateWorkflowTemplates,
  setCurrentTask,
  addMemoryEntry,
} from '@context-pilot-v1/core';
import type { SelectionResult } from '@context-pilot-v1/core';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

function formatPct(used: number, budget: number): string {
  return ((used / budget) * 100).toFixed(1) + '%';
}

function printScanSummary(result: SelectionResult): void {
  const { included, excluded, totalTokens, budget } = result;
  const pct = formatPct(totalTokens, budget);
  const budgetColor = totalTokens > budget * 0.9 ? chalk.yellow : chalk.green;

  console.log('');
  console.log(chalk.bold('  Context Pilot — Scan complete'));
  console.log('  ' + chalk.dim('─'.repeat(50)));
  console.log(
    `  ${chalk.bold('Tokens:')} ${budgetColor(formatNumber(totalTokens))} / ${formatNumber(budget)} ${chalk.dim(`(${pct} used)`)}`
  );
  console.log(
    `  ${chalk.bold('Files included:')} ${chalk.green(String(included.length))}   ${chalk.bold('Excluded:')} ${chalk.dim(String(excluded.length))}`
  );
  console.log('');
  console.log(
    `  ${chalk.green('✔')} ${chalk.bold('CONTEXT.md')} and ${chalk.bold('ARCHITECTURE.md')} written.`
  );
  console.log('');
}

function printBudgetTable(result: SelectionResult): void {
  const { included, excluded, totalTokens, budget } = result;
  const allFiles = [...included, ...excluded].sort((a, b) => b.score - a.score);

  const colWidths = { path: 42, score: 7, tokens: 9, status: 10 };

  const header =
    chalk.bold(
      '  ' +
        'File'.padEnd(colWidths.path) +
        'Score'.padStart(colWidths.score) +
        'Tokens'.padStart(colWidths.tokens) +
        'Status'.padStart(colWidths.status)
    );

  console.log('');
  console.log(chalk.bold('  Context Pilot — Token Budget'));
  console.log('  ' + chalk.dim('─'.repeat(70)));
  console.log(header);
  console.log('  ' + chalk.dim('─'.repeat(70)));

  for (const file of allFiles) {
    const isIncluded = included.includes(file);
    const shortPath =
      file.relativePath.length > colWidths.path - 3
        ? '…' + file.relativePath.slice(-(colWidths.path - 3))
        : file.relativePath;
    const scoreStr = (file.score * 100).toFixed(0) + '/100';
    const tokenStr = formatNumber(file.tokenCount);
    const statusStr = isIncluded ? chalk.green('included') : chalk.dim('excluded');

    console.log(
      '  ' +
        shortPath.padEnd(colWidths.path) +
        scoreStr.padStart(colWidths.score) +
        tokenStr.padStart(colWidths.tokens) +
        ('  ' + statusStr).padStart(colWidths.status + 2)
    );
  }

  console.log('  ' + chalk.dim('─'.repeat(70)));
  console.log(
    `  ${chalk.bold('Total included:')} ${chalk.green(formatNumber(totalTokens))} / ${formatNumber(budget)} tokens ${chalk.dim(`(${formatPct(totalTokens, budget)} of budget)`)}`
  );
  console.log('');
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI definition
// ─────────────────────────────────────────────────────────────────────────────

const program = new Command();

program
  .name('context-pilot')
  .description('Context Pilot — Free Claude Code Workflow AI OS')
  .version('0.2.0');

// ── scan ──────────────────────────────────────────────────────────────────────

program
  .command('scan [dir]')
  .description('Scan project and write CONTEXT.md + ARCHITECTURE.md')
  .option('-b, --budget <tokens>', 'Override token budget (default: 40000)', parseInt)
  .option('--json', 'Output raw JSON instead of human-readable summary')
  .option('-w, --watch', 'Watch for file changes and auto-rescan')
  .action(async (dir: string | undefined, opts: { budget?: number; json?: boolean; watch?: boolean }) => {
    const root = path.resolve(dir ?? '.');

    // Run the initial scan
    if (!opts.json) {
      const spinner = ora({ text: chalk.dim('Scanning project…'), color: 'cyan' }).start();

      let result: SelectionResult;
      try {
        const runOpts: any = { root, export: true };
        if (opts.budget !== undefined) runOpts.budget = opts.budget;
        result = await run(runOpts);
      } catch (err) {
        spinner.fail(chalk.red('Scan failed: ' + String(err)));
        process.exitCode = 1;
        return;
      }

      spinner.stop();
      printScanSummary(result);
    } else {
      let result: SelectionResult;
      try {
        const runOpts: any = { root, export: true };
        if (opts.budget !== undefined) runOpts.budget = opts.budget;
        result = await run(runOpts);
      } catch (err) {
        process.stderr.write(JSON.stringify({ error: String(err) }) + '\n');
        process.exitCode = 1;
        return;
      }
      process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    }

    // Watch mode
    if (opts.watch) {
      console.log(chalk.cyan('  👁  Watch mode active — press Ctrl+C to stop'));
      console.log(chalk.dim('  Watching src/ for changes…'));
      console.log('');

      // Dynamic import to avoid loading chokidar when not needed
      const { watch } = await import('chokidar');

      let debounceTimer: ReturnType<typeof setTimeout> | null = null;
      let isScanning = false;

      const watcher = watch(root, {
        ignored: [
          '**/node_modules/**',
          '**/dist/**',
          '**/.git/**',
          '**/build/**',
          '**/.next/**',
          '**/coverage/**',
          '**/CONTEXT.md',
          '**/ARCHITECTURE.md',
          '**/.contextpilot/**',
        ],
        persistent: true,
        ignoreInitial: true,
      });

      const rescan = async () => {
        if (isScanning) return;
        isScanning = true;

        const spinner = ora({ text: chalk.dim('Re-scanning…'), color: 'cyan' }).start();
        try {
          const runOpts: any = { root, export: true };
          if (opts.budget !== undefined) runOpts.budget = opts.budget;
          const result = await run(runOpts);
          spinner.stop();
          const pct = formatPct(result.totalTokens, result.budget);
          console.log(
            chalk.green('  ✅ Context updated') +
            chalk.dim(` (${new Date().toLocaleTimeString()}) — `) +
            `${formatNumber(result.totalTokens)} tokens (${pct}) · ${result.included.length} files`
          );
        } catch (err) {
          spinner.fail(chalk.red('Re-scan failed: ' + String(err)));
        } finally {
          isScanning = false;
        }
      };

      watcher.on('all', (_event: string, _filePath: string) => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(rescan, 500);
      });

      // Keep the process alive
      process.on('SIGINT', () => {
        watcher.close();
        console.log('\n' + chalk.dim('  Watch mode stopped.'));
        process.exit(0);
      });
    }
  });

// ── budget ────────────────────────────────────────────────────────────────────

program
  .command('budget [dir]')
  .description('Show token breakdown per file — no files are written')
  .option('--json', 'Output raw JSON instead of table')
  .action(async (dir: string | undefined, opts: { json?: boolean }) => {
    const root = path.resolve(dir ?? '.');

    if (!opts.json) {
      const spinner = ora({ text: chalk.dim('Analysing token budget…'), color: 'cyan' }).start();

      let result: SelectionResult;
      try {
        result = await run({ root, export: false });
      } catch (err) {
        spinner.fail(chalk.red('Failed: ' + String(err)));
        process.exitCode = 1;
        return;
      }

      spinner.stop();
      printBudgetTable(result);
    } else {
      let result: SelectionResult;
      try {
        result = await run({ root, export: false });
      } catch (err) {
        process.stderr.write(JSON.stringify({ error: String(err) }) + '\n');
        process.exitCode = 1;
        return;
      }
      process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    }
  });

// ── init ──────────────────────────────────────────────────────────────────────

program
  .command('init')
  .description('Create .contextpilot.json with default settings in the current directory')
  .option('--json', 'Output result as JSON')
  .action((opts: { json?: boolean }) => {
    const configPath = path.join(process.cwd(), CONFIG_FILE);

    if (fs.existsSync(configPath)) {
      const msg = `${CONFIG_FILE} already exists. Remove it first if you want to reset.`;
      if (opts.json) {
        process.stdout.write(JSON.stringify({ error: msg }) + '\n');
      } else {
        console.error(chalk.red('✖ ') + msg);
      }
      process.exitCode = 1;
      return;
    }

    const content = JSON.stringify(DEFAULT_CONFIG, null, 2) + '\n';
    fs.writeFileSync(configPath, content, 'utf-8');

    if (opts.json) {
      process.stdout.write(JSON.stringify({ created: configPath }) + '\n');
    } else {
      console.log('');
      console.log(chalk.green('✔ ') + chalk.bold(`Created ${CONFIG_FILE}`));
      console.log(chalk.dim(`  Path: ${configPath}`));
      console.log('');
      console.log(chalk.dim('  Edit it to pin files, set a budget, or add ignore patterns.'));
      console.log('');
    }
  });

// ── init-workflow ─────────────────────────────────────────────────────────────

program
  .command('init-workflow')
  .description('Scaffold the full AI workflow stack in the current directory')
  .option('--json', 'Output result as JSON')
  .action((opts: { json?: boolean }) => {
    const root = process.cwd();

    const result = generateWorkflowTemplates(root);

    if (opts.json) {
      process.stdout.write(JSON.stringify(result, null, 2) + '\n');
      return;
    }

    console.log('');
    console.log(chalk.bold('  Context Pilot — Workflow initialized'));
    console.log('  ' + chalk.dim('─'.repeat(50)));

    if (result.created.length > 0) {
      console.log('');
      console.log(chalk.green('  Created:'));
      for (const file of result.created) {
        console.log(`    ${chalk.green('+')} ${file}`);
      }
    }

    if (result.skipped.length > 0) {
      console.log('');
      console.log(chalk.dim('  Skipped (already exist):'));
      for (const file of result.skipped) {
        console.log(`    ${chalk.dim('·')} ${file}`);
      }
    }

    console.log('');
    console.log(chalk.dim('  Next steps:'));
    console.log(chalk.dim('    1. Run ') + chalk.cyan('context-pilot scan') + chalk.dim(' to generate context'));
    console.log(chalk.dim('    2. Run ') + chalk.cyan('context-pilot task "your task"') + chalk.dim(' to set a task'));
    console.log(chalk.dim('    3. Open your AI tool and start coding!'));
    console.log('');
  });

// ── task ──────────────────────────────────────────────────────────────────────

program
  .command('task <description>')
  .description('Set the current AI task in AI-TASK.md')
  .action((description: string) => {
    const root = process.cwd();

    setCurrentTask(root, description);

    console.log('');
    console.log(chalk.green('  ✔ ') + chalk.bold('Task set'));
    console.log(chalk.dim(`    "${description}"`));
    console.log('');
    console.log(chalk.dim('    File: AI-TASK.md'));
    console.log('');
  });

// ── memory ───────────────────────────────────────────────────────────────────

const memoryCmd = program
  .command('memory')
  .description('Manage persistent AI memory (AI-MEMORY.md)');

memoryCmd
  .command('add <entry...>')
  .description('Add an entry to AI memory')
  .action((entryParts: string[]) => {
    const root = process.cwd();
    const entry = entryParts.join(' ');

    addMemoryEntry(root, entry);

    console.log('');
    console.log(chalk.green('  ✔ ') + chalk.bold('Memory entry added'));
    console.log(chalk.dim(`    "${entry}"`));
    console.log('');
    console.log(chalk.dim('    File: AI-MEMORY.md'));
    console.log('');
  });

// ─────────────────────────────────────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────────────────────────────────────

program.parse(process.argv);
