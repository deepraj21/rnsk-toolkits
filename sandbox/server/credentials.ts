// In-memory credentials for the sandbox. Nothing is written to disk.
//
//   token → OAuth-style tokens keyed by a tool's requiredAuth field (e.g. githubToken).
//           Pasted in the UI, or set in .env.local by field name (githubToken=ghp_...).
//   env   → service env vars (e.g. FIRECRAWL_API_KEY). Pasted in the UI or set in .env.local.
//           Session values are also written to process.env because tools read it directly.

import type { ToolkitManifest } from './toolkits-source.js';

export type CredentialKind = 'token' | 'env';
export type CredentialSource = 'session' | 'env' | null;

export interface CredentialStore {
  getToken: (field: string) => Promise<string | null>;
  getServiceEnv: (name: string) => string | undefined;
  sourceOf: (kind: CredentialKind, name: string) => CredentialSource;
  set: (kind: CredentialKind, name: string, value: string) => void;
  clear: (kind: CredentialKind, name: string) => void;
}

export function createCredentialStore(): CredentialStore {
  const tokens = new Map<string, string>();
  const env = new Map<string, string>();
  // Values from .env.local / the shell, so clearing a pasted value restores them.
  const originalEnv = new Map<string, string | undefined>();

  const sourceOf = (kind: CredentialKind, name: string): CredentialSource => {
    const session = kind === 'token' ? tokens : env;
    if (session.has(name)) return 'session';
    const fromEnv = kind === 'env' ? originalEnv.get(name) ?? process.env[name] : process.env[name];
    return fromEnv ? 'env' : null;
  };

  return {
    async getToken(field) {
      return tokens.get(field) ?? process.env[field] ?? null;
    },
    getServiceEnv(name) {
      return env.get(name) ?? process.env[name];
    },
    sourceOf,
    set(kind, name, value) {
      if (kind === 'token') {
        tokens.set(name, value);
        return;
      }
      if (!originalEnv.has(name)) originalEnv.set(name, process.env[name]);
      env.set(name, value);
      process.env[name] = value;
    },
    clear(kind, name) {
      if (kind === 'token') {
        tokens.delete(name);
        return;
      }
      env.delete(name);
      if (originalEnv.has(name)) {
        const original = originalEnv.get(name);
        if (original === undefined) delete process.env[name];
        else process.env[name] = original;
      }
    },
  };
}

export interface CredentialField {
  kind: CredentialKind;
  name: string;
  description?: string;
  source: CredentialSource;
}

export function getCredentialFields(
  manifest: ToolkitManifest,
  store: CredentialStore,
): CredentialField[] {
  const { auth } = manifest;
  if (auth.type === 'service_env') {
    return auth.env.map((spec) => ({
      kind: 'env',
      name: spec.name,
      description: spec.description,
      source: store.sourceOf('env', spec.name),
    }));
  }
  if (auth.type === 'oauth2') {
    const fields = new Set<string>([auth.tokenField]);
    for (const tool of manifest.tools) if (tool.requiredAuth) fields.add(tool.requiredAuth);
    return [...fields].map((name) => ({
      kind: 'token',
      name,
      description: `Access token for ${manifest.displayName} (e.g. a personal access token). ${auth.provider.connectDescription}`,
      source: store.sourceOf('token', name),
    }));
  }
  return [];
}

export interface ToolkitStatus {
  /** Every credential the toolkit needs is present. */
  ready: boolean;
  missing: string[];
  hint?: string;
}

export function getToolkitStatus(manifest: ToolkitManifest, store: CredentialStore): ToolkitStatus {
  const missing = getCredentialFields(manifest, store)
    .filter((field) => !field.source)
    .map((field) => field.name);
  if (missing.length === 0) return { ready: true, missing };

  const hint =
    manifest.auth.type === 'service_env'
      ? `Set ${missing.join(', ')} in sandbox/.env.local or paste it in the Credentials panel.`
      : `Paste a ${missing.join(' / ')} in the Credentials panel (or set it in sandbox/.env.local).`;
  return { ready: false, missing, hint };
}

/** Names the UI may set; stops the credentials endpoint from overwriting arbitrary process.env keys. */
export function isKnownCredential(
  toolkits: ToolkitManifest[],
  store: CredentialStore,
  kind: CredentialKind,
  name: string,
): boolean {
  return toolkits.some((manifest) =>
    getCredentialFields(manifest, store).some((field) => field.kind === kind && field.name === name),
  );
}
