// @ts-nocheck
// HashiCorp Vault HTTP API — https://developer.hashicorp.com/vault/api-docs
// Base: {address}/v1/...
// Auth: X-Vault-Token (periodic token or from AppRole login)

export interface VaultCredentials {
  address: string;
  namespace?: string;
  token?: string;
  roleId?: string;
  secretId?: string;
}

export interface VaultResponse {
  ok: boolean;
  status: number;
  data: unknown;
}

export const VAULT_CONNECT_ERROR =
  'Vault credentials are required. Connect Vault with JSON {"address":"https://vault.example.com:8200","roleId":"...","secretId":"..."} (recommended AppRole) or {"address":"...","token":"..."} for a limited periodic token. Optional "namespace" for Enterprise namespaces.';

export function parseVaultCredentials(
  vaultCredentials: string | undefined,
  options?: { addressOnly?: boolean },
): VaultCredentials {
  if (!vaultCredentials) {
    throw new Error(VAULT_CONNECT_ERROR);
  }
  let parsed: Partial<VaultCredentials>;
  try {
    parsed = JSON.parse(vaultCredentials);
  } catch {
    throw new Error(
      'Vault credentials must be valid JSON like {"address":"https://vault.example.com:8200","roleId":"...","secretId":"..."}',
    );
  }
  if (!parsed.address) {
    throw new Error('Vault credentials must include address (Vault API URL)');
  }
  const creds: VaultCredentials = {
    address: String(parsed.address).trim().replace(/\/+$/, ''),
    namespace: parsed.namespace ? String(parsed.namespace).trim() : undefined,
    token: parsed.token ? String(parsed.token).trim() : undefined,
    roleId: parsed.roleId ? String(parsed.roleId).trim() : undefined,
    secretId: parsed.secretId ? String(parsed.secretId).trim() : undefined,
  };
  if (options?.addressOnly) {
    return creds;
  }
  if (!creds.token && !(creds.roleId && creds.secretId)) {
    throw new Error(
      'Vault credentials must include either token or both roleId and secretId (AppRole)',
    );
  }
  return creds;
}

function vaultUrl(credentials: VaultCredentials, path: string): string {
  const base = credentials.address.replace(/\/v1\/?$/i, '');
  return `${base}/v1${path.startsWith('/') ? path : `/${path}`}`;
}

async function loginAppRole(credentials: VaultCredentials): Promise<string> {
  const url = vaultUrl(credentials, '/auth/approle/login');
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (credentials.namespace) {
    headers['X-Vault-Namespace'] = credentials.namespace;
  }
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      role_id: credentials.roleId,
      secret_id: credentials.secretId,
    }),
  });
  const raw = await response.text();
  let data: any = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = { error: raw };
    }
  }
  if (!response.ok) {
    throw new Error(
      data?.errors?.[0] ?? data?.error ?? `AppRole login failed (${response.status})`,
    );
  }
  const token = data?.auth?.client_token;
  if (!token) {
    throw new Error('AppRole login did not return client_token');
  }
  return token;
}

async function resolveVaultToken(credentials: VaultCredentials): Promise<string> {
  if (credentials.token) {
    return credentials.token;
  }
  return loginAppRole(credentials);
}

/** Call the Vault HTTP API (resolves AppRole or uses token). */
export async function vaultRequest(
  vaultCredentials: string | undefined,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
    skipAuth?: boolean;
    addressOnly?: boolean;
  },
): Promise<VaultResponse> {
  let credentials: VaultCredentials;
  try {
    credentials = parseVaultCredentials(vaultCredentials, {
      addressOnly: options?.addressOnly,
    });
  } catch (error) {
    return {
      ok: false,
      status: 401,
      data: { error: error instanceof Error ? error.message : VAULT_CONNECT_ERROR },
    };
  }

  const url = new URL(vaultUrl(credentials, path));
  if (options?.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (credentials.namespace) {
    headers['X-Vault-Namespace'] = credentials.namespace;
  }

  if (!options?.skipAuth) {
    try {
      const token = await resolveVaultToken(credentials);
      headers['X-Vault-Token'] = token;
    } catch (error) {
      return {
        ok: false,
        status: 401,
        data: { error: error instanceof Error ? error.message : 'Vault authentication failed' },
      };
    }
  }

  const method = options?.method ?? 'GET';
  const fetchOptions: RequestInit = { method, headers };
  if (options?.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url.toString(), fetchOptions);
    const raw = await response.text();
    let data: unknown = null;
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }
    }
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: { error: error instanceof Error ? error.message : 'Vault request failed' },
    };
  }
}

export function failedResult(action: string, result: VaultResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toVaultError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}

/** Normalize KV mount path (no leading/trailing slashes). */
export function normalizeMount(mount: string): string {
  return mount.replace(/^\/+|\/+$/g, '');
}

/** Normalize secret path within a mount. */
export function normalizeSecretPath(path: string): string {
  return path.replace(/^\/+/, '');
}
