// Set / clear toolkit credentials for this server session (memory only).

import { Router } from 'express';

import { isKnownCredential, type CredentialKind } from '../credentials.js';
import type { SandboxRuntime } from '../runtime.js';

function parseKind(value: unknown): CredentialKind | null {
  return value === 'token' || value === 'env' ? value : null;
}

export function createCredentialsRouter(runtime: SandboxRuntime): Router {
  const router = Router();
  const { credentials, api } = runtime;

  const validate = (kindRaw: unknown, name: unknown) => {
    const kind = parseKind(kindRaw);
    if (!kind || typeof name !== 'string' || !name) {
      return { error: 'Expected { kind: "token" | "env", name: string }' } as const;
    }
    if (!isKnownCredential(api.toolkits, credentials, kind, name)) {
      return { error: `"${name}" is not a credential any toolkit declares.` } as const;
    }
    return { kind, name } as const;
  };

  router.post('/api/credentials', (req, res) => {
    const { kind, name, value } = (req.body ?? {}) as Record<string, unknown>;
    const parsed = validate(kind, name);
    if ('error' in parsed) {
      res.status(400).json(parsed);
      return;
    }
    if (typeof value !== 'string' || !value.trim()) {
      res.status(400).json({ error: 'value must be a non-empty string' });
      return;
    }
    credentials.set(parsed.kind, parsed.name, value.trim());
    res.json({ ok: true });
  });

  router.delete('/api/credentials', (req, res) => {
    const { kind, name } = (req.body ?? {}) as Record<string, unknown>;
    const parsed = validate(kind, name);
    if ('error' in parsed) {
      res.status(400).json(parsed);
      return;
    }
    credentials.clear(parsed.kind, parsed.name);
    res.json({ ok: true });
  });

  // Legacy endpoint from the previous sandbox; kept so existing scripts keep working.
  router.post('/api/dev-token', (req, res) => {
    const { tokenField, token, envName, envValue } = (req.body ?? {}) as Record<string, unknown>;
    if (typeof tokenField === 'string' && typeof token === 'string' && token) {
      credentials.set('token', tokenField, token);
    }
    if (typeof envName === 'string' && typeof envValue === 'string' && envValue) {
      if (isKnownCredential(api.toolkits, credentials, 'env', envName)) {
        credentials.set('env', envName, envValue);
      }
    }
    res.json({ ok: true });
  });

  return router;
}
