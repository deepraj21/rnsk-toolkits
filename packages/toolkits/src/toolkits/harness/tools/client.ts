// @ts-nocheck

export interface HarnessCredentials {
    baseUrl: string;
    apiKey: string;
}

const DEFAULT_BASE_URL = 'https://app.harness.io';

export function parseHarnessCredentials(harnessCredentials: string): HarnessCredentials {
    let parsed: Partial<HarnessCredentials> & { apiToken?: string };
    try {
        parsed = JSON.parse(harnessCredentials);
    } catch {
        throw new Error(
            'Harness credentials must be valid JSON with apiKey and optional baseUrl',
        );
    }
    const apiKey = parsed.apiKey ?? parsed.apiToken;
    if (!apiKey) {
        throw new Error(
            'Harness credentials must include apiKey, e.g. {"apiKey":"..."} (generate one from your Harness user profile > My API Keys). Service account tokens work too.',
        );
    }
    return {
        baseUrl: (parsed.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, ''),
        apiKey,
    };
}

function appendQuery(url: URL, query?: Record<string, string | number | boolean | undefined>) {
    if (!query) return;
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined) continue;
        url.searchParams.set(key, String(value));
    }
}

export interface HarnessResponse {
    ok: boolean;
    status: number;
    data: any;
}

export async function harnessRequest(
    harnessCredentials: string,
    path: string,
    options?: {
        method?: string;
        query?: Record<string, string | number | boolean | undefined>;
        body?: unknown;
        contentType?: string;
    },
): Promise<HarnessResponse> {
    const credentials = parseHarnessCredentials(harnessCredentials);
    const url = new URL(`${credentials.baseUrl}${path.startsWith('/') ? path : `/${path}`}`);
    appendQuery(url, options?.query);

    const headers: Record<string, string> = {
        Accept: 'application/json',
        'x-api-key': credentials.apiKey,
    };
    if (options?.contentType) headers['Content-Type'] = options.contentType;

    const fetchOptions: RequestInit = {
        method: options?.method ?? 'GET',
        headers,
    };
    if (options?.body !== undefined) {
        fetchOptions.body =
            typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
        if (!options?.contentType) headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url.toString(), fetchOptions);
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        const data = await response.json().catch(() => null);
        return { ok: response.ok, status: response.status, data };
    }
    const text = await response.text();
    return { ok: response.ok, status: response.status, data: text };
}

export function toHarnessError(error: unknown, action: string) {
    if (error instanceof Error && /credentials|apiKey/i.test(error.message)) {
        return { error: action, message: error.message };
    }
    return {
        error: action,
        message: error instanceof Error ? error.message : 'Unknown error',
    };
}

export function failedResult(action: string, result: HarnessResponse) {
    return {
        error: action,
        statusCode: result.status,
        details: result.data,
    };
}
