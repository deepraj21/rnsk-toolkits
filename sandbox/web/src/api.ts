// Typed client for the sandbox server (all requests go through the Vite /api proxy).

import type { ToolkitIndexEntry } from '@rnsk/bot';

export type Health = {
  ok: true;
  bootId: string;
  toolkits: {
    source: 'local' | 'npm';
    version: string;
    count: number;
    toolCount: number;
    manifestErrors: string[];
  };
  llm:
    | { ok: true; provider: string; modelId: string; note?: string }
    | { ok: false; code: string; message: string; hint: string };
};

export type CredentialField = {
  kind: 'token' | 'env';
  name: string;
  description?: string;
  source: 'session' | 'env' | null;
};

export type ToolSummary = {
  name: string;
  description: string;
  scope: 'read' | 'write' | 'delete';
  requiredAuth?: string;
};

export type ToolkitSummary = {
  id: string;
  displayName: string;
  shortDescription: string;
  category: string;
  icon: { kind: string; dataUri: string };
  authType: 'none' | 'oauth2' | 'service_env' | 'api_key' | 'basic_auth' | 'bearer_token' | 'service_account';
  toolCount: number;
  status: { ready: boolean; missing: string[]; hint?: string };
  credentials: CredentialField[];
  meta: { homepage?: string; docsUrl?: string; since?: string };
  tools: ToolSummary[];
};


export type ToolDetail = {
  name: string;
  description: string;
  toolkitId: string;
  scope: string;
  requiredAuth?: string;
  input: Record<string, unknown>;
};

export type ToolRunResponse = Record<string, unknown> & {
  error?: string;
  message?: string;
  success?: boolean;
  durationMs?: number;
  result?: unknown;
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok && !(init?.method === 'POST' && url === '/api/tools/execute')) {
    throw new Error(body.error ?? `${res.status} ${res.statusText}`);
  }
  return body;
}

export const api = {
  health: () => request<Health>('/api/health'),
  toolkits: () => request<{ toolkits: ToolkitSummary[] }>('/api/toolkits').then((r) => r.toolkits),
  toolkitIndex: () => request<ToolkitIndexEntry[]>('/api/toolkit-index'),
  tool: (name: string) => request<ToolDetail>(`/api/tools/${encodeURIComponent(name)}`),
  execute: (toolName: string, args: Record<string, unknown>) =>
    request<ToolRunResponse>('/api/tools/execute', {
      method: 'POST',
      body: JSON.stringify({ toolName, args }),
    }),
  setCredential: (kind: CredentialField['kind'], name: string, value: string) =>
    request<{ ok: true }>('/api/credentials', {
      method: 'POST',
      body: JSON.stringify({ kind, name, value }),
    }),
  clearCredential: (kind: CredentialField['kind'], name: string) =>
    request<{ ok: true }>('/api/credentials', {
      method: 'DELETE',
      body: JSON.stringify({ kind, name }),
    }),
};
