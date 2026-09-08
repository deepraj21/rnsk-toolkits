import type { ToolkitManifest, ToolDefinition } from './types.js';

export function defineToolkit(manifest: ToolkitManifest): ToolkitManifest {
  return manifest;
}

export function defineTool(def: ToolDefinition): ToolDefinition {
  return def;
}

export function toolkitCamelId(id: string): string {
  return id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}
