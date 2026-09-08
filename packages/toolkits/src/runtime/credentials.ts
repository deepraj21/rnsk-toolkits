import type { ToolkitManifest } from '../core/types.js';
import type { ToolRegistry } from './registry.js';

export interface CredentialResolver {
  getToken: (tokenField: string) => Promise<string | null>;
  getServiceEnv: (envName: string) => string | undefined;
}

export interface MetaToolPolicyResult {
  allowed: boolean;
  error?: string;
  reason?: string;
}

export interface MetaToolHooks {
  checkToolPolicy?: (toolName: string) => MetaToolPolicyResult;
  sanitizeToolResult?: (result: unknown) => unknown;
  sanitizeToolPayload?: (payload: Record<string, unknown>) => Record<string, unknown>;
  isWebSearchEnabled?: () => boolean;
  getAppUrl?: () => string;
  getProviderSlugs?: () => string[];
  isToolkitAvailable?: (toolkitId: string) => { available: boolean; reason?: string };
}

export function registerAllToolsFromManifests(
  registry: ToolRegistry,
  manifests: ToolkitManifest[],
  options?: { skipUnavailable?: boolean; isToolkitAvailable?: (id: string) => boolean },
): void {
  for (const manifest of manifests) {
    if (options?.skipUnavailable && options.isToolkitAvailable && !options.isToolkitAvailable(manifest.id)) {
      continue;
    }
    for (const toolDef of manifest.tools) {
      registry.register(toolDef.name, toolDef.description ?? toolDef.tool.description ?? '', toolDef.tool, {
        requiredAuth: toolDef.requiredAuth,
        scope: toolDef.scope,
        toolkitId: manifest.id,
      });
    }
  }
}
