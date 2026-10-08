// @ts-nocheck
// Wiz GraphQL API — https://docs.wiz.io/wiz-docs/docs/wiz-api
// OAuth2 client credentials → Bearer token on POST {apiUrl}

export interface WizCredentials {
  clientId: string;
  clientSecret: string;
  apiUrl: string;
  authUrl: string;
  audience: string;
}

export interface WizResponse {
  ok: boolean;
  status: number;
  data: unknown;
}

export const WIZ_CONNECT_ERROR =
  'Wiz credentials are required. Connect with JSON from Settings > Service Accounts: clientId, clientSecret, apiUrl (https://api.<region>.app.wiz.io/graphql), authUrl (https://auth.app.wiz.io/oauth/token), audience (wiz-api for Cognito or beyond-api for Auth0).';

export function parseWizCredentials(wizCredentials: string | undefined): WizCredentials {
  if (!wizCredentials) {
    throw new Error(WIZ_CONNECT_ERROR);
  }
  let parsed: Partial<WizCredentials>;
  try {
    parsed = JSON.parse(wizCredentials);
  } catch {
    throw new Error(
      'Wiz credentials must be valid JSON with clientId, clientSecret, apiUrl, authUrl, audience',
    );
  }
  if (
    !parsed.clientId ||
    !parsed.clientSecret ||
    !parsed.apiUrl ||
    !parsed.authUrl ||
    !parsed.audience
  ) {
    throw new Error(
      'Wiz credentials must include clientId, clientSecret, apiUrl, authUrl, and audience',
    );
  }
  return {
    clientId: String(parsed.clientId).trim(),
    clientSecret: String(parsed.clientSecret).trim(),
    apiUrl: String(parsed.apiUrl).trim().replace(/\/+$/, ''),
    authUrl: String(parsed.authUrl).trim().replace(/\/+$/, ''),
    audience: String(parsed.audience).trim(),
  };
}

async function fetchAccessToken(credentials: WizCredentials): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    audience: credentials.audience,
  });
  const response = await fetch(credentials.authUrl, {
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
      data?.error_description ?? data?.error ?? `Token request failed (${response.status})`,
    );
  }
  const token = data?.access_token;
  if (!token) {
    throw new Error('Wiz token response missing access_token');
  }
  return token;
}

export async function wizGraphql(
  wizCredentials: string | undefined,
  query: string,
  variables?: Record<string, unknown>,
): Promise<WizResponse> {
  let credentials: WizCredentials;
  try {
    credentials = parseWizCredentials(wizCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 401,
      data: { error: error instanceof Error ? error.message : WIZ_CONNECT_ERROR },
    };
  }
  try {
    const token = await fetchAccessToken(credentials);
    const response = await fetch(credentials.apiUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables: variables ?? {} }),
    });
    const raw = await response.text();
    let data: unknown = null;
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }
    }
    const gqlErrors = (data as any)?.errors;
    const ok = response.ok && !gqlErrors?.length;
    return { ok, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: { error: error instanceof Error ? error.message : 'Wiz GraphQL request failed' },
    };
  }
}

export function failedResult(action: string, result: WizResponse) {
  return { error: action, statusCode: result.status, details: result.data };
}

export function toWizError(error: unknown, action: string) {
  return { error: action, message: error instanceof Error ? error.message : 'Unknown error' };
}
