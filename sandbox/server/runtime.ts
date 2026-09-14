// Shared sandbox state, built once per server start: the toolkit source,
// the tool registry, and the in-memory credential store.

import { randomUUID } from 'node:crypto';

import { createCredentialStore, type CredentialStore } from './credentials.js';
import { createToolRegistry, type ToolRegistry } from './registry.js';
import { loadToolkits, type ToolkitsApi } from './toolkits-source.js';

export interface SandboxRuntime {
  api: ToolkitsApi;
  registry: ToolRegistry;
  credentials: CredentialStore;
  /** Changes on every restart; the web UI polls it to refresh after you edit a toolkit. */
  bootId: string;
}

export async function createRuntime(): Promise<SandboxRuntime> {
  const api = await loadToolkits();
  const registry = createToolRegistry();
  api.registerAllTools(registry);
  return { api, registry, credentials: createCredentialStore(), bootId: randomUUID() };
}

export function findToolkit(runtime: SandboxRuntime, toolkitId: string) {
  return runtime.api.toolkits.find((toolkit) => toolkit.id === toolkitId);
}
