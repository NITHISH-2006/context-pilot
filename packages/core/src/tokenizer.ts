import * as fs from 'fs';
import type { Tiktoken } from 'tiktoken';

// ─────────────────────────────────────────────────────────────────────────────
// Singleton encoder — initialised once, reused for all token counting
// Never create a new encoder per call: initialisation costs ~200ms
// ─────────────────────────────────────────────────────────────────────────────

let _encoder: Tiktoken | null = null;

async function getEncoder(): Promise<Tiktoken> {
  if (_encoder !== null) return _encoder;

  // Dynamic import to support both ESM and CJS, and to allow test mocking
  const { get_encoding } = await import('tiktoken');

  // cl100k_base: used by GPT-4, GPT-4o, text-embedding-ada-002
  // Claude and Gemini are within ~5% accuracy on most code files
  _encoder = get_encoding('cl100k_base');
  return _encoder;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Count the number of tokens in a string using cl100k_base encoding.
 * Returns 0 for empty string.
 */
export async function countTokens(text: string): Promise<number> {
  if (text.length === 0) return 0;
  const encoder = await getEncoder();
  return encoder.encode(text).length;
}

/**
 * Count tokens in a file on disk.
 * Returns 0 if the file cannot be read (logs warning).
 */
export async function countFileTokens(filePath: string): Promise<number> {
  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    // Don't crash on unreadable files — just skip them
    process.stderr.write(`[context-pilot] Warning: could not read ${filePath}: ${String(err)}\n`);
    return 0;
  }
  return countTokens(content);
}

/**
 * Count tokens for multiple files.
 * Runs in batches to avoid memory pressure on large repos.
 * Returns Map<absolutePath, tokenCount>
 */
export async function countAllFileTokens(
  filePaths: string[],
  batchSize = 50
): Promise<Map<string, number>> {
  const results = new Map<string, number>();

  // Pre-initialise encoder before batching
  await getEncoder();

  for (let i = 0; i < filePaths.length; i += batchSize) {
    const batch = filePaths.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (filePath) => {
        const count = await countFileTokens(filePath);
        results.set(filePath, count);
      })
    );
  }

  return results;
}

/**
 * Release the encoder (call on process exit or in tests).
 * The tiktoken encoder holds WASM memory — freeing it prevents leaks in long-running processes.
 */
export function releaseEncoder(): void {
  if (_encoder !== null) {
    _encoder.free();
    _encoder = null;
  }
}
