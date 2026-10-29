// @ts-nocheck
import { createHash } from 'node:crypto';

/**
 * Mailchimp Marketing API v3. Base URL is datacenter-specific:
 * the API key has the form "<32hex>-<dc>" (e.g. "abc123...-us21") and the
 * trailing "<dc>" suffix selects the account's data center host.
 */
export function mailchimpBaseUrl(mailchimpApiKey) {
  const key = (mailchimpApiKey ?? '').trim();
  const idx = key.lastIndexOf('-');
  if (idx <= 0 || idx === key.length - 1) return null;
  const dc = key.slice(idx + 1);
  return `https://${dc}.api.mailchimp.com/3.0`;
}

/** Mailchimp identifies members by the MD5 hash of the lowercase email address. */
export function subscriberHash(email) {
  return createHash('md5')
    .update((email ?? '').trim().toLowerCase())
    .digest('hex');
}

export async function mailchimpRequest(mailchimpApiKey, path, options = {}) {
  if (!mailchimpApiKey) {
    return { error: 'Mailchimp API key is required. Connect Mailchimp first.' };
  }
  const base = mailchimpBaseUrl(mailchimpApiKey);
  if (!base) {
    return {
      error:
        'Invalid Mailchimp API key. Expected the full key including its data-center suffix, e.g. "abc123...-us21". Reconnect Mailchimp.',
    };
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
  const url = `${base}${normalizedPath}${qs ? `?${qs}` : ''}`;

  try {
    const headers = {
      Authorization: `Bearer ${mailchimpApiKey.trim()}`,
      Accept: 'application/json',
    };
    const fetchOptions = {
      method: options.method ?? 'GET',
      headers,
    };
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
        data && typeof data === 'object' && data.detail
          ? data.detail
          : data && typeof data === 'object' && data.title
            ? data.title
            : undefined;
      return {
        error: detail
          ? `Mailchimp API error ${response.status}: ${detail}`
          : `Mailchimp API error ${response.status}`,
        statusCode: response.status,
        details: data,
      };
    }

    return { ok: true, status: response.status, data };
  } catch (error) {
    return {
      error: 'Error calling Mailchimp Marketing API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/** Shape a Mailchimp list response into { items, totalCount, nextOffset }. */
export function shapeCollection(data, listField) {
  if (!data || typeof data !== 'object') {
    return { items: [], totalCount: 0 };
  }
  const items = Array.isArray(data[listField]) ? data[listField] : [];
  const totalCount = typeof data.total_items === 'number' ? data.total_items : items.length;
  return { items, totalCount };
}

export function nextOffset(count, offset, totalCount) {
  const start = offset ?? 0;
  const taken = start + (count ?? 10);
  return taken < totalCount ? taken : undefined;
}
