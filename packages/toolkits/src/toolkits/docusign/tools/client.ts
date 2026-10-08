// @ts-nocheck
// DocuSign eSignature REST API v2.1 — https://developers.docusign.com/docs/esign-rest-api/
// Auth: Authorization: Bearer {accessToken}

export interface DocusignCredentials {
  accountId: string;
  baseUrl: string;
  accessToken: string;
}

export interface DocusignResponse {
  ok: boolean;
  status: number;
  data: unknown;
}

export const DOCUSIGN_CONNECT_ERROR =
  'DocuSign credentials are required. Connect with JSON {"accountId":"...","baseUrl":"https://demo.docusign.net/restapi","accessToken":"..."} from OAuth (JWT or Authorization Code grant). Use /oauth/userinfo to discover base_uri and account_id.';

export function parseDocusignCredentials(
  docusignCredentials: string | undefined,
): DocusignCredentials {
  if (!docusignCredentials) {
    throw new Error(DOCUSIGN_CONNECT_ERROR);
  }
  let parsed: Partial<DocusignCredentials>;
  try {
    parsed = JSON.parse(docusignCredentials);
  } catch {
    throw new Error(
      'DocuSign credentials must be valid JSON with accountId, baseUrl, and accessToken',
    );
  }
  if (!parsed.accountId || !parsed.baseUrl || !parsed.accessToken) {
    throw new Error('DocuSign credentials must include accountId, baseUrl, and accessToken');
  }
  return {
    accountId: String(parsed.accountId).trim(),
    baseUrl: String(parsed.baseUrl).trim().replace(/\/+$/, ''),
    accessToken: String(parsed.accessToken).trim(),
  };
}

function accountBase(credentials: DocusignCredentials, suffix: string): string {
  return `${credentials.baseUrl}/v2.1/accounts/${credentials.accountId}${suffix}`;
}

function appendQuery(url: URL, query?: Record<string, unknown>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }
}

export async function docusignRequest(
  docusignCredentials: string | undefined,
  pathSuffix: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
  },
): Promise<DocusignResponse> {
  let credentials: DocusignCredentials;
  try {
    credentials = parseDocusignCredentials(docusignCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 401,
      data: { error: error instanceof Error ? error.message : DOCUSIGN_CONNECT_ERROR },
    };
  }
  const url = new URL(accountBase(credentials, pathSuffix));
  appendQuery(url, options?.query);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${credentials.accessToken}`,
  };
  const fetchOptions: RequestInit = { method: options?.method ?? 'GET', headers };
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
      data: { error: error instanceof Error ? error.message : 'DocuSign request failed' },
    };
  }
}

export function failedResult(action: string, result: DocusignResponse) {
  return { error: action, statusCode: result.status, details: result.data };
}

export function toDocusignError(error: unknown, action: string) {
  return { error: action, message: error instanceof Error ? error.message : 'Unknown error' };
}
