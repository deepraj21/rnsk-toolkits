// @ts-nocheck

export interface DynatraceCredentials {
    baseUrl: string;
    apiToken: string;
    platformBaseUrl?: string;
}

export function parseDynatraceCredentials(dynatraceCredentials: string): DynatraceCredentials {
    let parsed: Partial<DynatraceCredentials>;
    try {
        parsed = JSON.parse(dynatraceCredentials);
    } catch {
        throw new Error(
            'Dynatrace credentials must be valid JSON with baseUrl and apiToken',
        );
    }
    if (!parsed.baseUrl) {
        throw new Error(
            'Dynatrace credentials must include baseUrl, e.g. {"baseUrl":"https://abc123.live.dynatrace.com","apiToken":"..."} (Managed: "https://dynatrace.example.com/e/ENV_ID")',
        );
    }
    if (!parsed.apiToken) {
        throw new Error(
            'Dynatrace credentials must include apiToken (Settings > Integration > Dynatrace API > Generate token, with the scopes the tools you use need).',
        );
    }
    return {
        baseUrl: parsed.baseUrl.replace(/\/+$/, ''),
        apiToken: parsed.apiToken,
        platformBaseUrl: parsed.platformBaseUrl?.replace(/\/+$/, ''),
    };
}

/**
 * Base URL for Dynatrace platform APIs (Grail/DQL). On SaaS the platform lives on
 * the sibling apps host ({env}.apps.dynatrace.com); Managed/SaaS users can also
 * supply platformBaseUrl explicitly in the credentials JSON.
 */
export function resolvePlatformBaseUrl(credentials: DynatraceCredentials): string {
    if (credentials.platformBaseUrl) return credentials.platformBaseUrl;
    if (/\.live\.dynatrace\.com$/i.test(credentials.baseUrl)) {
        return credentials.baseUrl.replace(/\.live\.dynatrace\.com$/i, '.apps.dynatrace.com');
    }
    return credentials.baseUrl;
}

function appendQuery(url: URL, query?: Record<string, string | number | boolean | undefined>) {
    if (!query) return;
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined) continue;
        url.searchParams.set(key, String(value));
    }
}

export interface DynatraceResponse {
    ok: boolean;
    status: number;
    data: any;
}

async function doRequest(
    baseUrl: string,
    apiToken: string,
    path: string,
    options?: {
        method?: string;
        query?: Record<string, string | number | boolean | undefined>;
        repeatQuery?: Record<string, Array<string | number>>;
        body?: unknown;
        contentType?: string;
    },
): Promise<DynatraceResponse> {
    const url = new URL(`${baseUrl}${path.startsWith('/') ? path : `/${path}`}`);
    appendQuery(url, options?.query);
    if (options?.repeatQuery) {
        for (const [key, values] of Object.entries(options.repeatQuery)) {
            for (const value of values) url.searchParams.append(key, String(value));
        }
    }

    const headers: Record<string, string> = {
        Accept: 'application/json',
        Authorization: `Api-Token ${apiToken}`,
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
    const text = await response.text().catch(() => '');
    return { ok: response.ok, status: response.status, data: text || null };
}

export async function dynatraceRequest(
    dynatraceCredentials: string,
    path: string,
    options?: {
        method?: string;
        query?: Record<string, string | number | boolean | undefined>;
        repeatQuery?: Record<string, Array<string | number>>;
        body?: unknown;
        contentType?: string;
    },
): Promise<DynatraceResponse> {
    const credentials = parseDynatraceCredentials(dynatraceCredentials);
    return doRequest(credentials.baseUrl, credentials.apiToken, path, options);
}

export async function dynatracePlatformRequest(
    dynatraceCredentials: string,
    path: string,
    options?: {
        method?: string;
        query?: Record<string, string | number | boolean | undefined>;
        body?: unknown;
    },
): Promise<DynatraceResponse> {
    const credentials = parseDynatraceCredentials(dynatraceCredentials);
    return doRequest(resolvePlatformBaseUrl(credentials), credentials.apiToken, path, options);
}

export function toDynatraceError(error: unknown, action: string) {
    if (error instanceof Error && /credentials|apiToken|baseUrl/i.test(error.message)) {
        return { error: action, message: error.message };
    }
    return {
        error: action,
        message: error instanceof Error ? error.message : 'Unknown error',
    };
}

export function failedResult(action: string, result: DynatraceResponse) {
    return {
        error: action,
        statusCode: result.status,
        details: result.data,
    };
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
