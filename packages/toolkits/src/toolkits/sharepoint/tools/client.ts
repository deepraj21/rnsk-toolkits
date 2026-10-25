// @ts-nocheck
// Shared helpers for the SharePoint toolkit (Microsoft Graph v1.0 SharePoint APIs).
// Endpoint paths verified against Microsoft Graph v1.0 reference
// (learn.microsoft.com/en-us/graph/api/resources/sharepoint):
//   Base: https://graph.microsoft.com/v1.0
//   Auth: Authorization: Bearer <delegated user token>
//   Sites are read-only (no site creation); lists, list items, and driveItems are read-write.

export interface SharePointResponse {
  ok: boolean;
  status: number;
  data: any;
  contentType?: string;
}

function appendQuery(url: URL, query?: Record<string, unknown>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }
}

async function readBody(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('json')) return response.json().catch(() => null);
  const text = await response.text().catch(() => '');
  return text === '' ? null : text;
}

/** Call Microsoft Graph. Returns an envelope — never throws for auth errors. */
export async function graphRequest(
  sharepointToken: string | undefined,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    headers?: Record<string, string>;
    body?: unknown;
    /** Untouched body for file content uploads (sent with application/octet-stream). */
    rawBody?: string;
  },
): Promise<SharePointResponse> {
  if (!sharepointToken) {
    return {
      ok: false,
      status: 401,
      data: {
        error:
          'SharePoint token is required. Connect SharePoint first via Microsoft sign-in (delegated Sites and Files permissions).',
      },
    };
  }
  const url = new URL(
    `https://graph.microsoft.com/v1.0${path.startsWith('/') ? path : `/${path}`}`,
  );
  appendQuery(url, options?.query);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${sharepointToken}`,
    ...(options?.headers ?? {}),
  };
  const fetchOptions: RequestInit = { method: options?.method ?? 'GET', headers };
  if (options?.rawBody !== undefined) {
    fetchOptions.body = options.rawBody;
    if (!headers['Content-Type']) headers['Content-Type'] = 'application/octet-stream';
  } else if (options?.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
    headers['Content-Type'] = 'application/json';
  }
  try {
    const response = await fetch(url.toString(), fetchOptions);
    return {
      ok: response.ok,
      status: response.status,
      data: await readBody(response),
      contentType: response.headers.get('content-type') ?? undefined,
    };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: { error: error instanceof Error ? error.message : 'SharePoint request failed' },
    };
  }
}

export function failedResult(action: string, result: SharePointResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toSharePointError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}

/** `/sites/{siteId}/drive` (default document library) or `/drives/{driveId}` (specific library). */
export function driveBase(siteId: string, driveId?: string): string {
  if (driveId && driveId !== 'me') return `/drives/${driveId}`;
  return `/sites/${siteId}/drive`;
}

/** Address a drive item by item ID, by library-relative path, or the drive root. */
export function driveItemRef(path?: string, itemId?: string): string {
  if (itemId) return `/items/${itemId}`;
  const trimmed = (path ?? '').replace(/^\/+|\/+$/g, '').trim();
  return trimmed ? `/root:/${trimmed}` : '/root';
}

/**
 * Address a folder within the drive, ready for navigation properties:
 * `${folderRef('Reports/2026')}/children` → `/root:/Reports/2026:/children`.
 * Library root returns `/root/children`.
 */
export function folderRef(folderPath?: string): string {
  const trimmed = (folderPath ?? '').replace(/^\/+|\/+$/g, '').trim();
  return trimmed ? `/root:/${trimmed}:` : '/root';
}

/** True when the response body looks like text we can return directly. */
export function isTextContent(contentType?: string, mimeType?: string): boolean {
  const haystack = `${contentType ?? ''} ${mimeType ?? ''}`;
  return [
    'text',
    'json',
    'xml',
    'csv',
    'html',
    'javascript',
    'markdown',
    'yaml',
    'urlencoded',
  ].some((needle) => haystack.includes(needle));
}
