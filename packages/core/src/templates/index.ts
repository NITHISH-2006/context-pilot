import * as fs from 'fs';
import * as path from 'path';

/**
 * Map of template filename → absolute path on disk.
 * Templates are .md, .json, and .sh files co-located in this directory.
 */
export interface TemplateMap {
  [filename: string]: string;
}

const TEMPLATE_DIR = path.join(__dirname, 'templates');

// Only include actual template files, not compiled JS/TS
const TEMPLATE_EXTENSIONS = ['.md', '.json', '.sh'];

/**
 * Dynamically discovers all template files in the templates directory.
 * Returns a map of `{ "ai-rules.md": "/abs/path/to/ai-rules.md", ... }`.
 */
export function getTemplates(): TemplateMap {
  const templates: TemplateMap = {};

  let entries: string[];
  try {
    entries = fs.readdirSync(TEMPLATE_DIR);
  } catch {
    return templates;
  }

  for (const entry of entries) {
    const ext = path.extname(entry).toLowerCase();
    if (TEMPLATE_EXTENSIONS.includes(ext)) {
      templates[entry] = path.join(TEMPLATE_DIR, entry);
    }
  }

  return templates;
}

/**
 * Reads a single template file and returns its content as a string.
 */
export function readTemplate(filename: string): string {
  const filePath = path.join(TEMPLATE_DIR, filename);
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Returns the absolute path to the templates directory.
 */
export function getTemplateDir(): string {
  return TEMPLATE_DIR;
}
