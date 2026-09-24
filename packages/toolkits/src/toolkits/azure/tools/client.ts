export interface AzureCredentials {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  subscriptionId?: string;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

const tokenCache = new Map<string, CachedToken>();

/** azureCredentials is the JSON blob injected by the framework under the manifest's tokenField. */
export function parseAzureCredentials(azureCredentials: string): AzureCredentials {
  let parsed: Partial<AzureCredentials>;
  try {
    parsed = JSON.parse(azureCredentials) as Partial<AzureCredentials>;
  } catch {
    throw new Error('Azure credentials must be a JSON object with tenantId, clientId, clientSecret and subscriptionId');
  }
  if (!parsed.tenantId || !parsed.clientId || !parsed.clientSecret) {
    throw new Error('Azure credentials must include tenantId, clientId and clientSecret');
  }
  return parsed as AzureCredentials;
}

export function resolveSubscriptionId(
  azureCredentials: string,
  subscriptionId?: string,
): string {
  if (subscriptionId) return subscriptionId;
  const parsed = parseAzureCredentials(azureCredentials);
  if (!parsed.subscriptionId) {
    throw new Error('A subscription ID is required. Provide subscriptionId or store it in Azure credentials.');
  }
  return parsed.subscriptionId;
}

async function fetchArmToken(creds: AzureCredentials): Promise<{ token: string; expiresIn: number }> {
  const url = `https://login.microsoftonline.com/${encodeURIComponent(creds.tenantId)}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    scope: 'https://management.azure.com/.default',
  });
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!response.ok) {
    const details = await response.json().catch(() => ({}));
    throw new Error(`Failed to acquire Azure AD token: ${response.status} ${JSON.stringify(details)}`);
  }
  const data = (await response.json()) as { access_token?: string; expires_in?: number | string };
  if (!data.access_token) throw new Error('Azure AD token response did not include an access token');
  const expiresIn = typeof data.expires_in === 'string' ? parseInt(data.expires_in, 10) : (data.expires_in ?? 3600);
  return { token: data.access_token, expiresIn };
}

export async function getArmToken(azureCredentials: string): Promise<string> {
  const creds = parseAzureCredentials(azureCredentials);
  const cacheKey = `${creds.tenantId}:${creds.clientId}`;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;
  const { token, expiresIn } = await fetchArmToken(creds);
  tokenCache.set(cacheKey, { token, expiresAt: Date.now() + expiresIn * 1000 });
  return token;
}

export interface ArmRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  apiVersion: string;
  body?: unknown;
  extraQuery?: Record<string, string | undefined>;
}

export async function armRequest(
  azureCredentials: string,
  path: string,
  options: ArmRequestOptions,
): Promise<unknown> {
  const token = await getArmToken(azureCredentials);
  const params = new URLSearchParams({ 'api-version': options.apiVersion });
  for (const [key, value] of Object.entries(options.extraQuery ?? {})) {
    if (value !== undefined) params.set(key, value);
  }
  const url = `https://management.azure.com${path}?${params.toString()}`;
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (response.status === 202 || response.status === 201 || response.status === 200) {
    const text = await response.text();
    if (!text) return { status: response.status, accepted: response.status === 202 };
    try {
      return JSON.parse(text);
    } catch {
      return { status: response.status, raw: text };
    }
  }
  if (response.status === 204) return { status: 204, deleted: true };
  const details = await response.json().catch(() => ({}));
  throw new Error(`Azure request failed: ${options.method ?? 'GET'} ${path} -> ${response.status} ${JSON.stringify(details)}`);
}

export function missingCredentialsError() {
  return { error: 'Azure credentials are required. Connect Azure first.' };
}
