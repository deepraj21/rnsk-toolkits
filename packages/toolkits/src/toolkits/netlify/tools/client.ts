// @ts-nocheck
/**
 * Netlify API client.
 *
 * Base URL: https://api.netlify.com/api/v1
 * Auth: personal access token (or OAuth token) sent as `Authorization: Bearer <token>`.
 * Tokens: Netlify UI > User settings > Applications > Personal access tokens.
 *
 * List endpoints are paginated with `page` / `per_page` (max 100) and return
 * bare JSON arrays (Netlify uses Link headers for rel="next").
 */
const BASE_URL = 'https://api.netlify.com/api/v1';

export async function netlifyRequest(netlifyToken, path, options = {}) {
  if (!netlifyToken) {
    return { error: 'Netlify token is required. Connect Netlify first.' };
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length) search.set(key, value.join(','));
    } else {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  const url = `${BASE_URL}${normalizedPath}${qs ? `?${qs}` : ''}`;

  try {
    const headers = {
      Authorization: `Bearer ${String(netlifyToken).trim()}`,
      Accept: 'application/json',
    };
    const fetchOptions = { method: options.method ?? 'GET', headers };
    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);

    if (response.status === 204) {
      return { ok: true, status: 204, data: null };
    }

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const detail =
        data && typeof data === 'object' && (data.message || data.error)
          ? data.message || data.error
          : undefined;
      return {
        error: detail
          ? `Netlify API error ${response.status}: ${detail}`
          : `Netlify API error ${response.status}`,
        statusCode: response.status,
        details: data,
      };
    }

    return { ok: true, status: response.status, data };
  } catch (error) {
    return {
      error: 'Error calling Netlify API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * POST to a build-hook URL (returned by build hook create/list).
 * Build hooks live on api.netlify.com, so this stays inside allowedHosts.
 */
export async function netlifyTriggerHook(netlifyToken, hookUrl) {
  if (!netlifyToken) {
    return { error: 'Netlify token is required. Connect Netlify first.' };
  }

  let parsed;
  try {
    parsed = new URL(hookUrl);
  } catch {
    return { error: 'Invalid build hook URL.' };
  }
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'api.netlify.com') {
    return {
      error:
        'Build hook URL must be an https URL on api.netlify.com, e.g. "https://api.netlify.com/hooks/..." (as returned by createBuildHook).',
    };
  }

  try {
    const response = await fetch(hookUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${String(netlifyToken).trim()}` },
    });
    const text = await response.text().catch(() => '');
    if (!response.ok) {
      return {
        error: `Build hook returned ${response.status}${text ? `: ${text.slice(0, 200)}` : ''}`,
        statusCode: response.status,
      };
    }
    return { ok: true, status: response.status, message: text || 'Build triggered.' };
  } catch (error) {
    return {
      error: 'Error calling Netlify build hook',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/** Normalize a Netlify list response (bare array or {data}) into an array. */
export function asList(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data;
  return [];
}

/**
 * Drop unset entries (undefined / '') from a body object. Keeps `null`,
 * `false`, and `0`.
 */
export function compact(body) {
  const out = {};
  for (const [key, value] of Object.entries(body ?? {})) {
    if (value === undefined || value === '') continue;
    out[key] = value;
  }
  return out;
}

/**
 * Resolve a site's account_id (needed for the account-scoped environment
 * variable endpoints, which accept ?site_id= to target the site level).
 */
export async function resolveAccountId(netlifyToken, siteId) {
  const site = await netlifyRequest(netlifyToken, `/sites/${siteId}`);
  if (site.error) return site;
  const accountId = site.data?.account_id;
  if (!accountId) {
    return { error: `Could not resolve the account for site "${siteId}".` };
  }
  return { ok: true, accountId };
}
