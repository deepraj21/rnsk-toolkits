// @ts-nocheck
export const ZOHO_API_BASE = 'https://www.zohoapis.com/crm/v8';

export function getZohoBase(apiDomain?: string): string {
  if (!apiDomain) return ZOHO_API_BASE;
  // allow passing full domain like https://www.zohoapis.eu or just www.zohoapis.eu
  if (apiDomain.startsWith('http')) return `${apiDomain.replace(/\/$/, '')}/crm/v8`;
  return `https://${apiDomain.replace(/\/$/, '')}/crm/v8`;
}

export async function zohoFetch(
  path: string,
  {
    zohoToken,
    method = 'GET',
    query,
    body,
    apiDomain,
  }: {
    zohoToken: string;
    method?: string;
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
    apiDomain?: string;
  },
) {
  const base = getZohoBase(apiDomain);
  const url = new URL(`${base}${path}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    });
  }
  const headers: Record<string, string> = {
    Authorization: `Zoho-oauthtoken ${zohoToken}`,
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

export function handleZohoError(data: any): { error: string; details?: any } {
  if (data?.data?.[0]?.message) return { error: data.data[0].message, details: data };
  if (data?.message) return { error: data.message, details: data };
  return { error: 'Zoho API error', details: data };
}
