// @ts-nocheck

export interface PrometheusCredentials {
    baseUrl: string;
    username?: string;
    password?: string;
    bearerToken?: string;
}

export function parsePrometheusCredentials(prometheusCredentials: string): PrometheusCredentials {
    let parsed: Partial<PrometheusCredentials>;
    try {
        parsed = JSON.parse(prometheusCredentials);
    } catch {
        throw new Error('Prometheus credentials must be valid JSON with baseUrl and optional auth fields');
    }
    if (!parsed.baseUrl) {
        throw new Error('Prometheus credentials must include baseUrl, e.g. {"baseUrl":"http://localhost:9090"}');
    }
    return {
        baseUrl: parsed.baseUrl.replace(/\/+$/, ''),
        username: parsed.username,
        password: parsed.password,
        bearerToken: parsed.bearerToken,
    };
}

function buildHeaders(credentials: PrometheusCredentials): Record<string, string> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (credentials.bearerToken) {
        headers.Authorization = `Bearer ${credentials.bearerToken}`;
    } else if (credentials.username) {
        headers.Authorization = `Basic ${Buffer.from(`${credentials.username}:${credentials.password ?? ''}`).toString('base64')}`;
    }
    return headers;
}

function appendQuery(url: URL, query?: Record<string, string | number | boolean | string[] | undefined>) {
    if (!query) return;
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined) continue;
        if (Array.isArray(value)) {
            for (const v of value) url.searchParams.append(key, String(v));
        } else {
            url.searchParams.set(key, String(value));
        }
    }
}

export async function promRequest(
    prometheusCredentials: string,
    path: string,
    options?: {
        method?: string;
        query?: Record<string, string | number | boolean | string[] | undefined>;
        acceptNdjson?: boolean;
    },
) {
    const credentials = parsePrometheusCredentials(prometheusCredentials);
    const url = new URL(`${credentials.baseUrl}${path.startsWith('/') ? path : `/${path}`}`);
    appendQuery(url, options?.query);
    const headers = buildHeaders(credentials);
    if (options?.acceptNdjson) headers.Accept = 'application/x-ndjson';

    const response = await fetch(url.toString(), {
        method: options?.method ?? 'GET',
        headers,
    });
    const contentType = response.headers.get('content-type') ?? '';
    if (options?.acceptNdjson || contentType.includes('x-ndjson')) {
        const text = await response.text();
        if (!response.ok) return { error: 'Prometheus request failed', status: response.status, details: text };
        return { ndjson: text.split('\n').filter(Boolean).map((line) => {
            try { return JSON.parse(line); } catch { return { raw: line }; }
        }) };
    }
    if (!contentType.includes('json')) {
        const text = await response.text();
        if (!response.ok) return { error: 'Prometheus request failed', status: response.status, details: text };
        return { text, contentType };
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok || (data as any)?.status === 'error') {
        return { error: 'Prometheus request failed', status: response.status, details: data };
    }
    return data;
}

export function toPromError(error: unknown, label: string) {
    if ((error as any)?.details !== undefined) {
        return { error: label, details: (error as any).details };
    }
    return {
        error: label.replace('Failed', 'Error').replace('failed', 'error'),
        message: error instanceof Error ? error.message : 'Unknown error',
    };
}
