// @ts-nocheck

export interface GrafanaCredentials {
    baseUrl: string;
    apiToken?: string;
}

export function parseGrafanaCredentials(grafanaCredentials: string): GrafanaCredentials {
    const parsed = JSON.parse(grafanaCredentials) as Partial<GrafanaCredentials>;
    if (!parsed.baseUrl) {
        throw new Error('Grafana credentials must include baseUrl');
    }

    return {
        baseUrl: parsed.baseUrl.replace(/\/+$/, ''),
        apiToken: parsed.apiToken,
    };
}

function buildHeaders(
    credentials: GrafanaCredentials,
    options?: { contentType?: string; acceptJson?: boolean },
): Record<string, string> {
    const headers: Record<string, string> = {};

    if (options?.contentType) {
        headers['Content-Type'] = options.contentType;
    }
    if (options?.acceptJson) {
        headers.Accept = 'application/json';
    }
    if (credentials.apiToken) {
        headers.Authorization = `Bearer ${credentials.apiToken}`;
    }

    return headers;
}

export async function grafanaRequest(
    grafanaCredentials: string,
    path: string,
    options?: {
        method?: string;
        body?: unknown;
        contentType?: string;
        acceptJson?: boolean;
        baseUrlOverride?: string;
    },
) {
    const credentials = parseGrafanaCredentials(grafanaCredentials);
    const baseUrl = (options?.baseUrlOverride ?? credentials.baseUrl).replace(/\/+$/, '');
    const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    const fetchOptions: RequestInit = {
        method: options?.method ?? 'GET',
        headers: buildHeaders(credentials, options),
        redirect: 'manual',
    };

    if (options?.body !== undefined) {
        fetchOptions.body =
            typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);
    const contentType = response.headers.get('content-type') ?? '';
    const headers = Object.fromEntries(response.headers.entries());

    if (contentType.includes('application/json')) {
        const data = await response.json().catch(() => null);
        return { ok: response.ok, status: response.status, data, contentType, headers };
    }

    const text = await response.text();
    return { ok: response.ok, status: response.status, data: text, contentType, headers };
}
