// @ts-nocheck
export const WISE_API_BASE = 'https://api.transferwise.com';

export async function wiseFetch(
  path: string,
  {
    wiseApiKey,
    method = 'GET',
    query,
    body,
  }: {
    wiseApiKey: string;
    method?: string;
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
  },
) {
  const url = new URL(`${WISE_API_BASE}${path}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        if (Array.isArray(v)) {
          url.searchParams.set(k, (v as unknown as string[]).join(','));
        } else {
          url.searchParams.set(k, String(v));
        }
      }
    });
  }
  const headers: Record<string, string> = {
    Authorization: `Bearer ${wiseApiKey}`,
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
