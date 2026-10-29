// @ts-nocheck

export const GREENHOUSE_API_BASE = 'https://harvest.greenhouse.io/v3';
const TOKEN_URL = 'https://auth.greenhouse.io/token';

/**
 * Harvest v3 uses OAuth 2.0 Client Credentials: the stored value is the raw
 * "clientId:clientSecret" pair, exchanged at auth.greenhouse.io/token for a
 * short-lived Bearer JWT (cached in-memory until shortly before expiry).
 */
const tokenCache = new Map();

function credentialsOf(greenhouseCredentials) {
  const idx = (greenhouseCredentials ?? '').indexOf(':');
  if (idx <= 0) return null;
  return {
    clientId: greenhouseCredentials.slice(0, idx),
    clientSecret: greenhouseCredentials.slice(idx + 1),
  };
}

async function getAccessToken(greenhouseCredentials) {
  const cached = tokenCache.get(greenhouseCredentials);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;
  const creds = credentialsOf(greenhouseCredentials);
  if (!creds) return null;
  const basic = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString('base64');
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!response.ok) return null;
  const data = await response.json().catch(() => null);
  if (!data?.access_token) return null;
  tokenCache.set(greenhouseCredentials, {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  });
  return data.access_token;
}

function buildQuery(query) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length) search.set(key, value.join(','));
    } else {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Harvest v3 list endpoints paginate via a W3C Link header
 * (`<https://harvest.greenhouse.io/v3/jobs?cursor=...>; rel="next"`).
 * Extract just the cursor for the caller.
 */
function extractNextCursor(linkHeader) {
  if (!linkHeader) return null;
  const match = linkHeader.match(/<([^>]+)>\s*;\s*rel="next"/);
  if (!match) return null;
  try {
    return new URL(match[1]).searchParams.get('cursor');
  } catch {
    return null;
  }
}

export async function greenhouseRequest(greenhouseCredentials, path, options = {}) {
  if (!greenhouseCredentials) {
    return { error: 'Greenhouse API credentials are required. Connect Greenhouse first.' };
  }
  if (!credentialsOf(greenhouseCredentials)) {
    return {
      error:
        'Invalid Greenhouse credentials. Expected "clientId:clientSecret" from a Greenhouse Harvest API client (Settings > Developer Center > API Credential Management). Reconnect Greenhouse.',
    };
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${GREENHOUSE_API_BASE}${normalizedPath}${buildQuery(options.query)}`;

  try {
    const doFetch = async (token) =>
      fetch(url, {
        method: options.method ?? 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      });

    let token = await getAccessToken(greenhouseCredentials);
    if (!token) {
      return {
        error:
          'Failed to exchange Greenhouse credentials for an access token. Verify the Harvest API client ID and secret (must belong to a user with Harvest API v3 permissions).',
      };
    }

    let response = await doFetch(token);
    if (response.status === 401) {
      // Token may have been revoked before cache expiry — refresh once and retry.
      tokenCache.delete(greenhouseCredentials);
      token = await getAccessToken(greenhouseCredentials);
      if (!token) {
        return {
          error:
            'Greenhouse rejected the credentials (401). Verify the Harvest API client ID and secret.',
        };
      }
      response = await doFetch(token);
    }

    if (response.status === 204) {
      return { ok: true, status: 204, data: { success: true }, nextCursor: null };
    }

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const retryAfter = response.headers.get('Retry-After');
      return {
        error: `Greenhouse API error ${response.status}`,
        statusCode: response.status,
        details: data,
        ...(retryAfter ? { retryAfterSeconds: Number(retryAfter) || retryAfter } : {}),
      };
    }

    const nextCursor = extractNextCursor(response.headers.get('Link'));
    return { ok: true, status: response.status, data, nextCursor };
  } catch (error) {
    return {
      error: 'Error calling Greenhouse Harvest API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
