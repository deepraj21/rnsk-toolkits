export interface SplunkCredentials {
  baseUrl: string;
  username?: string;
  password?: string;
  token?: string;
}

/** splunkCredentials is the JSON blob injected by the framework under the manifest's tokenField. */
export function parseSplunkCredentials(splunkCredentials: string): SplunkCredentials {
  let parsed: Partial<SplunkCredentials>;
  try {
    parsed = JSON.parse(splunkCredentials) as Partial<SplunkCredentials>;
  } catch {
    throw new Error('Splunk credentials must be a JSON object with baseUrl plus username/password or token');
  }
  if (!parsed.baseUrl) {
    throw new Error('Splunk credentials must include baseUrl (e.g. https://splunk.example.com:8089)');
  }
  if (!parsed.token && (!parsed.username || !parsed.password)) {
    throw new Error('Splunk credentials must include a token or a username and password');
  }
  return {
    baseUrl: parsed.baseUrl.replace(/\/+$/, ''),
    username: parsed.username,
    password: parsed.password,
    token: parsed.token,
  };
}

const sessionCache = new Map<string, string>();

function cacheKey(creds: SplunkCredentials): string {
  return `${creds.baseUrl}::${creds.username ?? ''}`;
}

function extractSessionKey(body: string): string {
  try {
    const parsed = JSON.parse(body) as { sessionKey?: string };
    if (parsed.sessionKey) return parsed.sessionKey;
  } catch {
    // Fall through to XML parsing — /services/auth/login returns XML by default.
  }
  const match = body.match(/<sessionKey>([^<]+)<\/sessionKey>/);
  if (match) return match[1];
  throw new Error('Splunk login did not return a session key');
}

async function login(creds: SplunkCredentials): Promise<string> {
  const response = await fetch(`${creds.baseUrl}/services/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      username: creds.username ?? '',
      password: creds.password ?? '',
      output_mode: 'json',
    }).toString(),
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Splunk login failed: ${response.status} ${body.slice(0, 500)}`);
  }
  const sessionKey = extractSessionKey(body);
  sessionCache.set(cacheKey(creds), sessionKey);
  return sessionKey;
}

async function getAuthHeader(creds: SplunkCredentials): Promise<{ header: string; usesSession: boolean }> {
  if (creds.token) return { header: `Bearer ${creds.token}`, usesSession: false };
  const cached = sessionCache.get(cacheKey(creds));
  if (cached) return { header: `Splunk ${cached}`, usesSession: true };
  return { header: `Splunk ${await login(creds)}`, usesSession: true };
}

export type SplunkMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface SplunkRequestOptions {
  method?: SplunkMethod;
  /** Query params — output_mode=json is added automatically. */
  query?: Record<string, string | number | boolean | undefined>;
  /** Form-encoded POST body (Splunk management API expects form encoding). */
  form?: Record<string, string | number | boolean | undefined>;
  /** Return raw text instead of parsing JSON (e.g. export streaming). */
  rawText?: boolean;
}

export async function splunkRequest(
  splunkCredentials: string,
  path: string,
  options: SplunkRequestOptions = {},
): Promise<unknown> {
  const creds = parseSplunkCredentials(splunkCredentials);
  const buildQuery = (): string => {
    const params = new URLSearchParams({ output_mode: 'json' });
    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value !== undefined) params.set(key, String(value));
    }
    return params.toString();
  };
  const send = async (authHeader: string): Promise<Response> => {
    const headers: Record<string, string> = { Authorization: authHeader };
    let body: string | undefined;
    if (options.form !== undefined) {
      const form = new URLSearchParams();
      for (const [key, value] of Object.entries(options.form)) {
        if (value !== undefined) form.set(key, String(value));
      }
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      body = form.toString();
    }
    return fetch(`${creds.baseUrl}${path}?${buildQuery()}`, {
      method: options.method ?? 'GET',
      headers,
      body,
    });
  };

  const { header, usesSession } = await getAuthHeader(creds);
  let response = await send(header);
  // Session keys can expire server-side — re-login once and retry.
  if (response.status === 401 && usesSession) {
    sessionCache.delete(cacheKey(creds));
    response = await send(`Splunk ${await login(creds)}`);
  }
  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      `Splunk request failed: ${options.method ?? 'GET'} ${path} -> ${response.status} ${text.slice(0, 2000)}`,
    );
  }
  if (options.rawText) return text;
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export interface SplunkEntry {
  name?: string;
  id?: string;
  updated?: string;
  content?: Record<string, unknown>;
}

/** Unwrap the standard Splunk EAI list envelope { entry: [...] }. */
export function splunkEntries(data: unknown): SplunkEntry[] {
  if (data && typeof data === 'object' && Array.isArray((data as { entry?: unknown }).entry)) {
    return (data as { entry: SplunkEntry[] }).entry;
  }
  return [];
}

export function missingCredentialsError() {
  return { error: 'Splunk credentials are required. Connect Splunk first.' };
}
