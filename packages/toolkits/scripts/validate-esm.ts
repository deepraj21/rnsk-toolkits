#!/usr/bin/env tsx
/**
 * ESM publish checks for @rnsk/toolkits.
 *
 * --source  Scan src/ for relative imports missing .js (fast, pre-build).
 * --dist    Import dist/index.js with native Node (post-build smoke test).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = path.join(packageRoot, 'src');
const distEntry = path.join(packageRoot, 'dist', 'index.js');

const mode = process.argv.includes('--dist') ? 'dist' : 'source';
const RELATIVE_IMPORT_RE = /(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\sfrom\s+)?['"](\.[^'"]+)['"]/g;

function collectSourceImportErrors(): string[] {
  const errors: string[] = [];

  function walk(dir: string): void {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const filePath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(filePath);
        continue;
      }
      if (!entry.name.endsWith('.ts')) continue;

      const content = fs.readFileSync(filePath, 'utf8');
      for (const match of content.matchAll(RELATIVE_IMPORT_RE)) {
        const specifier = match[1];
        if (specifier.endsWith('.js') || specifier.endsWith('.json')) continue;
        const rel = path.relative(srcRoot, filePath);
        errors.push(`${rel}: relative import "${specifier}" must end with .js for Node ESM`);
      }
    }
  }

  walk(srcRoot);
  return errors;
}

function validateDistImport(): string[] {
  if (!fs.existsSync(distEntry)) {
    return ['dist/index.js not found — run `npm run build` first'];
  }

  try {
    execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `import { toolkits, registerAllTools } from ${JSON.stringify(distEntry)}; if (!toolkits?.length) throw new Error('toolkits export is empty'); registerAllTools({ register() {} });`,
      ],
      { cwd: packageRoot, stdio: 'pipe', encoding: 'utf8' },
    );
    return [];
  } catch (error) {
    const err = error as { stderr?: string; stdout?: string; message?: string };
    const details = [err.stderr, err.stdout, err.message].filter(Boolean).join('\n').trim();
    return [`native Node import of dist/index.js failed:\n${details}`];
  }
}

const errors = mode === 'dist' ? validateDistImport() : collectSourceImportErrors();

if (errors.length > 0) {
  console.error(`ESM validation failed (${mode}):`);
  for (const err of errors) console.error(`  - ${err}`);
  process.exit(1);
}

if (mode === 'dist') {
  console.log('ESM dist import OK (native Node)');
} else {
  console.log('ESM source imports OK');
}
