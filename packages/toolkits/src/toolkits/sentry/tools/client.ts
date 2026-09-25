const BASE_URL = 'https://sentry.io/api/0';

function buildQuery(query: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v !== undefined && v !== null) params.append(key, String(v));
      }
    } else {
      params.append(key, String(value));
    }
  }
  return params.toString();
}

function parseBody(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function sentryRequest(
  token: string,
  method: string,
  path: string,
  opts: { query?: Record<string, unknown>; body?: Record<string, unknown> } = {},
): Promise<unknown> {
  try {
    const qs = opts.query ? buildQuery(opts.query) : '';
    const url = `${BASE_URL}${path}${qs ? `?${qs}` : ''}`;
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const text = await response.text();
    const data = parseBody(text);
    if (!response.ok) {
      return { error: `Sentry API error ${response.status}`, details: data };
    }
    return data;
  } catch (error) {
    return {
      error: 'Error calling Sentry API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/** Multipart upload for release files and dsym bundles. Accepts fileContent (+fileName) or a file object. */
export async function sentryUpload(
  token: string,
  path: string,
  fields: Record<string, unknown> = {},
): Promise<unknown> {
  try {
    const form = new FormData();
    const { file, fileContent, fileName, ...rest } = fields as Record<string, any>;
    for (const [key, value] of Object.entries(rest)) {
      if (value === undefined || value === null) continue;
      form.append(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
    const content = fileContent ?? file?.content ?? file?.data;
    const name = fileName ?? file?.name ?? file?.filename ?? 'upload.bin';
    if (content !== undefined && content !== null && typeof content !== 'object') {
      let payload: BlobPart = String(content);
      if (typeof content === 'string') {
        const looksB64 = /^[A-Za-z0-9+/=\s]+$/.test(content) && content.length % 4 === 0 && content.length > 64;
        payload = looksB64 ? Buffer.from(content, 'base64') : content;
      }
      form.append(
        'file',
        typeof payload === 'string' ? new Blob([payload]) : new Blob([payload as unknown as ArrayBuffer]),
        String(name),
      );
    } else if (file !== undefined && file !== null && typeof file !== 'object') {
      form.append('file', new Blob([String(file)]), String(name));
    }
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const text = await response.text();
    const data = parseBody(text);
    if (!response.ok) {
      return { error: `Sentry API error ${response.status}`, details: data };
    }
    return data;
  } catch (error) {
    return {
      error: 'Error uploading to Sentry API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
