// @ts-nocheck
// Shared HTTP helper for the X (Twitter) API v2.
// Base URL and paths verified against the official spec at https://api.x.com/2/openapi.json.

const BASE_URL = 'https://api.x.com/2';

export interface XResponse {
  ok: boolean;
  status: number;
  data: any;
}

export function missingTokenError() {
  return { error: 'X access token is required. Connect X first.' };
}

function appendQuery(
  url: URL,
  query?: Record<string, string | number | boolean | string[] | undefined>,
) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      url.searchParams.set(key, value.join(','));
      continue;
    }
    url.searchParams.set(key, String(value));
  }
}

export async function xRequest(
  xToken: string | undefined,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, string | number | boolean | string[] | undefined>;
    body?: unknown;
    rawText?: boolean;
  },
): Promise<XResponse> {
  if (!xToken) {
    return { ok: false, status: 401, data: missingTokenError() };
  }
  const url = new URL(`${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`);
  appendQuery(url, options?.query);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${xToken}`,
  };
  const fetchOptions: RequestInit = {
    method: options?.method ?? 'GET',
    headers,
  };
  if (options?.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url.toString(), fetchOptions);
  if (options?.rawText) {
    const text = await response.text().catch(() => '');
    return { ok: response.ok, status: response.status, data: text };
  }
  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };
}

export function failedResult(action: string, result: XResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toXError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}

/** Resolve a user id, defaulting to the authenticated user via GET /2/users/me. */
export async function resolveUserId(
  xToken: string | undefined,
  maybeId?: string,
): Promise<{ id?: string; error?: unknown }> {
  if (maybeId && maybeId !== 'me') return { id: maybeId };
  const result = await xRequest(xToken, '/users/me');
  if (!result.ok) {
    return { error: failedResult('Failed to resolve the authenticated user id', result) };
  }
  const id = result.data?.data?.id;
  if (!id)
    return {
      error: { error: 'Failed to resolve the authenticated user id', details: result.data },
    };
  return { id };
}

/** Common expansion/field query params shared by most lookup/search endpoints. */
export function fieldQuery(params: {
  expansions?: string[];
  tweetFields?: string[];
  userFields?: string[];
  mediaFields?: string[];
  pollFields?: string[];
  placeFields?: string[];
  spaceFields?: string[];
  topicFields?: string[];
  listFields?: string[];
  dmEventFields?: string[];
  maxResults?: number;
  paginationToken?: string;
}): Record<string, string | number | boolean | string[] | undefined> {
  return {
    expansions: params.expansions,
    'tweet.fields': params.tweetFields,
    'user.fields': params.userFields,
    'media.fields': params.mediaFields,
    'poll.fields': params.pollFields,
    'place.fields': params.placeFields,
    'space.fields': params.spaceFields,
    'topic.fields': params.topicFields,
    'list.fields': params.listFields,
    'dm_event.fields': params.dmEventFields,
    max_results: params.maxResults,
    pagination_token: params.paginationToken,
  };
}
