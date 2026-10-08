// @ts-nocheck
// CrowdStrike Falcon API — https://developer.crowdstrike.com/
// OAuth2 client credentials → Bearer token (30 min TTL)

export interface CrowdstrikeCredentials {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
}

export interface CrowdstrikeResponse {
  ok: boolean;
  status: number;
  data: unknown;
}

export const CROWDSTRIKE_CONNECT_ERROR =
  'CrowdStrike credentials are required. Connect with JSON {"clientId":"...","clientSecret":"...","baseUrl":"https://api.crowdstrike.com"} (or your cloud region host, e.g. api.us-2.crowdstrike.com).';

export function parseCrowdstrikeCredentials(
  crowdstrikeCredentials: string | undefined,
): CrowdstrikeCredentials {
  if (!crowdstrikeCredentials) {
    throw new Error(CROWDSTRIKE_CONNECT_ERROR);
  }
  let parsed: Partial<CrowdstrikeCredentials>;
  try {
    parsed = JSON.parse(crowdstrikeCredentials);
  } catch {
    throw new Error(
      'CrowdStrike credentials must be valid JSON with clientId, clientSecret, and optional baseUrl',
    );
  }
  if (!parsed.clientId || !parsed.clientSecret) {
    throw new Error('CrowdStrike credentials must include clientId and clientSecret');
  }
  return {
    clientId: String(parsed.clientId).trim(),
    clientSecret: String(parsed.clientSecret).trim(),
    baseUrl: (parsed.baseUrl
      ? String(parsed.baseUrl).trim()
      : 'https://api.crowdstrike.com'
    ).replace(/\/+$/, ''),
  };
}

async function fetchAccessToken(credentials: CrowdstrikeCredentials): Promise<string> {
  const body = new URLSearchParams({
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
  });
  const response = await fetch(`${credentials.baseUrl}/oauth2/token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
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
      data?.errors?.[0]?.message ??
        data?.error_description ??
        `CrowdStrike token request failed (${response.status})`,
    );
  }
  const token = data?.access_token;
  if (!token) {
    throw new Error('CrowdStrike token response missing access_token');
  }
  return token;
}

export async function crowdstrikeRequest(
  crowdstrikeCredentials: string | undefined,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
  },
): Promise<CrowdstrikeResponse> {
  let credentials: CrowdstrikeCredentials;
  try {
    credentials = parseCrowdstrikeCredentials(crowdstrikeCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 401,
      data: { error: error instanceof Error ? error.message : CROWDSTRIKE_CONNECT_ERROR },
    };
  }
  try {
    const token = await fetchAccessToken(credentials);
    const url = new URL(`${credentials.baseUrl}${path.startsWith('/') ? path : `/${path}`}`);
    if (options?.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value === undefined || value === null) continue;
        url.searchParams.set(key, String(value));
      }
    }
    const headers: Record<string, string> = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };
    const method = options?.method ?? 'GET';
    const fetchOptions: RequestInit = { method, headers };
    if (options?.body !== undefined) {
      fetchOptions.body = JSON.stringify(options.body);
      headers['Content-Type'] = 'application/json';
    }
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
      data: { error: error instanceof Error ? error.message : 'CrowdStrike request failed' },
    };
  }
}

export function failedResult(action: string, result: CrowdstrikeResponse) {
  return { error: action, statusCode: result.status, details: result.data };
}

export function toCrowdstrikeError(error: unknown, action: string) {
  return { error: action, message: error instanceof Error ? error.message : 'Unknown error' };
}
