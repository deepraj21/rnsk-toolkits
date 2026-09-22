// @ts-nocheck
export const WP_API_BASE = 'https://public-api.wordpress.com';

export async function wpFetch(
  path: string,
  {
    wordpressToken,
    method = 'GET',
    query,
    body,
  }: {
    wordpressToken: string;
    method?: string;
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
  },
) {
  const url = new URL(`${WP_API_BASE}${path}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    });
  }
  const headers: Record<string, string> = {
    Authorization: `Bearer ${wordpressToken}`,
    'Content-Type': 'application/json',
  };
  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    return { ok: false as const, status: res.status, data, error: data };
  }
  return { ok: true as const, status: res.status, data };
}
