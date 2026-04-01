// Public API for @context-pilot/core
// All other packages import from here — never from internal modules directly

export { scanFiles, buildImportGraph, computeInDegree } from './scanner';
export { countTokens, countFileTokens, countAllFileTokens, releaseEncoder } from './tokenizer';
export { scoreFiles, computeScore, scoreByInDegree, scoreByRecency, scoreByFileType, scoreByPin } from './scorer';
export { selectFiles } from './selector';
export { exportContext } from './exporter';
export { readConfig } from './config';
export { generateWorkflowTemplates, setCurrentTask, addMemoryEntry, WORKFLOW_DIR } from './workflow';
export type { WorkflowResult } from './workflow';
export { getTemplates, readTemplate, getTemplateDir } from './templates/index';
export type { TemplateMap } from './templates/index';

// Re-export types from shared so consumers only need one import
export type {
  FileNode,
  ScanResult,
  SelectionResult,
  ContextConfig,
  ScoringWeights,
} from '@context-pilot-v1/shared';

export {
  DEFAULT_CONFIG,
  SUPPORTED_EXTENSIONS,
  CONTEXT_OUTPUT_FILE,
  ARCHITECTURE_OUTPUT_FILE,
  CONFIG_FILE,
} from '@context-pilot-v1/shared';

// ─────────────────────────────────────────────────────────────────────────────
// Convenience: run the full pipeline in one call
// ─────────────────────────────────────────────────────────────────────────────

import { scanFiles } from './scanner';
import { scoreFiles } from './scorer';
import { selectFiles } from './selector';
import { exportContext } from './exporter';
import { readConfig } from './config';
import type { SelectionResult } from '@context-pilot-v1/shared';

export interface RunOptions {
  /** Project root directory (default: process.cwd()) */
  root?: string;
  /** Override token budget from config */
  budget?: number;
  /** Write CONTEXT.md and ARCHITECTURE.md to disk (default: true) */
  export?: boolean;
}

/**
 * Run the full pipeline: scan → score → select → export.
 * This is the main entry point for the CLI and VS Code extension.
 */
export async function run(options: RunOptions = {}): Promise<SelectionResult> {
  const root = options.root ?? process.cwd();
  const config = readConfig(root);

  if (options.budget !== undefined) {
    config.budget = options.budget;
  }

  // 1. Scan the repository
  const scanResult = await scanFiles(root, config);

  // 2. Score all files
  const scoredFiles = scoreFiles(scanResult.files, config);

  // 3. Select files within budget
  const selection = selectFiles(scoredFiles, config.budget);

  // 4. Export to disk (default: yes)
  if (options.export !== false) {
    await exportContext(selection, root);
  }

  return selection;
}
