import * as fs from 'fs';
import * as path from 'path';
import type { ContextConfig } from '@context-pilot-v1/shared';
import { DEFAULT_CONFIG, CONFIG_FILE } from '@context-pilot-v1/shared';

/**
 * Read .contextpilot.json from the project root.
 * Deep-merges with DEFAULT_CONFIG so partial configs work correctly.
 * Returns DEFAULT_CONFIG if no config file exists.
 */
export function readConfig(root: string): ContextConfig {
  const configPath = path.join(path.resolve(root), CONFIG_FILE);

  if (!fs.existsSync(configPath)) {
    return { ...DEFAULT_CONFIG };
  }

  let raw: string;
  try {
    raw = fs.readFileSync(configPath, 'utf-8');
  } catch (err) {
    process.stderr.write(`[context-pilot] Warning: could not read ${configPath}: ${String(err)}\n`);
    return { ...DEFAULT_CONFIG };
  }

  let parsed: Partial<ContextConfig>;
  try {
    parsed = JSON.parse(raw) as Partial<ContextConfig>;
  } catch (err) {
    throw new Error(`Invalid JSON in ${configPath}: ${String(err)}`);
  }

  return {
    budget: parsed.budget ?? DEFAULT_CONFIG.budget,
    ignorePaths: [
      ...DEFAULT_CONFIG.ignorePaths,
      ...(parsed.ignorePaths ?? []),
    ],
    pinnedFiles: parsed.pinnedFiles ?? DEFAULT_CONFIG.pinnedFiles,
    fileTypePriorities: {
      ...DEFAULT_CONFIG.fileTypePriorities,
      ...(parsed.fileTypePriorities ?? {}),
    },
    scoringWeights: {
      ...DEFAULT_CONFIG.scoringWeights,
      ...(parsed.scoringWeights ?? {}),
    },
  };
}
