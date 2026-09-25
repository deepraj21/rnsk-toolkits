// @ts-nocheck

const BASE_URL = 'https://api.airtable.com';

export interface AirtableResponse {
    ok: boolean;
    status: number;
    data: any;
}

function appendQuery(url: URL, query?: Record<string, string | number | boolean | undefined>) {
    if (!query) return;
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined) continue;
        url.searchParams.set(key, String(value));
    }
}

export function missingTokenError() {
    return { error: 'Airtable access token is required. Connect Airtable first.' };
}

export async function airtableRequest(
    airtableAccessToken: string | undefined,
    path: string,
    options?: {
        method?: string;
        query?: Record<string, string | number | boolean | undefined>;
        repeatQuery?: Record<string, Array<string | number>>;
        indexedQuery?: Record<string, Array<{ field: string; direction?: string }>>;
        body?: unknown;
    },
): Promise<AirtableResponse> {
    const url = new URL(`${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`);
    appendQuery(url, options?.query);
    if (options?.repeatQuery) {
        for (const [key, values] of Object.entries(options.repeatQuery)) {
            for (const value of values) url.searchParams.append(key, String(value));
        }
    }
    if (options?.indexedQuery) {
        for (const [key, sorts] of Object.entries(options.indexedQuery)) {
            sorts.forEach((sort, i) => {
                url.searchParams.append(`${key}[${i}][field]`, sort.field);
                if (sort.direction) url.searchParams.append(`${key}[${i}][direction]`, sort.direction);
            });
        }
    }

    const headers: Record<string, string> = {
        Accept: 'application/json',
        Authorization: `Bearer ${airtableAccessToken}`,
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
    const data = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, data };
}

export function toAirtableError(error: unknown, action: string) {
    return {
        error: action,
        message: error instanceof Error ? error.message : 'Unknown error',
    };
}

export function failedResult(action: string, result: AirtableResponse) {
    return {
        error: action,
        statusCode: result.status,
        details: result.data,
    };
}
