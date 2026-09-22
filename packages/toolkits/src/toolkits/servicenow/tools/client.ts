// @ts-nocheck
/**
 * Shared ServiceNow REST client.
 *
 * Auth: injected `servicenowCredentials` is a JSON string:
 *   { "baseUrl": "https://myinstance.service-now.com",
 *     "username": "admin", "password": "..." }           -> HTTP Basic
 *   { "baseUrl": "...", "accessToken": "..." }            -> Authorization: Bearer (OAuth 2.0)
 *   { "baseUrl": "...", "apiKey": "..." }                 -> x-sn-apikey header (API Key auth)
 */

export interface ServiceNowCredentials {
    baseUrl: string;
    username?: string;
    password?: string;
    accessToken?: string;
    apiKey?: string;
}

export const SERVICENOW_CONNECT_ERROR =
    'ServiceNow credentials are required. Connect ServiceNow with your instance base URL (e.g. https://myinstance.service-now.com) and username/password (or accessToken/apiKey) first.';

export function parseServiceNowCredentials(servicenowCredentials: string): ServiceNowCredentials {
    if (!servicenowCredentials) {
        throw new Error(SERVICENOW_CONNECT_ERROR);
    }
    let parsed: Partial<ServiceNowCredentials>;
    try {
        parsed = JSON.parse(servicenowCredentials);
    } catch {
        throw new Error(
            'ServiceNow credentials must be valid JSON like {"baseUrl":"https://myinstance.service-now.com","username":"admin","password":"..."}',
        );
    }
    if (!parsed.baseUrl) {
        throw new Error('ServiceNow credentials must include baseUrl, e.g. {"baseUrl":"https://myinstance.service-now.com"}');
    }
    return {
        baseUrl: parsed.baseUrl.replace(/\/+$/, ''),
        username: parsed.username,
        password: parsed.password,
        accessToken: parsed.accessToken,
        apiKey: parsed.apiKey,
    };
}

function buildHeaders(credentials: ServiceNowCredentials): Record<string, string> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (credentials.apiKey) {
        headers['x-sn-apikey'] = credentials.apiKey;
    } else if (credentials.accessToken) {
        headers.Authorization = `Bearer ${credentials.accessToken}`;
    } else if (credentials.username) {
        headers.Authorization = `Basic ${Buffer.from(`${credentials.username}:${credentials.password ?? ''}`, 'utf-8').toString('base64')}`;
    }
    return headers;
}

function appendQuery(url: URL, query?: Record<string, string | number | boolean | string[] | undefined>) {
    if (!query) return;
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === '') continue;
        if (Array.isArray(value)) {
            if (value.length === 0) continue;
            url.searchParams.set(key, value.join(','));
        } else {
            url.searchParams.set(key, String(value));
        }
    }
}

async function parseBody(response: Response) {
    const text = await response.text();
    if (!text) return { success: true };
    try {
        return JSON.parse(text);
    } catch {
        return { raw: text };
    }
}

/**
 * Perform a ServiceNow REST call. Never throws — returns an `{ error }` object on failure.
 *
 * @param path API path relative to the instance, e.g. `/api/now/table/incident`
 */
export async function snRequest(
    servicenowCredentials: string,
    path: string,
    options?: {
        method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        query?: Record<string, string | number | boolean | string[] | undefined>;
        body?: unknown;
        /** multipart/form-data payload (attachment uploads). Takes precedence over body. */
        formData?: FormData;
        /** When true, non-JSON responses (file downloads) return metadata instead of bytes. */
        expectBinary?: boolean;
    },
) {
    let credentials: ServiceNowCredentials;
    try {
        credentials = parseServiceNowCredentials(servicenowCredentials);
    } catch (error) {
        return {
            error: SERVICENOW_CONNECT_ERROR,
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }

    const url = new URL(`${credentials.baseUrl}${path.startsWith('/') ? path : `/${path}`}`);
    appendQuery(url, options?.query);
    const headers = buildHeaders(credentials);

    let payload: string | FormData | undefined;
    if (options?.formData !== undefined) {
        payload = options.formData;
    } else if (options?.body !== undefined) {
        headers['Content-Type'] = 'application/json';
        payload = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url.toString(), {
            method: options?.method ?? 'GET',
            headers,
            body: payload,
        });

        if (!response.ok) {
            const details = await parseBody(response).catch(() => ({}));
            return {
                error: `ServiceNow API request failed with status ${response.status}`,
                status: response.status,
                details,
            };
        }

        if (response.status === 204) {
            return { success: true };
        }

        const contentType = response.headers.get('content-type') ?? '';
        if (!contentType.includes('json')) {
            if (options?.expectBinary || contentType) {
                const size = response.headers.get('content-length');
                const finalUrl = response.url || url.toString();
                await response.body?.cancel().catch(() => null);
                return {
                    contentType,
                    sizeBytes: size ? Number(size) : null,
                    url: finalUrl,
                    note: 'Binary content is not embedded in tool output. Use the url to download the file directly.',
                };
            }
            const text = await response.text();
            return { raw: text };
        }

        return await parseBody(response);
    } catch (error) {
        return {
            error: 'Error calling ServiceNow API',
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/** Standard sysparm_* query helper: picks only defined values from tool input. */
export function sysparms(params: Record<string, string | number | boolean | undefined>) {
    const query: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined) continue;
        query[key] = value;
    }
    return query;
}

/**
 * Convert top-level camelCase schema keys to ServiceNow's snake_case wire names
 * (sysparmQuery -> sysparm_query, shortDescription -> short_description) and drop
 * undefined values. Only top level is transformed — nested objects (record fields,
 * catalog variables) are passed through untouched.
 */
export function toServerKeys(obj: Record<string, unknown>) {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value === undefined) continue;
        out[key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)] = value;
    }
    return out;
}
