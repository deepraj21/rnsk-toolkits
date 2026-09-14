// Feature flag: which @rnsk/toolkits the sandbox runs against.
//
//   local (default) → packages/toolkits/src, loaded as TypeScript through tsx.
//                     No build step; saving a toolkit file restarts the server.
//   npm             → the published package, installed as the npm alias
//                     @rnsk/toolkits-published (what @rnsk/bot and Runstack ship with).
//
// Pick with `--toolkits=npm` (see `npm run sandbox:npm`) or TOOLKITS_SOURCE=npm.
// Everything else in the sandbox gets manifests *and* core helpers from here,
// so both always come from the same copy (no mixed zod instances).

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type * as LocalCore from '../../packages/toolkits/src/core/index.js';
import type * as LocalToolkits from '../../packages/toolkits/src/index.js';

export type ToolkitsSource = 'local' | 'npm';
export type ToolkitManifest = LocalCore.ToolkitManifest;

export interface ToolkitsApi {
  source: ToolkitsSource;
  version: string;
  toolkits: ToolkitManifest[];
  registerAllTools: typeof LocalToolkits.registerAllTools;
  core: Pick<
    typeof LocalCore,
    | 'coerceArguments'
    | 'extractParameterInfo'
    | 'getToolInputZodSchema'
    | 'resolveZodObjectShape'
    | 'toolInputToJsonSchema'
  > &
    Partial<Pick<typeof LocalCore, 'validateManifests'>>;
}

export function resolveToolkitsSource(argv = process.argv): ToolkitsSource {
  const flag = argv.find((arg) => arg.startsWith('--toolkits='))?.split('=')[1];
  const raw = (flag ?? process.env.TOOLKITS_SOURCE ?? 'local').trim().toLowerCase();
  if (raw === 'local' || raw === 'npm') return raw;
  throw new Error(`Toolkit source must be "local" or "npm" (got "${raw}").`);
}

function readVersion(packageJsonPath: string): string {
  return (JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { version: string }).version;
}

export async function loadToolkits(source = resolveToolkitsSource()): Promise<ToolkitsApi> {
  if (source === 'npm') {
    const index = (await import('@rnsk/toolkits-published')) as unknown as typeof LocalToolkits;
    const core = (await import('@rnsk/toolkits-published/core')) as unknown as typeof LocalCore;
    // import.meta.resolve → <pkg>/dist/index.js
    const entry = fileURLToPath(import.meta.resolve('@rnsk/toolkits-published'));
    return {
      source,
      version: readVersion(join(dirname(entry), '..', 'package.json')),
      toolkits: index.toolkits,
      registerAllTools: index.registerAllTools,
      core,
    };
  }

  const index = await import('../../packages/toolkits/src/index.js');
  const core = await import('../../packages/toolkits/src/core/index.js');
  return {
    source,
    version: readVersion(
      fileURLToPath(new URL('../../packages/toolkits/package.json', import.meta.url)),
    ),
    toolkits: index.toolkits,
    registerAllTools: index.registerAllTools,
    core,
  };
}
