// @ts-nocheck
// Shared helpers for the Pinecone toolkit.
// Endpoint paths verified against the official Pinecone OpenAPI specs
// (github.com/pinecone-io/pinecone-api, 2025-10: db_data, db_control,
// inference, admin):
//   Control plane: https://api.pinecone.io (indexes, collections, backups)
//   Data plane:    https://{index-host} (vectors, namespaces, records, imports)
//   Inference:     https://api.pinecone.io (embed, rerank, models)
//   Admin:         https://api.pinecone.io (projects, organizations, api-keys)
// Auth: Api-Key header + required X-Pinecone-Api-Version date header.

export const PINECONE_API_VERSION = '2025-10';

export interface PineconeResponse {
  ok: boolean;
  status: number;
  data: any;
}

async function doFetch(
  url: string,
  apiKey: string,
  options?: { method?: string; query?: Record<string, unknown>; body?: unknown },
): Promise<PineconeResponse> {
  const full = new URL(url);
  if (options?.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          for (const item of value) {
            if (item !== undefined && item !== null) full.searchParams.append(key, String(item));
          }
        } else {
          full.searchParams.set(key, String(value));
        }
      }
    }
  }
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Api-Key': apiKey,
    'X-Pinecone-Api-Version': PINECONE_API_VERSION,
  };
  const fetchOptions: RequestInit = { method: options?.method ?? 'GET', headers };
  if (options?.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
    headers['Content-Type'] = 'application/json';
  }
  try {
    const response = await fetch(full.toString(), fetchOptions);
    const data = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: { error: error instanceof Error ? error.message : 'Pinecone request failed' },
    };
  }
}

function needKey(apiKey: string | undefined): PineconeResponse | null {
  if (!apiKey) {
    return {
      ok: false,
      status: 401,
      data: {
        error:
          'Pinecone API key is required. Connect Pinecone first with an API key from the Pinecone console.',
      },
    };
  }
  return null;
}

/** Call the Pinecone control plane / inference / admin APIs (api.pinecone.io). */
export async function pineconeControl(
  pineconeApiKey: string | undefined,
  path: string,
  options?: { method?: string; query?: Record<string, unknown>; body?: unknown },
): Promise<PineconeResponse> {
  const missing = needKey(pineconeApiKey);
  if (missing) return missing;
  return doFetch(
    `https://api.pinecone.io${path.startsWith('/') ? path : `/${path}`}`,
    pineconeApiKey as string,
    options,
  );
}

/** Call a Pinecone index data-plane host (from Describe Index). */
export async function pineconeIndex(
  pineconeApiKey: string | undefined,
  indexHost: string | undefined,
  path: string,
  options?: { method?: string; query?: Record<string, unknown>; body?: unknown },
): Promise<PineconeResponse> {
  const missing = needKey(pineconeApiKey);
  if (missing) return missing;
  if (!indexHost) {
    return {
      ok: false,
      status: 400,
      data: {
        error:
          'Index host is required for data-plane calls. Pass indexHost (e.g. my-index-abc123.svc.region.pinecone.io) from Describe Index.',
      },
    };
  }
  const host = indexHost
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '');
  return doFetch(
    `https://${host}${path.startsWith('/') ? path : `/${path}`}`,
    pineconeApiKey as string,
    options,
  );
}

export function failedResult(action: string, result: PineconeResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toPineconeError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
