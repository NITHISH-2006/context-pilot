import * as fs from 'fs';
import * as path from 'path';
import { getTemplates, readTemplate } from './templates/index';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Directory name where workflow files are stored inside the project */
export const WORKFLOW_DIR = '.';

/** Mapping from template source filenames → output filenames */
const TEMPLATE_OUTPUT_MAP: Record<string, string> = {
  'ai-rules.md': 'AI-RULES.md',
  'ai-task.md': 'AI-TASK.md',
  'ai-memory.md': 'AI-MEMORY.md',
  'continue-config.json': '.continue/config.json',
  'dev.sh': 'dev.sh',
};

// ─────────────────────────────────────────────────────────────────────────────
// Generate workflow templates
// ─────────────────────────────────────────────────────────────────────────────

export interface WorkflowResult {
  /** Absolute path to the .contextpilot directory */
  workflowDir: string;
  /** List of files that were created (relative to project root) */
  created: string[];
  /** List of files that already existed and were skipped */
  skipped: string[];
}

/**
 * Generates the full workflow template stack in `<projectRoot>/.contextpilot/`.
 * Will NOT overwrite files that already exist — safe to run multiple times.
 */
export function generateWorkflowTemplates(projectRoot: string): WorkflowResult {
  const root = path.resolve(projectRoot);
  const workflowDir = path.join(root, WORKFLOW_DIR);

  // Ensure the output directory exists for nested files
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  const templates = getTemplates();
  const created: string[] = [];
  const skipped: string[] = [];

  for (const [templateFile, outputName] of Object.entries(TEMPLATE_OUTPUT_MAP)) {
    const outputPath = path.join(workflowDir, outputName);
    const relativePath = path.join(WORKFLOW_DIR, outputName);

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    if (fs.existsSync(outputPath)) {
      skipped.push(relativePath);
      continue;
    }

    // Read template content — use the template if available, otherwise skip
    if (templates[templateFile]) {
      const content = readTemplate(templateFile);
      fs.writeFileSync(outputPath, content, 'utf-8');
      created.push(relativePath);
    }
  }

  // Make dev.sh executable on unix systems
  const devShPath = path.join(workflowDir, 'dev.sh');
  if (fs.existsSync(devShPath)) {
    try {
      fs.chmodSync(devShPath, 0o755);
    } catch {
      // Windows doesn't support chmod — that's fine
    }
  }

  // Add .contextpilot entries to .gitignore if not already present
  ensureGitignoreEntries(root);

  return { workflowDir, created, skipped };
}

// ─────────────────────────────────────────────────────────────────────────────
// Task management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sets the current AI task in `AI-TASK.md`.
 * If the file doesn't exist, generates the workflow templates first.
 */
export function setCurrentTask(projectRoot: string, task: string): void {
  const root = path.resolve(projectRoot);
  const taskFile = path.join(root, WORKFLOW_DIR, 'AI-TASK.md');

  // Ensure workflow dir and templates exist
  if (!fs.existsSync(taskFile)) {
    generateWorkflowTemplates(root);
  }

  const now = new Date().toISOString().split('T')[0];

  const content = `# Current AI Task

> This file is managed by Context Pilot. Use \`context-pilot task "description"\` to update it.
> AI tools will read this file to understand what you're currently working on.

## Active Task

**${task}**

## Context

- **Priority:** Normal
- **Started:** ${now}
- **Related files:** (auto-detected from CONTEXT.md)

## Acceptance Criteria

- [ ] Task is clearly defined above
- [ ] Changes pass all existing tests
- [ ] New code has appropriate test coverage
- [ ] CONTEXT.md is regenerated after changes

## Notes

_Add any relevant context, constraints, or decisions here._
`;

  fs.writeFileSync(taskFile, content, 'utf-8');
}

// ─────────────────────────────────────────────────────────────────────────────
// Memory management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Appends a timestamped entry to `AI-MEMORY.md`.
 * If the file doesn't exist, generates the workflow templates first.
 */
export function addMemoryEntry(projectRoot: string, entry: string): void {
  const root = path.resolve(projectRoot);
  const memoryFile = path.join(root, WORKFLOW_DIR, 'AI-MEMORY.md');

  // Ensure workflow dir and templates exist
  if (!fs.existsSync(memoryFile)) {
    generateWorkflowTemplates(root);
  }

  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
  const memoryLine = `- **[${timestamp}]** ${entry}`;

  let content = fs.readFileSync(memoryFile, 'utf-8');

  // Insert before the MEMORY_ENTRIES_END marker
  const endMarker = '<!-- MEMORY_ENTRIES_END -->';
  if (content.includes(endMarker)) {
    content = content.replace(endMarker, `${memoryLine}\n${endMarker}`);
  } else {
    // Fallback: append to end of file
    content += `\n${memoryLine}\n`;
  }

  fs.writeFileSync(memoryFile, content, 'utf-8');
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ensures that .contextpilot AI files are in .gitignore.
 * Only the mutable files (task/memory) are git-ignored by default;
 * rules and config are meant to be committed.
 */
function ensureGitignoreEntries(root: string): void {
  const gitignorePath = path.join(root, '.gitignore');

  const entriesToAdd = [
    '# Context Pilot — mutable AI state (don\'t commit)',
    'AI-TASK.md',
    'AI-MEMORY.md',
  ];

  let content = '';
  if (fs.existsSync(gitignorePath)) {
    content = fs.readFileSync(gitignorePath, 'utf-8');
  }

  const linesToAdd = entriesToAdd.filter(line => !content.includes(line));

  if (linesToAdd.length > 0) {
    const addition = '\n' + linesToAdd.join('\n') + '\n';
    fs.appendFileSync(gitignorePath, addition, 'utf-8');
  }
}
